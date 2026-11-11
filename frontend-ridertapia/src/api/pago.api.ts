import type { EstadoPedido, MedioPago } from '../models/Pedido';
import apiClient from './cliente';
import { obtenerLista } from './hal';
import type { EstadoPagoApi, PagoApi } from './tipos';

// Pagos en ms-pagos: una tabla por medio de pago

const RUTAS: Record<MedioPago, string> = {
  TARJETA: '/pagos-webpay',
  TRANSFERENCIA: '/pagos-transferencia',
  EFECTIVO: '/pagos-presenciales'
};

const MEDIOS = Object.keys(RUTAS) as MedioPago[];

// Plazo para transferir antes de que el pedido se pueda anular
const HORAS_TRANSFERENCIA = 48;

const sinZona = (fecha: Date): string => fecha.toISOString().slice(0, 19);

// Tarjeta: aprobado al instante (simulado). Transferencia y efectivo: pendientes
export const registrarPago = async (idPedido: number, medio: MedioPago, monto: number, ultimosDigitos?: string): Promise<void> => {
  const ahora = new Date();
  const base = { idPedido, monto, fecha: sinZona(ahora) };

  if (medio === 'TARJETA') {
    await apiClient.post(RUTAS.TARJETA, {
      ...base,
      estado: 'APROBADO',
      token: `SIM-${ahora.getTime()}`,
      codigoAutorizacion: String(Math.floor(100000 + Math.random() * 900000)),
      ultimosDigitosTarjeta: ultimosDigitos ?? null
    });
  } else if (medio === 'TRANSFERENCIA') {
    const limite = new Date(ahora.getTime() + HORAS_TRANSFERENCIA * 3600000);
    await apiClient.post(RUTAS.TRANSFERENCIA, { ...base, estado: 'PENDIENTE', comprobanteUrl: null, fechaLimite: sinZona(limite), observacion: null });
  } else {
    await apiClient.post(RUTAS.EFECTIVO, { ...base, estado: 'PENDIENTE', medioPago: 'EFECTIVO' });
  }
};

// idPedido -> medio de pago
export const mediosDePago = async (): Promise<Map<number, MedioPago>> => {
  const listas = await Promise.all(MEDIOS.map((m) => obtenerLista<PagoApi>(RUTAS[m])));
  const mapa = new Map<number, MedioPago>();
  listas.forEach((lista, i) => lista.forEach((p) => mapa.set(p.idPedido, MEDIOS[i])));
  return mapa;
};

// Estado del pago segun el nuevo estado del pedido (null = no cambia)
export const estadoPagoPara = (pago: EstadoPagoApi, pedido: EstadoPedido): EstadoPagoApi | null => {
  if (pedido === 'PAGADO' && pago === 'PENDIENTE') return 'APROBADO';
  if (pedido === 'CANCELADO' || pedido === 'ANULADO') {
    if (pago === 'APROBADO') return 'REEMBOLSADO';
    if (pago === 'PENDIENTE') return 'RECHAZADO';
  }
  return null;
};

export const sincronizarPago = async (idPedido: number, medio: MedioPago | undefined, estadoPedido: EstadoPedido): Promise<void> => {
  if (!medio) return;
  const pagos = await obtenerLista<PagoApi & { _links?: unknown }>(`${RUTAS[medio]}/idPedido/${idPedido}`);
  for (const { _links, ...pago } of pagos) {
    void _links;
    const nuevo = estadoPagoPara(pago.estado, estadoPedido);
    if (nuevo) await apiClient.put(`${RUTAS[medio]}/${pago.idPago}`, { ...pago, estado: nuevo });
  }
};

export const eliminarPagos = async (idPedido: number): Promise<void> => {
  for (const medio of MEDIOS) {
    const pagos = await obtenerLista<PagoApi>(`${RUTAS[medio]}/idPedido/${idPedido}`);
    for (const p of pagos) await apiClient.delete(`${RUTAS[medio]}/${p.idPago}`);
  }
};
