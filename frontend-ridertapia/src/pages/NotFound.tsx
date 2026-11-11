import { Link } from 'react-router';

interface NotFoundProps {
  ruta?: string;
  texto?: string;
}

const NotFound = ({ ruta = '/', texto = 'Volver al inicio' }: NotFoundProps) => {
  return (
    <section className="container py-5 text-center">
      <i className="bi bi-emoji-dizzy" style={{ fontSize: '3.5rem' }}></i>
      <h1 className="display-4 fw-bold mt-3 mb-1">404</h1>
      <h2 className="h4 mb-3">Esta página no existe</h2>
      <p className="text-muted">Puede que el enlace esté mal escrito o que la página ya no esté disponible.</p>
      <Link to={ruta} className="btn btn-brand mt-2"><i className="bi bi-arrow-left me-2"></i>{texto}</Link>
    </section>
  );
};

export default NotFound;
