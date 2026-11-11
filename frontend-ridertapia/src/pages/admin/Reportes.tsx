import { useMemo, useState, type ChangeEvent } from 'react';
import usePedidos from '../../hooks/usePedidos';
import useProductos from '../../hooks/useProductos';
import useCategorias from '../../hooks/useCategorias';
import useDatos from '../../hooks/useDatos';
import useAviso from '../../hooks/useAviso';
import ReporteService, {
  ETIQUETA_STOCK, masVendidos, productosDeInventario, ventasEntre, ventasPorPeriodo,
  type Agrupacion, type OrdenTop
} from '../../services/reporte.service';
import { estadoStock } from '../../services/producto.service';
import type { FormatoReporte, Reporte, ReporteGuardado, TipoReporte } from '../../models/Reporte';
import { aCSV, abrirImprimible, descargarArchivo, nombreArchivo } from '../../utils/exportar';
import { diaLocal, fechaCorta, formatoCLP } from '../../utils/formato';

type Pestana = TipoReporte | 'historial';

const PESTANAS: { clave: Pestana; texto: string }[] = [
  { clave: 'ventas', texto: 'Ventas' },
  { clave: 'top', texto: 'Más vendidos' },
  { clave: 'inventario', texto: 'Inventario' },
  { clave: 'historial', texto: 'Historial' }
];

const TIPO_TEXTO: Record<TipoReporte, string> = { ventas: 'Ventas', top: 'Más vendidos', inventario: 'Inventario' };

// Rango por defecto: ultimos 6 meses (ventas) o mes actual (mas vendidos)
const hoyISO = (): string => diaLocal(new Date());
const haceMeses = (n: number): string => {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return diaLocal(d);
};
const inicioMes = (): string => {
  const d = new Date();
  d.setDate(1);
  return diaLocal(d);
};

const Reportes = () => {
  const { pedidos } = usePedidos();
  const { productos } = useProductos();
  const { categorias } = useCategorias();
  const { datos: historial, recargar: recargarHistorial } = useDatos<ReporteGuardado[]>(ReporteService.listar, []);
  const { aviso, mostrar } = useAviso();

  const [pestana, setPestana] = useState<Pestana>('ventas');
  // Ventas
  const [desdeV, setDesdeV] = useState<string>(haceMeses(6));
  const [hastaV, setHastaV] = useState<string>(hoyISO());
  const [agrupar, setAgrupar] = useState<Agrupacion>('mes');
  // Mas vendidos
  const [desdeT, setDesdeT] = useState<string>(inicioMes());
  const [hastaT, setHastaT] = useState<string>(hoyISO());
  const [orden, setOrden] = useState<OrdenTop>('unidades');
  // Filtros comunes
  const [categoria, setCategoria] = useState<string>('');
  const [estado, setEstado] = useState<string>('');

  const nombreCategoria = categorias.find((c) => String(c.idCategoria) === categoria)?.nombre ?? 'Todas';

  const filasVentas = useMemo(
    () => ventasPorPeriodo(ventasEntre(pedidos, desdeV, hastaV), agrupar),
    [pedidos, desdeV, hastaV, agrupar]
  );
  const filasTop = useMemo(
    () => masVendidos(ventasEntre(pedidos, desdeT, hastaT), productos, categoria, orden),
    [pedidos, productos, desdeT, hastaT, categoria, orden]
  );
  const filasInv = useMemo(
    () => productosDeInventario(productos, categoria, estado),
    [productos, categoria, estado]
  );

  const totalVentas = filasVentas.reduce((s, f) => s + f.ventas, 0);
  const totalPedidos = filasVentas.reduce((s, f) => s + f.pedidos, 0);
  const maximo = Math.max(1, ...filasVentas.map((f) => f.ventas));

  // Arma el reporte de la pestana activa (la primera fila es el encabezado)
  const armarReporte = (): Reporte | null => {
    if (pestana === 'ventas') {
      return {
        nombre: `Ventas por ${agrupar === 'dia' ? 'día' : agrupar} ${desdeV} a ${hastaV}`,
        tipo: TIPO_TEXTO.ventas,
        categoria: 'Todas',
        filas: [['Período', 'Pedidos', 'Ventas'], ...filasVentas.map((f) => [f.largo, f.pedidos, f.ventas])]
      };
    }
    if (pestana === 'top') {
      return {
        nombre: `Más vendidos ${desdeT} a ${hastaT}`,
        tipo: TIPO_TEXTO.top,
        categoria: nombreCategoria,
        filas: [['#', 'Producto', 'Categoría', 'Unidades', 'Ingresos'], ...filasTop.map((f, i) => [i + 1, f.nombre, f.categoria, f.unidades, f.ingresos])]
      };
    }
    if (pestana === 'inventario') {
      return {
        nombre: `Inventario ${hoyISO()}`,
        tipo: TIPO_TEXTO.inventario,
        categoria: nombreCategoria,
        filas: [['SKU', 'Producto', 'Categoría', 'Stock', 'Mínimo', 'Estado'],
          ...filasInv.map((p) => [p.sku ?? '', p.nombre, p.categoria.nombre, p.stockDisponible ?? 0, p.stockMinimo ?? 0, ETIQUETA_STOCK[estadoStock(p)]])]
      };
    }
    return null;
  };

  const exportar = async (formato: FormatoReporte) => {
    const reporte = armarReporte();
    if (!reporte) return;
    if (reporte.filas.length < 2) {
      mostrar({ texto: 'No hay datos para exportar con esos filtros.', tipo: 'warning' });
      return;
    }
    if (formato === 'excel') {
      descargarArchivo(`${nombreArchivo(reporte.nombre)}.csv`, aCSV(reporte.filas));
    } else if (!abrirImprimible(reporte)) {
      mostrar({ texto: 'El navegador bloqueó la ventana. Permite las ventanas emergentes para exportar el PDF.', tipo: 'danger' });
      return;
    }
    try {
      await ReporteService.crear({ ...reporte, formato, fecha: new Date().toISOString() });
      await recargarHistorial();
      mostrar({ texto: formato === 'excel' ? 'Reporte descargado y guardado en el historial.' : 'Reporte abierto para imprimir y guardado en el historial.', tipo: 'success' });
    } catch (err) {
      console.error(err);
      mostrar({ texto: 'El reporte se exportó, pero no se pudo guardar en el historial.', tipo: 'warning' });
    }
  };

  // Vuelve a descargar un reporte del historial
  const redescargar = (reporte: ReporteGuardado) => {
    if (reporte.formato === 'excel') descargarArchivo(`${nombreArchivo(reporte.nombre)}.csv`, aCSV(reporte.filas));
    else if (!abrirImprimible(reporte)) mostrar({ texto: 'El navegador bloqueó la ventana emergente.', tipo: 'danger' });
  };

  const cambiar = (set: (v: string) => void) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => set(event.target.value);

  const filtroCategoria = (
    <div className="field">
      <label htmlFor="repCategoria">Categoría</label>
      <select id="repCategoria" className="form-select" value={categoria} onChange={cambiar(setCategoria)}>
        <option value="">Todas</option>
        {categorias.filter((c) => !c.categoriaPadre).map((c) => <option key={c.idCategoria} value={c.idCategoria}>{c.nombre}</option>)}
      </select>
    </div>
  );

  const botonesExportar = pestana !== 'historial' && (
    <div className="d-flex gap-2 ms-auto">
      <button type="button" className="btn btn-outline-light" onClick={() => void exportar('excel')}><i className="bi bi-file-earmark-spreadsheet me-1"></i>Excel</button>
      <button type="button" className="btn btn-brand" onClick={() => void exportar('pdf')}><i className="bi bi-file-earmark-pdf me-1"></i>PDF</button>
    </div>
  );

  return (
    <>
      {aviso && <div className={`alert alert-${aviso.tipo} py-2`}>{aviso.texto}</div>}

      <div className="adm-tabs" role="tablist">
        {PESTANAS.map((t) => (
          <button key={t.clave} type="button" role="tab" aria-selected={pestana === t.clave} className={pestana === t.clave ? 'active' : ''} onClick={() => setPestana(t.clave)}>
            {t.texto}
          </button>
        ))}
      </div>

      {pestana === 'ventas' && (
        <>
          <div className="toolbar">
            <div className="field">
              <label htmlFor="repDesdeV">Desde</label>
              <input id="repDesdeV" type="date" className="form-control" value={desdeV} max={hastaV} onChange={cambiar(setDesdeV)} />
            </div>
            <div className="field">
              <label htmlFor="repHastaV">Hasta</label>
              <input id="repHastaV" type="date" className="form-control" value={hastaV} min={desdeV} onChange={cambiar(setHastaV)} />
            </div>
            <div className="field">
              <label htmlFor="repAgrupar">Agrupar por</label>
              <select id="repAgrupar" className="form-select" value={agrupar} onChange={(e) => setAgrupar(e.target.value as Agrupacion)}>
                <option value="dia">Día</option>
                <option value="semana">Semana</option>
                <option value="mes">Mes</option>
              </select>
            </div>
            {botonesExportar}
          </div>

          <div className="panel mb-4">
            <h2 className="mb-1">Ventas del período</h2>
            <p className="panel-note">{totalPedidos} pedidos · {formatoCLP(totalVentas)} (sin pedidos cancelados ni anulados)</p>
            {filasVentas.length === 0 ? (
              <p className="text-muted m-0">No hay ventas en ese rango. Prueba con otras fechas o carga ventas de ejemplo en Resumen.</p>
            ) : (
              <div className="bar-chart" role="img" aria-label="Gráfico de ventas por período">
                {filasVentas.map((f, i) => (
                  <div className="bar" key={f.clave}>
                    <span className="bar-val">{formatoCLP(f.ventas)}</span>
                    <div className={i === filasVentas.length - 1 ? 'bar-fill is-current' : 'bar-fill'} style={{ height: `${Math.max(2, (f.ventas / maximo) * 100)}%` }}></div>
                    <span className="bar-label">{f.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="panel panel-flush">
            <div className="table-responsive">
              <table className="table adm-table">
                <thead><tr><th>Período</th><th className="num">Pedidos</th><th className="num">Ventas</th></tr></thead>
                <tbody>
                  {filasVentas.length === 0 && <tr><td colSpan={3} className="empty">Sin datos.</td></tr>}
                  {filasVentas.map((f) => <tr key={f.clave}><td>{f.largo}</td><td className="num">{f.pedidos}</td><td className="num">{formatoCLP(f.ventas)}</td></tr>)}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {pestana === 'top' && (
        <>
          <div className="toolbar">
            <div className="field">
              <label htmlFor="repDesdeT">Desde</label>
              <input id="repDesdeT" type="date" className="form-control" value={desdeT} max={hastaT} onChange={cambiar(setDesdeT)} />
            </div>
            <div className="field">
              <label htmlFor="repHastaT">Hasta</label>
              <input id="repHastaT" type="date" className="form-control" value={hastaT} min={desdeT} onChange={cambiar(setHastaT)} />
            </div>
            {filtroCategoria}
            <div className="field">
              <label htmlFor="repOrden">Ordenar por</label>
              <select id="repOrden" className="form-select" value={orden} onChange={(e) => setOrden(e.target.value as OrdenTop)}>
                <option value="unidades">Unidades</option>
                <option value="ingresos">Ingresos</option>
              </select>
            </div>
            {botonesExportar}
          </div>
          <div className="panel panel-flush">
            <div className="table-responsive">
              <table className="table adm-table">
                <thead><tr><th>#</th><th>Producto</th><th>Categoría</th><th className="num">Unidades</th><th className="num">Ingresos</th></tr></thead>
                <tbody>
                  {filasTop.length === 0 && <tr><td colSpan={5} className="empty">No hay ventas con esos filtros.</td></tr>}
                  {filasTop.slice(0, 20).map((f, i) => (
                    <tr key={f.idProducto}><td>{i + 1}</td><td><strong>{f.nombre}</strong></td><td>{f.categoria}</td><td className="num">{f.unidades}</td><td className="num">{formatoCLP(f.ingresos)}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {filasTop.length > 20 && <p className="table-foot">Se muestran los 20 primeros en pantalla; la exportación incluye los {filasTop.length}.</p>}
        </>
      )}

      {pestana === 'inventario' && (
        <>
          <div className="toolbar">
            {filtroCategoria}
            <div className="field">
              <label htmlFor="repEstado">Estado del stock</label>
              <select id="repEstado" className="form-select" value={estado} onChange={cambiar(setEstado)}>
                <option value="">Todos</option>
                <option value="ok">{ETIQUETA_STOCK.ok}</option>
                <option value="bajo">{ETIQUETA_STOCK.bajo}</option>
                <option value="cero">{ETIQUETA_STOCK.cero}</option>
              </select>
            </div>
            {botonesExportar}
          </div>
          <div className="panel panel-flush">
            <div className="table-responsive">
              <table className="table adm-table">
                <thead><tr><th>SKU</th><th>Producto</th><th>Categoría</th><th className="num">Stock</th><th className="num">Mínimo</th><th>Estado</th></tr></thead>
                <tbody>
                  {filasInv.length === 0 && <tr><td colSpan={6} className="empty">No hay productos con esos filtros.</td></tr>}
                  {filasInv.map((p) => {
                    const e = estadoStock(p);
                    return (
                      <tr key={p.idProducto}>
                        <td>{p.sku}</td><td><strong>{p.nombre}</strong></td><td>{p.categoria.nombre}</td>
                        <td className="num">{p.stockDisponible ?? 0}</td><td className="num">{p.stockMinimo ?? 0}</td>
                        <td><span className={`tag tag-${e}`}>{ETIQUETA_STOCK[e]}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {pestana === 'historial' && (
        <div className="panel panel-flush">
          <div className="table-responsive">
            <table className="table adm-table">
              <thead><tr><th>Reporte</th><th>Tipo</th><th>Categoría</th><th>Formato</th><th>Fecha</th><th className="text-end">Acción</th></tr></thead>
              <tbody>
                {historial.length === 0 && <tr><td colSpan={6} className="empty">Aún no exportas reportes. Aparecerán aquí al descargarlos.</td></tr>}
                {historial.map((r) => (
                  <tr key={r.idReporte}>
                    <td><strong>{r.nombre}</strong></td><td>{r.tipo}</td><td>{r.categoria}</td>
                    <td>{r.formato === 'excel' ? 'Excel (CSV)' : 'PDF'}</td><td>{fechaCorta(r.fecha)}</td>
                    <td className="text-end"><button type="button" className="btn btn-sm btn-outline-light" onClick={() => redescargar(r)}><i className="bi bi-download me-1"></i>Descargar</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
};

export default Reportes;
