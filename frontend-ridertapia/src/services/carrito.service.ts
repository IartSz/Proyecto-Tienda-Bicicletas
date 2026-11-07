import type { ItemCarrito } from '../models/ItemCarrito';
import type { Producto } from '../models/Producto';
import { LIMITE_POR_COMPRA } from '../data/productos';

// Funciones puras: reciben el carrito y devuelven uno nuevo

export const CANTIDAD_MINIMA = 1;
export const CANTIDAD_MAXIMA = LIMITE_POR_COMPRA;

export interface Totales {
  subtotal: number;
  envio: number;
  total: number;
}

export const limitarCantidad = (cantidad: number): number =>
  Math.max(CANTIDAD_MINIMA, Math.min(CANTIDAD_MAXIMA, Math.floor(cantidad)));

// Unidades de un producto en el carrito (todas sus variantes)
export const unidadesEnCarrito = (items: ItemCarrito[], idProducto: number): number =>
  items.filter((i) => i.idProducto === idProducto).reduce((suma, i) => suma + i.cantidad, 0);

export const contarUnidades = (items: ItemCarrito[]): number =>
  items.reduce((suma, i) => suma + i.cantidad, 0);

// Si ya esta con la misma variante, suma la cantidad
export const agregar = (items: ItemCarrito[], nuevo: ItemCarrito): ItemCarrito[] => {
  const existe = items.some((i) => i.idProducto === nuevo.idProducto && i.variante === nuevo.variante);
  if (!existe) return [...items, nuevo];
  return items.map((i) =>
    i.idProducto === nuevo.idProducto && i.variante === nuevo.variante ? { ...i, cantidad: i.cantidad + nuevo.cantidad } : i
  );
};

export const eliminar = (items: ItemCarrito[], indice: number): ItemCarrito[] =>
  items.filter((_, i) => i !== indice);

// Entre 1 y 10
export const cambiarCantidad = (items: ItemCarrito[], indice: number, cantidad: number): ItemCarrito[] =>
  items.map((item, i) => (i === indice ? { ...item, cantidad: limitarCantidad(cantidad) } : item));

export const vaciar = (): ItemCarrito[] => [];

// Solo retiro en tienda: envio siempre 0
export const calcularTotales = (items: ItemCarrito[]): Totales => {
  const subtotal = items.reduce((suma, i) => suma + i.precioUnitario * i.cantidad, 0);
  const envio = 0;
  return { subtotal, envio, total: subtotal + envio };
};

// Error al agregar 'cantidad' unidades, o null si se puede
export const validarStock = (items: ItemCarrito[], producto: Producto, cantidad: number, variante?: string): string | null => {
  const stock = producto.stockDisponible ?? 0;
  if (producto.estado !== 'PUBLICADO' || stock <= 0) return 'Este producto no tiene stock disponible.';
  const libre = stock - unidadesEnCarrito(items, producto.idProducto);
  if (libre <= 0) return 'Ya tienes en tu carrito todas las unidades disponibles.';
  if (cantidad > libre) return `Solo puedes agregar ${libre} unidad(es) más.`;
  const enLinea = items.find((i) => i.idProducto === producto.idProducto && i.variante === variante)?.cantidad ?? 0;
  if (enLinea + cantidad > CANTIDAD_MAXIMA) return `Puedes llevar hasta ${CANTIDAD_MAXIMA} unidades por producto.`;
  return null;
};

// Maximo para una linea: stock menos lo que hay en otras lineas del mismo producto
export const cantidadMaximaLinea = (items: ItemCarrito[], indice: number, producto: Producto): number => {
  const item = items[indice];
  if (!item) return 0;
  const otras = unidadesEnCarrito(items, item.idProducto) - item.cantidad;
  return Math.min(CANTIDAD_MAXIMA, (producto.stockDisponible ?? 0) - otras);
};

// Revisa todo el carrito contra el stock actual
export const validarStockCarrito = (items: ItemCarrito[], productos: Producto[]): string | null => {
  const ids = [...new Set(items.map((i) => i.idProducto))];
  for (const id of ids) {
    const producto = productos.find((p) => p.idProducto === id);
    if (!producto || producto.estado !== 'PUBLICADO') return 'Un producto de tu carrito ya no está disponible.';
    const stock = producto.stockDisponible ?? 0;
    if (stock < unidadesEnCarrito(items, id)) return `Solo quedan ${stock} unidades de "${producto.nombre}".`;
  }
  return null;
};
