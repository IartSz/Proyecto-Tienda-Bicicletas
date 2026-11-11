import useDatos from './useDatos';
import MovimientoService from '../services/movimiento.service';
import type { MovimientoInventario } from '../models/Movimiento';

interface UseMovimientosState {
  movimientos: MovimientoInventario[];
  loading: boolean;
  error: Error | null;
  recargar: () => Promise<void>;
}

export const useMovimientos = (): UseMovimientosState => {
  const { datos, loading, error, recargar } = useDatos<MovimientoInventario[]>(MovimientoService.listar, []);
  return { movimientos: datos, loading, error, recargar };
};

export default useMovimientos;
