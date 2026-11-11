import type { Pedido } from '../models/Pedido';
import type { Producto } from '../models/Producto';
import type { ReporteGuardado, ReporteGuardadoPayload } from '../models/Reporte';
import { estadoStock } from './producto.service';
import { diaLocal } from '../utils/formato';
import { esVenta } from '../utils/estadosPedido';
import { USAR_API } from '../api/cliente';
import ReporteApiService from '../api/reporte.api';

// Modo local (sin backend)
const CLAVE = 'reportesHistorial';
const MAXIMO = 30;

export type Agrupacion = 'dia' | 'semana' | 'mes';
export type OrdenTop = 'unidades' | 'ingresos';

export interface FilaVentas {
  clave: string;
  label: string; // etiqueta corta del grafico
  largo: string; // etiqueta para la tabla
  pedidos: number;
  ventas: number;
}

export interface FilaTop {
  idProducto: number;
  nombre: string;
  categoria: string;
  unidades: number;
  ingresos: number;
}

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const MESES_LARGO = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const claveGrupo = (d: Date, modo: Agrupacion): Omit<FilaVentas, 'pedidos' | 'ventas'> => {
  if (modo === 'dia') {
    return { clave: diaLocal(d), label: d.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit' }), largo: d.toLocaleDateString('es-CL') };
  }
  if (modo === 'semana') {
    const lunes = new Date(d);
    lunes.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    return {
      clave: diaLocal(lunes),
      label: lunes.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit' }),
      largo: `Semana del ${lunes.toLocaleDateString('es-CL')}`
    };
  }
  return {
    clave: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
    label: MESES[d.getMonth()],
    largo: `${MESES_LARGO[d.getMonth()]} ${d.getFullYear()}`
  };
};

// Ventas (sin cancelados ni anulados) entre dos dias YYYY-MM-DD
export const ventasEntre = (pedidos: Pedido[], desde: string, hasta: string): Pedido[] =>
  pedidos.filter((p) => esVenta(p) && (!desde || diaLocal(p.fechaCreacion) >= desde) && (!hasta || diaLocal(p.fechaCreacion) <= hasta));

export const ventasPorPeriodo = (pedidos: Pedido[], modo: Agrupacion): FilaVentas[] => {
  const grupos = new Map<string, FilaVentas>();
  for (const p of pedidos) {
    const g = claveGrupo(new Date(p.fechaCreacion), modo);
    const fila = grupos.get(g.clave) ?? { ...g, pedidos: 0, ventas: 0 };
    fila.pedidos++;
    fila.ventas += p.total;
    grupos.set(g.clave, fila);
  }
  return [...grupos.values()].sort((a, b) => a.clave.localeCompare(b.clave));
};

export const masVendidos = (pedidos: Pedido[], productos: Producto[], idCategoria: string, orden: OrdenTop): FilaTop[] => {
  const acumulado = new Map<number, FilaTop>();
  for (const p of pedidos) {
    for (const item of p.items ?? []) {
      const producto = productos.find((x) => x.idProducto === item.idProducto);
      if (idCategoria && String(producto?.categoria.idCategoria) !== idCategoria) continue;
      const fila = acumulado.get(item.idProducto)
        ?? { idProducto: item.idProducto, nombre: item.nombre ?? producto?.nombre ?? '', categoria: producto?.categoria.nombre ?? 'Sin categoría', unidades: 0, ingresos: 0 };
      fila.unidades += item.cantidad;
      fila.ingresos += item.precioUnitario * item.cantidad;
      acumulado.set(item.idProducto, fila);
    }
  }
  return [...acumulado.values()].sort((a, b) => b[orden] - a[orden]);
};

export const productosDeInventario = (productos: Producto[], idCategoria: string, estado: string): Producto[] =>
  productos
    .filter((p) => p.estado !== 'OCULTO' && (!idCategoria || String(p.categoria.idCategoria) === idCategoria) && (!estado || estadoStock(p) === estado))
    .sort((a, b) => (a.sku ?? '').localeCompare(b.sku ?? ''));

export const ETIQUETA_STOCK = { ok: 'Disponible', bajo: 'Stock bajo', cero: 'Sin stock' };

const leerHistorial = (): ReporteGuardado[] => {
  try {
    const guardado = localStorage.getItem(CLAVE);
    return guardado ? (JSON.parse(guardado) as ReporteGuardado[]) : [];
  } catch {
    return [];
  }
};

// Historial de reportes exportados
const ReporteLocalService = {
  async listar(): Promise<ReporteGuardado[]> {
    return leerHistorial();
  },

  async crear(reporte: ReporteGuardadoPayload): Promise<ReporteGuardado> {
    const lista = leerHistorial();
    const idReporte = Math.max(0, ...lista.map((r) => r.idReporte)) + 1;
    const nuevo: ReporteGuardado = { ...reporte, idReporte };
    try {
      localStorage.setItem(CLAVE, JSON.stringify([nuevo, ...lista].slice(0, MAXIMO)));
    } catch {
      throw new Error('No se pudo guardar el reporte en el historial.');
    }
    return nuevo;
  }
};

// VITE_USAR_API=true usa ms-reportes; si no, localStorage
export const ReporteService: typeof ReporteLocalService = USAR_API ? ReporteApiService : ReporteLocalService;

export default ReporteService;
