import type { Categoria } from './Categoria';

export type EstadoPublicacion = 'PUBLICADO' | 'OCULTO' | 'BORRADOR';

export interface Marca { 
    idMarca: number;
    nombre: string;
    activa: boolean;
}

export interface EspecificacionTecnica {
    nombre: string;
    valor: string;
}

export interface ValorVariante {
    valor: string;
    detalle: string;
    disponible: boolean;
    idVariante?: number; // id en el backend
}

export interface Variantes {
    nombre: string;
    columna: string;
    guia: string;
    nota: string;
    valores: ValorVariante[];
}

export interface Producto {
  idProducto: number;
  nombre: string;
  descripcion: string | null;
  precioNormal: number;
  estado: EstadoPublicacion;
  destacado: boolean;
  ordenDestacado: number | null;
  limitePorCompra: number | null;
  fechaCreacion: string;
  categoria: Categoria;
  marca: Marca;
  // Solo frontend (en el backend están en otras entidades o no existen)
  slug?: string;
  subtipo?: string;
  precioOferta?: number;
  imagenPrincipal?: string;
  stockDisponible?: number;
  stockMinimo?: number;
  sku?: string;
  proveedor?: string;
  especificaciones?: EspecificacionTecnica[];
  variantes?: Variantes;
  idVariante?: number; // variante unica (sin tallas)
}

export type ProductoPayload = Omit<Producto, 'idProducto'>;