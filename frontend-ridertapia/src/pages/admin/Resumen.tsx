import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import usePedidos from '../../hooks/usePedidos';
import useProductos from '../../hooks/useProductos';
import useMovimientos from '../../hooks/useMovimientos';
import useAviso from '../../hooks/useAviso';
import PedidoService from '../../services/pedido.service';
import { generarVentasEjemplo } from '../../services/demo.service';
import { ESTADOS_PEDIDO, esVenta } from '../../utils/estadosPedido';
import { fechaCorta, fechaRelativa, formatoCLP } from '../../utils/formato';

const variacion = (actual: number, anterior: number): string => {
  if (!anterior) return actual ? 'Primer mes con ventas' : 'Sin ventas aún';
  const pct = Math.round(((actual - anterior) / anterior) * 100);
  return `${pct >= 0 ? '+' : ''}${pct}% vs. mes anterior`;
};

const Resumen = () => {
  const navigate = useNavigate();
  const { pedidos } = usePedidos();
  const { productos } = useProductos();
  const { movimientos } = useMovimientos();
  const { aviso, mostrar } = useAviso();
  const [hoy] = useState<Date>(() => new Date());

  const ventas = pedidos.filter(esVenta);
  const esMes = (iso: string, desfase: number): boolean => {
    const d = new Date(iso);
    const ref = new Date(hoy.getFullYear(), hoy.getMonth() - desfase, 1);
    return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
  };
  const delMes = ventas.filter((p) => esMes(p.fechaCreacion, 0));
  const mesAnterior = ventas.filter((p) => esMes(p.fechaCreacion, 1));
  const suma = (lista: typeof ventas): number => lista.reduce((total, p) => total + p.total, 0);

  const bajos = productos
    .filter((p) => p.estado !== 'OCULTO' && (p.stockDisponible ?? 0) < (p.stockMinimo ?? 0))
    .sort((a, b) => (a.stockDisponible ?? 0) / Math.max(1, a.stockMinimo ?? 0) - (b.stockDisponible ?? 0) / Math.max(1, b.stockMinimo ?? 0));
  const sinStock = bajos.filter((p) => (p.stockDisponible ?? 0) <= 0).length;
  const ultimos = [...pedidos].sort((a, b) => b.fechaCreacion.localeCompare(a.fechaCreacion)).slice(0, 8);
  const hayDemo = pedidos.some((p) => p.demo);

  const handleDemo = async () => {
    try {
      await PedidoService.eliminarDemo();
      if (!hayDemo) await PedidoService.agregarVarios(generarVentasEjemplo(productos));
      mostrar({ texto: hayDemo ? 'Ventas de ejemplo quitadas.' : 'Se cargaron 70 ventas de ejemplo.', tipo: 'success' });
    } catch (err) {
      console.error(err);
      mostrar({ texto: 'No se pudieron actualizar las ventas de ejemplo.', tipo: 'danger' });
    }
  };

  return (
    <>
      {aviso && <div className={`alert alert-${aviso.tipo} py-2`}>{aviso.texto}</div>}

      <div className="d-flex flex-wrap gap-2 justify-content-end mb-3">
        <button type="button" className="btn btn-sm btn-outline-light" onClick={() => void handleDemo()}>
          {hayDemo
            ? <><i className="bi bi-x-circle me-1"></i>Quitar ventas de ejemplo</>
            : <><i className="bi bi-magic me-1"></i>Cargar ventas de ejemplo</>}
        </button>
      </div>

      <div className="kpi-strip">
        <div className="kpi"><span className="kpi-label">Ventas del mes</span><strong>{formatoCLP(suma(delMes))}</strong><small>{variacion(suma(delMes), suma(mesAnterior))}</small></div>
        <div className="kpi">
          <span className="kpi-label">Pedidos del mes</span><strong>{delMes.length}</strong>
          <small>{mesAnterior.length ? `${delMes.length - mesAnterior.length >= 0 ? '+' : ''}${delMes.length - mesAnterior.length} vs. mes anterior` : ''}</small>
        </div>
        <div className="kpi"><span className="kpi-label">Ticket promedio</span><strong>{delMes.length ? formatoCLP(suma(delMes) / delMes.length) : '$0'}</strong><small>Mes en curso</small></div>
        <div className={bajos.length > 0 ? 'kpi is-alert' : 'kpi'}>
          <span className="kpi-label">Productos bajo el mínimo</span><strong>{bajos.length}</strong>
          <small>{sinStock ? `${sinStock} sin stock` : 'Ninguno sin stock'}</small>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-xl-7">
          <div className="panel h-100">
            <div className="panel-head">
              <div>
                <h2>Stock bajo el mínimo</h2>
                <p className="panel-note">Reponer con el proveedor indicado antes de quedar sin unidades.</p>
              </div>
            </div>
            {bajos.length === 0 && <p className="text-muted m-0"><i className="bi bi-check-circle me-1"></i>Todos los productos están sobre el stock mínimo.</p>}
            {bajos.slice(0, 6).map((p) => (
              <div className="alert-row" key={p.idProducto}>
                <div><strong>{p.nombre}</strong><span className="sub">Proveedor: {p.proveedor || '—'}</span></div>
                <span className={`tag ${(p.stockDisponible ?? 0) <= 0 ? 'tag-cero' : 'tag-bajo'}`}>{p.stockDisponible ?? 0} de {p.stockMinimo ?? 0} mín.</span>
                <Link className="btn btn-sm btn-outline-light" to={`/admin/inventario?producto=${p.idProducto}`}>Registrar ingreso</Link>
              </div>
            ))}
          </div>
        </div>

        <div className="col-xl-5">
          <div className="panel h-100">
            <div className="panel-head">
              <h2>Últimos movimientos</h2>
              <Link className="btn btn-sm btn-outline-light" to="/admin/inventario">Ver todos</Link>
            </div>
            <ul className="move-list">
              {movimientos.length === 0 && <li className="text-muted">Aún no hay movimientos.</li>}
              {movimientos.slice(0, 6).map((m) => (
                <li key={m.idMovimiento}>
                  <span>{m.nombre} <span className="sub">{fechaRelativa(m.fecha)} · {m.tipo.charAt(0) + m.tipo.slice(1).toLowerCase()}</span></span>
                  <span className={m.cantidad < 0 ? 'qty-neg' : 'qty-pos'}>{m.cantidad > 0 ? '+' : '−'}{Math.abs(m.cantidad)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="col-12">
          <div className="panel panel-flush">
            <div className="panel-head px-3 pt-3">
              <h2>Últimos pedidos de la tienda</h2>
              <Link className="btn btn-sm btn-outline-light" to="/admin/pedidos">Ver todos</Link>
            </div>
            <div className="table-responsive">
              <table className="table adm-table">
                <thead>
                  <tr><th>Pedido</th><th>Fecha</th><th>Cliente</th><th>Tipo</th><th>Entrega</th><th>Estado</th><th className="num">Total</th></tr>
                </thead>
                <tbody>
                  {ultimos.length === 0 && (
                    <tr><td colSpan={7} className="text-center text-muted py-4">Aún no hay pedidos. Haz una compra en la tienda o carga ventas de ejemplo.</td></tr>
                  )}
                  {ultimos.map((p) => {
                    const estado = ESTADOS_PEDIDO[p.estado];
                    return (
                      <tr key={p.idPedido} style={{ cursor: 'pointer' }} onClick={() => navigate(`/admin/pedidos?ver=${encodeURIComponent(p.numero)}`)}>
                        <td><strong>{p.numero}</strong>{p.demo && <> <span className="sub">ejemplo</span></>}</td>
                        <td>{fechaCorta(p.fechaCreacion)}</td>
                        <td>{p.cliente ? `${p.cliente.nombre} ${p.cliente.apellido}` : p.datosVisitante?.nombre}<span className="sub">{p.cliente?.email ?? p.datosVisitante?.correo}</span></td>
                        <td>{p.rutCliente ? <span className="tag tag-ok">Registrado</span> : <span className="tag tag-off">Invitado</span>}</td>
                        <td>Retiro en tienda</td>
                        <td><span className={`tag ${estado.tag}`}><i className={`bi ${estado.icono} me-1`}></i>{estado.etiqueta}</span></td>
                        <td className="num">{formatoCLP(p.total)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Resumen;
