import { useEffect, type ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { Collapse, Offcanvas } from 'bootstrap';
import useSesion from '../hooks/useSesion';
import usePedidos from '../hooks/usePedidos';
import { pedidosDeCorreo } from '../services/pedido.service';
import { iniciales } from '../utils/formato';
import { estaAbierto } from '../utils/estadosPedido';

interface NavbarProps {
  cantidadCarrito: number;
}

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

// Cierra el menu lateral de la cuenta
const cerrarMenuCuenta = (): void => {
  const cuenta = document.getElementById('sidebarUsuario');
  if (cuenta) Offcanvas.getInstance(cuenta)?.hide();
};

// Opcion del menu lateral de la cuenta.
// No usa data-bs-dismiss: Bootstrap cancela el clic de los enlaces <a> y el router no navegaba.
const OpcionCuenta = ({ ruta, icono, texto, extra }: { ruta: string; icono: string; texto: string; extra?: ReactNode }) => (
  <Link to={ruta} onClick={cerrarMenuCuenta} className="list-group-item list-group-item-action d-flex align-items-center gap-3 py-3 border-0">
    <i className={`bi ${icono} fs-5`}></i>
    <span className="flex-grow-1">{texto}</span>
    {extra ?? <i className="bi bi-chevron-right text-muted small"></i>}
  </Link>
);

const TituloSeccion = ({ texto }: { texto: string }) => (
  <div className="px-3 pt-3 pb-1 text-uppercase text-muted" style={{ fontSize: '.7rem', letterSpacing: '1px' }}>{texto}</div>
);

const Navbar = ({ cantidadCarrito }: NavbarProps) => {
  const { pathname, hash } = useLocation();
  const { sesion, esAdmin, cerrarSesion } = useSesion();
  const { pedidos } = usePedidos();

  // Pedidos de la cuenta y los que tienen novedades
  const mios = sesion && !esAdmin ? pedidosDeCorreo(pedidos, sesion.emailCliente) : [];
  const novedades = mios.filter((p) => p.novedad).length;
  // Pedidos que el administrador aun debe atender
  const porAtender = esAdmin ? pedidos.filter(estaAbierto).length : 0;

  // Cierra el menu movil y el menu de la cuenta al cambiar de pagina
  useEffect(() => {
    const menu = document.getElementById('navMenu');
    if (menu) Collapse.getInstance(menu)?.hide();
    cerrarMenuCuenta();
  }, [pathname, hash]);

  const handleCerrarSesion = () => {
    cerrarMenuCuenta();
    cerrarSesion();
  };

  return (
    <header>
      <div className="topbar py-1">
        <div className="container d-flex justify-content-between align-items-center">
          <div className="d-none d-md-block"><i className="bi bi-geo-alt me-1"></i>Centro, Concepción · Lunes a domingo, 10:30 a 19:30 hrs</div>
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
              <li className="nav-item">
                <NavLink className="nav-link" to="/ofertas">Ofertas</NavLink>
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
                {sesion ? (
                  <button
                    type="button"
                    className="btn p-0 border-0 d-inline-flex align-items-center gap-2"
                    data-bs-toggle="offcanvas"
                    data-bs-target="#sidebarUsuario"
                    aria-controls="sidebarUsuario"
                    title="Mi cuenta"
                  >
                    <span
                      className="position-relative d-inline-flex align-items-center justify-content-center rounded-circle bg-dark text-white fw-bold"
                      style={{ width: '32px', height: '32px', fontSize: '.75rem', letterSpacing: '.5px' }}
                    >
                      {iniciales(sesion.nombre, sesion.apellido)}
                      {novedades > 0 && (
                        <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle" title="Tus pedidos tienen novedades"></span>
                      )}
                    </span>
                    <span className="fw-semibold" style={{ fontSize: '.9rem', color: '#222' }}>{sesion.nombre} {sesion.apellido}</span>
                  </button>
                ) : (
                  <Link to={`/login?volver=${encodeURIComponent(pathname)}`} title="Iniciar sesión"><i className="bi bi-person"></i></Link>
                )}
                <Link to="/carrito" className="position-relative" title="Carrito">
                  <i className="bi bi-cart3"></i>
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-dark" style={{ fontSize: '.55rem' }}>
                    {cantidadCarrito}
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {sesion && (
        <div className="offcanvas offcanvas-end" tabIndex={-1} id="sidebarUsuario" aria-labelledby="sidebarUsuarioTitulo" style={{ maxWidth: '340px' }}>
          <div className="offcanvas-header text-white align-items-start" style={{ background: 'linear-gradient(135deg,#2b2b2b,#555)' }}>
            <div className="d-flex align-items-center gap-3">
              <span className="d-inline-flex align-items-center justify-content-center rounded-circle bg-white text-dark fw-bold" style={{ width: '52px', height: '52px', fontSize: '1.1rem' }}>
                {iniciales(sesion.nombre, sesion.apellido)}
              </span>
              <div>
                <div className="small" style={{ opacity: 0.8 }}>{esAdmin ? 'Administrador' : '¡Hola, Rider!'}</div>
                <h5 className="offcanvas-title mb-0" id="sidebarUsuarioTitulo">{sesion.nombre} {sesion.apellido}</h5>
                <div className="small" style={{ opacity: 0.8 }}>{sesion.emailCliente}</div>
              </div>
            </div>
            <button type="button" className="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Cerrar"></button>
          </div>
          <div className="offcanvas-body p-0 d-flex flex-column">
            <div className="list-group list-group-flush">
              {esAdmin ? (
                <>
                  <TituloSeccion texto="Administración" />
                  <OpcionCuenta ruta="/admin" icono="bi-speedometer2" texto="Panel de administración" />
                  <OpcionCuenta
                    ruta="/admin/pedidos"
                    icono="bi-receipt"
                    texto="Pedidos"
                    extra={porAtender > 0 ? <span className="badge rounded-pill bg-danger">{porAtender} por atender</span> : undefined}
                  />
                </>
              ) : (
                <>
                  <TituloSeccion texto="Mi cuenta" />
                  <OpcionCuenta ruta="/perfil" icono="bi-person-circle" texto="Mi perfil" />
                  <OpcionCuenta
                    ruta="/mis-pedidos"
                    icono="bi-bag-check"
                    texto="Mis pedidos"
                    extra={novedades > 0
                      ? <span className="badge rounded-pill bg-danger">{novedades} {novedades === 1 ? 'novedad' : 'novedades'}</span>
                      : mios.length > 0 ? <span className="badge rounded-pill bg-dark">{mios.length}</span> : undefined}
                  />
                  <OpcionCuenta ruta="/carrito" icono="bi-cart3" texto="Mi carrito" extra={cantidadCarrito > 0 ? <span className="badge rounded-pill bg-dark">{cantidadCarrito}</span> : undefined} />
                  <TituloSeccion texto="Ayuda" />
                  <OpcionCuenta ruta="/politicas/retiro" icono="bi-shop" texto="Retiro en tienda" />
                  <OpcionCuenta ruta="/politicas/reembolso" icono="bi-arrow-repeat" texto="Cambios y devoluciones" />
                  <OpcionCuenta ruta="/politicas/contacto" icono="bi-headset" texto="Contacto" />
                </>
              )}
            </div>
            <div className="mt-auto p-3 border-top">
              <button type="button" className="btn btn-outline-dark w-100" onClick={handleCerrarSesion}>
                <i className="bi bi-box-arrow-right me-2"></i>Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
