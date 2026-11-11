import type { EstadoPedido, MedioPago, Pedido } from '../models/Pedido';

export interface ConfigEstado {
  etiqueta: string;
  icono: string;
  badge: string; // clase de Bootstrap (tienda)
  tag: string; // clase del panel
  texto: string; // mensaje para el cliente
}

export const ESTADOS_PEDIDO: Record<EstadoPedido, ConfigEstado> = {
  PENDIENTE_PAGO: { etiqueta: 'Pendiente de pago', icono: 'bi-hourglass-split', badge: 'bg-warning text-dark', tag: 'tag-bajo', texto: 'Esperando el pago.' },
  PAGADO: { etiqueta: 'Pagado', icono: 'bi-credit-card', badge: 'bg-info text-dark', tag: 'tag-ingreso', texto: 'Recibimos tu pago.' },
  EN_PREPARACION: { etiqueta: 'En preparación', icono: 'bi-box-seam', badge: 'bg-primary', tag: 'tag-ajuste', texto: 'Estamos preparando tu pedido.' },
  LISTO_PARA_RETIRO: { etiqueta: 'Listo para retiro', icono: 'bi-shop', badge: 'bg-success', tag: 'tag-venta', texto: 'Puedes retirarlo en la tienda (Centro, Concepción).' },
  RETIRADO: { etiqueta: 'Retirado', icono: 'bi-check2-circle', badge: 'bg-success', tag: 'tag-ok', texto: 'Pedido retirado. ¡Gracias por tu compra!' },
  CANCELADO: { etiqueta: 'Cancelado', icono: 'bi-x-circle', badge: 'bg-danger', tag: 'tag-cero', texto: 'El pedido fue cancelado.' },
  ANULADO: { etiqueta: 'Anulado', icono: 'bi-slash-circle', badge: 'bg-secondary', tag: 'tag-off', texto: 'El pedido fue anulado.' }
};

export const ESTADOS: EstadoPedido[] = Object.keys(ESTADOS_PEDIDO) as EstadoPedido[];

// Ya no se pueden cambiar
export const ESTADOS_FINALES: EstadoPedido[] = ['RETIRADO', 'CANCELADO', 'ANULADO'];

// Al pasar a estos estados las unidades vuelven al stock
export const ESTADOS_QUE_DEVUELVEN: EstadoPedido[] = ['CANCELADO', 'ANULADO'];

// Cancelados y anulados no cuentan como venta
export const esVenta = (pedido: Pedido): boolean => !ESTADOS_QUE_DEVUELVEN.includes(pedido.estado);

export const estaAbierto = (pedido: Pedido): boolean => !ESTADOS_FINALES.includes(pedido.estado);

// Pasos de la barra de avance del cliente
export const pasosPedido = (pedido: Pedido): EstadoPedido[] => {
  const pasos: EstadoPedido[] = ['PAGADO', 'EN_PREPARACION', 'LISTO_PARA_RETIRO', 'RETIRADO'];
  // Transferencia y efectivo parten pendientes de pago
  return pedido.medioPago && pedido.medioPago !== 'TARJETA' ? ['PENDIENTE_PAGO', ...pasos] : pasos;
};

// Estados que el admin puede elegir para un pedido
export const estadosElegibles = (pedido: Pedido): EstadoPedido[] =>
  ESTADOS.filter((e) => e !== pedido.estado && !(e === 'PENDIENTE_PAGO' && pedido.medioPago === 'TARJETA'));

export const ETIQUETA_MEDIO_PAGO: Record<MedioPago, string> = {
  TARJETA: 'Tarjeta',
  TRANSFERENCIA: 'Transferencia',
  EFECTIVO: 'Efectivo al retirar'
};
