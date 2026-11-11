import axios from 'axios';
import type { Rol, Sesion } from '../models/Usuario';
import type { CampoAuth, ErrorAuth, ServicioAuth } from '../services/auth.service';
import { borrarSesion, guardarSesion, leerSesion } from '../services/sesion';
import { CLAVE_MINIMA, formatearRut, rutApi, telefonoApi } from '../utils/validaciones';
import apiClient from './cliente';
import { obtenerLista } from './hal';
import type { CambioEstadoApi, ClienteApi, UsuarioApi } from './tipos';

// AuthService contra ms-usuario (cuenta y clave) y ms-cliente (datos personales)

export const estadoHttp = (err: unknown): number | undefined =>
  axios.isAxiosError(err) ? err.response?.status : undefined;

const mensajeHttp = (err: unknown): string =>
  (axios.isAxiosError(err) ? (err.response?.data as { mensaje?: string } | undefined)?.mensaje : undefined) ?? '';

const falla = (campo: CampoAuth, error: string, noExiste = false): ErrorAuth => ({ ok: false, error, campo, noExiste });

// GET que devuelve undefined si el backend responde 404
const buscar = async <T>(ruta: string, params?: Record<string, string>): Promise<T | undefined> => {
  try {
    const { data } = await apiClient.get<T>(ruta, { params });
    return data;
  } catch (err) {
    if (estadoHttp(err) === 404) return undefined;
    throw err;
  }
};

const usuarioPorCorreo = (correo: string) => buscar<UsuarioApi>('/usuarios/buscar', { email: correo.trim().toLowerCase() });
const usuarioPorRut = (rut: string) => buscar<UsuarioApi>(`/usuarios/${rutApi(rut)}`);
const clientePorRut = (rut: string) => buscar<ClienteApi>(`/clientes/${rutApi(rut)}`);

// El admin no tiene perfil en ms-cliente
const aSesion = (u: UsuarioApi, c?: ClienteApi): Sesion => ({
  rutUsuario: formatearRut(u.rutUsuario),
  emailCliente: u.emailCliente,
  rol: u.rol,
  nombre: c?.nombre ?? (u.rol === 'ADMIN' ? 'Administrador' : ''),
  apellido: c?.apellido ?? (u.rol === 'ADMIN' ? 'Rider Tapia' : ''),
  telefono: c?.telefono ?? null,
  activo: u.activo,
  fechaCreacion: u.fechaCreacion ?? undefined
});

const conPerfil = async (u: UsuarioApi): Promise<Sesion> =>
  aSesion(u, u.rol === 'CLIENTE' ? await clientePorRut(u.rutUsuario) : undefined);

// La clave se comprueba con el login del backend
const claveCorrecta = async (correo: string, password: string): Promise<'ok' | 'mala' | 'inactiva'> => {
  try {
    await apiClient.post('/usuarios/login', { emailCliente: correo, password });
    return 'ok';
  } catch (err) {
    if (estadoHttp(err) === 401) return 'mala';
    if (estadoHttp(err) === 403) return 'inactiva';
    throw err;
  }
};

const AuthApiService: ServicioAuth = {
  async listar(): Promise<Sesion[]> {
    const [usuarios, clientes] = await Promise.all([
      obtenerLista<UsuarioApi>('/usuarios'),
      obtenerLista<ClienteApi>('/clientes')
    ]);
    return usuarios.map((u) => aSesion(u, clientes.find((c) => c.rutUsuario === u.rutUsuario)));
  },

  async obtenerSesion(): Promise<Sesion | null> {
    return leerSesion();
  },

  async buscarPorCorreo(correo: string): Promise<Sesion | undefined> {
    const u = await usuarioPorCorreo(correo);
    return u ? conPerfil(u) : undefined;
  },

  async buscarPorRut(rut: string): Promise<Sesion | undefined> {
    const u = await usuarioPorRut(rut);
    return u ? conPerfil(u) : undefined;
  },

  // Sin cuenta (invitado) se considera activa
  async cuentaActiva(correo: string): Promise<boolean> {
    return (await usuarioPorCorreo(correo))?.activo ?? true;
  },

  // Crea la cuenta y luego el perfil del cliente
  async registrar(datos) {
    const rut = rutApi(datos.rutUsuario);
    let usuario: UsuarioApi;
    try {
      const { data } = await apiClient.post<UsuarioApi>('/usuarios', {
        rutUsuario: rut,
        emailCliente: datos.emailCliente.trim().toLowerCase(),
        password: datos.password,
        rol: 'CLIENTE'
      });
      usuario = data;
    } catch (err) {
      const mensaje = mensajeHttp(err);
      if (estadoHttp(err) === 409) {
        return mensaje.includes('RUT')
          ? falla('rutUsuario', 'Ya existe una cuenta con ese RUT.')
          : falla('emailCliente', 'Ya existe una cuenta con ese correo.');
      }
      if (estadoHttp(err) === 400) return falla(mensaje.includes('RUT') ? 'rutUsuario' : 'password', mensaje || 'Datos inválidos.');
      throw err;
    }

    const { data: cliente } = await apiClient.post<ClienteApi>('/clientes', {
      rutUsuario: rut,
      nombre: datos.nombre.trim(),
      apellido: datos.apellido.trim(),
      telefono: null,
      direccion: null,
      comuna: null
    });
    const sesion = aSesion(usuario, cliente);
    guardarSesion(sesion);
    return { ok: true, sesion };
  },

  async iniciarSesion(correo: string, password: string, rol?: Rol) {
    const u = await usuarioPorCorreo(correo);
    if (!u) return falla('emailCliente', 'No existe una cuenta con ese correo.', true);
    if (rol && u.rol !== rol) {
      return falla('emailCliente', rol === 'ADMIN'
        ? 'Esa cuenta no es de administrador.'
        : 'Esa cuenta es de administrador: usa la pestaña Administrador.');
    }
    const clave = await claveCorrecta(u.emailCliente, password);
    if (clave === 'mala') return falla('password', 'Contraseña incorrecta.');
    if (clave === 'inactiva') return falla('emailCliente', 'Tu cuenta está desactivada. Contáctanos para más información.');

    const sesion = await conPerfil(u);
    guardarSesion(sesion);
    return { ok: true, sesion };
  },

  async cerrarSesion(): Promise<void> {
    borrarSesion();
  },

  // El RUT es la clave de la cuenta en el backend: no se cambia
  async actualizarPerfil(correo, cambios) {
    const u = await usuarioPorCorreo(correo);
    if (!u) return falla('emailCliente', 'No se encontró la cuenta.');
    if (cambios.rutUsuario && rutApi(cambios.rutUsuario) !== u.rutUsuario) {
      return falla('rutUsuario', 'El RUT de la cuenta no se puede cambiar.');
    }

    const actual = await clientePorRut(u.rutUsuario);
    const cuerpo = {
      nombre: cambios.nombre?.trim() || actual?.nombre || '',
      apellido: cambios.apellido?.trim() || actual?.apellido || '',
      telefono: cambios.telefono === undefined ? actual?.telefono ?? null : telefonoApi(cambios.telefono),
      direccion: actual?.direccion ?? null,
      comuna: actual?.comuna ?? null
    };
    const { data: cliente } = actual
      ? await apiClient.put<ClienteApi>(`/clientes/${u.rutUsuario}`, cuerpo)
      : await apiClient.post<ClienteApi>('/clientes', { rutUsuario: u.rutUsuario, ...cuerpo });

    const sesion = aSesion(u, cliente);
    if (leerSesion()?.emailCliente === u.emailCliente) guardarSesion(sesion);
    return { ok: true, sesion };
  },

  async cambiarPassword(correo, actual, nueva) {
    const u = await usuarioPorCorreo(correo);
    if (!u) return falla('emailCliente', 'No se encontró la cuenta.');
    if (await claveCorrecta(u.emailCliente, actual) !== 'ok') return falla('password', 'La contraseña actual no es correcta.');
    if (nueva.length < CLAVE_MINIMA) return falla('password', `La nueva contraseña debe tener al menos ${CLAVE_MINIMA} caracteres.`);
    await apiClient.put(`/usuarios/${u.rutUsuario}`, { emailCliente: u.emailCliente, password: nueva });
    return { ok: true, sesion: await conPerfil(u) };
  }
};

/* Panel: estado de las cuentas */

export const cambiarEstadoCuenta = async (rut: string, activo: boolean): Promise<void> => {
  await apiClient.patch(`/usuarios/${rutApi(rut)}/estado`, { activo });
};

export const cambiosDeEstado = (): Promise<CambioEstadoApi[]> => obtenerLista<CambioEstadoApi>('/usuarios/cambios-estado');

export default AuthApiService;
