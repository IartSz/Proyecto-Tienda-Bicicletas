import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import useSesion from '../hooks/useSesion';
import type { CampoAuth } from '../services/auth.service';
import {
  CLAVE_MINIMA, errorEmail, errorNombre, errorRut, formatearRut, limpiarNombre
} from '../utils/validaciones';
import { rutaVolver } from '../utils/volver';

interface RegistroFormState {
  nombre: string;
  apellido: string;
  rut: string;
  email: string;
  password: string;
  password2: string;
  terminos: boolean;
}

type Errores = Partial<Record<keyof RegistroFormState, string>>;

const initialState: RegistroFormState = {
  nombre: '',
  apellido: '',
  rut: '',
  email: '',
  password: '',
  password2: '',
  terminos: false
};

// Campo del servicio y su campo del formulario
const CAMPO_FORM: Record<CampoAuth, keyof RegistroFormState> = {
  emailCliente: 'email',
  rutUsuario: 'rut',
  password: 'password'
};

const validar = (form: RegistroFormState): Errores => {
  const errores: Errores = {
    nombre: errorNombre(form.nombre, 'nombre'),
    apellido: errorNombre(form.apellido, 'apellido'),
    rut: errorRut(form.rut),
    email: errorEmail(form.email),
    password: form.password.length < CLAVE_MINIMA ? `Mínimo ${CLAVE_MINIMA} caracteres.` : '',
    password2: form.password2 === '' ? 'Repite tu contraseña.' : form.password !== form.password2 ? 'Las contraseñas no coinciden.' : '',
    terminos: form.terminos ? '' : 'Debes aceptar los términos.'
  };
  // Solo deja los campos con error
  return Object.fromEntries(Object.entries(errores).filter(([, v]) => v)) as Errores;
};

const Registro = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { registrar } = useSesion();
  const volver = rutaVolver(params.get('volver'));
  const [form, setForm] = useState<RegistroFormState>(initialState);
  const [intentado, setIntentado] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  // Error que devuelve el servicio (correo o RUT repetido)
  const [errorServicio, setErrorServicio] = useState<{ campo: keyof RegistroFormState; texto: string } | null>(null);

  const errores: Errores = intentado ? validar(form) : {};
  if (errorServicio) errores[errorServicio.campo] = errorServicio.texto;
  // Las contraseñas se comparan mientras se escribe
  const noCoinciden = form.password2 !== '' && form.password !== form.password2;
  if (noCoinciden) errores.password2 = 'Las contraseñas no coinciden.';

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target;
    let valor: string | boolean = type === 'checkbox' ? checked : value;
    // Formato mientras se escribe
    if (name === 'nombre' || name === 'apellido') valor = limpiarNombre(value);
    if (name === 'rut') valor = formatearRut(value);
    setForm((prev) => ({ ...prev, [name]: valor }));
    setErrorServicio(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIntentado(true);
    if (Object.keys(validar(form)).length > 0) return;

    setLoading(true);
    try {
      const resultado = await registrar({
        nombre: form.nombre,
        apellido: form.apellido,
        rutUsuario: formatearRut(form.rut),
        emailCliente: form.email,
        password: form.password
      });
      if (!resultado.ok) {
        setErrorServicio({ campo: CAMPO_FORM[resultado.campo], texto: resultado.error });
        return;
      }
      // Cuenta creada y sesion iniciada
      navigate(volver);
    } catch (err) {
      console.error(err);
      setErrorServicio({ campo: 'email', texto: 'No fue posible crear la cuenta. Intenta nuevamente.' });
    } finally {
      setLoading(false);
    }
  };

  const clase = (campo: keyof RegistroFormState, base = 'form-control'): string => {
    if (errores[campo]) return `${base} is-invalid`;
    if (campo === 'password2' && form.password2 !== '') return `${base} is-valid`;
    return base;
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <Link to="/" className="auth-brand d-block mb-1">RIDER TAPIA <span>BIKER</span></Link>
        <p className="text-center text-muted mb-4" style={{ fontSize: '.9rem' }}>Crea tu cuenta</p>

        <form noValidate onSubmit={(event) => void handleSubmit(event)} aria-label="Crear cuenta">
          <div className="mb-3">
            <label htmlFor="nombre" className="form-label">Nombre</label>
            <div className="input-group has-validation">
              <span className="input-group-text"><i className="bi bi-person"></i></span>
              <input type="text" className={clase('nombre')} id="nombre" name="nombre" maxLength={40} placeholder="Tu nombre" value={form.nombre} onChange={handleChange} />
              <div className="invalid-feedback">{errores.nombre}</div>
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="apellido" className="form-label">Apellido</label>
            <div className="input-group has-validation">
              <span className="input-group-text"><i className="bi bi-person"></i></span>
              <input type="text" className={clase('apellido')} id="apellido" name="apellido" maxLength={40} placeholder="Tu apellido" value={form.apellido} onChange={handleChange} />
              <div className="invalid-feedback">{errores.apellido}</div>
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="rut" className="form-label">RUT</label>
            <div className="input-group has-validation">
              <span className="input-group-text"><i className="bi bi-person-vcard"></i></span>
              <input type="text" className={clase('rut')} id="rut" name="rut" maxLength={12} autoComplete="off" placeholder="12.345.678-5" value={form.rut} onChange={handleChange} />
              <div className="invalid-feedback">{errores.rut}</div>
            </div>
            <div className="form-text">Sin puntos ni guion también sirve: se ordena solo.</div>
          </div>

          <div className="mb-3">
            <label htmlFor="email" className="form-label">Correo electrónico</label>
            <div className="input-group has-validation">
              <span className="input-group-text"><i className="bi bi-envelope"></i></span>
              <input type="email" className={clase('email')} id="email" name="email" placeholder="tucorreo@ejemplo.com" value={form.email} onChange={handleChange} />
              <div className="invalid-feedback">
                {errores.email}
                {errorServicio?.campo === 'email' && errorServicio.texto.startsWith('Ya existe') && <> <Link to="/login">Iniciar sesión</Link></>}
              </div>
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">Contraseña</label>
            <div className="input-group has-validation">
              <span className="input-group-text"><i className="bi bi-lock"></i></span>
              <input type="password" className={clase('password')} id="password" name="password" placeholder={`Mínimo ${CLAVE_MINIMA} caracteres`} value={form.password} onChange={handleChange} />
              <div className="invalid-feedback">{errores.password}</div>
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="password2" className="form-label">Repetir contraseña</label>
            <div className="input-group has-validation">
              <span className="input-group-text"><i className="bi bi-lock-fill"></i></span>
              <input type="password" className={clase('password2')} id="password2" name="password2" placeholder="Repite tu contraseña" value={form.password2} onChange={handleChange} />
              <div className="invalid-feedback">{errores.password2}</div>
            </div>
          </div>

          <div className="form-check mb-4 auth-links">
            <input className={clase('terminos', 'form-check-input')} type="checkbox" id="terminos" name="terminos" checked={form.terminos} onChange={handleChange} />
            <label className="form-check-label" htmlFor="terminos" style={{ fontSize: '.85rem' }}>
              Acepto los <Link to="/politicas/terminos" target="_blank">términos y condiciones</Link>
            </label>
            <div className="invalid-feedback">{errores.terminos}</div>
          </div>

          <button type="submit" className="btn btn-brand w-100 mb-3" disabled={loading}>{loading ? 'CREANDO...' : 'CREAR CUENTA'}</button>

          <div className="text-center text-muted mb-2" style={{ fontSize: '.8rem' }}>¿Ya tienes cuenta?</div>
          <div className="text-center">
            <Link to={`/login?volver=${encodeURIComponent(volver)}`} className="btn btn-dark px-4">INICIAR SESIÓN</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Registro;
