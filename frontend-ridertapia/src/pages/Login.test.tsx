import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import Login from './Login';
import type { ResultadoAuth } from '../services/auth.service';
import type { Sesion } from '../models/Usuario';

// MOCK 1: el hook de sesion. Asi se prueba la PANTALLA sin tocar el servicio real:
// cada test decide que respuesta "devuelve el servidor".
const { iniciarSesion, navegar } = vi.hoisted(() => ({ iniciarSesion: vi.fn(), navegar: vi.fn() }));
vi.mock('../hooks/useSesion', () => ({ default: () => ({ sesion: null, iniciarSesion }) }));

// MOCK 2: la navegacion. Se deja todo react-router real y solo se espia useNavigate.
vi.mock('react-router', async () => {
  const real = await vi.importActual<typeof import('react-router')>('react-router');
  return { ...real, useNavigate: () => navegar };
});

const SESION: Sesion = { rutUsuario: '1-9', emailCliente: 'a@b.cl', rol: 'CLIENTE', nombre: 'Ana', apellido: 'Paz', telefono: null };
const OK: ResultadoAuth = { ok: true, sesion: SESION };

const mostrar = (ruta = '/login') =>
  render(
    <MemoryRouter initialEntries={[ruta]}>
      <Login />
    </MemoryRouter>
  );

const escribir = async (correo: string, clave: string) => {
  await userEvent.type(screen.getByLabelText('Correo electrónico'), correo);
  await userEvent.type(screen.getByLabelText('Contraseña'), clave);
};

beforeEach(() => {
  iniciarSesion.mockReset();
  navegar.mockReset();
});

describe('HU-8 Iniciar sesión (pantalla de cliente)', () => {
  it('HU-8 CA1: con credenciales correctas llama al servicio y vuelve al inicio', async () => {
    iniciarSesion.mockResolvedValue(OK);
    mostrar();
    await escribir('camila@correo.cl', 'secreto1');
    await userEvent.click(screen.getByRole('button', { name: 'INICIAR SESIÓN' }));

    expect(iniciarSesion).toHaveBeenCalledWith('camila@correo.cl', 'secreto1');
    await waitFor(() => expect(navegar).toHaveBeenCalledWith('/'));
  });

  it('HU-8 CA1: vuelve a la página indicada en ?volver= (por ejemplo el checkout)', async () => {
    iniciarSesion.mockResolvedValue(OK);
    mostrar('/login?volver=/checkout');
    await escribir('camila@correo.cl', 'secreto1');
    await userEvent.click(screen.getByRole('button', { name: 'INICIAR SESIÓN' }));
    await waitFor(() => expect(navegar).toHaveBeenCalledWith('/checkout'));
  });

  it('HU-8 CA2: con una contraseña incorrecta muestra el error y no navega', async () => {
    iniciarSesion.mockResolvedValue({ ok: false, campo: 'password', error: 'Contraseña incorrecta.' });
    mostrar();
    await escribir('camila@correo.cl', 'equivocada');
    await userEvent.click(screen.getByRole('button', { name: 'INICIAR SESIÓN' }));

    expect(await screen.findByText('Contraseña incorrecta.')).toBeInTheDocument();
    expect(navegar).not.toHaveBeenCalled();
  });

  it('HU-8 CA2: si no existe la cuenta, ofrece el enlace para crearla', async () => {
    iniciarSesion.mockResolvedValue({ ok: false, campo: 'emailCliente', error: 'No existe una cuenta con ese correo.', noExiste: true });
    mostrar();
    await escribir('nadie@correo.cl', 'secreto1');
    await userEvent.click(screen.getByRole('button', { name: 'INICIAR SESIÓN' }));

    expect(await screen.findByText('No existe una cuenta con ese correo.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Crear cuenta' })).toHaveAttribute('href', '/registro?volver=%2F');
  });

  it('HU-8 CA2: con datos inválidos no llama al servicio y marca los campos', async () => {
    mostrar();
    await escribir('correo-malo', '123');
    await userEvent.click(screen.getByRole('button', { name: 'INICIAR SESIÓN' }));

    expect(screen.getByText('Ingresa un correo válido.')).toBeInTheDocument();
    expect(screen.getByText('Mínimo 6 caracteres.')).toBeInTheDocument();
    expect(iniciarSesion).not.toHaveBeenCalled();
  });
});

describe('HU-9 Iniciar sesión (staff): un solo login que detecta el rol', () => {
  const ADMIN: ResultadoAuth = { ok: true, sesion: { ...SESION, rol: 'ADMIN' } };

  it('HU-9 CA1: no hay pestañas: es un solo formulario para clientes y administradores', () => {
    mostrar();
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'INICIAR SESIÓN' })).toHaveLength(1);
  });

  it('HU-9 CA1: si la cuenta es de administrador, entra por el mismo formulario y va al panel', async () => {
    iniciarSesion.mockResolvedValue(ADMIN);
    mostrar();
    await escribir('admin@ridertapia.cl', 'admin123');
    await userEvent.click(screen.getByRole('button', { name: 'INICIAR SESIÓN' }));

    expect(iniciarSesion).toHaveBeenCalledWith('admin@ridertapia.cl', 'admin123');
    await waitFor(() => expect(navegar).toHaveBeenCalledWith('/admin'));
  });

  it('HU-9 CA1: el administrador que venía de una página del panel vuelve a ella', async () => {
    iniciarSesion.mockResolvedValue(ADMIN);
    mostrar('/login?volver=/admin/pedidos');
    await escribir('admin@ridertapia.cl', 'admin123');
    await userEvent.click(screen.getByRole('button', { name: 'INICIAR SESIÓN' }));
    await waitFor(() => expect(navegar).toHaveBeenCalledWith('/admin/pedidos'));
  });

  it('HU-9 CA1: un cliente que venía del panel va al inicio, no al panel', async () => {
    iniciarSesion.mockResolvedValue(OK);
    mostrar('/login?volver=/admin/pedidos');
    await escribir('camila@correo.cl', 'secreto1');
    await userEvent.click(screen.getByRole('button', { name: 'INICIAR SESIÓN' }));
    await waitFor(() => expect(navegar).toHaveBeenCalledWith('/'));
  });

  it('HU-9 CA2: con credenciales de administrador incorrectas muestra el error y no navega', async () => {
    iniciarSesion.mockResolvedValue({ ok: false, campo: 'password', error: 'Contraseña incorrecta.' });
    mostrar();
    await escribir('admin@ridertapia.cl', 'mala-clave');
    await userEvent.click(screen.getByRole('button', { name: 'INICIAR SESIÓN' }));
    expect(await screen.findByText('Contraseña incorrecta.')).toBeInTheDocument();
    expect(navegar).not.toHaveBeenCalled();
  });
});
