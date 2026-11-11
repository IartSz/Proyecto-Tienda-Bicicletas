import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link } from 'react-router';
import useSesion from '../hooks/useSesion';
import usePedidos from '../hooks/usePedidos';
import { pedidosDeCorreo } from '../services/pedido.service';
import { esVenta } from '../utils/estadosPedido';
import { formatoCLP, iniciales } from '../utils/formato';
import {
  errorNombre, errorRut, errorTelefono, formatearRut, limpiarNombre
} from '../utils/validaciones';

interface PerfilFormState {
  nombre: string;
  apellido: string;
  rut: string;
  telefono: string;
}

interface ClaveFormState {
  actual: string;
  nueva: string;
  nueva2: string;
}

type ErroresPerfil = Partial<Record<keyof PerfilFormState, string>>;
type ErroresClave = Partial<Record<keyof ClaveFormState, string>>;

const claveInicial: ClaveFormState = { actual: '', nueva: '', nueva2: '' };

// El telefono es opcional en el perfil
const errorTelefonoOpcional = (telefono: string): string => (telefono.trim() ? errorTelefono(telefono) : '');

const Perfil = () => {
  const { sesion, actualizarPerfil, cambiarPassword, cerrarSesion } = useSesion();
  const { pedidos } = usePedidos();
  const [form, setForm] = useState<PerfilFormState>({
    nombre: sesion?.nombre ?? '',
    apellido: sesion?.apellido ?? '',
    rut: sesion?.rutUsuario ?? '',
    telefono: sesion?.telefono ?? ''
  });
  const [clave, setClave] = useState<ClaveFormState>(claveInicial);
  const [erroresPerfil, setErroresPerfil] = useState<ErroresPerfil>({});
  const [erroresClave, setErroresClave] = useState<ErroresClave>({});
  const [okPerfil, setOkPerfil] = useState<boolean>(false);
  const [okClave, setOkClave] = useState<boolean>(false);

  // RutaCliente ya asegura que hay sesion
  if (!sesion) return null;

  const mios = pedidosDeCorreo(pedidos, sesion.emailCliente);
  const comprado = mios.filter(esVenta).reduce((suma, p) => suma + p.total, 0);

  const handlePerfilChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    let valor = value;
    if (name === 'nombre' || name === 'apellido') valor = limpiarNombre(value);
    if (name === 'rut') valor = formatearRut(value);
    setForm((prev) => ({ ...prev, [name]: valor }));
    setErroresPerfil((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleClaveChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setClave((prev) => ({ ...prev, [name]: value }));
    setErroresClave((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleGuardarPerfil = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errores: ErroresPerfil = {
      nombre: errorNombre(form.nombre, 'nombre') || undefined,
      apellido: errorNombre(form.apellido, 'apellido') || undefined,
      rut: errorRut(form.rut) || undefined,
      telefono: errorTelefonoOpcional(form.telefono) || undefined
    };
    if (Object.values(errores).some(Boolean)) {
      setErroresPerfil(errores);
      return;
    }
    try {
      const resultado = await actualizarPerfil({
        nombre: form.nombre,
        apellido: form.apellido,
        rutUsuario: form.rut,
        telefono: form.telefono
      });
      if (!resultado.ok) {
        setErroresPerfil({ rut: resultado.error });
        return;
      }
      setErroresPerfil({});
      setOkPerfil(true);
      window.setTimeout(() => setOkPerfil(false), 3000);
    } catch (err) {
      console.error(err);
      setErroresPerfil({ nombre: 'No se pudieron guardar los cambios.' });
    }
  };

  const handleCambiarClave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errores: ErroresClave = {
      actual: clave.actual ? undefined : 'Ingresa tu contraseña actual.',
      nueva: clave.nueva.length < 6 ? 'Mínimo 6 caracteres.' : undefined,
      nueva2: clave.nueva2 !== clave.nueva ? 'Las contraseñas no coinciden.' : undefined
    };
    if (Object.values(errores).some(Boolean)) {
      setErroresClave(errores);
      return;
    }
    try {
      const resultado = await cambiarPassword(clave.actual, clave.nueva);
      if (!resultado.ok) {
        setErroresClave({ actual: resultado.error });
        return;
      }
      setClave(claveInicial);
      setErroresClave({});
      setOkClave(true);
      window.setTimeout(() => setOkClave(false), 3000);
    } catch (err) {
      console.error(err);
      setErroresClave({ actual: 'No se pudo cambiar la contraseña.' });
    }
  };

  const clasePerfil = (campo: keyof PerfilFormState): string => (erroresPerfil[campo] ? 'form-control is-invalid' : 'form-control');
  const claseClave = (campo: keyof ClaveFormState): string => (erroresClave[campo] ? 'form-control is-invalid' : 'form-control');
  const desde = sesion.fechaCreacion
    ? 'Cliente desde ' + new Date(sesion.fechaCreacion).toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })
    : sesion.emailCliente;

  return (
    <>
      <section className="store-section py-4">
        <div className="container">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-2" style={{ fontSize: '.85rem' }}>
              <li className="breadcrumb-item"><Link to="/" style={{ color: 'inherit', opacity: 0.8 }}>Inicio</Link></li>
              <li className="breadcrumb-item active" aria-current="page" style={{ color: 'inherit' }}>Mi perfil</li>
            </ol>
          </nav>
          <h2 className="mb-0"><i className="bi bi-person-circle me-2"></i>Mi perfil</h2>
          <p className="mb-0 mt-1" style={{ opacity: 0.85 }}>Hola, {sesion.nombre}. Aquí puedes actualizar tus datos.</p>
        </div>
      </section>

      <section className="py-5 bg-light">
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-8">
              <form className="bg-white rounded shadow-sm p-4 mb-4" noValidate onSubmit={(event) => void handleGuardarPerfil(event)} aria-label="Datos personales">
                <h5 className="fw-bold mb-3">Datos personales</h5>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="nombre">Nombre</label>
                    <input className={clasePerfil('nombre')} id="nombre" name="nombre" maxLength={40} value={form.nombre} onChange={handlePerfilChange} />
                    <div className="invalid-feedback">{erroresPerfil.nombre}</div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="apellido">Apellido</label>
                    <input className={clasePerfil('apellido')} id="apellido" name="apellido" maxLength={40} value={form.apellido} onChange={handlePerfilChange} />
                    <div className="invalid-feedback">{erroresPerfil.apellido}</div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="rut">RUT</label>
                    <input className={clasePerfil('rut')} id="rut" name="rut" maxLength={12} autoComplete="off" placeholder="12.345.678-5" value={form.rut} onChange={handlePerfilChange} />
                    <div className="invalid-feedback">{erroresPerfil.rut}</div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="email">Correo electrónico</label>
                    <input className="form-control" id="email" value={sesion.emailCliente} disabled />
                    <div className="form-text">El correo identifica tu cuenta y no se puede cambiar.</div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="telefono">Teléfono</label>
                    <input type="tel" className={clasePerfil('telefono')} id="telefono" name="telefono" placeholder="+56 9 1234 5678" value={form.telefono} onChange={handlePerfilChange} />
                    <div className="invalid-feedback">{erroresPerfil.telefono}</div>
                  </div>
                </div>
                <p className="small text-muted mt-3 mb-0"><i className="bi bi-shop me-1"></i>Por ahora solo hay retiro en tienda, por eso no pedimos dirección.</p>

                <button type="submit" className="btn btn-brand mt-4"><i className="bi bi-check-lg me-1"></i>GUARDAR CAMBIOS</button>
                {okPerfil && <span className="text-success ms-3"><i className="bi bi-check-circle me-1"></i>Datos guardados</span>}
              </form>

              <form className="bg-white rounded shadow-sm p-4" noValidate onSubmit={(event) => void handleCambiarClave(event)} aria-label="Cambiar contraseña">
                <h5 className="fw-bold mb-3">Cambiar contraseña</h5>
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label" htmlFor="actual">Contraseña actual</label>
                    <input type="password" className={claseClave('actual')} id="actual" name="actual" value={clave.actual} onChange={handleClaveChange} />
                    <div className="invalid-feedback">{erroresClave.actual}</div>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label" htmlFor="nueva">Nueva contraseña</label>
                    <input type="password" className={claseClave('nueva')} id="nueva" name="nueva" value={clave.nueva} onChange={handleClaveChange} />
                    <div className="invalid-feedback">{erroresClave.nueva}</div>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label" htmlFor="nueva2">Repetir nueva</label>
                    <input type="password" className={claseClave('nueva2')} id="nueva2" name="nueva2" value={clave.nueva2} onChange={handleClaveChange} />
                    <div className="invalid-feedback">{erroresClave.nueva2}</div>
                  </div>
                </div>
                <button type="submit" className="btn btn-dark mt-3">CAMBIAR CONTRASEÑA</button>
                {okClave && <span className="text-success ms-3"><i className="bi bi-check-circle me-1"></i>Contraseña actualizada</span>}
              </form>
            </div>

            <div className="col-lg-4">
              <div className="bg-white rounded shadow-sm p-4 text-center mb-4">
                <span className="d-inline-flex align-items-center justify-content-center rounded-circle bg-dark text-white fw-bold mb-3" style={{ width: '80px', height: '80px', fontSize: '1.6rem' }}>
                  {iniciales(sesion.nombre, sesion.apellido)}
                </span>
                <h5 className="fw-bold mb-0">{sesion.nombre} {sesion.apellido}</h5>
                <p className="text-muted small mb-3">{desde}</p>
                <div className="row text-center">
                  <div className="col"><div className="fs-4 fw-bold">{mios.length}</div><div className="small text-muted">Pedidos</div></div>
                  <div className="col"><div className="fs-4 fw-bold">{formatoCLP(comprado)}</div><div className="small text-muted">Comprado</div></div>
                </div>
              </div>
              <div className="list-group shadow-sm">
                <Link to="/mis-pedidos" className="list-group-item list-group-item-action py-3"><i className="bi bi-bag-check me-2"></i>Mis pedidos</Link>
                <Link to="/carrito" className="list-group-item list-group-item-action py-3"><i className="bi bi-cart3 me-2"></i>Mi carrito</Link>
                <button type="button" className="list-group-item list-group-item-action py-3 text-danger" onClick={cerrarSesion}>
                  <i className="bi bi-box-arrow-right me-2"></i>Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Perfil;
