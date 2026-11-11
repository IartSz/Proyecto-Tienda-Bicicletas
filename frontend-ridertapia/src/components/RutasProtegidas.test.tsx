import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import RutaAdmin from './RutaAdmin';
import RutaCliente from './RutaCliente';
import type { Sesion } from '../models/Usuario';

// MOCK: el hook de sesion. Cada test decide quien "esta conectado".
const estado = vi.hoisted(() => ({ sesion: null as Sesion | null }));
vi.mock('../hooks/useSesion', () => ({ default: () => ({ sesion: estado.sesion }) }));

const ADMIN: Sesion = { rutUsuario: '11.111.111-1', emailCliente: 'admin@ridertapia.cl', rol: 'ADMIN', nombre: 'Admin', apellido: 'Rider', telefono: null };
const CLIENTE: Sesion = { rutUsuario: '1-9', emailCliente: 'a@b.cl', rol: 'CLIENTE', nombre: 'Ana', apellido: 'Paz', telefono: null };

// Muestra a que direccion fue a parar la navegacion
const Ubicacion = () => {
  const { pathname, search } = useLocation();
  return <div data-testid="ubicacion">{pathname + search}</div>;
};

const mostrar = (ruta: string) =>
  render(
    <MemoryRouter initialEntries={[ruta]}>
      <Routes>
        <Route element={<RutaAdmin />}>
          <Route path="/admin" element={<p>Panel de administración</p>} />
        </Route>
        <Route element={<RutaCliente />}>
          <Route path="/perfil" element={<p>Mi perfil</p>} />
        </Route>
        <Route path="/" element={<><p>Inicio</p><Ubicacion /></>} />
        <Route path="/login" element={<><p>Pantalla de login</p><Ubicacion /></>} />
      </Routes>
    </MemoryRouter>
  );

beforeEach(() => {
  estado.sesion = null;
});

describe('HU-9 Rutas de administrador (RutaAdmin)', () => {
  it('HU-9 CA1: el administrador entra al panel', () => {
    estado.sesion = ADMIN;
    mostrar('/admin');
    expect(screen.getByText('Panel de administración')).toBeInTheDocument();
  });

  it('HU-9 CA1: sin sesión lo manda al login y recuerda a dónde quería ir', () => {
    mostrar('/admin');
    expect(screen.queryByText('Panel de administración')).not.toBeInTheDocument();
    expect(screen.getByText('Pantalla de login')).toBeInTheDocument();
    expect(screen.getByTestId('ubicacion')).toHaveTextContent('/login?volver=%2Fadmin');
  });

  it('HU-9 CA1: un cliente no entra al panel', () => {
    estado.sesion = CLIENTE;
    mostrar('/admin');
    expect(screen.queryByText('Panel de administración')).not.toBeInTheDocument();
    expect(screen.getByText('Pantalla de login')).toBeInTheDocument();
  });
});

describe('HU-8 Rutas de cliente (RutaCliente)', () => {
  it('HU-8 CA1: un cliente con sesión entra a su perfil', () => {
    estado.sesion = CLIENTE;
    mostrar('/perfil');
    expect(screen.getByText('Mi perfil')).toBeInTheDocument();
  });

  it('HU-8 CA1: sin sesión lo manda al login y recuerda a dónde quería ir', () => {
    mostrar('/perfil');
    expect(screen.queryByText('Mi perfil')).not.toBeInTheDocument();
    expect(screen.getByTestId('ubicacion')).toHaveTextContent('/login?volver=%2Fperfil');
  });
});
