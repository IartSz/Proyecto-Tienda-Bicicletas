import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import useSesion from '../hooks/useSesion';
import usePedidos from '../hooks/usePedidos';
import useProductos from '../hooks/useProductos';
import PedidoService, { pedidosDeCorreo } from '../services/pedido.service';
import type { Pedido } from '../models/Pedido';
import { ESTADOS_PEDIDO, ETIQUETA_MEDIO_PAGO, pasosPedido } from '../utils/estadosPedido';
import { fechaCorta, formatoCLP } from '../utils/formato';

// Barra de avance: Pagado > En preparacion > Listo para retiro > Retirado
const Avance = ({ pedido }: { pedido: Pedido }) => {
  if (pedido.estado === 'CANCELADO' || pedido.estado === 'ANULADO') {
    return (
      <div className="alert alert-danger small mb-3">
        <i className={`bi ${ESTADOS_PEDIDO[pedido.estado].icono} me-1`}></i>
        {ESTADOS_PEDIDO[pedido.estado].texto}
        {pedido.motivoAnulacion && <> Motivo: {pedido.motivoAnulacion}</>}
      </div>
    );
  }
  const pasos = pasosPedido(pedido);
  const indice = Math.max(0, pasos.indexOf(pedido.estado));

  return (
    <div className="d-flex justify-content-between position-relative mb-4 mt-2 px-2">
      <div className="position-absolute bg-secondary-subtle" style={{ height: '3px', left: '30px', right: '30px', top: '15px' }}></div>
      <div className="position-absolute bg-dark" style={{ height: '3px', left: '30px', top: '15px', width: `calc((100% - 60px) * ${indice / (pasos.length - 1)})` }}></div>
      {pasos.map((paso, i) => (
        <div className="text-center position-relative" style={{ width: `${100 / pasos.length}%` }} key={paso}>
          <span
            className={`d-inline-flex align-items-center justify-content-center rounded-circle ${i <= indice ? 'bg-dark text-white' : 'bg-white border text-muted'}`}
            style={{ width: '32px', height: '32px' }}
          >
            <i className={`bi ${i < indice ? 'bi-check-lg' : ESTADOS_PEDIDO[paso].icono}`}></i>
          </span>
          <div className={`small mt-1 ${i === indice ? 'fw-bold' : 'text-muted'}`} style={{ fontSize: '.75rem' }}>{ESTADOS_PEDIDO[paso].etiqueta}</div>
        </div>
      ))}
    </div>
  );
};

const MisPedidos = () => {
  const { sesion } = useSesion();
  const { pedidos, loading, error } = usePedidos();
  const { productos } = useProductos();
  // Pedidos que tenian novedades al entrar (se avisa "ACTUALIZADO" en esta visita)
  const [nuevos, setNuevos] = useState<number[]>([]);
  // null = el que se abre por defecto; -1 = todos cerrados
  const [abierto, setAbierto] = useState<number | null>(null);
  const correo = sesion?.emailCliente ?? '';

  // El cliente ya vio las novedades: se quita el aviso del menu
  useEffect(() => {
    if (!correo) return;
    let activo = true;
    PedidoService.listar()
      .then(async (lista) => {
        const conNovedad = pedidosDeCorreo(lista, correo).filter((p) => p.novedad);
        if (!activo || conNovedad.length === 0) return;
        setNuevos(conNovedad.map((p) => p.idPedido));
        for (const pedido of conNovedad) {
          await PedidoService.actualizar(pedido.idPedido, { ...pedido, novedad: false });
        }
      })
      .catch((err: unknown) => console.error(err));
    return () => {
      activo = false;
    };
  }, [correo]);

  if (!sesion) return null;

  const mios = pedidosDeCorreo(pedidos, correo);
  const idAbierto = abierto ?? nuevos[0] ?? mios[0]?.idPedido;

  return (
    <>
      <section className="store-section py-4">
        <div className="container">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-2" style={{ fontSize: '.85rem' }}>
              <li className="breadcrumb-item"><Link to="/" style={{ color: 'inherit', opacity: 0.8 }}>Inicio</Link></li>
              <li className="breadcrumb-item active" aria-current="page" style={{ color: 'inherit' }}>Mis pedidos</li>
            </ol>
          </nav>
          <h2 className="mb-0"><i className="bi bi-bag-check me-2"></i>Mis pedidos</h2>
          <p className="mb-0 mt-1" style={{ opacity: 0.85 }}>Hola, {sesion.nombre}. Aquí puedes seguir el estado de tus compras.</p>
        </div>
      </section>

      <section className="py-5 bg-light">
        <div className="container" style={{ maxWidth: '900px' }}>
          {error && <div className="alert alert-danger py-2">No se pudieron cargar tus pedidos.</div>}
          {loading && <p className="text-muted text-center">Cargando pedidos...</p>}

          {!loading && mios.length === 0 && (
            <div className="text-center py-5">
              <i className="bi bi-bag" style={{ fontSize: '3.5rem', color: '#999' }}></i>
              <h4 className="mt-3">Aún no tienes pedidos</h4>
              <p className="text-muted">Cuando compres con tu cuenta, tus pedidos aparecerán aquí.</p>
              <Link to="/" className="btn btn-brand mt-2">Ir a la tienda</Link>
            </div>
          )}

          <div className="accordion">
            {mios.map((pedido) => {
              const estado = ESTADOS_PEDIDO[pedido.estado];
              const abierta = pedido.idPedido === idAbierto;
              return (
                <div className="accordion-item mb-3 border rounded shadow-sm overflow-hidden" key={pedido.idPedido}>
                  <h2 className="accordion-header">
                    <button
                      className={`accordion-button ${abierta ? '' : 'collapsed'}`}
                      type="button"
                      aria-expanded={abierta}
                      onClick={() => setAbierto(abierta ? -1 : pedido.idPedido)}
                    >
                      <div className="d-flex flex-wrap w-100 align-items-center gap-3 me-3">
                        <div>
                          <div className="fw-bold">
                            {pedido.numero}
                            {nuevos.includes(pedido.idPedido) && <span className="badge bg-danger ms-1" style={{ fontSize: '.65rem' }}>ACTUALIZADO</span>}
                          </div>
                          <div className="small text-muted">{fechaCorta(pedido.fechaCreacion)}</div>
                        </div>
                        <div className="ms-md-auto">
                          <span className={`badge ${estado.badge}`}><i className={`bi ${estado.icono} me-1`}></i>{estado.etiqueta}</span>
                        </div>
                        <div className="fw-bold">{formatoCLP(pedido.total)}</div>
                      </div>
                    </button>
                  </h2>
                  <div className={`accordion-collapse collapse ${abierta ? 'show' : ''}`}>
                    <div className="accordion-body">
                      <Avance pedido={pedido} />
                      {pedido.estado !== 'CANCELADO' && pedido.estado !== 'ANULADO' && (
                        <p className="small mb-3"><i className={`bi ${estado.icono} me-1`}></i>{estado.texto}</p>
                      )}

                      {(pedido.items ?? []).map((item) => {
                        const producto = productos.find((p) => p.idProducto === item.idProducto);
                        const detalle = producto?.estado === 'PUBLICADO'
                          ? <Link to={`/producto/${item.idProducto}`} className="text-reset fw-semibold text-decoration-none">{item.nombre}</Link>
                          : <span className="fw-semibold">{item.nombre}</span>;
                        return (
                          <div className="d-flex align-items-center gap-3 py-2 border-bottom" key={`${item.idProducto}-${item.variante ?? ''}`}>
                            <div className="bg-light rounded flex-shrink-0 d-flex align-items-center justify-content-center" style={{ width: '56px', height: '56px', padding: '4px' }}>
                              {item.imagen
                                ? <img src={item.imagen} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                : <i className="bi bi-box-seam text-muted"></i>}
                            </div>
                            <div className="flex-grow-1">
                              {detalle}
                              <div className="small text-muted">{item.variante && `${item.variante} · `}{item.cantidad} × {formatoCLP(item.precioUnitario)}</div>
                            </div>
                            <div className="fw-semibold">{formatoCLP(item.precioUnitario * item.cantidad)}</div>
                          </div>
                        );
                      })}

                      <div className="row mt-3 small">
                        <div className="col-md-6 mb-2">
                          <div><strong>Entrega:</strong> Retiro en tienda (Centro, Concepción)</div>
                          <div><strong>Pago:</strong> {pedido.medioPago ? ETIQUETA_MEDIO_PAGO[pedido.medioPago] : '—'}</div>
                        </div>
                        <div className="col-md-6 text-md-end">
                          <div>Subtotal: {formatoCLP(pedido.subtotal)}</div>
                          <div className="fw-bold fs-6">Total: {formatoCLP(pedido.total)}</div>
                        </div>
                      </div>

                      <h6 className="fw-bold mt-3 mb-2">Historial del pedido</h6>
                      <ul className="list-unstyled mb-0">
                        {[...(pedido.historial ?? [])].reverse().map((h, i) => (
                          <li className="mb-2" key={`${h.fecha}-${i}`}>
                            <span className="fw-semibold"><i className={`bi ${ESTADOS_PEDIDO[h.estado].icono} me-1`}></i>{ESTADOS_PEDIDO[h.estado].etiqueta}</span>
                            <span className="text-muted small ms-1">{fechaCorta(h.fecha)}</span>
                            {h.nota && <div className="small bg-light rounded px-2 py-1 mt-1"><i className="bi bi-chat-left-text me-1"></i>{h.nota}</div>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
};

export default MisPedidos;
