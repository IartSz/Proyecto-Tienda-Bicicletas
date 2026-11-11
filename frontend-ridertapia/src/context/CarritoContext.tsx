import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { ItemCarrito } from '../models/ItemCarrito';
import type { Producto } from '../models/Producto';
import * as carrito from '../services/carrito.service';
import useProductos from '../hooks/useProductos';
import { CarritoContext, type CarritoContextValue } from '../hooks/useCarrito';

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

interface CarritoProviderProps {
  children: ReactNode;
}

export const CarritoProvider = ({ children }: CarritoProviderProps) => {
  const [items, setItems] = useState<ItemCarrito[]>(leerCarrito);
  const { productos } = useProductos();

  // Guarda cada cambio
  useEffect(() => {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(items));
    } catch {
      // Sin acceso al almacenamiento
    }
  }, [items]);

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
