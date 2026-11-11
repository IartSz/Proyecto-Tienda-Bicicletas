import { beforeEach, describe, expect, it, vi } from 'vitest';
import AuthService, { ADMIN_PRUEBA, hashClave, leerSesion, type ResultadoAuth } from './auth.service';
import PedidoService from './pedido.service';
import { COMPRADOR, crearPedido } from '../test/fixtures';

// MOCK: actualizarPerfil actualiza los pedidos de la cuenta; se reemplaza el servicio de pedidos
// para comprobar que se llama con los datos nuevos sin depender de pedidos reales.
vi.mock('./pedido.service', () => ({ default: { listar: vi.fn(), actualizar: vi.fn() } }));
const listarPedidos = vi.mocked(PedidoService.listar);
const actualizarPedido = vi.mocked(PedidoService.actualizar);

const DATOS = { nombre: 'Camila', apellido: 'Rojas', rutUsuario: '12.345.678-5', emailCliente: 'Camila@Correo.cl', password: 'secreto1' };
const CORREO = 'camila@correo.cl';

// Devuelve la sesion o hace fallar el test con el mensaje del servicio
const sesionDe = (resultado: ResultadoAuth) => {
  if (!resultado.ok) throw new Error(`Se esperaba exito y fue: ${resultado.error}`);
  return resultado.sesion;
};

beforeEach(() => {
  localStorage.clear();
  listarPedidos.mockReset();
  actualizarPedido.mockReset();
  listarPedidos.mockResolvedValue([]);
});

describe('HU-1 Registro de cliente', () => {
  it('HU-1 CA1: crea la cuenta, normaliza el correo e inicia sesión', async () => {
    const sesion = sesionDe(await AuthService.registrar(DATOS));
    expect(sesion).toMatchObject({ emailCliente: CORREO, rol: 'CLIENTE', nombre: 'Camila', rutUsuario: '12.345.678-5' });
    expect(leerSesion()?.emailCliente).toBe(CORREO);
  });

  it('HU-1 CA1: la contraseña se guarda con hash y nunca en la sesión', async () => {
    const sesion = sesionDe(await AuthService.registrar(DATOS));
    expect(sesion).not.toHaveProperty('password');
    expect(localStorage.getItem('usuario')).not.toContain('secreto1');
    expect(localStorage.getItem('usuarios')).not.toContain('secreto1');
    expect(localStorage.getItem('usuarios')).toContain(hashClave('secreto1'));
  });

  it('HU-1 CA2: un correo ya registrado no crea la cuenta y lo informa', async () => {
    await AuthService.registrar(DATOS);
    const resultado = await AuthService.registrar({ ...DATOS, rutUsuario: '9.999.999-9' });
    expect(resultado).toMatchObject({ ok: false, campo: 'emailCliente', error: 'Ya existe una cuenta con ese correo.' });
    expect(await AuthService.listar()).toHaveLength(2); // admin + la primera cuenta
  });

  it('HU-1 CA2: un RUT ya registrado tampoco se acepta', async () => {
    await AuthService.registrar(DATOS);
    const resultado = await AuthService.registrar({ ...DATOS, emailCliente: 'otra@correo.cl', rutUsuario: '123456785' });
    expect(resultado).toMatchObject({ ok: false, campo: 'rutUsuario', error: 'Ya existe una cuenta con ese RUT.' });
  });

  it('HU-1 CA1: se puede buscar la cuenta por correo y por RUT (con o sin formato)', async () => {
    await AuthService.registrar(DATOS);
    expect((await AuthService.buscarPorCorreo('CAMILA@correo.cl'))?.nombre).toBe('Camila');
    expect((await AuthService.buscarPorRut('123456785'))?.emailCliente).toBe(CORREO);
    expect(await AuthService.buscarPorCorreo('nadie@correo.cl')).toBeUndefined();
  });
});

describe('HU-8 Iniciar sesión (cliente)', () => {
  beforeEach(async () => {
    await AuthService.registrar(DATOS);
    await AuthService.cerrarSesion();
  });

  it('HU-8 CA1: con credenciales correctas inicia sesión y guarda la sesión', async () => {
    const sesion = sesionDe(await AuthService.iniciarSesion('CAMILA@correo.cl', 'secreto1', 'CLIENTE'));
    expect(sesion.emailCliente).toBe(CORREO);
    expect(leerSesion()).not.toBeNull();
  });

  it('HU-8 CA2: una contraseña incorrecta no inicia sesión', async () => {
    const resultado = await AuthService.iniciarSesion(CORREO, 'equivocada', 'CLIENTE');
    expect(resultado).toMatchObject({ ok: false, campo: 'password', error: 'Contraseña incorrecta.' });
    expect(leerSesion()).toBeNull();
  });

  it('HU-8 CA2: un correo sin cuenta lo informa y ofrece crearla', async () => {
    const resultado = await AuthService.iniciarSesion('nadie@correo.cl', 'secreto1', 'CLIENTE');
    expect(resultado).toMatchObject({ ok: false, campo: 'emailCliente', noExiste: true });
  });

  it('HU-5 CA2: una cuenta desactivada no puede iniciar sesión', async () => {
    localStorage.setItem('clientesEstado', JSON.stringify({ [CORREO]: 'inactivo' }));
    const resultado = await AuthService.iniciarSesion(CORREO, 'secreto1', 'CLIENTE');
    expect(resultado).toMatchObject({ ok: false, error: 'Tu cuenta está desactivada. Contáctanos para más información.' });
    expect(await AuthService.cuentaActiva(CORREO)).toBe(false);
  });

  it('HU-8 CA1: cerrar sesión borra la sesión guardada', async () => {
    await AuthService.iniciarSesion(CORREO, 'secreto1', 'CLIENTE');
    await AuthService.cerrarSesion();
    expect(leerSesion()).toBeNull();
    expect(await AuthService.obtenerSesion()).toBeNull();
  });

  it('HU-8 CA1: una sesión guardada con datos dañados se ignora', () => {
    localStorage.setItem('usuario', '{dañado');
    expect(leerSesion()).toBeNull();
  });
});

describe('HU-9 Iniciar sesión (staff): un solo login que detecta el rol', () => {
  it('HU-9 CA1: la cuenta de administrador entra sin indicar el rol y la sesión queda como ADMIN', async () => {
    const sesion = sesionDe(await AuthService.iniciarSesion(ADMIN_PRUEBA.email, ADMIN_PRUEBA.password));
    expect(sesion.rol).toBe('ADMIN');
    expect(leerSesion()?.rol).toBe('ADMIN');
  });

  it('HU-9 CA1: un cliente entra por el mismo login y la sesión queda como CLIENTE', async () => {
    await AuthService.registrar(DATOS);
    await AuthService.cerrarSesion();
    const sesion = sesionDe(await AuthService.iniciarSesion(CORREO, 'secreto1'));
    expect(sesion.rol).toBe('CLIENTE');
  });

  it('HU-9 CA1: si se exige el rol ADMIN, el administrador entra', async () => {
    const sesion = sesionDe(await AuthService.iniciarSesion(ADMIN_PRUEBA.email, ADMIN_PRUEBA.password, 'ADMIN'));
    expect(sesion.rol).toBe('ADMIN');
  });

  it('HU-9 CA1: si se exige el rol CLIENTE, el administrador no entra', async () => {
    const resultado = await AuthService.iniciarSesion(ADMIN_PRUEBA.email, ADMIN_PRUEBA.password, 'CLIENTE');
    expect(resultado).toMatchObject({ ok: false, error: 'Esa cuenta es de administrador: usa la pestaña Administrador.' });
    expect(leerSesion()).toBeNull();
  });

  it('HU-9 CA1: si se exige el rol ADMIN, un cliente no entra al panel', async () => {
    await AuthService.registrar(DATOS);
    const resultado = await AuthService.iniciarSesion(CORREO, 'secreto1', 'ADMIN');
    expect(resultado).toMatchObject({ ok: false, error: 'Esa cuenta no es de administrador.' });
  });

  it('HU-9 CA2: contraseña de administrador incorrecta', async () => {
    const resultado = await AuthService.iniciarSesion(ADMIN_PRUEBA.email, 'mala');
    expect(resultado).toMatchObject({ ok: false, campo: 'password' });
    expect(leerSesion()).toBeNull();
  });

  it('HU-5 CA2: sin indicar el rol, una cuenta de cliente desactivada tampoco entra', async () => {
    await AuthService.registrar(DATOS);
    await AuthService.cerrarSesion();
    localStorage.setItem('clientesEstado', JSON.stringify({ [CORREO]: 'inactivo' }));
    const resultado = await AuthService.iniciarSesion(CORREO, 'secreto1');
    expect(resultado).toMatchObject({ ok: false, error: 'Tu cuenta está desactivada. Contáctanos para más información.' });
  });
});

describe('HU-3 Actualizar perfil', () => {
  it('HU-3 CA1: guarda los cambios y la sesión los refleja de inmediato', async () => {
    await AuthService.registrar(DATOS);
    const sesion = sesionDe(await AuthService.actualizarPerfil(CORREO, { nombre: 'Camila Andrea', telefono: '+56 9 8765 4321' }));
    expect(sesion).toMatchObject({ nombre: 'Camila Andrea', telefono: '+56 9 8765 4321' });
    expect(leerSesion()?.nombre).toBe('Camila Andrea');
  });

  it('HU-3 CA1: los pedidos de la cuenta se actualizan con el nombre nuevo (verifica el mock)', async () => {
    await AuthService.registrar(DATOS);
    listarPedidos.mockResolvedValue([crearPedido({ idPedido: 3 })]);
    await AuthService.actualizarPerfil(CORREO, { nombre: 'Camila Andrea' });
    expect(actualizarPedido).toHaveBeenCalledTimes(1);
    expect(actualizarPedido).toHaveBeenCalledWith(3, expect.objectContaining({
      cliente: expect.objectContaining({ nombre: 'Camila Andrea', email: COMPRADOR.email })
    }));
  });

  it('HU-3 CA2: no deja usar un RUT que pertenece a otra cuenta', async () => {
    await AuthService.registrar(DATOS);
    await AuthService.registrar({ ...DATOS, emailCliente: 'otra@correo.cl', rutUsuario: '9.999.999-9' });
    const resultado = await AuthService.actualizarPerfil('otra@correo.cl', { rutUsuario: '12.345.678-5' });
    expect(resultado).toMatchObject({ ok: false, campo: 'rutUsuario', error: 'Ese RUT pertenece a otra cuenta.' });
  });

  it('HU-3 CA2: actualizar una cuenta que no existe informa el error', async () => {
    const resultado = await AuthService.actualizarPerfil('nadie@correo.cl', { nombre: 'X' });
    expect(resultado).toMatchObject({ ok: false, error: 'No se encontró la cuenta.' });
  });
});

describe('HU-3 Cambio de contraseña (perfil)', () => {
  beforeEach(async () => {
    await AuthService.registrar(DATOS);
  });

  it('HU-3 CA1: con la contraseña actual correcta, la nueva sirve para iniciar sesión y la vieja no', async () => {
    sesionDe(await AuthService.cambiarPassword(CORREO, 'secreto1', 'nueva123'));
    expect((await AuthService.iniciarSesion(CORREO, 'nueva123', 'CLIENTE')).ok).toBe(true);
    expect((await AuthService.iniciarSesion(CORREO, 'secreto1', 'CLIENTE')).ok).toBe(false);
  });

  it('HU-3 CA1: exige la contraseña actual correcta', async () => {
    const resultado = await AuthService.cambiarPassword(CORREO, 'mala', 'nueva123');
    expect(resultado).toMatchObject({ ok: false, error: 'La contraseña actual no es correcta.' });
  });

  it('HU-3 CA1: la contraseña nueva debe tener al menos 6 caracteres', async () => {
    const resultado = await AuthService.cambiarPassword(CORREO, 'secreto1', '123');
    expect(resultado).toMatchObject({ ok: false, error: 'La nueva contraseña debe tener al menos 6 caracteres.' });
  });

  it('HU-1 CA1: el hash es siempre el mismo para el mismo texto y no es el texto', () => {
    expect(hashClave('abc123')).toBe(hashClave('abc123'));
    expect(hashClave('abc123')).not.toBe(hashClave('abc124'));
    expect(hashClave('abc123')).not.toContain('abc123');
  });
});
