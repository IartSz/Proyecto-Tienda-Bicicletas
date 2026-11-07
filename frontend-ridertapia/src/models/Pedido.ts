import type { ItemCarrito } from './ItemCarrito';

export type EstadoPedido = 
  | 'PENDIENTE_PAGO'
  | 'PAGADO'
  | 'EN_PREPARACION'
  | 'LISTO_PARA_RETIRO'
  | 'RETIRADO'
  | 'CANCELADO'
  | 'ANULADO';

export type CanalVenta = 'WEB' | 'MOVIL' | 'TIENDA_FISICA';

export type MedioPago = 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA';

export interface DatosVisitante {
    idDatosVisitante?: number;
    nombre: string;
    correo: string; 
    telefono: string | null;
}

// Datos del comprador 
export interface DatosComprador {
    nombre: string;
    apellido: string;
    rut: string;
    email: string;
    telefono: string;
}

export interface CambioEstado {
    estado: EstadoPedido;
    fecha: string;
    nota: string;
}

export interface Pedido {
  idPedido: number;
  numero: string;
  fechaCreacion: string;
  fechaExpiracion: string | null;
  estado: EstadoPedido;
  canal: CanalVenta;
  subtotal: number;
  descuento: number;
  total: number;
  motivoAnulacion: string | null;
  rutCliente: string | null;
  idCupon: number | null;
  idEmpleado: number | null;
  datosVisitante: DatosVisitante | null;
  // Solo frontend
  envio?: number; // siempre 0: solo retiro en tienda
  cliente?: DatosComprador;
  medioPago?: MedioPago;
  items?: ItemCarrito[];
  historial?: CambioEstado[];
  novedad?: boolean; // el cliente aún no ve el último cambio de estado
}

export type PedidoPayload = Omit<Pedido, 'idPedido'>;
