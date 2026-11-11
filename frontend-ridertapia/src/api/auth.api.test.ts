import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import AuthApiService from './auth.api';

// MOCK: el cliente HTTP. Cada test define lo que responde el backend
const { get, post, put } = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), put: vi.fn() }));
vi.mock('./cliente', () => ({ default: { get, post, put, patch: vi.fn(), delete: vi.fn() }, USAR_API: true }));

const errorHttp = (status: number, mensaje = ''): AxiosError =>
  new AxiosError('error', String(status), undefined, undefined,
    { status, statusText: '', data: { mensaje }, headers: {}, config: { headers: new AxiosHeaders() } });

const USUARIO = { rutUsuario: '12345678-5', emailCliente: 'camila@correo.cl', rol: 'CLIENTE', activo: true, fechaCreacion: '2026-10-01T10:00:00' };
const CLIENTE = { rutUsuario: '12345678-5', nombre: 'Camila', apellido: 'Rojas', telefono: '+56911111111', direccion: null, comuna: null };

const DATOS = { rutUsuario: '12.345.678-5', emailCliente: 'Camila@Correo.cl', password: 'secreto12', nombre: 'Camila', apellido: 'Rojas' };

beforeEach(() => {
  localStorage.clear();
  get.mockReset();
  post.mockReset();
  put.mockReset();
});

describe('AuthApiService (modo backend)', () => {
  it('registrar: crea la cuenta en ms-usuario con el RUT del backend y luego el perfil en ms-cliente', async () => {
    post.mockImplementation(async (url: string) => ({ data: url === '/usuarios' ? USUARIO : CLIENTE }));

    const resultado = await AuthApiService.registrar(DATOS);

    expect(post.mock.calls[0]).toEqual(['/usuarios', { rutUsuario: '12345678-5', emailCliente: 'camila@correo.cl', password: 'secreto12', rol: 'CLIENTE' }]);
    expect(post.mock.calls[1][0]).toBe('/clientes');
    expect(resultado).toMatchObject({ ok: true, sesion: { rutUsuario: '12.345.678-5', nombre: 'Camila', rol: 'CLIENTE' } });
  });

  it('registrar: un RUT repetido (409) se informa en el campo RUT', async () => {
    post.mockRejectedValue(errorHttp(409, 'Ya existe un usuario con el RUT 12345678-5'));

    const resultado = await AuthApiService.registrar(DATOS);

    expect(resultado).toMatchObject({ ok: false, campo: 'rutUsuario' });
  });

  it('iniciarSesion: correo inexistente avisa que no hay cuenta', async () => {
    get.mockRejectedValue(errorHttp(404));

    expect(await AuthApiService.iniciarSesion('nadie@correo.cl', 'secreto12')).toMatchObject({ ok: false, noExiste: true });
  });

  it('iniciarSesion: clave mala (401) y cuenta desactivada (403)', async () => {
    get.mockResolvedValue({ data: USUARIO });
    post.mockRejectedValueOnce(errorHttp(401)).mockRejectedValueOnce(errorHttp(403));

    expect(await AuthApiService.iniciarSesion(USUARIO.emailCliente, 'mala1234')).toMatchObject({ ok: false, error: 'Contraseña incorrecta.' });
    expect(await AuthApiService.iniciarSesion(USUARIO.emailCliente, 'secreto12')).toMatchObject({ ok: false, error: expect.stringContaining('desactivada') });
  });

  it('iniciarSesion: guarda la sesion con los datos del perfil', async () => {
    get.mockImplementation(async (url: string) => ({ data: url.startsWith('/clientes') ? CLIENTE : USUARIO }));
    post.mockResolvedValue({ data: USUARIO });

    const resultado = await AuthApiService.iniciarSesion(USUARIO.emailCliente, 'secreto12');

    expect(resultado).toMatchObject({ ok: true, sesion: { nombre: 'Camila', apellido: 'Rojas' } });
    expect(JSON.parse(localStorage.getItem('usuario') ?? '{}')).toMatchObject({ emailCliente: USUARIO.emailCliente });
  });

  it('actualizarPerfil: el RUT de la cuenta no se puede cambiar', async () => {
    get.mockResolvedValue({ data: USUARIO });

    const resultado = await AuthApiService.actualizarPerfil(USUARIO.emailCliente, { rutUsuario: '11.111.111-1' });

    expect(resultado).toMatchObject({ ok: false, campo: 'rutUsuario' });
    expect(put).not.toHaveBeenCalled();
  });

  it('actualizarPerfil: envía el teléfono sin espacios y conserva dirección y comuna', async () => {
    get.mockImplementation(async (url: string) => ({ data: url.startsWith('/clientes') ? { ...CLIENTE, comuna: 'Concepción' } : USUARIO }));
    put.mockResolvedValue({ data: CLIENTE });

    await AuthApiService.actualizarPerfil(USUARIO.emailCliente, { nombre: 'Cami', telefono: '+56 9 2222 3333' });

    expect(put).toHaveBeenCalledWith('/clientes/12345678-5', expect.objectContaining({ nombre: 'Cami', telefono: '+56922223333', comuna: 'Concepción' }));
  });

  it('cuentaActiva: un comprador sin cuenta se considera activo', async () => {
    get.mockRejectedValue(errorHttp(404));
    expect(await AuthApiService.cuentaActiva('invitado@correo.cl')).toBe(true);
  });
});
