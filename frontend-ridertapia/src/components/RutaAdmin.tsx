import { Navigate, Outlet, useLocation } from 'react-router';
import useSesion from '../hooks/useSesion';

// Envuelve las rutas /admin: solo entra quien tiene sesion de administrador
const RutaAdmin = () => {
  const { sesion } = useSesion();
  const { pathname } = useLocation();

  if (sesion?.rol !== 'ADMIN') return <Navigate to={`/login?volver=${encodeURIComponent(pathname)}`} replace />;
  return <Outlet />;
};

export default RutaAdmin;
