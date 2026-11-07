import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link } from 'react-router';

const Footer = () => {
    const [correo, setCorreo] = useState<string>('');

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCorreo(event.target.value);
};

// Evita que la pagina se recargue al enviar

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCorreo('');
  };

  return (
    <>
      <section className="newsletter py-5">
        <div className="container text-center">
          <h3 className="mb-2">¡Suscríbete a Rider Tapia Bici!</h3>
          <p className="text-muted mb-4">Recibe promociones y novedades directo en tu correo.</p>
          <form className="row justify-content-center g-2 mb-4" style={{ maxWidth: '500px', margin: '0 auto' }} onSubmit={handleSubmit}>
            <div className="col-8">
              <input
                type="email"
                className="form-control"
                placeholder="Correo electrónico"
                value={correo}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-4">
              <button type="submit" className="btn btn-brand w-100">Enviar</button>
            </div>
          </form>
          <div className="social-icons">
            <a href="#"><i className="bi bi-facebook"></i></a>
            <a href="#"><i className="bi bi-instagram"></i></a>
            <a href="#"><i className="bi bi-tiktok"></i></a>
          </div>
        </div>
      </section>

      <footer className="pt-5 pb-3">
        <div className="container">
          <div className="row g-4">
            <div className="col-md-4">
              <h5 className="text-white fw-bold mb-3">RIDER TAPIA</h5>
              <p>Tienda y taller de bicicletas en Concepción. Todo lo que necesitas para ti y tu bici.</p>
              <p className="mb-0"><i className="bi bi-geo-alt me-2"></i>Centro, Concepción</p>
              <p><i className="bi bi-clock me-2"></i>Lunes a domingo, 10:30 a 19:30 hrs</p>
            </div>
            <div className="col-6 col-md-2">
              <h6>Categorías</h6>
              <ul className="list-unstyled">
                <li><Link to="/categoria/indumentaria">Indumentaria</Link></li>
                <li><Link to="/categoria/accesorios">Accesorios</Link></li>
                <li><Link to="/categoria/componentes">Componentes</Link></li>
                <li><Link to="/categoria/ruedas">Ruedas</Link></li>
                <li><Link to="/categoria/suspensiones">Suspensiones</Link></li>
                <li><Link to="/categoria/mantenimiento">Mantenimiento</Link></li>
              </ul>
            </div>
            <div className="col-6 col-md-3">
              <h6>Políticas</h6>
              <ul className="list-unstyled">
                <li><Link to="/politicas/privacidad">Política de privacidad</Link></li>
                <li><Link to="/politicas/terminos">Términos del servicio</Link></li>
                <li><Link to="/politicas/reembolso">Política de reembolso</Link></li>
                <li><Link to="/politicas/retiro">Retiro en tienda</Link></li>
                <li><Link to="/politicas/contacto">Información de contacto</Link></li>
              </ul>
            </div>
            <div className="col-md-3">
              <h6>Síguenos</h6>
              <div className="social-icons mb-3">
                <a href="#"><i className="bi bi-facebook"></i></a>
                <a href="#"><i className="bi bi-instagram"></i></a>
                <a href="#"><i className="bi bi-tiktok"></i></a>
              </div>
              <h6>Formas de pago</h6>
              <div className="payment-icons">
                <i className="bi bi-credit-card-2-front"></i>
                <i className="bi bi-credit-card"></i>
              </div>
            </div>
          </div>
          <hr className="my-4" />
          <p className="text-center mb-0" style={{ fontSize: '.8rem' }}>© 2026, Rider Tapia</p>
        </div>
      </footer>
    </>
  );
};

export default Footer;
