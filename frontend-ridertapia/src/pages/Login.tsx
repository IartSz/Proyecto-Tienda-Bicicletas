import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import useSesion from '../hooks/useSesion';
import { CLAVE_MINIMA, errorEmail } from '../utils/validaciones';
import { rutaVolver } from '../utils/volver';

interface LoginFormState {
  correo: string;
  password: string;
}

interface ErroresLogin {
  correo?: string;
  password?: string;
  noExiste?: boolean;
}

const initialState: LoginFormState = { correo: '', password: '' };

// Un solo formulario para clientes y administradores: el rol lo define la cuenta
const Login = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { sesion, iniciarSesion } = useSesion();
  const volver = rutaVolver(params.get('volver'));
  const [form, setForm] = useState<LoginFormState>(initialState);
  const [errores, setErrores] = useState<ErroresLogin>({});
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // El error se quita al volver a escribir
    setErrores((prev) => ({ ...prev, [name]: undefined, noExiste: false }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nuevos: ErroresLogin = {
      correo: errorEmail(form.correo) || undefined,
      password: form.password.length < CLAVE_MINIMA ? `Mínimo ${CLAVE_MINIMA} caracteres.` : undefined
    };
    if (nuevos.correo || nuevos.password) {
      setErrores(nuevos);
      return;
    }

    setLoading(true);
    try {
      const resultado = await iniciarSesion(form.correo, form.password);
      if (!resultado.ok) {
        setErrores(resultado.campo === 'password'
          ? { password: resultado.error }
          : { correo: resultado.error, noExiste: resultado.noExiste });
        return;
      }
      // El administrador entra al panel; el cliente vuelve a donde estaba (nunca al panel)
      const alPanel = volver.startsWith('/admin');
      if (resultado.sesion.rol === 'ADMIN') navigate(alPanel ? volver : '/admin');
      else navigate(alPanel ? '/' : volver);
    } finally {
      setLoading(false);
    }
  };

  const clase = (campo: 'correo' | 'password'): string => (errores[campo] ? 'form-control is-invalid' : 'form-control');

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <Link to="/" className="auth-brand d-block mb-1">RIDER TAPIA <span>BIKER</span></Link>
        <p className="text-center text-muted mb-4" style={{ fontSize: '.9rem' }}>Ingresa a tu cuenta</p>

        {volver === '/checkout' && (
          <div className="alert alert-light border small text-center">
            Inicia sesión para continuar tu compra, o <Link to="/checkout">sigue como invitado</Link>.
          </div>
        )}
        {sesion && (
          <div className="alert alert-light border small text-center">
            Ya iniciaste sesión como <strong>{sesion.nombre} {sesion.apellido}</strong>.{' '}
            <Link to={sesion.rol === 'ADMIN' ? '/admin' : volver}>Continuar</Link>
          </div>
        )}

        <form noValidate onSubmit={(event) => void handleSubmit(event)} aria-label="Iniciar sesión">
          <div className="mb-3">
            <label htmlFor="correo" className="form-label">Correo electrónico</label>
            <div className="input-group">
              <span className="input-group-text"><i className="bi bi-envelope"></i></span>
              <input type="email" className={clase('correo')} id="correo" name="correo" placeholder="tucorreo@ejemplo.com" value={form.correo} onChange={handleChange} />
            </div>
            {errores.correo && (
              <div className="text-danger mt-1" style={{ fontSize: '.85rem' }}>
                {errores.correo}
                {errores.noExiste && <> <Link to={`/registro?volver=${encodeURIComponent(volver)}`}>Crear cuenta</Link></>}
              </div>
            )}
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">Contraseña</label>
            <div className="input-group">
              <span className="input-group-text"><i className="bi bi-lock"></i></span>
              <input type="password" className={clase('password')} id="password" name="password" placeholder="••••••••" value={form.password} onChange={handleChange} />
            </div>
            {errores.password && <div className="text-danger mt-1" style={{ fontSize: '.85rem' }}>{errores.password}</div>}
          </div>

          <div className="text-end mb-4 auth-links">
            <Link to="/recuperar" style={{ fontSize: '.85rem' }}>¿Olvidaste tu contraseña?</Link>
          </div>

          <button type="submit" className="btn btn-brand w-100 mb-3" disabled={loading}>
            {loading ? 'INGRESANDO...' : 'INICIAR SESIÓN'}
          </button>

          <div className="text-center text-muted mb-2" style={{ fontSize: '.8rem' }}>¿No tienes cuenta?</div>
          <div className="text-center">
            <Link to={`/registro?volver=${encodeURIComponent(volver)}`} className="btn btn-dark px-4">CREAR CUENTA</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
