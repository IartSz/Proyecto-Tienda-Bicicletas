import { useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { ItemCarrito } from '../models/ItemCarrito';
import type { Producto } from '../models/Producto';
import * as carrito from '../services/carrito.service';
import useProductos from '../hooks/useProductos';
import { CarritoContext, type CarritoContextValue } from '../hooks/useCarrito';
import { SesionContext } from '../hooks/useSesion';
import { USAR_API } from '../api/cliente';
import { olvidarCarrito, recuperarCarrito, sincronizarCarrito, type LineaCarritoApi } from '../api/carrito.api';

const CLAVE = 'carrito';

// Lee el carrito guardado; si esta danado parte vacio
const leerCarrito = (): ItemCarrito[] => {
  try {
    const datos: unknown = JSON.parse(localStorage.getItem(CLAVE) ?? '[]');
    return Array.isArray(datos)
      ? (datos as ItemCarrito[]).filter((i) => typeof i.idProducto === 'number' && typeof i.cantidad === 'number')
      : [];
  } catch {
    return [];
  }
};

// Pasa las lineas guardadas en el backend a items de la pantalla
const aItems = (lineas: LineaCarritoApi[], productos: Producto[]): ItemCarrito[] =>
  lineas.flatMap((l) => {
    const producto = productos.find((p) => p.idProducto === l.idProducto)
      ?? productos.find((p) => p.idVariante === l.idVariante || p.variantes?.valores.some((v) => v.idVariante === l.idVariante));
    if (!producto) return [];
    return [{
      idProducto: producto.idProducto,
      cantidad: l.cantidad,
      precioUnitario: l.precioUnitario,
      idVariante: l.idVariante,
      nombre: producto.nombre,
      variante: producto.variantes?.valores.find((v) => v.idVariante === l.idVariante)?.valor,
      imagen: producto.imagenPrincipal
    }];
  });

interface CarritoProviderProps {
  children: ReactNode;
}

export const CarritoProvider = ({ children }: CarritoProviderProps) => {
  const [items, setItems] = useState<ItemCarrito[]>(leerCarrito);
  const { productos } = useProductos();
  const sesion = useContext(SesionContext)?.sesion;
  const rutCliente = sesion?.rol === 'CLIENTE' ? sesion.rutUsuario : null;
  const hayItems = useRef(items.length > 0);
  const rutAnterior = useRef(rutCliente);
  const recuperadoPara = useRef<string | null>(null);

  // Guarda cada cambio
  useEffect(() => {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(items));
    } catch {
      // Sin acceso al almacenamiento
    }
  }, [items]);

  useEffect(() => {
    hayItems.current = items.length > 0;
  }, [items]);

  // Con backend: guarda una copia en ms-carrito (espera a que el usuario deje de tocar)
  useEffect(() => {
    if (!USAR_API) return;
    const espera = window.setTimeout(() => void sincronizarCarrito(items, rutCliente), 600);
    return () => window.clearTimeout(espera);
  }, [items, rutCliente]);

  // Al iniciar sesion con el carrito vacio, trae el que el cliente dejo guardado
  useEffect(() => {
    if (!USAR_API) return;
    if (rutAnterior.current && !rutCliente) olvidarCarrito();
    rutAnterior.current = rutCliente;
    if (!rutCliente || hayItems.current || productos.length === 0 || recuperadoPara.current === rutCliente) return;
    recuperadoPara.current = rutCliente;
    recuperarCarrito(rutCliente)
      .then((lineas) => {
        const guardados = aItems(lineas, productos);
        if (guardados.length > 0 && !hayItems.current) setItems(guardados);
      })
      .catch((err: unknown) => console.error(err));
  }, [rutCliente, productos]);

  // Si el carrito cambia en otra pestana
  useEffect(() => {
    const alCambiar = (event: StorageEvent) => {
      if (event.key === CLAVE) setItems(leerCarrito());
    };
    window.addEventListener('storage', alCambiar);
    return () => window.removeEventListener('storage', alCambiar);
  }, []);

  const agregar = useCallback((producto: Producto, cantidad: number, variante?: string): string | null => {
    const error = carrito.validarStock(items, producto, cantidad, variante);
    if (error) return error;
    setItems((prev) => carrito.agregar(prev, {
      idProducto: producto.idProducto,
      cantidad,
      precioUnitario: producto.precioOferta ?? producto.precioNormal,
      // Id de la variante en el backend (lo pide el detalle del pedido)
      idVariante: producto.variantes?.valores.find((v) => v.valor === variante)?.idVariante ?? producto.idVariante,
      nombre: producto.nombre,
      variante,
      imagen: producto.imagenPrincipal
    }));
    return null;
  }, [items]);

  // No deja pasar el stock: ajusta al maximo y avisa
  const cambiarCantidad = useCallback((indice: number, cantidad: number): string | null => {
    const item = items[indice];
    if (!item) return null;
    const producto = productos.find((p) => p.idProducto === item.idProducto);
    const maximo = producto ? carrito.cantidadMaximaLinea(items, indice, producto) : carrito.CANTIDAD_MAXIMA;
    if (cantidad > maximo) {
      setItems((prev) => carrito.cambiarCantidad(prev, indice, maximo));
      return maximo >= carrito.CANTIDAD_MAXIMA
        ? `Puedes llevar hasta ${carrito.CANTIDAD_MAXIMA} unidades por producto.`
        : `Stock máximo disponible: ${Math.max(maximo, 0)} unidad(es).`;
    }
    setItems((prev) => carrito.cambiarCantidad(prev, indice, cantidad));
    return null;
  }, [items, productos]);

  const eliminar = useCallback((indice: number) => {
    setItems((prev) => carrito.eliminar(prev, indice));
  }, []);

  const vaciar = useCallback(() => {
    setItems(carrito.vaciar());
  }, []);

  const valor = useMemo<CarritoContextValue>(() => ({
    items,
    totales: carrito.calcularTotales(items),
    cantidadTotal: carrito.contarUnidades(items),
    agregar,
    cambiarCantidad,
    eliminar,
    vaciar
  }), [items, agregar, cambiarCantidad, eliminar, vaciar]);

  return <CarritoContext.Provider value={valor}>{children}</CarritoContext.Provider>;
};

export default CarritoProvider;
