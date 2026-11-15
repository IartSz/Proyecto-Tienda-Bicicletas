import type { Producto, ProductoPayload } from '../models/Producto';
import { productos as productosIniciales } from '../data/productos';
import { USAR_API } from '../api/cliente';
import ProductoApiService from '../api/producto.api';

// Modo local (sin backend)
const CLAVE = 'productos';

export interface ServicioProductos {
  listar(): Promise<Producto[]>;
  obtener(id: number): Promise<Producto>;
  crear(producto: ProductoPayload): Promise<Producto>;
  actualizar(id: number, producto: ProductoPayload): Promise<Producto>;
  eliminar(id: number): Promise<void>;
  subirImagen(archivo: File): Promise<string>;
}

export type EstadoStock = 'ok' | 'bajo' | 'cero';

export const TIPOS_IMAGEN = ['image/jpeg', 'image/png', 'image/webp'];
export const TAMANO_MAXIMO_IMAGEN = 2 * 1024 * 1024;

export const errorImagen = (archivo: File): string => {
  if (!TIPOS_IMAGEN.includes(archivo.type)) return 'Formato no permitido. Usa JPG, PNG o WEBP.';
  if (archivo.size > TAMANO_MAXIMO_IMAGEN) return 'La imagen supera los 2 MB.';
  return '';
};

const leerComoDataUrl = (archivo: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onload = () => resolve(String(lector.result));
    lector.onerror = () => reject(new Error('No se pudo leer la imagen.'));
    lector.readAsDataURL(archivo);
  });

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

const ProductoLocalService: ServicioProductos = {
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
  },

  // Sin backend la imagen queda dentro del producto
  async subirImagen(archivo: File): Promise<string> {
    const error = errorImagen(archivo);
    if (error) throw new Error(error);
    return leerComoDataUrl(archivo);
  }
};

// VITE_USAR_API=true usa el backend; si no, localStorage
export const ProductoService: ServicioProductos = USAR_API ? ProductoApiService : ProductoLocalService;

export default ProductoService;
