import { useState, type ChangeEvent, type FormEvent } from 'react';
import useDatos from '../../hooks/useDatos';
import useModal from '../../hooks/useModal';
import useAviso from '../../hooks/useAviso';
import { USAR_API } from '../../api/cliente';
import ClienteService, { type ClienteResumen } from '../../services/cliente.service';
import AuthService from '../../services/auth.service';
import { EVENTO_PEDIDOS } from '../../services/pedido.service';
import { fechaCorta, formatoCLP } from '../../utils/formato';
import { errorEmail, errorNombre, errorTelefono, limpiarNombre } from '../../utils/validaciones';

interface Filtros {
  buscar: string;
  tipo: '' | 'registrado' | 'invitado';
  estado: '' | 'activo' | 'inactivo';
}

interface EdicionFormState {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
}

type ErroresEdicion = Partial<Record<keyof EdicionFormState, string>>;

const edicionInicial: EdicionFormState = { nombre: '', apellido: '', email: '', telefono: '' };

const soloRut = (texto: string): string => texto.toLowerCase().replace(/[^0-9k]/g, '');

// El telefono es opcional
const errorTelefonoOpcional = (telefono: string): string => (telefono.trim() ? errorTelefono(telefono) : '');

const Clientes = () => {
  const { datos: clientes, loading, error, recargar } = useDatos<ClienteResumen[]>(ClienteService.listar, [], EVENTO_PEDIDOS);
  const { datos: registro, recargar: recargarRegistro } = useDatos(ClienteService.registro, []);
  const { aviso, mostrar } = useAviso();
  const modal = useModal('modalCuenta');
  const modalEdicion = useModal('modalEditarCliente');
  const [filtros, setFiltros] = useState<Filtros>({ buscar: '', tipo: '', estado: '' });
  // Cliente al que se le cambia el estado de la cuenta
  const [seleccion, setSeleccion] = useState<{ cliente: ClienteResumen; activar: boolean } | null>(null);
  // Cliente que se esta editando
  const [editando, setEditando] = useState<ClienteResumen | null>(null);
  const [edicion, setEdicion] = useState<EdicionFormState>(edicionInicial);
  const [erroresEdicion, setErroresEdicion] = useState<ErroresEdicion>({});
  const [guardando, setGuardando] = useState<boolean>(false);

  const handleFiltro = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFiltros((prev) => ({ ...prev, [name]: value }));
  };

  const texto = filtros.buscar.trim().toLowerCase();
  const rutBuscado = soloRut(filtros.buscar);
  const lista = clientes.filter((c) =>
    (!texto
      || [c.nombre, c.email, c.telefono].join(' ').toLowerCase().includes(texto)
      || (rutBuscado.length > 0 && soloRut(c.rut).includes(rutBuscado)))
    && (!filtros.tipo || c.tipo === filtros.tipo)
    && (!filtros.estado || (filtros.estado === 'activo') === c.activo)
  );

  const abrir = (cliente: ClienteResumen, activar: boolean) => {
    setSeleccion({ cliente, activar });
    modal.mostrar();
  };

  const confirmar = async () => {
    if (!seleccion) return;
    try {
      await ClienteService.cambiarEstado(seleccion.cliente.email, seleccion.cliente.nombre, seleccion.activar, seleccion.cliente.tipo === 'registrado' ? seleccion.cliente.rut : '');
      modal.ocultar();
      mostrar({ texto: seleccion.activar ? 'Cuenta activada.' : 'Cuenta desactivada.', tipo: seleccion.activar ? 'success' : 'warning' });
      await Promise.all([recargar(), recargarRegistro()]);
    } catch (err) {
      console.error(err);
      mostrar({ texto: 'No se pudo cambiar el estado de la cuenta.', tipo: 'danger' });
    }
  };

  // Precarga los datos actuales de la cuenta
  const abrirEdicion = async (cliente: ClienteResumen) => {
    try {
      const cuenta = await AuthService.buscarPorCorreo(cliente.email);
      if (!cuenta) {
        mostrar({ texto: 'No se encontró la cuenta del cliente.', tipo: 'danger' });
        return;
      }
      setEditando(cliente);
      setEdicion({ nombre: cuenta.nombre, apellido: cuenta.apellido, email: cuenta.emailCliente, telefono: cuenta.telefono ?? '' });
      setErroresEdicion({});
      modalEdicion.mostrar();
    } catch (err) {
      console.error(err);
      mostrar({ texto: 'No se pudieron cargar los datos del cliente.', tipo: 'danger' });
    }
  };

  const handleEdicion = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    const valor = name === 'nombre' || name === 'apellido' ? limpiarNombre(value) : value;
    setEdicion((prev) => ({ ...prev, [name]: valor }));
    setErroresEdicion((prev) => ({ ...prev, [name]: undefined }));
  };

  const guardarEdicion = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editando) return;
    const errores: ErroresEdicion = {
      nombre: errorNombre(edicion.nombre, 'nombre') || undefined,
      apellido: errorNombre(edicion.apellido, 'apellido') || undefined,
      email: errorEmail(edicion.email) || undefined,
      telefono: errorTelefonoOpcional(edicion.telefono) || undefined
    };
    if (Object.values(errores).some(Boolean)) {
      setErroresEdicion(errores);
      return;
    }
    setGuardando(true);
    try {
      const resultado = await ClienteService.actualizar(editando.email, {
        nombre: edicion.nombre,
        apellido: edicion.apellido,
        emailCliente: edicion.email,
        telefono: edicion.telefono
      });
      if (!resultado.ok) {
        setErroresEdicion(resultado.campo === 'emailCliente' ? { email: resultado.error } : { nombre: resultado.error });
        return;
      }
      modalEdicion.ocultar();
      mostrar({ texto: 'Datos del cliente actualizados.', tipo: 'success' });
      await Promise.all([recargar(), recargarRegistro()]);
    } catch (err) {
      console.error(err);
      setErroresEdicion({ nombre: 'No se pudieron guardar los cambios.' });
    } finally {
      setGuardando(false);
    }
  };

  const claseEdicion = (campo: keyof EdicionFormState): string => (erroresEdicion[campo] ? 'form-control is-invalid' : 'form-control');

  return (
    <>
      {aviso && <div className={`alert alert-${aviso.tipo} py-2`}>{aviso.texto}</div>}
      {error && <div className="alert alert-danger py-2">No se pudieron cargar los clientes.</div>}

      <div className="toolbar">
        <div className="input-icon">
          <i className="bi bi-search"></i>
          <input name="buscar" type="search" className="form-control" placeholder="Buscar por nombre, RUT, correo o teléfono" aria-label="Buscar cliente" value={filtros.buscar} onChange={handleFiltro} />
        </div>
        <select name="tipo" className="form-select" aria-label="Tipo de cliente" value={filtros.tipo} onChange={handleFiltro}>
          <option value="">Registrados e invitados</option>
          <option value="registrado">Registrados</option>
          <option value="invitado">Invitados</option>
        </select>
        <select name="estado" className="form-select" aria-label="Estado de la cuenta" value={filtros.estado} onChange={handleFiltro}>
          <option value="">Todas las cuentas</option>
          <option value="activo">Activas</option>
          <option value="inactivo">Desactivadas</option>
        </select>
      </div>

      <div className="row g-4">
        <div className="col-xl-8">
          <div className="panel panel-flush">
            <div className="table-responsive">
              <table className="table adm-table">
                <thead>
                  <tr><th>Cliente</th><th>Correo</th><th>Teléfono</th><th className="num">Pedidos</th><th className="num">Total comprado</th><th>Cuenta</th><th className="text-end">Acción</th></tr>
                </thead>
                <tbody>
                  {loading && <tr><td colSpan={7} className="text-center text-muted py-4">Cargando clientes...</td></tr>}
                  {!loading && lista.length === 0 && (
                    <tr><td colSpan={7} className="text-center text-muted py-4">Aún no hay clientes. Aparecen aquí cuando alguien se registra o compra en la tienda (o carga ventas de ejemplo en Resumen).</td></tr>
                  )}
                  {lista.map((c) => (
                    <tr key={c.email} className={c.activo ? undefined : 'is-inactive'}>
                      <td><strong>{c.nombre}</strong><span className="sub">{c.rut && `${c.rut} · `}{c.tipo === 'registrado' ? 'Cuenta registrada' : 'Invitado'}</span></td>
                      <td>{c.email}</td>
                      <td>{c.telefono}</td>
                      <td className="num">{c.pedidos}</td>
                      <td className="num">{formatoCLP(c.total)}</td>
                      <td>{c.activo ? <span className="tag tag-ok">Activa</span> : <span className="tag tag-off">Desactivada</span>}</td>
                      <td className="text-end text-nowrap">
                        {c.tipo === 'registrado' && (
                          <button className="btn btn-sm btn-outline-light me-2" type="button" onClick={() => void abrirEdicion(c)}>
                            <i className="bi bi-pencil"></i> Editar
                          </button>
                        )}
                        {USAR_API && c.tipo === 'invitado'
                          ? <span className="sub">Sin cuenta</span>
                          : c.activo
                          ? <button className="btn btn-sm btn-outline-danger" type="button" onClick={() => abrir(c, false)}>Desactivar</button>
                          : <button className="btn btn-sm btn-outline-light" type="button" onClick={() => abrir(c, true)}>Activar</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="table-foot">Aparecen las cuentas creadas en la tienda y quienes compraron como invitado. Un cliente desactivado no puede iniciar sesión ni finalizar compras con ese correo.</p>
        </div>

        <div className="col-xl-4">
          <div className="panel">
            <h2 className="mb-3">Registro de acciones</h2>
            <ul className="log-list">
              {registro.length === 0 && <li className="text-muted">Sin acciones registradas.</li>}
              {registro.slice(0, 12).map((l, i) => (
                <li key={`${l.fecha}-${i}`}><strong>{l.accion}</strong> · {l.nombre}<span className="sub">{fechaCorta(l.fecha)} · admin</span></li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Editar datos */}
      <div className="modal fade" id="modalEditarCliente" tabIndex={-1} aria-labelledby="modalEditarClienteTitulo" aria-hidden="true">
        <div className="modal-dialog">
          <form className="modal-content" onSubmit={(event) => void guardarEdicion(event)} noValidate>
            <div className="modal-header">
              <h2 className="modal-title" id="modalEditarClienteTitulo">Editar cliente</h2>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <div className="modal-body">
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label" htmlFor="editarRut">RUT</label>
                  <input id="editarRut" className="form-control" value={editando?.rut ?? ''} disabled />
                  <div className="form-text">El RUT de la cuenta no se puede cambiar.</div>
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="editarNombre">Nombre</label>
                  <input id="editarNombre" name="nombre" className={claseEdicion('nombre')} maxLength={40} value={edicion.nombre} onChange={handleEdicion} />
                  <div className="invalid-feedback">{erroresEdicion.nombre}</div>
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="editarApellido">Apellido</label>
                  <input id="editarApellido" name="apellido" className={claseEdicion('apellido')} maxLength={40} value={edicion.apellido} onChange={handleEdicion} />
                  <div className="invalid-feedback">{erroresEdicion.apellido}</div>
                </div>
                <div className="col-12">
                  <label className="form-label" htmlFor="editarEmail">Correo</label>
                  <input id="editarEmail" name="email" type="email" className={claseEdicion('email')} maxLength={80} value={edicion.email} onChange={handleEdicion} />
                  <div className="invalid-feedback">{erroresEdicion.email}</div>
                </div>
                <div className="col-12">
                  <label className="form-label" htmlFor="editarTelefono">Teléfono</label>
                  <input id="editarTelefono" name="telefono" className={claseEdicion('telefono')} placeholder="+56 9 1234 5678" value={edicion.telefono} onChange={handleEdicion} />
                  <div className="invalid-feedback">{erroresEdicion.telefono}</div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline-light" data-bs-dismiss="modal">Cancelar</button>
              <button type="submit" className="btn btn-brand" disabled={guardando}>{guardando ? 'Guardando...' : 'Guardar cambios'}</button>
            </div>
          </form>
        </div>
      </div>

      {/* Activar o desactivar */}
      <div className="modal fade" id="modalCuenta" tabIndex={-1} aria-labelledby="modalCuentaTitulo" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title" id="modalCuentaTitulo">{seleccion?.activar ? 'Activar cuenta' : 'Desactivar cuenta'}</h2>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <div className="modal-body">
              <p className="m-0">
                {seleccion?.activar
                  ? <><strong>{seleccion.cliente.nombre}</strong> podrá volver a comprar en la tienda.</>
                  : <><strong>{seleccion?.cliente.nombre}</strong> no podrá finalizar compras con {seleccion?.cliente.email} hasta que vuelvas a activar su cuenta. La acción quedará en el registro.</>}
              </p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline-light" data-bs-dismiss="modal">Cancelar</button>
              <button type="button" className={seleccion?.activar ? 'btn btn-brand' : 'btn btn-danger'} onClick={() => void confirmar()}>
                {seleccion?.activar ? 'Activar cuenta' : 'Desactivar cuenta'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Clientes;
