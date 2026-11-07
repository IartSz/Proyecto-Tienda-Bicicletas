import { useState, type ChangeEvent } from 'react';
import type { Producto } from '../models/Producto';
import { precioActual } from '../services/producto.service';
import ProductCard from './ProductCard';

type Orden = '' | 'asc' | 'desc';

interface ProductListProps {
  productos: Producto[];
  onAgregar?: (producto: Producto) => void;
  conOrden?: boolean;
  mensajeVacio?: string;
}

const ordenar = (lista: Producto[], orden: Orden): Producto[] => {
  if (orden === 'asc') return [...lista].sort((a, b) => precioActual(a) - precioActual(b));
  if (orden === 'desc') return [...lista].sort((a, b) => precioActual(b) - precioActual(a));
  return lista;
};

const ProductList = ({ productos, onAgregar, conOrden = false, mensajeVacio = 'Aún no hay productos en esta categoría.' }: ProductListProps) => {
  const [orden, setOrden] = useState<Orden>('');
  const lista = ordenar(productos, orden);

  const handleOrden = (event: ChangeEvent<HTMLSelectElement>) => {
    setOrden(event.target.value as Orden);
  };

  return (
    <>
      {conOrden && (
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
          <p className="mb-0 text-muted">{lista.length} productos</p>
          <select className="form-select form-select-sm" style={{ width: 'auto' }} value={orden} onChange={handleOrden} aria-label="Ordenar productos">
            <option value="">Ordenar por: destacados</option>
            <option value="asc">Precio: menor a mayor</option>
            <option value="desc">Precio: mayor a menor</option>
          </select>
        </div>
      )}

      <div className="row g-4">
        {lista.length === 0 ? (
          <div className="col-12 text-center text-muted py-5">
            <i className="bi bi-box-seam" style={{ fontSize: '2.5rem' }}></i>
            <p className="mt-2">{mensajeVacio}</p>
          </div>
        ) : (
          lista.map((producto) => (
            <div className="col-6 col-md-4 col-lg-3" key={producto.idProducto}>
              <ProductCard producto={producto} onAgregar={onAgregar} />
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default ProductList;
