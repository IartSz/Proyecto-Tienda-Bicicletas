import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link } from 'react-router';
import { errorEmail } from '../utils/validaciones';

const Recuperar = () => {
  const [email, setEmail] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [enviado, setEnviado] = useState<boolean>(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
    setError('');
    setEnviado(false);
  };

  // Simulado: aun no hay servicio de correo para enviar el enlace de recuperacion
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const mensaje = errorEmail(email);
    setError(mensaje);
    setEnviado(!mensaje);
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <Link to="/" className="auth-brand d-block mb-1">RIDER TAPIA <span>BIKER</span></Link>
        <p className="text-center text-muted mb-4" style={{ fontSize: '.9rem' }}>Recupera tu contraseña</p>

        <p className="text-center text-muted mb-4" style={{ fontSize: '.85rem' }}>
          Ingresa el correo con el que te registraste y te enviaremos un enlace para crear una nueva contraseña.
        </p>

        <form noValidate onSubmit={handleSubmit} aria-label="Recuperar contraseña">
          <div className="mb-4">
            <label htmlFor="email" className="form-label">Correo electrónico</label>
            <div className="input-group has-validation">
              <span className="input-group-text"><i className="bi bi-envelope"></i></span>
              <input type="email" className={error ? 'form-control is-invalid' : 'form-control'} id="email" name="email" placeholder="tucorreo@ejemplo.com" value={email} onChange={handleChange} />
              <div className="invalid-feedback">{error}</div>
            </div>
          </div>

          <button type="submit" className="btn btn-brand w-100 mb-3">ENVIAR ENLACE</button>

          {enviado && (
            <div className="alert alert-success text-center" style={{ fontSize: '.85rem' }}>
              Si el correo está registrado, te enviamos un enlace para restablecer tu contraseña.
            </div>
          )}

          <p className="text-center mb-0 auth-links" style={{ fontSize: '.9rem' }}>
            <Link to="/login"><i className="bi bi-arrow-left me-1"></i>Volver a iniciar sesión</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Recuperar;
