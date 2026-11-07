import { useState } from 'react';
import { Link } from 'react-router';
import type { ItemCarrito } from '../models/ItemCarrito';
import { CANTIDAD_MINIMA } from '../services/carrito.service';
import { formatoCLP } from '../utils/formato';

interface CartItemRowProps {
  item: ItemCarrito;
  // Nombre de la variante: "Talla", "Medida"...
  nombreVariante?: string;
  mensaje?: string | null;
  onCambiarCantidad: (cantidad: number) => void;
  onEliminar: () => void;
}

const CartItemRow = ({ item, nombreVariante, mensaje, onCambiarCantidad, onEliminar }: CartItemRowProps) => {
  const [errorImagen, setErrorImagen] = useState<boolean>(false);
  const ruta = `/producto/${item.idProducto}`;

  return (
    <div className="py-3 border-top">
      <div className="d-flex gap-3 align-items-center flex-wrap flex-sm-nowrap">
        <Link to={ruta} className="bg-light rounded flex-shrink-0 d-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px', padding: '5px' }}>
          {item.imagen && !errorImagen
            ? <img src={item.imagen} alt={item.nombre ?? ''} style={{ width: '100%', height: '70px', objectFit: 'contain' }} onError={() => setErrorImagen(true)} />
            : <i className="bi bi-box-seam" style={{ fontSize: '2rem', color: '#999' }}></i>}
        </Link>
        <div className="flex-grow-1">
          <Link to={ruta} className="text-reset text-decoration-none fw-semibold">{item.nombre}</Link>
          {item.variante && <div className="small text-muted">{nombreVariante ?? 'Opción'}: {item.variante}</div>}
          <div className="small">{formatoCLP(item.precioUnitario)} c/u</div>
        </div>
        <div className="input-group input-group-sm" style={{ width: '105px' }}>
          <button className="btn btn-outline-dark" type="button" aria-label="Disminuir" onClick={() => onCambiarCantidad(item.cantidad - 1)} disabled={item.cantidad <= CANTIDAD_MINIMA}>−</button>
          <input className="form-control text-center" value={item.cantidad} readOnly aria-label="Cantidad" />
          <button className="btn btn-outline-dark" type="button" aria-label="Aumentar" onClick={() => onCambiarCantidad(item.cantidad + 1)}>+</button>
        </div>
        <div className="fw-bold text-end" style={{ minWidth: '85px' }}>{formatoCLP(item.precioUnitario * item.cantidad)}</div>
        <button className="btn btn-sm text-danger" type="button" title="Eliminar" aria-label="Eliminar" onClick={onEliminar}>
          <i className="bi bi-x-lg"></i>
        </button>
      </div>
      {mensaje && <div className="small text-danger mt-2"><i className="bi bi-exclamation-circle me-1"></i>{mensaje}</div>}
    </div>
  );
};

export default CartItemRow;
