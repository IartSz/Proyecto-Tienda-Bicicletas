import { useState } from 'react';
import { Link } from 'react-router';
import type { Producto } from '../../models/Producto';
import { estadoStock } from '../../services/producto.service';
import { formatoCLP } from '../../utils/formato';

interface ProductTableProps {
  productos: Producto[];
  onEditar: (producto: Producto) => void;
  onCambiarEstado: (producto: Producto) => void;
}

const ETIQUETAS = {
  ok: { clase: 'tag-ok', texto: 'Disponible' },
  bajo: { clase: 'tag-bajo', texto: 'Stock bajo' },
  cero: { clase: 'tag-cero', texto: 'Sin stock' }
};

// Miniatura con icono de respaldo
const Miniatura = ({ producto }: { producto: Producto }) => {
  const [error, setError] = useState<boolean>(false);
  const icono = producto.categoria.icono ?? 'bi-box-seam';
  return (
    <span className="thumb">
      {producto.imagenPrincipal && !error
        ? <img src={producto.imagenPrincipal} alt="" onError={() => setError(true)} />
        : <i className={`bi ${icono}`}></i>}
    </span>
  );
};

const ProductTable = ({ productos, onEditar, onCambiarEstado }: ProductTableProps) => {
  return (
    <div className="table-responsive">
      <table className="table adm-table">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Categoría</th>
            <th className="num">Precio</th>
            <th>Stock</th>
            <th>Estado</th>
            <th className="text-end">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.length === 0 && (
            <tr>
              <td colSpan={6} className="text-center text-muted py-4">No hay productos con esos filtros.</td>
            </tr>
          )}
          {productos.map((producto) => {
            const inactivo = producto.estado === 'OCULTO';
            const estado = estadoStock(producto);
            const stock = producto.stockDisponible ?? 0;
            const ancho = Math.min(100, Math.round((stock / Math.max(1, (producto.stockMinimo ?? 0) * 2)) * 100));

            return (
              <tr key={producto.idProducto} className={inactivo ? 'is-inactive' : undefined}>
                <td>
                  <div className="prod-cell">
                    <Miniatura producto={producto} />
                    <div>
                      <strong>{producto.nombre}</strong>
                      <small>{producto.sku} · {producto.marca.nombre}</small>
                    </div>
                  </div>
                </td>
                <td>{producto.categoria.nombre}</td>
                <td className="num">
                  {producto.precioOferta !== undefined && <span className="price-before">{formatoCLP(producto.precioNormal)}</span>}
                  <span className="price-now">{formatoCLP(producto.precioOferta ?? producto.precioNormal)}</span>
                </td>
                <td>
                  <div className="stock">
                    <span className={estado === 'ok' ? 'gauge' : `gauge gauge-${estado}`}><span style={{ width: `${ancho}%` }}></span></span>
                    <span className="stock-num">{stock}</span>
                  </div>
                </td>
                <td>
                  {inactivo
                    ? <span className="tag tag-off">Dado de baja</span>
                    : <span className={`tag ${ETIQUETAS[estado].clase}`}>{ETIQUETAS[estado].texto}</span>}
                </td>
                <td>
                  <div className="actions">
                    {inactivo ? (
                      <button className="btn-icon" type="button" title="Reactivar" aria-label="Reactivar" onClick={() => onCambiarEstado(producto)}>
                        <i className="bi bi-arrow-counterclockwise"></i>
                      </button>
                    ) : (
                      <>
                        <Link className="btn-icon" to={`/producto/${producto.idProducto}`} target="_blank" title="Ver en tienda" aria-label="Ver en tienda">
                          <i className="bi bi-eye"></i>
                        </Link>
                        <button className="btn-icon" type="button" title="Editar" aria-label="Editar" onClick={() => onEditar(producto)}>
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button className="btn-icon danger" type="button" title="Dar de baja" aria-label="Dar de baja" onClick={() => onCambiarEstado(producto)}>
                          <i className="bi bi-archive"></i>
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;
