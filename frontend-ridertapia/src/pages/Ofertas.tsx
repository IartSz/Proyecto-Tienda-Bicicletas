import { Link } from 'react-router';
import ProductList from '../components/ProductList';
import useProductos from '../hooks/useProductos';

const Ofertas = () => {
  const { productos, loading, error } = useProductos();
  const ofertas = productos.filter((p) => p.estado === 'PUBLICADO' && p.precioOferta !== undefined);

  return (
    <>
      <section className="store-section py-5">
        <div className="container">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-2" style={{ fontSize: '.85rem' }}>
              <li className="breadcrumb-item">
                <Link to="/" style={{ color: 'inherit', opacity: 0.8 }}>Inicio</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page" style={{ color: 'inherit' }}>Ofertas</li>
            </ol>
          </nav>
          <h2 className="mb-1">Ofertas</h2>
          <p className="mb-0" style={{ opacity: 0.85 }}>Productos con precio rebajado.</p>
        </div>
      </section>

      <section className="py-5 bg-light">
        <div className="container">
          {loading && <p className="text-muted">Cargando productos...</p>}
          {error && <p className="text-danger">No se pudieron cargar los productos.</p>}
          {!loading && <ProductList productos={ofertas} conOrden mensajeVacio="No hay ofertas por ahora." />}
        </div>
      </section>
    </>
  );
};

export default Ofertas;
