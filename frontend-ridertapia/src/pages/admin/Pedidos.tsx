import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { useSearchParams } from 'react-router';
import usePedidos from '../../hooks/usePedidos';
import useAviso from '../../hooks/useAviso';
import useModal from '../../hooks/useModal';
import PedidoService from '../../services/pedido.service';
import type { EstadoPedido, Pedido } from '../../models/Pedido';
import {
  ESTADOS, ESTADOS_FINALES, ESTADOS_PEDIDO, ETIQUETA_MEDIO_PAGO, estadosElegibles, estaAbierto
} from '../../utils/estadosPedido';
import { diaLocal, fechaCorta, formatoCLP } from '../../utils/formato';

const POR_PAGINA = 15;

type FiltroEstado = EstadoPedido | 'abiertos' | '';

interface Filtros {
  buscar: string;
  estado: FiltroEstado;
  desde: string;
  hasta: string;
}

const filtrosIniciales: Filtros = { buscar: '', estado: '', desde: '', hasta: '' };

const nombreCliente = (p: Pedido): string =>
  p.cliente ? `${p.cliente.nombre} ${p.cliente.apellido}` : (p.datosVisitante?.nombre ?? '');

const correoCliente = (p: Pedido): string => p.cliente?.email ?? p.datosVisitante?.correo ?? '';

const soloRut = (texto: string): string => texto.toLowerCase().replace(/[^0-9k]/g, '');

const Pedidos = () => {
  const [params] = useSearchParams();
  const { pedidos, loading, error } = usePedidos();
  const { aviso, mostrar: avisar } = useAviso();
  const modal = useModal('modalPedido');
  const [filtros, setFiltros] = useState<Filtros>(filtrosIniciales);
  const [pagina, setPagina] = useState<number>(1);
  const [numeroActual, setNumeroActual] = useState<string | null>(params.get('ver'));
  const [estadoNuevo, setEstadoNuevo] = useState<EstadoPedido | ''>('');
  const [nota, setNota] = useState<string>('');
  const [intentado, setIntentado] = useState<boolean>(false);
  const [guardando, setGuardando] = useState<boolean>(false);
  // Pedido que viene en ?ver=: se abre una sola vez cuando cargan los datos
  const abrirInicial = useRef<string | null>(params.get('ver'));
  const { mostrar: mostrarModal } = modal;

  useEffect(() => {
    if (loading || !abrirInicial.current) return;
    const numero = abrirInicial.current;
    abrirInicial.current = null;
    if (pedidos.some((p) => p.numero === numero)) mostrarModal();
  }, [loading, pedidos, mostrarModal]);

  const ordenados = [...pedidos].sort((a, b) => b.fechaCreacion.localeCompare(a.fechaCreacion));
  const texto = filtros.buscar.trim().toLowerCase();
  const rutBuscado = soloRut(filtros.buscar);
  const filtrados = ordenados.filter((p) =>
    (!texto
      || [p.numero, nombreCliente(p), correoCliente(p)].join(' ').toLowerCase().includes(texto)
      || (rutBuscado.length >= 3 && soloRut(p.cliente?.rut ?? p.rutCliente ?? '').includes(rutBuscado)))
    && (!filtros.estado || (filtros.estado === 'abiertos' ? estaAbierto(p) : p.estado === filtros.estado))
    && (!filtros.desde || diaLocal(p.fechaCreacion) >= filtros.desde)
    && (!filtros.hasta || diaLocal(p.fechaCreacion) <= filtros.hasta)
  );

  const paginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, paginas);
  const visibles = filtrados.slice((paginaActual - 1) * POR_PAGINA, paginaActual * POR_PAGINA);

  const cuenta = (...estados: EstadoPedido[]): number => pedidos.filter((p) => estados.includes(p.estado)).length;
  const kpis: { titulo: string; cantidad: number; filtro: FiltroEstado }[] = [
    { titulo: 'Por pagar', cantidad: cuenta('PENDIENTE_PAGO'), filtro: 'PENDIENTE_PAGO' },
    { titulo: 'Por preparar', cantidad: cuenta('PAGADO', 'EN_PREPARACION'), filtro: 'abiertos' },
    { titulo: 'Por retirar', cantidad: cuenta('LISTO_PARA_RETIRO'), filtro: 'LISTO_PARA_RETIRO' },
    { titulo: 'Retirados', cantidad: cuenta('RETIRADO'), filtro: 'RETIRADO' }
  ];

  const handleFiltro = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFiltros((prev) => ({ ...prev, [name]: value }));
    setPagina(1);
  };

  const filtrarEstado = (estado: FiltroEstado) => {
    setFiltros((prev) => ({ ...prev, estado }));
    setPagina(1);
  };

  const abrir = (numero: string) => {
    setNumeroActual(numero);
    setEstadoNuevo('');
    setNota('');
    setIntentado(false);
    mostrarModal();
  };

  const actual = pedidos.find((p) => p.numero === numeroActual);
  const esFinal = actual ? ESTADOS_FINALES.includes(actual.estado) : false;
  const anula = estadoNuevo === 'CANCELADO' || estadoNuevo === 'ANULADO';

  const handleCambiarEstado = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!actual) return;
    setIntentado(true);
    if (!estadoNuevo) return;
    if (estadoNuevo === 'ANULADO' && !nota.trim()) return;

    setGuardando(true);
    try {
      await PedidoService.cambiarEstado(actual.idPedido, estadoNuevo, nota);
      avisar({ texto: `Pedido ${actual.numero}: ${ESTADOS_PEDIDO[estadoNuevo].etiqueta}. El cliente ya lo ve en su cuenta.`, tipo: 'success' });
      setEstadoNuevo('');
      setNota('');
      setIntentado(false);
    } catch (err) {
      console.error(err);
      avisar({ texto: err instanceof Error ? err.message : 'No se pudo cambiar el estado.', tipo: 'danger' });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <>
      {aviso && <div className={`alert alert-${aviso.tipo} py-2`}>{aviso.texto}</div>}
      {error && <div className="alert alert-danger py-2">No se pudieron cargar los pedidos.</div>}

      <div className="kpi-strip is-light">
        {kpis.map((k) => (
          <div className="kpi" role="button" tabIndex={0} style={{ cursor: 'pointer' }} key={k.titulo} onClick={() => filtrarEstado(k.filtro)} onKeyDown={(e) => { if (e.key === 'Enter') filtrarEstado(k.filtro); }}>
            <span className="kpi-label">{k.titulo}</span><strong>{k.cantidad}</strong>
          </div>
        ))}
      </div>

      <div className="toolbar">
        <div className="input-icon">
          <i className="bi bi-search"></i>
          <input name="buscar" type="search" className="form-control" placeholder="Buscar por N° de pedido, cliente, RUT o correo" aria-label="Buscar pedido" value={filtros.buscar} onChange={handleFiltro} />
        </div>
        <select name="estado" className="form-select" aria-label="Filtrar por estado" value={filtros.estado} onChange={handleFiltro}>
          <option value="">Todos los estados</option>
          <option value="abiertos">Por atender (no finalizados)</option>
          {ESTADOS.map((e) => <option key={e} value={e}>{ESTADOS_PEDIDO[e].etiqueta}</option>)}
        </select>
        <div className="field"><label htmlFor="desde">Desde</label><input id="desde" name="desde" type="date" className="form-control" value={filtros.desde} onChange={handleFiltro} /></div>
        <div className="field"><label htmlFor="hasta">Hasta</label><input id="hasta" name="hasta" type="date" className="form-control" value={filtros.hasta} onChange={handleFiltro} /></div>
      </div>

      <div className="panel panel-flush">
        <div className="table-responsive">
          <table className="table adm-table">
            <thead>
              <tr>
                <th>Pedido</th><th>Fecha</th><th>Cliente</th><th className="num">Productos</th><th>Entrega</th><th>Pago</th><th>Estado</th><th className="num">Total</th><th className="text-end">Acción</th>
              </tr>
            </thead>
            <tbody>
              {loading && pedidos.length === 0 && <tr><td colSpan={9} className="text-center text-muted py-4">Cargando pedidos...</td></tr>}
              {!loading && visibles.length === 0 && (
                <tr><td colSpan={9} className="text-center text-muted py-4">No hay pedidos con esos filtros. Los pedidos aparecen cuando alguien compra en la tienda (o carga ventas de ejemplo en Resumen).</td></tr>
              )}
              {visibles.map((p) => {
                const estado = ESTADOS_PEDIDO[p.estado];
                const unidades = (p.items ?? []).reduce((suma, i) => suma + i.cantidad, 0);
                return (
                  <tr key={p.idPedido} className={p.estado === 'CANCELADO' || p.estado === 'ANULADO' ? 'is-inactive' : undefined}>
                    <td><strong>{p.numero}</strong>{p.demo && <span className="sub">ejemplo</span>}</td>
                    <td>{fechaCorta(p.fechaCreacion)}</td>
                    <td>{nombreCliente(p)}<span className="sub">{correoCliente(p)} · {p.rutCliente ? 'Registrado' : 'Invitado'}</span></td>
                    <td className="num">{unidades}</td>
                    <td>Retiro</td>
                    <td>{p.medioPago ? ETIQUETA_MEDIO_PAGO[p.medioPago] : '—'}</td>
                    <td><span className={`tag ${estado.tag}`}><i className={`bi ${estado.icono} me-1`}></i>{estado.etiqueta}</span></td>
                    <td className="num">{formatoCLP(p.total)}</td>
                    <td className="text-end"><button className="btn btn-sm btn-outline-light" type="button" onClick={() => abrir(p.numero)}>Ver</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="d-flex flex-wrap justify-content-between align-items-center mt-2">
        <p className="table-foot m-0">Mostrando {visibles.length} de {filtrados.length} pedidos</p>
        <nav aria-label="Paginación de pedidos">
          <ul className="pagination pagination-sm m-0">
            <li className={`page-item ${paginaActual === 1 ? 'disabled' : ''}`}>
              <button type="button" className="page-link" onClick={() => setPagina(paginaActual - 1)}>Anterior</button>
            </li>
            {Array.from({ length: paginas }, (_, i) => i + 1).map((n) => (
              <li key={n} className={`page-item ${n === paginaActual ? 'active' : ''}`}>
                <button type="button" className="page-link" onClick={() => setPagina(n)}>{n}</button>
              </li>
            ))}
            <li className={`page-item ${paginaActual === paginas ? 'disabled' : ''}`}>
              <button type="button" className="page-link" onClick={() => setPagina(paginaActual + 1)}>Siguiente</button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Detalle del pedido */}
      <div className="modal fade" id="modalPedido" tabIndex={-1} aria-labelledby="mpTitulo" aria-hidden="true">
        <div className="modal-dialog modal-xl modal-dialog-scrollable">
          <div className="modal-content">
            {actual && (
              <>
                <div className="modal-header">
                  <div>
                    <h2 className="modal-title" id="mpTitulo">Pedido {actual.numero}</h2>
                    <span className="sub">{fechaCorta(actual.fechaCreacion)}{actual.demo && ' · pedido de ejemplo'}</span>
                  </div>
                  <div className="ms-3">
                    <span className={`tag ${ESTADOS_PEDIDO[actual.estado].tag}`}><i className={`bi ${ESTADOS_PEDIDO[actual.estado].icono} me-1`}></i>{ESTADOS_PEDIDO[actual.estado].etiqueta}</span>
                  </div>
                  <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                </div>
                <div className="modal-body">
                  <div className="row g-4">
                    <div className="col-lg-7">
                      <h3 className="h6 text-uppercase mb-2" style={{ letterSpacing: '1px', opacity: 0.7 }}>Productos</h3>
                      <div className="table-responsive">
                        <table className="table adm-table mb-2">
                          <thead><tr><th>Producto</th><th>Opción</th><th className="num">Cant.</th><th className="num">Precio</th><th className="num">Subtotal</th></tr></thead>
                          <tbody>
                            {(actual.items ?? []).map((i) => (
                              <tr key={`${i.idProducto}-${i.variante ?? ''}`}>
                                <td>{i.nombre}</td>
                                <td>{i.variante ?? '—'}</td>
                                <td className="num">{i.cantidad}</td>
                                <td className="num">{formatoCLP(i.precioUnitario)}</td>
                                <td className="num">{formatoCLP(i.precioUnitario * i.cantidad)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="d-flex justify-content-end">
                        <div style={{ minWidth: '220px' }}>
                          <div className="d-flex justify-content-between"><span>Subtotal</span><span>{formatoCLP(actual.subtotal)}</span></div>
                          <div className="d-flex justify-content-between fw-bold fs-5 mt-1"><span>Total</span><span>{formatoCLP(actual.total)}</span></div>
                        </div>
                      </div>

                      <div className="row g-3 mt-2">
                        <div className="col-md-6">
                          <h3 className="h6 text-uppercase mb-2" style={{ letterSpacing: '1px', opacity: 0.7 }}>Cliente</h3>
                          <strong>{nombreCliente(actual)}</strong>
                          <span className="sub">{actual.rutCliente ? 'Cuenta registrada' : 'Compró como invitado'}</span>
                          {actual.cliente?.rut && <div className="mt-1"><i className="bi bi-person-vcard me-1"></i>RUT {actual.cliente.rut}</div>}
                          <div className="mt-1"><i className="bi bi-envelope me-1"></i>{correoCliente(actual)}</div>
                          <div><i className="bi bi-telephone me-1"></i>{actual.cliente?.telefono ?? actual.datosVisitante?.telefono ?? '—'}</div>
                        </div>
                        <div className="col-md-6">
                          <h3 className="h6 text-uppercase mb-2" style={{ letterSpacing: '1px', opacity: 0.7 }}>Entrega y pago</h3>
                          <div><i className="bi bi-shop me-1"></i>Retiro en tienda</div>
                          <div className="sub">Centro, Concepción</div>
                          <div className="mt-1"><i className={`bi ${actual.medioPago === 'TARJETA' ? 'bi-credit-card' : actual.medioPago === 'TRANSFERENCIA' ? 'bi-bank' : 'bi-cash-coin'} me-1`}></i>{actual.medioPago ? ETIQUETA_MEDIO_PAGO[actual.medioPago] : '—'}</div>
                          {actual.motivoAnulacion && <div className="mt-1"><i className="bi bi-chat-left-text me-1"></i>Motivo: {actual.motivoAnulacion}</div>}
                        </div>
                      </div>
                    </div>

                    <div className="col-lg-5">
                      <div className="panel mb-3">
                        <h3 className="h6 text-uppercase mb-3" style={{ letterSpacing: '1px', opacity: 0.7 }}>Actualizar estado</h3>
                        {esFinal ? (
                          <div className="small"><i className="bi bi-lock me-1"></i>El pedido está <strong>{ESTADOS_PEDIDO[actual.estado].etiqueta.toLowerCase()}</strong>; ya no se puede cambiar su estado.</div>
                        ) : (
                          <form noValidate onSubmit={(event) => void handleCambiarEstado(event)} aria-label="Actualizar estado">
                            <label className="form-label" htmlFor="mpNuevo">Nuevo estado</label>
                            <select id="mpNuevo" className={intentado && !estadoNuevo ? 'form-select is-invalid' : 'form-select'} value={estadoNuevo} onChange={(e) => setEstadoNuevo(e.target.value as EstadoPedido | '')}>
                              <option value="">Elige el nuevo estado</option>
                              {estadosElegibles(actual).map((e) => <option key={e} value={e}>{ESTADOS_PEDIDO[e].etiqueta}</option>)}
                            </select>
                            <div className="invalid-feedback">Elige el nuevo estado.</div>

                            <label className="form-label mt-3" htmlFor="mpNota">
                              {estadoNuevo === 'ANULADO' ? 'Motivo de la anulación' : 'Mensaje para el cliente'} {estadoNuevo !== 'ANULADO' && <span className="sub d-inline">(opcional)</span>}
                            </label>
                            <textarea id="mpNota" className={intentado && estadoNuevo === 'ANULADO' && !nota.trim() ? 'form-control is-invalid' : 'form-control'} rows={2} maxLength={200} placeholder="Ej: Tu pedido ya está listo para retirar." value={nota} onChange={(e) => setNota(e.target.value)}></textarea>
                            <div className="invalid-feedback">Indica el motivo.</div>
                            <div className="form-text">El cliente verá el nuevo estado y este mensaje en "Mis pedidos".</div>

                            {anula && (
                              <div className="alert alert-warning small mt-3 mb-0">
                                <i className="bi bi-exclamation-triangle me-1"></i>Al {estadoNuevo === 'ANULADO' ? 'anular' : 'cancelar'}, las unidades vuelven al stock. Esta acción no se puede deshacer.
                              </div>
                            )}
                            <button type="submit" className={`btn w-100 mt-3 ${anula ? 'btn-danger' : 'btn-brand'}`} disabled={guardando}>
                              <i className="bi bi-arrow-repeat me-1"></i>{guardando ? 'Guardando...' : 'Actualizar estado'}
                            </button>
                          </form>
                        )}
                      </div>

                      <h3 className="h6 text-uppercase mb-2" style={{ letterSpacing: '1px', opacity: 0.7 }}>Historial</h3>
                      <ul className="log-list">
                        {[...(actual.historial ?? [])].reverse().map((h, i) => (
                          <li key={`${h.fecha}-${i}`}>
                            <strong><i className={`bi ${ESTADOS_PEDIDO[h.estado].icono} me-1`}></i>{ESTADOS_PEDIDO[h.estado].etiqueta}</strong>{h.nota && ` · ${h.nota}`}
                            <span className="sub">{fechaCorta(h.fecha)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Pedidos;
