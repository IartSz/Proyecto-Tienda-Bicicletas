import type { MovimientoInventario, MovimientoPayload, TipoMovimiento } from '../models/Movimiento';
import type { Producto } from '../models/Producto';

// Por ahora en localStorage; luego se cambia por la API
const CLAVE = 'movimientos';
const MAXIMO = 500;

const leer = (): MovimientoInventario[] => {
  try {
    const guardados = localStorage.getItem(CLAVE);
    return guardados ? (JSON.parse(guardados) as MovimientoInventario[]) : [];
  } catch {
    return [];
  }
};

const guardar = (lista: MovimientoInventario[]): void => {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(lista));
  } catch {
    throw new Error('No se pudo guardar el movimiento.');
  }
};

export const MovimientoService = {
  // Del mas reciente al mas antiguo
  async listar(): Promise<MovimientoInventario[]> {
    return leer();
  },

  async crear(movimiento: MovimientoPayload): Promise<MovimientoInventario> {
    const lista = leer();
    const idMovimiento = Math.max(0, ...lista.map((m) => m.idMovimiento)) + 1;
    const nuevo: MovimientoInventario = { ...movimiento, idMovimiento };
    guardar([nuevo, ...lista].slice(0, MAXIMO));
    return nuevo;
  },

  // Anota el movimiento de un producto que ya tiene su stock actualizado
  async registrar(producto: Producto, tipo: TipoMovimiento, cantidad: number, usuario: string, detalle: string): Promise<MovimientoInventario> {
    return this.crear({
      fecha: new Date().toISOString(),
      idProducto: producto.idProducto,
      nombre: producto.nombre,
      tipo,
      cantidad,
      stockResultante: producto.stockDisponible ?? 0,
      usuario,
      detalle
    });
  }
};

export default MovimientoService;
