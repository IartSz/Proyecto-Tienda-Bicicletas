import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import AdminSidebar from '../components/admin/AdminSidebar';

const SECCIONES: Record<string, string> = {
  pedidos: 'Pedidos',
  productos: 'Productos',
  inventario: 'Inventario',
  categorias: 'Categorías',
  clientes: 'Clientes',
  reportes: 'Reportes'
};

// Titulo de la cabecera segun la ruta
const tituloDe = (ruta: string): string => {
  if (ruta.endsWith('/nuevo')) return 'Nuevo producto';
  if (ruta.endsWith('/editar')) return 'Editar producto';
  const seccion = ruta.split('/')[2] ?? '';
  return SECCIONES[seccion] ?? 'Resumen';
};

const AdminLayout = () => {
  const { pathname } = useLocation();
  const titulo = tituloDe(pathname);

  // Tema oscuro solo dentro del panel
  useEffect(() => {
    document.body.classList.add('adm');
    document.documentElement.setAttribute('data-bs-theme', 'dark');
    return () => {
      document.body.classList.remove('adm');
      document.documentElement.removeAttribute('data-bs-theme');
    };
  }, []);

  useEffect(() => {
    document.title = `${titulo} · Panel Rider Tapia`;
  }, [titulo]);

  return (
    <div className="adm-layout">
      <AdminSidebar />
      <main className="adm-main">
        <header className="adm-top">
          <button className="btn btn-outline-light d-lg-none" type="button" data-bs-toggle="offcanvas" data-bs-target="#sidebar" aria-label="Abrir menú">
            <i className="bi bi-list"></i>
          </button>
          <h1>{titulo}</h1>
          <div className="adm-user">
            <div className="text-end"><strong>Administrador</strong><small>admin@ridertapia.cl</small></div>
            <span className="adm-avatar" aria-hidden="true">AD</span>
          </div>
        </header>
        <div className="adm-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
