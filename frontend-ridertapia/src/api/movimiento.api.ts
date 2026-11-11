import type { MovimientoInventario, MovimientoPayload, TipoMovimiento } from '../models/Movimiento';
import type { Producto } from '../models/Producto';
import ProductoService from '../services/producto.service';
import { leerSesion } from '../services/sesion';
import { limpiarRut } from '../utils/validaciones';
import apiClient from './cliente';
import { obtenerLista } from './hal';
import type { ItemInventarioApi } from './tipos';

// Movimientos en ms-inventario. Solo registran: el stock ya lo cambio ProductoService

type TipoApi = 'INGRESO' | 'VENTA_WEB' | 'VENTA_TIENDA' | 'USO_TALLER' | 'AJUSTE' | 'DEVOLUCION_CLIENTE'
  | 'DEVOLUCION_PROVEEDOR' | 'RESERVA' | 'LIBERACION_RESERVA';

interface MovimientoApi {
  idMovimientoInventario: number;
  tipo: TipoApi;
  cantidad: number;
  stockResultante: number;
  fecha: string;
  observacion: string | null;
  idEmpleado: number;
  itemInventario: { idItemInventario: number; idVariante: number };
}

const A_API: Record<TipoMovimiento, TipoApi> = { INGRESO: 'INGRESO', AJUSTE: 'AJUSTE', VENTA: 'VENTA_WEB', TALLER: 'USO_TALLER' };

const deApi = (tipo: TipoApi): TipoMovimiento => {
  if (tipo === 'VENTA_WEB' || tipo === 'VENTA_TIENDA') return 'VENTA';
  if (tipo === 'USO_TALLER') return 'TALLER';
  return tipo === 'INGRESO' ? 'INGRESO' : 'AJUSTE';
};

// idEmpleado 0 = el sistema (ventas); si no, el RUT sin DV del admin con sesion
const SISTEMA = 0;
const idEmpleado = (usuario: string): number => {
  if (usuario === 'Sistema') return SISTEMA;
  const rut = limpiarRut(leerSesion()?.rutUsuario ?? '');
  return Number(rut.slice(0, -1)) || 1;
};

const variantesDe = (p: Producto): number[] =>
  [p.idVariante, ...(p.variantes?.valores.map((v) => v.idVariante) ?? [])].filter((id): id is number => typeof id === 'number');

export const MovimientoApiService = {
  async listar(): Promise<MovimientoInventario[]> {
    const [movimientos, productos] = await Promise.all([obtenerLista<MovimientoApi>('/movimientos'), ProductoService.listar()]);
    return movimientos
      .map((m): MovimientoInventario => {
        const producto = productos.find((p) => variantesDe(p).includes(m.itemInventario.idVariante));
        return {
          idMovimiento: m.idMovimientoInventario,
          fecha: m.fecha,
          idProducto: producto?.idProducto ?? 0,
          nombre: producto?.nombre ?? 'Producto eliminado',
          tipo: deApi(m.tipo),
          cantidad: m.cantidad,
          stockResultante: m.stockResultante,
          usuario: m.idEmpleado === SISTEMA ? 'Sistema' : 'admin',
          detalle: m.observacion ?? ''
        };
      })
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
  },

  // Se anota sobre el item de la primera variante (el stock es el mismo en todas)
  async crear(movimiento: MovimientoPayload): Promise<MovimientoInventario> {
    const producto = await ProductoService.obtener(movimiento.idProducto);
    const [idVariante] = variantesDe(producto);
    if (!idVariante) throw new Error('El producto no tiene variantes en el inventario.');
    const { data: item } = await apiClient.get<ItemInventarioApi>(`/items-inventario/idVariante/${idVariante}`);

    const { data } = await apiClient.post<MovimientoApi>('/movimientos', {
      tipo: A_API[movimiento.tipo],
      cantidad: movimiento.cantidad,
      stockAnterior: movimiento.stockResultante - movimiento.cantidad,
      stockResultante: movimiento.stockResultante,
      fecha: movimiento.fecha.slice(0, 19),
      observacion: movimiento.detalle.slice(0, 255) || null,
      idEmpleado: idEmpleado(movimiento.usuario),
      idPedido: null,
      idOrdenTrabajo: null,
      itemInventario: { idItemInventario: item.idItemInventario }
    });
    return { ...movimiento, idMovimiento: data.idMovimientoInventario };
  }
};

export default MovimientoApiService;
