import { useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';
import useSesion from '../hooks/useSesion';

// Paginas solo para clientes con sesion iniciada
const RutaCliente = () => {
  const { sesion } = useSesion();
  const { pathname } = useLocation();
  // Si ya habia sesion al entrar, perderla es un cierre de sesion: se vuelve al inicio
  const [teniaSesion] = useState<boolean>(sesion !== null);

  if (!sesion) return <Navigate to={teniaSesion ? '/' : `/login?volver=${encodeURIComponent(pathname)}`} replace />;
  return <Outlet />;
};

export default RutaCliente;
