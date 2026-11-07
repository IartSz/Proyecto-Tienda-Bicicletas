import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import useProductos from '../hooks/useProductos';
import useCarrito from '../hooks/useCarrito';
import { CANTIDAD_MAXIMA, unidadesEnCarrito } from '../services/carrito.service';
import { formatoCLP } from '../utils/formato';

interface MensajeAgregado {
  cantidad: number;
  detalle: string;
}

const ProductoDetalle = () => {
  const { id } = useParams<{ id: string }>();
  const { productos, loading } = useProductos();
  const { items, agregar } = useCarrito();
  const [variante, setVariante] = useState<string | null>(null);
  const [cantidad, setCantidad] = useState<number>(1);
  const [errorVariante, setErrorVariante] = useState<boolean>(false);
  const [errorStock, setErrorStock] = useState<string | null>(null);
  const [agregado, setAgregado] = useState<MensajeAgregado | null>(null);
  const [errorImagen, setErrorImagen] = useState<boolean>(false);

  // Valida el id como en el resto de la app
  const numericId = Number(id);
  const idValido = !!id && !Number.isNaN(numericId);
  const producto = idValido ? productos.find((p) => p.idProducto === numericId && p.estado === 'PUBLICADO') : undefined;

  // Si solo hay una opcion disponible, queda elegida
  const disponibles = producto?.variantes?.valores.filter((v) => v.disponible) ?? [];
  const varianteElegida = variante ?? (disponibles.length === 1 ? disponibles[0]?.valor ?? null : null);

  useEffect(() => {
    if (producto) document.title = `${producto.nombre} - Rider Tapia`;
  }, [producto]);

  if (loading) return <p className="container py-5 text-muted">Cargando producto...</p>;

  if (!producto) {
    return (
      <section className="py-5">
        <div className="container text-center py-5">
          <i className="bi bi-emoji-frown" style={{ fontSize: '3rem' }}></i>
          <h3 className="mt-3">Producto no encontrado</h3>
          <Link to="/" className="btn btn-brand mt-3">Volver al inicio</Link>
        </div>
      </section>
    );
  }

  const stock = producto.stockDisponible ?? 0;
  const libre = stock - unidadesEnCarrito(items, producto.idProducto);
  const maximo = Math.max(1, Math.min(CANTIDAD_MAXIMA, libre));
  const conOferta = producto.precioOferta !== undefined;
  const op = producto.variantes;
  const datoVariante = op?.valores.find((v) => v.valor === varianteElegida);

  const handleAgregar = () => {
    if (op && !varianteElegida) {
      setErrorVariante(true);
      return;
    }
    const error = agregar(producto, cantidad, varianteElegida ?? undefined);
    if (error) {
      setErrorStock(error);
      setAgregado(null);
      return;
    }
    setErrorStock(null);
    setAgregado({ cantidad, detalle: op && varianteElegida ? ` (${op.nombre.toLowerCase()} ${varianteElegida})` : '' });
    setCantidad(1);
  };

  const estadoStock = () => {
    if (stock <= 0) return <span className="text-danger fw-semibold"><i className="bi bi-x-circle me-1"></i>Producto agotado</span>;
    if (libre <= 0) return <span className="text-muted">Ya tienes en tu carrito todas las unidades disponibles.</span>;
    if (stock <= 3) return <span className="text-warning-emphasis fw-semibold"><i className="bi bi-exclamation-circle me-1"></i>¡Últimas {stock} unidades!</span>;
    return <span className="text-success"><i className="bi bi-check-circle me-1"></i>Disponible</span>;
  };

  return (
    <section className="py-5">
      <div className="container">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb mb-4" style={{ fontSize: '.85rem' }}>
            <li className="breadcrumb-item"><Link to="/">Inicio</Link></li>
            <li className="breadcrumb-item"><Link to={`/categoria/${producto.categoria.slug ?? ''}`}>{producto.categoria.nombre}</Link></li>
            <li className="breadcrumb-item active" aria-current="page">{producto.nombre}</li>
          </ol>
        </nav>

        <div className="row g-5">
          <div className="col-lg-6">
            <div className="bg-light rounded position-relative d-flex align-items-center justify-content-center" style={{ height: '420px', padding: '20px' }}>
              {conOferta && <span className="badge badge-offer position-absolute top-0 start-0 m-2" style={{ zIndex: 1 }}>OFERTA</span>}
              {producto.imagenPrincipal && !errorImagen
                ? <img src={producto.imagenPrincipal} alt={producto.nombre} style={{ width: '100%', height: '380px', objectFit: 'contain' }} onError={() => setErrorImagen(true)} />
                : <i className={`bi ${producto.categoria.icono ?? 'bi-box-seam'}`} style={{ fontSize: '4rem', color: '#999' }}></i>}
            </div>
          </div>

          <div className="col-lg-6">
            <small className="text-muted text-uppercase" style={{ letterSpacing: '1px' }}>
              {producto.marca.nombre}{producto.subtipo && ` · ${producto.subtipo}`}
            </small>
            <h1 className="h3 fw-bold mt-1">{producto.nombre}</h1>
            <div className="mb-3">
              {conOferta && <span className="price-old fs-5 me-2">{formatoCLP(producto.precioNormal)}</span>}
              <span className="price-new fs-3 fw-bold">{formatoCLP(producto.precioOferta ?? producto.precioNormal)}</span>
            </div>
            <p className="text-muted">{producto.descripcion}</p>

            {op && (
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <strong>
                    {op.nombre}{' '}
                    {datoVariante && (
                      <span className="fw-normal text-muted">
                        ({datoVariante.valor}{datoVariante.detalle && ` · ${datoVariante.detalle}`})
                      </span>
                    )}
                  </strong>
                  <a href="#guia" style={{ fontSize: '.85rem' }}>{op.guia}</a>
                </div>
                <div className="d-flex flex-wrap gap-2">
                  {op.valores.map((v) => (
                    <button
                      key={v.valor}
                      type="button"
                      className={`btn ${v.disponible ? 'btn-outline-dark' : 'btn-outline-secondary text-decoration-line-through'}${varianteElegida === v.valor ? ' active' : ''}`}
                      disabled={!v.disponible}
                      style={{ minWidth: '60px' }}
                      onClick={() => { setVariante(v.valor); setErrorVariante(false); }}
                    >
                      {v.valor}
                    </button>
                  ))}
                </div>
                {errorVariante && <div className="text-danger mt-2" style={{ fontSize: '.85rem' }}>Selecciona una opción de {op.nombre.toLowerCase()}.</div>}
              </div>
            )}

            <div className="d-flex gap-2 align-items-center mb-4">
              <div className="input-group" style={{ width: '130px' }}>
                <button className="btn btn-outline-dark" type="button" aria-label="Disminuir" onClick={() => setCantidad((c) => Math.max(1, c - 1))}>−</button>
                <input type="text" className="form-control text-center" value={cantidad} readOnly aria-label="Cantidad" />
                <button className="btn btn-outline-dark" type="button" aria-label="Aumentar" onClick={() => setCantidad((c) => Math.min(maximo, c + 1))}>+</button>
              </div>
              <button className="btn btn-brand flex-grow-1" type="button" onClick={handleAgregar} disabled={stock <= 0 || libre <= 0}>
                {stock <= 0 ? 'AGOTADO' : <><i className="bi bi-cart-plus me-2"></i>AGREGAR AL CARRITO</>}
              </button>
            </div>
            <div className="small mb-3">{errorStock ? <span className="text-danger">{errorStock}</span> : estadoStock()}</div>
            {agregado && (
              <div className="alert alert-success" style={{ fontSize: '.9rem' }}>
                <i className="bi bi-check-circle me-2"></i>Agregaste {agregado.cantidad} × {producto.nombre}{agregado.detalle} al carrito.
                <Link to="/carrito" className="alert-link ms-1">Ver carrito</Link>
              </div>
            )}
            <ul className="list-unstyled text-muted" style={{ fontSize: '.85rem' }}>
              <li><i className="bi bi-arrow-repeat me-2"></i>Cambios y devoluciones · <Link to="/politicas/reembolso">ver política</Link></li>
              <li><i className="bi bi-shop me-2"></i>Retiro en tienda: Centro, Concepción</li>
            </ul>
          </div>
        </div>

        <div className="row g-5 mt-2">
          <div className="col-lg-6">
            <h5 className="fw-bold mb-3">Características</h5>
            <table className="table">
              <tbody>
                {(producto.especificaciones ?? []).map((e) => (
                  <tr key={e.nombre}>
                    <th className="fw-semibold" style={{ width: '45%' }}>{e.nombre}</th>
                    <td>{e.valor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {op && (
            <div className="col-lg-6" id="guia">
              <h5 className="fw-bold mb-3">{op.guia}</h5>
              <table className="table">
                <thead>
                  <tr><th>{op.nombre}</th><th>{op.columna}</th><th>Stock</th></tr>
                </thead>
                <tbody>
                  {op.valores.map((v) => (
                    <tr key={v.valor}>
                      <td>{v.valor}</td>
                      <td>{v.detalle}</td>
                      <td>{v.disponible ? <span className="text-success">Disponible</span> : <span className="text-muted">Agotado</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-muted" style={{ fontSize: '.8rem' }}>{op.nota}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProductoDetalle;
