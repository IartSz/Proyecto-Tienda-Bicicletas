import type { EstadoPublicacion, Marca } from '../models/Producto';
import type { EstadoPedido } from '../models/Pedido';

// Respuestas del backend tal como llegan (sin _links)

export interface CategoriaApi {
  idCategoria: number;
  nombre: string;
  descripcion: string | null;
  activa: boolean;
  categoriaPadre: CategoriaApi | null;
}

export interface ProductoApi {
  idProducto: number;
  nombre: string;
  descripcion: string | null;
  precioNormal: number;
  estado: EstadoPublicacion;
  destacado: boolean;
  ordenDestacado: number | null;
  limitePorCompra: number | null;
  fechaCreacion: string;
  categoria: CategoriaApi;
  marca: Marca;
}

// Las tablas hijas traen el producto; solo usamos su id
interface DeProducto {
  producto: { idProducto: number };
}

export interface ImagenApi extends DeProducto {
  idImagenProducto: number;
  url: string;
  orden: number;
  esPrincipal: boolean;
}

export interface OfertaApi extends DeProducto {
  idOferta: number;
  precioOferta: number;
  fechaInicio: string;
  fechaTermino: string;
}

export interface EspecificacionApi extends DeProducto {
  idEspecificacionTecnica: number;
  nombre: string;
  valor: string;
}

export interface VarianteApi extends DeProducto {
  idVarianteProducto: number;
  sku: string;
  talla: string | null;
  color: string | null;
  aro: string | null;
}

// ms-inventario
export interface ItemInventarioApi {
  idItemInventario: number;
  idVariante: number;
  stockDisponible: number;
  stockReservado: number;
  stockMinimo: number;
  costoPromedio: number;
  fechaActualizacion: string;
}

/* ms-pedidos */

export type CanalVentaApi = 'WEB' | 'TIENDA';

export interface DatosVisitanteApi {
  idDatosVisitante: number;
  nombre: string;
  correo: string;
  telefono: string | null;
}

export interface PedidoApi {
  idPedido: number;
  numero: string;
  fechaCreacion: string;
  fechaExpiracion: string | null;
  estado: EstadoPedido;
  canal: CanalVentaApi;
  subtotal: number;
  descuento: number;
  total: number;
  motivoAnulacion: string | null;
  rutCliente: string | null;
  idCupon: number | null;
  idEmpleado: number | null;
  datosVisitante: DatosVisitanteApi | null;
}

export interface DetallePedidoApi {
  idDetallePedido: number;
  idVariante: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  pedido: { idPedido: number };
}

export interface HistorialEstadoApi {
  idHistorialEstadoPedido: number;
  estadoAnterior: EstadoPedido | null;
  estadoNuevo: EstadoPedido;
  fechaCambio: string;
  pedido: { idPedido: number };
}
