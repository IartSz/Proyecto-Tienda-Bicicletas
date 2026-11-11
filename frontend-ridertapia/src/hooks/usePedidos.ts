import useDatos from './useDatos';
import PedidoService, { EVENTO_PEDIDOS } from '../services/pedido.service';
import type { Pedido } from '../models/Pedido';

interface UsePedidosState {
  pedidos: Pedido[];
  loading: boolean;
  error: Error | null;
  recargar: () => Promise<void>;
}

// Se actualiza solo cuando cambia un pedido (por ejemplo, el admin cambia su estado)
export const usePedidos = (): UsePedidosState => {
  const { datos, loading, error, recargar } = useDatos<Pedido[]>(PedidoService.listar, [], EVENTO_PEDIDOS);
  return { pedidos: datos, loading, error, recargar };
};

export default usePedidos;
