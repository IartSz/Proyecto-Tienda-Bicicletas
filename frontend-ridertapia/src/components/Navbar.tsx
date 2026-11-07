import { Link, NavLink } from 'react-router';

interface EnlaceMenu {
    texto: string;
    ruta: string;
}

interface GrupoMenu {
    titulo: string;
    enlaces: EnlaceMenu[];
}

// Grupos con menu desplegable
const GRUPOS: GrupoMenu[] = [
  {
    titulo: 'Indumentaria',
    enlaces: [
      { texto: 'Cascos', ruta: '/categoria/cascos' },
      { texto: 'Rodilleras', ruta: '/categoria/rodilleras' },
      { texto: 'Guantes', ruta: '/categoria/guantes' },
      { texto: 'Cortavientos', ruta: '/categoria/cortavientos' }
    ]
  },
  {
    titulo: 'Accesorios',
    enlaces: [
      { texto: 'Bombines', ruta: '/categoria/bombines' },
      { texto: 'Botellas', ruta: '/categoria/botellas' },
      { texto: 'Luces', ruta: '/categoria/luces' },
      { texto: 'Puños', ruta: '/categoria/punos' },
      { texto: 'Sillines', ruta: '/categoria/sillines' },
      { texto: 'Tapabarros', ruta: '/categoria/tapabarros' }
    ]
  },
  {
    titulo: 'Componentes',
    enlaces: [
      { texto: 'Transmisión', ruta: '/categoria/transmision' },
      { texto: 'Frenos', ruta: '/categoria/frenos' },
      { texto: 'Mazas', ruta: '/categoria/mazas' },
      { texto: 'Pedales', ruta: '/categoria/pedales' },
      { texto: 'Manubrios', ruta: '/categoria/manubrios' }
    ]
  },
  {
    titulo: 'Ruedas',
    enlaces: [
      { texto: 'Neumáticos', ruta: '/categoria/neumaticos' },
      { texto: 'Cámaras', ruta: '/categoria/camaras' }
    ]
  }
];

// Grupos sin menu desplegable
const ENLACES: EnlaceMenu[] = [
  { texto: 'Suspensiones', ruta: '/categoria/suspensiones' },
  { texto: 'Mantenimiento', ruta: '/categoria/mantenimiento' },
  { texto: 'Contacto', ruta: '/politicas/contacto' }
];

const Navbar = () => {
  return (
    <header>
      <div className="topbar py-1">
        <div className="container d-flex justify-content-between align-items-center">
          <div className="d-none d-md-block">📍 Centro, Concepción · Lunes a domingo, 10:30 a 19:30 hrs</div>
          <div className="ms-auto">
            <a href="#" className="me-3"><i className="bi bi-facebook"></i></a>
            <a href="#" className="me-3"><i className="bi bi-instagram"></i></a>
            <a href="#"><i className="bi bi-tiktok"></i></a>
          </div>
        </div>
      </div>

      <nav className="navbar navbar-expand-xl bg-white shadow-sm sticky-top py-3">
        <div className="container">
          <Link className="navbar-brand" to="/">RIDER TAPIA <span>BIKER</span></Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navMenu">
            <ul className="navbar-nav mx-auto">
              <li className="nav-item">
                <Link className="nav-link" to="/#destacados">Destacados⚡️</Link>
              </li>
              {GRUPOS.map((grupo) => (
                <li className="nav-item dropdown" key={grupo.titulo}>
                  <button className="nav-link dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    {grupo.titulo}
                  </button>
                  <ul className="dropdown-menu">
                    {grupo.enlaces.map((enlace) => (
                      <li key={enlace.ruta}>
                        <Link className="dropdown-item" to={enlace.ruta}>{enlace.texto}</Link>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
              {ENLACES.map((enlace) => (
                <li className="nav-item" key={enlace.ruta}>
                  <NavLink className="nav-link" to={enlace.ruta}>{enlace.texto}</NavLink>
                </li>
              ))}
            </ul>
            <div className="d-flex align-items-center mt-3 mt-xl-0">
              <div className="nav-icons d-flex align-items-center">
                <Link to="/login" title="Iniciar sesión"><i className="bi bi-person"></i></Link>
                <Link to="/carrito" className="position-relative" title="Carrito">
                  <i className="bi bi-cart3"></i>
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-dark" style={{ fontSize: '.55rem' }}>
                    0
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
