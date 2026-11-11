import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useSearchParams } from 'react-router';
import useProductos from '../../hooks/useProductos';
import useMovimientos from '../../hooks/useMovimientos';
import useAviso from '../../hooks/useAviso';
import InventarioService from '../../services/inventario.service';
import type { TipoMovimiento } from '../../models/Movimiento';
import { diaLocal, fechaCorta } from '../../utils/formato';

const ETIQUETA_TIPO: Record<TipoMovimiento, string> = {
  INGRESO: 'Ingreso',
  AJUSTE: 'Ajuste',
  VENTA: 'Venta',
  TALLER: 'Taller'
};

const MOTIVOS = ['Conteo físico', 'Merma o daño', 'Corrección de error', 'Otro'];

interface IngresoFormState {
  idProducto: string;
  cantidad: string;
  proveedor: string;
  documento: string;
}

interface AjusteFormState {
  idProducto: string;
  stockNuevo: string;
  motivo: string;
  detalle: string;
}

interface FiltrosMov {
  buscar: string;
  tipo: TipoMovimiento | '';
  desde: string;
  hasta: string;
}

type ErroresIngreso = Partial<Record<keyof IngresoFormState, string>>;
type ErroresAjuste = Partial<Record<keyof AjusteFormState, string>>;

const esEntero = (valor: string): boolean => valor !== '' && Number.isInteger(Number(valor));

const Inventario = () => {
  const [params] = useSearchParams();
  const { productos, recargar: recargarProductos } = useProductos();
  const { movimientos, loading, recargar: recargarMovimientos } = useMovimientos();
  const { aviso, mostrar } = useAviso();
  // Desde Resumen llega ?producto=id con el producto ya elegido
  const [ingreso, setIngreso] = useState<IngresoFormState>({ idProducto: params.get('producto') ?? '', cantidad: '', proveedor: '', documento: '' });
  const [ajuste, setAjuste] = useState<AjusteFormState>({ idProducto: '', stockNuevo: '', motivo: '', detalle: '' });
  const [erroresIngreso, setErroresIngreso] = useState<ErroresIngreso>({});
  const [erroresAjuste, setErroresAjuste] = useState<ErroresAjuste>({});
  const [filtros, setFiltros] = useState<FiltrosMov>({ buscar: '', tipo: '', desde: '', hasta: '' });

  const activos = productos.filter((p) => p.estado !== 'OCULTO').sort((a, b) => a.nombre.localeCompare(b.nombre));
  const productoIngreso = productos.find((p) => String(p.idProducto) === ingreso.idProducto);
  const productoAjuste = productos.find((p) => String(p.idProducto) === ajuste.idProducto);
  // Si no se escribe proveedor, se usa el del producto
  const proveedorIngreso = ingreso.proveedor.trim() || productoIngreso?.proveedor || '';

  const handleIngreso = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setIngreso((prev) => ({ ...prev, [name]: value }));
    setErroresIngreso((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleAjuste = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setAjuste((prev) => {
      const siguiente = { ...prev, [name]: value };
      // Al elegir el producto, el stock nuevo parte en el actual
      if (name === 'idProducto') {
        const elegido = productos.find((p) => String(p.idProducto) === value);
        siguiente.stockNuevo = elegido ? String(elegido.stockDisponible ?? 0) : '';
      }
      return siguiente;
    });
    setErroresAjuste((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleRegistrarIngreso = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errores: ErroresIngreso = {
      idProducto: ingreso.idProducto ? undefined : 'Elige un producto.',
      cantidad: esEntero(ingreso.cantidad) && Number(ingreso.cantidad) >= 1 ? undefined : '1 o más.',
      proveedor: proveedorIngreso.trim() ? undefined : 'Ingresa el proveedor.'
    };
    if (Object.values(errores).some(Boolean)) {
      setErroresIngreso(errores);
      return;
    }
    try {
      const cantidad = Number(ingreso.cantidad);
      const doc = ingreso.documento.trim();
      const actualizado = await InventarioService.mover(
        Number(ingreso.idProducto), 'INGRESO', cantidad, 'admin', `${doc ? `${doc} · ` : ''}${proveedorIngreso.trim()}`
      );
      mostrar({ texto: `+${cantidad} unidades de ${actualizado.nombre}. Stock: ${actualizado.stockDisponible ?? 0}.`, tipo: 'success' });
      setIngreso({ idProducto: '', cantidad: '', proveedor: '', documento: '' });
      setErroresIngreso({});
      await Promise.all([recargarProductos(), recargarMovimientos()]);
    } catch (err) {
      console.error(err);
      mostrar({ texto: 'No se pudo registrar el ingreso.', tipo: 'danger' });
    }
  };

  const handleAjustar = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errores: ErroresAjuste = {
      idProducto: ajuste.idProducto ? undefined : 'Elige un producto.',
      stockNuevo: esEntero(ajuste.stockNuevo) && Number(ajuste.stockNuevo) >= 0 ? undefined : '0 o más.',
      motivo: ajuste.motivo ? undefined : 'Elige un motivo.'
    };
    if (Object.values(errores).some(Boolean)) {
      setErroresAjuste(errores);
      return;
    }
    try {
      const detalle = ajuste.motivo + (ajuste.detalle.trim() ? ` · ${ajuste.detalle.trim()}` : '');
      const nuevo = Number(ajuste.stockNuevo);
      if (nuevo === (productoAjuste?.stockDisponible ?? 0)) {
        mostrar({ texto: 'El stock ya tiene ese valor: no hay nada que ajustar.', tipo: 'warning' });
        return;
      }
      const actualizado = await InventarioService.fijar(Number(ajuste.idProducto), nuevo, 'admin', detalle);
      mostrar({ texto: `Stock de ${actualizado.nombre}: ${actualizado.stockDisponible ?? 0} unidades.`, tipo: 'success' });
      setAjuste({ idProducto: '', stockNuevo: '', motivo: '', detalle: '' });
      setErroresAjuste({});
      await Promise.all([recargarProductos(), recargarMovimientos()]);
    } catch (err) {
      console.error(err);
      mostrar({ texto: 'No se pudo ajustar el stock.', tipo: 'danger' });
    }
  };

  const handleFiltro = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFiltros((prev) => ({ ...prev, [name]: value }));
  };

  const texto = filtros.buscar.trim().toLowerCase();
  const lista = movimientos.filter((m) =>
    (!texto || m.nombre.toLowerCase().includes(texto))
    && (!filtros.tipo || m.tipo === filtros.tipo)
    && (!filtros.desde || diaLocal(m.fecha) >= filtros.desde)
    && (!filtros.hasta || diaLocal(m.fecha) <= filtros.hasta)
  );

  const claseIngreso = (campo: keyof IngresoFormState, base = 'form-control'): string => (erroresIngreso[campo] ? `${base} is-invalid` : base);
  const claseAjuste = (campo: keyof AjusteFormState, base = 'form-control'): string => (erroresAjuste[campo] ? `${base} is-invalid` : base);

  return (
    <>
      {aviso && <div className={`alert alert-${aviso.tipo} py-2`}>{aviso.texto}</div>}

      <div className="panel mb-4">
        <div className="panel-head">
          <div>
            <h2>Registrar ingreso de mercancía</h2>
            <p className="panel-note">Suma las unidades recibidas al stock y deja el movimiento registrado.</p>
          </div>
        </div>
        <form className="row g-3 align-items-end" noValidate onSubmit={(event) => void handleRegistrarIngreso(event)} aria-label="Registrar ingreso">
          <div className="col-md-4">
            <label className="form-label" htmlFor="ingProducto">Producto</label>
            <select id="ingProducto" name="idProducto" className={claseIngreso('idProducto', 'form-select')} value={ingreso.idProducto} onChange={handleIngreso}>
              <option value="">Elige el producto recibido</option>
              {activos.map((p) => <option key={p.idProducto} value={p.idProducto}>{p.nombre} ({p.sku})</option>)}
            </select>
            <div className="invalid-feedback">{erroresIngreso.idProducto}</div>
          </div>
          <div className="col-6 col-md-2">
            <label className="form-label" htmlFor="ingCantidad">Cantidad</label>
            <input id="ingCantidad" name="cantidad" type="number" min="1" step="1" className={claseIngreso('cantidad')} value={ingreso.cantidad} onChange={handleIngreso} />
            <div className="invalid-feedback">{erroresIngreso.cantidad}</div>
          </div>
          <div className="col-6 col-md-3">
            <label className="form-label" htmlFor="ingProveedor">Proveedor</label>
            <input id="ingProveedor" name="proveedor" type="text" className={claseIngreso('proveedor')} placeholder={productoIngreso?.proveedor ?? ''} value={ingreso.proveedor} onChange={handleIngreso} />
            <div className="invalid-feedback">{erroresIngreso.proveedor}</div>
          </div>
          <div className="col-md-3">
            <label className="form-label" htmlFor="ingDoc">N° de factura o guía</label>
            <input id="ingDoc" name="documento" type="text" className="form-control" placeholder="Opcional" value={ingreso.documento} onChange={handleIngreso} />
          </div>
          <div className="col-12 d-flex align-items-center gap-3">
            <button className="btn btn-brand" type="submit"><i className="bi bi-box-arrow-in-down me-1"></i>Registrar ingreso</button>
            {productoIngreso && <span className="small text-muted">Stock actual: {productoIngreso.stockDisponible ?? 0} · mínimo {productoIngreso.stockMinimo ?? 0}</span>}
          </div>
        </form>
      </div>

      <div className="panel mb-4">
        <div className="panel-head">
          <div>
            <h2>Ajustar stock</h2>
            <p className="panel-note">Deja el stock en el valor real (conteo físico, merma, corrección). Queda registrado como ajuste.</p>
          </div>
        </div>
        <form className="row g-3 align-items-end" noValidate onSubmit={(event) => void handleAjustar(event)} aria-label="Ajustar stock">
          <div className="col-md-4">
            <label className="form-label" htmlFor="ajProducto">Producto</label>
            <select id="ajProducto" name="idProducto" className={claseAjuste('idProducto', 'form-select')} value={ajuste.idProducto} onChange={handleAjuste}>
              <option value="">Elige el producto</option>
              {activos.map((p) => <option key={p.idProducto} value={p.idProducto}>{p.nombre} ({p.sku})</option>)}
            </select>
            <div className="invalid-feedback">{erroresAjuste.idProducto}</div>
          </div>
          <div className="col-6 col-md-2">
            <label className="form-label" htmlFor="ajStock">Stock nuevo</label>
            <input id="ajStock" name="stockNuevo" type="number" min="0" step="1" className={claseAjuste('stockNuevo')} value={ajuste.stockNuevo} onChange={handleAjuste} />
            <div className="invalid-feedback">{erroresAjuste.stockNuevo}</div>
          </div>
          <div className="col-6 col-md-3">
            <label className="form-label" htmlFor="ajMotivo">Motivo</label>
            <select id="ajMotivo" name="motivo" className={claseAjuste('motivo', 'form-select')} value={ajuste.motivo} onChange={handleAjuste}>
              <option value="">Elige un motivo</option>
              {MOTIVOS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <div className="invalid-feedback">{erroresAjuste.motivo}</div>
          </div>
          <div className="col-md-3">
            <label className="form-label" htmlFor="ajDetalle">Detalle</label>
            <input id="ajDetalle" name="detalle" type="text" maxLength={120} className="form-control" placeholder="Opcional" value={ajuste.detalle} onChange={handleAjuste} />
          </div>
          <div className="col-12 d-flex align-items-center gap-3">
            <button className="btn btn-brand" type="submit"><i className="bi bi-sliders me-1"></i>Guardar ajuste</button>
            {productoAjuste && <span className="small text-muted">Stock actual: {productoAjuste.stockDisponible ?? 0} · mínimo {productoAjuste.stockMinimo ?? 0}</span>}
          </div>
        </form>
      </div>

      <div className="panel-head">
        <h2 className="h4 m-0" style={{ fontFamily: 'var(--adm-display)', fontWeight: 700 }}>Movimientos de inventario</h2>
      </div>
      <div className="toolbar">
        <div className="input-icon align-self-end">
          <i className="bi bi-search"></i>
          <input name="buscar" type="search" className="form-control" placeholder="Buscar producto" aria-label="Buscar producto en movimientos" value={filtros.buscar} onChange={handleFiltro} />
        </div>
        <div className="field">
          <label htmlFor="fMovTipo">Tipo</label>
          <select id="fMovTipo" name="tipo" className="form-select" value={filtros.tipo} onChange={handleFiltro}>
            <option value="">Todos los tipos</option>
            {(Object.keys(ETIQUETA_TIPO) as TipoMovimiento[]).map((t) => <option key={t} value={t}>{ETIQUETA_TIPO[t]}</option>)}
          </select>
        </div>
        <div className="field"><label htmlFor="fMovDesde">Desde</label><input id="fMovDesde" name="desde" type="date" className="form-control" value={filtros.desde} onChange={handleFiltro} /></div>
        <div className="field"><label htmlFor="fMovHasta">Hasta</label><input id="fMovHasta" name="hasta" type="date" className="form-control" value={filtros.hasta} onChange={handleFiltro} /></div>
      </div>
      <div className="panel panel-flush">
        <div className="table-responsive">
          <table className="table adm-table">
            <thead>
              <tr><th>Fecha</th><th>Producto</th><th>Tipo</th><th className="num">Cantidad</th><th className="num">Stock resultante</th><th>Usuario</th><th>Detalle</th></tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={7} className="text-center text-muted py-4">Cargando movimientos...</td></tr>}
              {!loading && lista.length === 0 && (
                <tr><td colSpan={7} className="text-center text-muted py-4">Sin movimientos. Registra un ingreso, ajusta el stock o haz una compra en la tienda.</td></tr>
              )}
              {lista.map((m) => (
                <tr key={m.idMovimiento}>
                  <td>{fechaCorta(m.fecha)}</td>
                  <td>{m.nombre}</td>
                  <td><span className={`tag tag-${m.tipo.toLowerCase()}`}>{ETIQUETA_TIPO[m.tipo]}</span></td>
                  <td className={`num ${m.cantidad < 0 ? 'qty-neg' : 'qty-pos'}`}>{m.cantidad > 0 ? '+' : '−'}{Math.abs(m.cantidad)}</td>
                  <td className="num">{m.stockResultante}</td>
                  <td>{m.usuario}</td>
                  <td>{m.detalle}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="table-foot">{lista.length} movimientos</p>
    </>
  );
};

export default Inventario;
