import { useEffect, type MouseEvent } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { Offcanvas } from 'bootstrap';
import useProductos from '../../hooks/useProductos';

interface EnlaceAdmin {
  texto: string;
  ruta: string;
  icono: string;
}

const ENLACES: EnlaceAdmin[] = [
  { texto: 'Resumen', ruta: '/admin', icono: 'bi-speedometer2' },
  { texto: 'Pedidos', ruta: '/admin/pedidos', icono: 'bi-receipt' },
  { texto: 'Productos', ruta: '/admin/productos', icono: 'bi-box-seam' },
  { texto: 'Inventario', ruta: '/admin/inventario', icono: 'bi-arrow-left-right' },
  { texto: 'Categorías', ruta: '/admin/categorias', icono: 'bi-tags' },
  { texto: 'Clientes', ruta: '/admin/clientes', icono: 'bi-people' },
  { texto: 'Reportes', ruta: '/admin/reportes', icono: 'bi-graph-up' }
];

const CLAVES_DATOS = ['productos', 'categorias', 'categoriasEliminadas', 'movimientos', 'pedidos', 'clientesEstado',
  'clientesLog', 'reportesHistorial', 'carrito', 'usuarios', 'usuario'];

const AdminSidebar = () => {
  const { pathname } = useLocation();
  const { productos, recargar } = useProductos();

  // Productos activos bajo el stock minimo
  const bajoMinimo = productos.filter(
    (p) => p.estado !== 'OCULTO' && (p.stockDisponible ?? 0) < (p.stockMinimo ?? 0)
  ).length;
  // Pendiente: pedidos por atender
  const pedidosPorAtender = 0;

  // Al cambiar de pagina: cierra el menu movil y actualiza los contadores
  useEffect(() => {
    const menu = document.getElementById('sidebar');
    if (menu) Offcanvas.getInstance(menu)?.hide();
    void recargar();
  }, [pathname, recargar]);

  const restablecerDatos = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    if (!window.confirm('Esto borrará productos creados, cambios de stock, categorías, movimientos, pedidos, clientes y cuentas registradas, y volverá a los datos iniciales. ¿Continuar?')) return;
    CLAVES_DATOS.forEach((clave) => {
      try {
        localStorage.removeItem(clave);
      } catch {
        // Sin acceso al almacenamiento
      }
    });
    window.location.reload();
  };

  const contador = (texto: string): number => {
    if (texto === 'Inventario') return bajoMinimo;
    if (texto === 'Pedidos') return pedidosPorAtender;
    return 0;
  };

  return (
    <aside className="offcanvas-lg offcanvas-start adm-sidebar" tabIndex={-1} id="sidebar" aria-label="Menú del panel">
      <div className="d-flex align-items-start justify-content-between">
        <div className="adm-brand">RIDER TAPIA <span>BIKER</span><small>Panel de administración</small></div>
        <button type="button" className="btn-close btn-close-white d-lg-none m-3" data-bs-dismiss="offcanvas" data-bs-target="#sidebar" aria-label="Cerrar menú"></button>
      </div>
      <nav className="adm-nav">
        {ENLACES.map((enlace) => (
          <NavLink key={enlace.ruta} to={enlace.ruta} end={enlace.ruta === '/admin'}>
            <i className={`bi ${enlace.icono}`}></i>{enlace.texto}
            {contador(enlace.texto) > 0 && <span className="adm-badge">{contador(enlace.texto)}</span>}
          </NavLink>
        ))}
      </nav>
      <div className="adm-sidebar-foot">
        <Link to="/"><i className="bi bi-shop"></i>Ver tienda</Link>
        <Link to="/login"><i className="bi bi-box-arrow-left"></i>Cerrar sesión</Link>
        <a href="#" onClick={restablecerDatos}><i className="bi bi-arrow-counterclockwise"></i>Restablecer datos</a>
      </div>
    </aside>
  );
};

export default AdminSidebar;
