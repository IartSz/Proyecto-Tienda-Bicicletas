import { useState } from 'react';
import { Link } from 'react-router';
import type { Producto } from '../models/Producto';
import { estadoStock, precioActual } from '../services/producto.service';
import { formatoCLP } from '../utils/formato';

interface ProductCardProps {
  producto: Producto;
  onAgregar?: (producto: Producto) => void;
}

const ProductCard = ({ producto, onAgregar }: ProductCardProps) => {
  const [errorImagen, setErrorImagen] = useState<boolean>(false);
  const agotado = estadoStock(producto) === 'cero';
  const conOferta = producto.precioOferta !== undefined;

  return (
    <div className="product-card h-100 bg-white position-relative d-flex flex-column">
      {agotado ? (
        <span className="badge bg-secondary position-absolute m-2" style={{ zIndex: 1 }}>AGOTADO</span>
      ) : conOferta ? (
        <span className="badge badge-offer position-absolute m-2" style={{ zIndex: 1 }}>OFERTA</span>
      ) : null}

      <Link to={`/producto/${producto.idProducto}`} className="text-decoration-none text-reset d-block flex-grow-1">
        <div className="product-thumb" style={{ height: '220px', padding: '10px' }}>
          {producto.imagenPrincipal && !errorImagen ? (
            <img
              src={producto.imagenPrincipal}
              alt={producto.nombre}
              style={{ width: '100%', height: '200px', objectFit: 'contain' }}
              onError={() => setErrorImagen(true)}
            />
          ) : (
            // Icono de la categoria si no hay imagen
            <i className={`bi ${producto.categoria.icono ?? 'bi-box-seam'}`} style={{ fontSize: '4rem', color: '#999' }}></i>
          )}
        </div>
        <div className="p-3">
          <small className="text-muted text-uppercase" style={{ fontSize: '.7rem', letterSpacing: '1px' }}>
            {producto.marca.nombre}{producto.subtipo && ` · ${producto.subtipo}`}
          </small>
          <h6 className="mb-1 mt-1">{producto.nombre}</h6>
          {conOferta && <span className="price-old">{formatoCLP(producto.precioNormal)}</span>}
          <span className="price-new">{formatoCLP(precioActual(producto))}</span>
          {producto.variantes && (
            <div className="mt-2" style={{ fontSize: '.8rem' }}>
              {producto.variantes.nombre}: {producto.variantes.valores.map((v) => v.valor).join(' · ')}
            </div>
          )}
        </div>
      </Link>

      {onAgregar && (
        <div className="px-3 pb-3">
          <button type="button" className="btn btn-brand btn-sm w-100" onClick={() => onAgregar(producto)} disabled={agotado}>
            <i className="bi bi-cart-plus me-1"></i>Agregar
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductCard;
