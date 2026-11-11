import { useEffect } from 'react';
import { Link, useParams } from 'react-router';
import CategoryGrid, { type ItemCategoria } from '../components/CategoryGrid';
import ProductList from '../components/ProductList';
import useProductos from '../hooks/useProductos';
import useCategorias from '../hooks/useCategorias';
import { buscarCategoriaPorSlug, subcategoriasDe } from '../data/categorias';

const Categoria = () => {
  const { slug } = useParams<{ slug: string }>();
  const { productos, loading, error } = useProductos();
  const { categorias, loading: cargandoCategorias } = useCategorias();
  const categoria = slug ? buscarCategoriaPorSlug(slug, categorias) : undefined;

  useEffect(() => {
    if (categoria) document.title = `${categoria.nombre} - Rider Tapia`;
  }, [categoria]);

  if (cargandoCategorias) return null;

  if (!slug || !categoria) {
    return (
      <section className="container py-5 text-center">
        <i className="bi bi-search" style={{ fontSize: '2.5rem' }}></i>
        <h2 className="mt-3">Categoría no encontrada</h2>
        <Link to="/" className="btn btn-brand mt-3">Volver al inicio</Link>
      </section>
    );
  }

  // Si es un grupo, muestra los productos de todas sus subcategorias
  const subcategorias = subcategoriasDe(slug, categorias);
  const botones: ItemCategoria[] = subcategorias.map((c) => ({ titulo: c.nombre, ruta: `/categoria/${c.slug ?? ''}` }));

  const lista = productos.filter(
    (p) => p.estado === 'PUBLICADO' && (p.categoria.slug === slug || p.categoria.categoriaPadre?.slug === slug)
  );

  return (
    <>
      <section className="store-section py-5">
        <div className="container">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-2" style={{ fontSize: '.85rem' }}>
              <li className="breadcrumb-item">
                <Link to="/" style={{ color: 'inherit', opacity: 0.8 }}>Inicio</Link>
              </li>
              {categoria.categoriaPadre && (
                <li className="breadcrumb-item">
                  <Link to={`/categoria/${categoria.categoriaPadre.slug ?? ''}`} style={{ color: 'inherit', opacity: 0.8 }}>
                    {categoria.categoriaPadre.nombre}
                  </Link>
                </li>
              )}
              <li className="breadcrumb-item active" aria-current="page" style={{ color: 'inherit' }}>{categoria.nombre}</li>
            </ol>
          </nav>
          <h2 className="mb-1">{categoria.nombre}</h2>
          <p className={botones.length > 0 ? 'mb-3' : 'mb-0'} style={{ opacity: 0.85 }}>{categoria.descripcion}</p>
          {botones.length > 0 && <CategoryGrid items={botones} variante="botones" />}
        </div>
      </section>

      <section className="py-5 bg-light">
        <div className="container">
          {loading && <p className="text-muted">Cargando productos...</p>}
          {error && <p className="text-danger">No se pudieron cargar los productos.</p>}
          {!loading && <ProductList productos={lista} conOrden />}
        </div>
      </section>
    </>
  );
};

export default Categoria;
