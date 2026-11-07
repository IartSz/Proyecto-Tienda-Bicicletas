import type { ReactNode } from 'react';
import type { Totales } from '../services/carrito.service';
import { formatoCLP } from '../utils/formato';

interface CartSummaryProps {
  totales: Totales;
  titulo?: string;
  // Lista de productos (checkout) arriba de los totales
  detalle?: ReactNode;
  // Botones o terminos al final
  children?: ReactNode;
}

const CartSummary = ({ totales, titulo = 'Resumen', detalle, children }: CartSummaryProps) => {
  return (
    <div className="bg-white rounded shadow-sm p-4 sticky-lg-top" style={{ top: '100px' }}>
      <h5 className="fw-bold mb-3">{titulo}</h5>
      {detalle}
      <div className="d-flex justify-content-between mb-2">
        <span>Subtotal</span>
        <span data-testid="subtotal">{formatoCLP(totales.subtotal)}</span>
      </div>
      <div className="d-flex justify-content-between mb-2">
        <span>Retiro en tienda</span>
        <span className="text-success">{totales.envio === 0 ? 'Gratis' : formatoCLP(totales.envio)}</span>
      </div>
      <div className="small text-muted mb-2">Retiras tu pedido en nuestra tienda (Centro, Concepción).</div>
      <hr />
      <div className="d-flex justify-content-between fw-bold fs-5 mb-3">
        <span>Total</span>
        <span data-testid="total">{formatoCLP(totales.total)}</span>
      </div>
      {children}
    </div>
  );
};

export default CartSummary;
