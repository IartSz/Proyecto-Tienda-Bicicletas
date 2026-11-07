import type { Producto, ProductoPayload } from '../models/Producto';
import { productos as productosIniciales } from '../data/productos';

// Por ahora en localStorage; luego se cambia por la API
const CLAVE = 'productos';

export type EstadoStock = 'ok' | 'bajo' | 'cero';

const leer = (): Producto[] => {
  try {
    const guardados = localStorage.getItem(CLAVE);
    return guardados ? (JSON.parse(guardados) as Producto[]) : [...productosIniciales];
  } catch {
    return [...productosIniciales];
  }
};

const guardar = (lista: Producto[]): void => {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(lista));
  } catch {
    throw new Error('No se pudo guardar: el almacenamiento del navegador está lleno.');
  }
};

// Precio que paga el cliente
export const precioActual = (producto: Producto): number => producto.precioOferta ?? producto.precioNormal;

export const estadoStock = (producto: Producto): EstadoStock => {
  const stock = producto.stockDisponible ?? 0;
  if (stock <= 0) return 'cero';
  if (stock < (producto.stockMinimo ?? 0)) return 'bajo';
  return 'ok';
};

export const ProductoService = {
  async listar(): Promise<Producto[]> {
    return leer();
  },

  async obtener(id: number): Promise<Producto> {
    const producto = leer().find((p) => p.idProducto === id);
    if (!producto) throw new Error('Producto no encontrado.');
    return producto;
  },

  async crear(producto: ProductoPayload): Promise<Producto> {
    const lista = leer();
    const idProducto = Math.max(0, ...lista.map((p) => p.idProducto)) + 1;
    const nuevo: Producto = { ...producto, idProducto };
    guardar([nuevo, ...lista]);
    return nuevo;
  },

  async actualizar(id: number, producto: ProductoPayload): Promise<Producto> {
    const lista = leer();
    const indice = lista.findIndex((p) => p.idProducto === id);
    if (indice === -1) throw new Error('Producto no encontrado.');
    const actualizado: Producto = { ...producto, idProducto: id };
    lista[indice] = actualizado;
    guardar(lista);
    return actualizado;
  },

  async eliminar(id: number): Promise<void> {
    guardar(leer().filter((p) => p.idProducto !== id));
  }
};

export default ProductoService;
