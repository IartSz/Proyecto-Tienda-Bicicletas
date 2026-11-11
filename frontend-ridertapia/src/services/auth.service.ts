import type { Cliente, RegistroPayload, Rol, Sesion, Usuario } from '../models/Usuario';
import PedidoService from './pedido.service';
import { CLAVE_MINIMA, formatearRut, limpiarRut } from '../utils/validaciones';
import { USAR_API } from '../api/cliente';
import AuthApiService from '../api/auth.api';
import { CLAVE_SESION, guardarSesion, leerSesion, borrarSesion } from './sesion';

export { CLAVE_SESION, leerSesion };

// Modo local (sin backend)
const CLAVE_CUENTAS = 'usuarios';
const CLAVE_ESTADOS = 'clientesEstado';

// Cuenta de administrador de prueba (se crea sola la primera vez)
export const ADMIN_PRUEBA = { email: 'admin@ridertapia.cl', password: 'admin123' };

// Lo que se guarda de cada cuenta: Usuario + datos del Cliente
type Cuenta = Usuario & Omit<Cliente, 'rutUsuario'>;

export type CampoAuth = 'emailCliente' | 'password' | 'rutUsuario';

export interface ErrorAuth {
  ok: false;
  error: string;
  campo: CampoAuth;
  noExiste?: boolean; // no hay cuenta con ese correo
}

export type ResultadoAuth = { ok: true; sesion: Sesion } | ErrorAuth;

export type CambiosPerfil = Partial<Pick<Cliente, 'rutUsuario' | 'nombre' | 'apellido' | 'telefono'>>;

export interface ServicioAuth {
  listar(): Promise<Sesion[]>;
  obtenerSesion(): Promise<Sesion | null>;
  buscarPorCorreo(correo: string): Promise<Sesion | undefined>;
  buscarPorRut(rut: string): Promise<Sesion | undefined>;
  cuentaActiva(correo: string): Promise<boolean>;
  registrar(datos: RegistroPayload): Promise<ResultadoAuth>;
  iniciarSesion(correo: string, password: string, rol?: Rol): Promise<ResultadoAuth>;
  cerrarSesion(): Promise<void>;
  actualizarPerfil(correo: string, cambios: CambiosPerfil): Promise<ResultadoAuth>;
  cambiarPassword(correo: string, actual: string, nueva: string): Promise<ResultadoAuth>;
}

// Hash simple para no guardar la contraseña en texto plano (solo simulacion, NO es seguro)
export const hashClave = (texto: string): string => {
  let h = 5381;
  for (let i = 0; i < texto.length; i++) h = ((h << 5) + h + texto.charCodeAt(i)) >>> 0;
  return 'h' + h.toString(16);
};

const cuentaAdmin = (): Cuenta => ({
  rutUsuario: '11.111.111-1',
  emailCliente: ADMIN_PRUEBA.email,
  password: hashClave(ADMIN_PRUEBA.password),
  rol: 'ADMIN',
  nombre: 'Administrador',
  apellido: 'Rider Tapia',
  telefono: null,
  fechaCreacion: '2026-03-01T00:00:00'
});

const leerCuentas = (): Cuenta[] => {
  let lista: Cuenta[] = [];
  try {
    const datos: unknown = JSON.parse(localStorage.getItem(CLAVE_CUENTAS) ?? '[]');
    if (Array.isArray(datos)) {
      lista = (datos as Cuenta[]).filter((c) => typeof c.emailCliente === 'string' && typeof c.password === 'string');
    }
  } catch {
    lista = [];
  }
  return lista.some((c) => c.rol === 'ADMIN') ? lista : [cuentaAdmin(), ...lista];
};

const guardarCuentas = (lista: Cuenta[]): void => {
  try {
    localStorage.setItem(CLAVE_CUENTAS, JSON.stringify(lista));
  } catch {
    throw new Error('No se pudo guardar: el almacenamiento del navegador está lleno.');
  }
};

// Cuentas desactivadas desde el panel: { "correo": "inactivo" }
export const leerEstadosCuenta = (): Record<string, string> => {
  try {
    const datos: unknown = JSON.parse(localStorage.getItem(CLAVE_ESTADOS) ?? '{}');
    return datos && typeof datos === 'object' ? (datos as Record<string, string>) : {};
  } catch {
    return {};
  }
};

export const guardarEstadosCuenta = (estados: Record<string, string>): void => {
  try {
    localStorage.setItem(CLAVE_ESTADOS, JSON.stringify(estados));
  } catch {
    throw new Error('No se pudo guardar el estado de la cuenta.');
  }
};

// La sesion nunca lleva la contraseña
const aSesion = (cuenta: Cuenta): Sesion => ({
  rutUsuario: cuenta.rutUsuario,
  emailCliente: cuenta.emailCliente,
  rol: cuenta.rol,
  nombre: cuenta.nombre,
  apellido: cuenta.apellido,
  telefono: cuenta.telefono,
  fechaCreacion: cuenta.fechaCreacion
});

const normalizarCorreo = (correo: string): string => correo.trim().toLowerCase();

const buscarCuenta = (correo: string): Cuenta | undefined =>
  leerCuentas().find((c) => c.emailCliente === normalizarCorreo(correo));

// Compara el RUT sin puntos ni guion (12.345.678-5 = 123456785)
const buscarCuentaPorRut = (rut: string): Cuenta | undefined => {
  const limpio = limpiarRut(rut);
  return limpio ? leerCuentas().find((c) => limpiarRut(c.rutUsuario) === limpio) : undefined;
};

const falla = (campo: CampoAuth, error: string, noExiste = false): ErrorAuth => ({ ok: false, error, campo, noExiste });

const AuthLocalService: ServicioAuth = {
  async listar(): Promise<Sesion[]> {
    return leerCuentas().map(aSesion);
  },

  async obtenerSesion(): Promise<Sesion | null> {
    return leerSesion();
  },

  async buscarPorCorreo(correo: string): Promise<Sesion | undefined> {
    const cuenta = buscarCuenta(correo);
    return cuenta ? aSesion(cuenta) : undefined;
  },

  async buscarPorRut(rut: string): Promise<Sesion | undefined> {
    const cuenta = buscarCuentaPorRut(rut);
    return cuenta ? aSesion(cuenta) : undefined;
  },

  // false si el cliente fue desactivado desde el panel
  async cuentaActiva(correo: string): Promise<boolean> {
    return leerEstadosCuenta()[normalizarCorreo(correo)] !== 'inactivo';
  },

  // Crea la cuenta de cliente e inicia la sesion
  async registrar(datos: RegistroPayload): Promise<ResultadoAuth> {
    const correo = normalizarCorreo(datos.emailCliente);
    if (buscarCuenta(correo)) return falla('emailCliente', 'Ya existe una cuenta con ese correo.');
    if (buscarCuentaPorRut(datos.rutUsuario)) return falla('rutUsuario', 'Ya existe una cuenta con ese RUT.');

    const nueva: Cuenta = {
      rutUsuario: formatearRut(datos.rutUsuario),
      emailCliente: correo,
      password: hashClave(datos.password),
      rol: 'CLIENTE',
      nombre: datos.nombre.trim(),
      apellido: datos.apellido.trim(),
      telefono: null,
      fechaCreacion: new Date().toISOString()
    };
    guardarCuentas([...leerCuentas(), nueva]);
    const sesion = aSesion(nueva);
    guardarSesion(sesion);
    return { ok: true, sesion };
  },

  // Sin "rol" entra cualquier cuenta y la sesion queda con el rol de la cuenta.
  // Con "rol" se exige ese rol (por si alguna pantalla lo necesita).
  async iniciarSesion(correo: string, password: string, rol?: Rol): Promise<ResultadoAuth> {
    const cuenta = buscarCuenta(correo);
    if (!cuenta) return falla('emailCliente', 'No existe una cuenta con ese correo.', true);
    if (rol && cuenta.rol !== rol) {
      return falla('emailCliente', rol === 'ADMIN'
        ? 'Esa cuenta no es de administrador.'
        : 'Esa cuenta es de administrador: usa la pestaña Administrador.');
    }
    if (cuenta.password !== hashClave(password)) return falla('password', 'Contraseña incorrecta.');
    if (cuenta.rol === 'CLIENTE' && leerEstadosCuenta()[cuenta.emailCliente] === 'inactivo') {
      return falla('emailCliente', 'Tu cuenta está desactivada. Contáctanos para más información.');
    }
    const sesion = aSesion(cuenta);
    guardarSesion(sesion);
    return { ok: true, sesion };
  },

  async cerrarSesion(): Promise<void> {
    borrarSesion();
  },

  // Actualiza los datos del perfil (y la sesion)
  async actualizarPerfil(correo: string, cambios: CambiosPerfil): Promise<ResultadoAuth> {
    const email = normalizarCorreo(correo);
    const cuentas = leerCuentas();
    const indice = cuentas.findIndex((c) => c.emailCliente === email);
    if (indice === -1) return falla('emailCliente', 'No se encontró la cuenta.');
    const actual = cuentas[indice];

    if (cambios.rutUsuario) {
      const otra = buscarCuentaPorRut(cambios.rutUsuario);
      if (otra && otra.emailCliente !== email) return falla('rutUsuario', 'Ese RUT pertenece a otra cuenta.');
    }

    const cuenta: Cuenta = {
      ...actual,
      rutUsuario: cambios.rutUsuario ? formatearRut(cambios.rutUsuario) : actual.rutUsuario,
      nombre: cambios.nombre?.trim() || actual.nombre,
      apellido: cambios.apellido?.trim() || actual.apellido,
      telefono: cambios.telefono === undefined ? actual.telefono : (cambios.telefono?.trim() || null)
    };
    cuentas[indice] = cuenta;
    guardarCuentas(cuentas);

    const sesion = aSesion(cuenta);
    if (leerSesion()?.emailCliente === email) guardarSesion(sesion);

    // Los pedidos de la cuenta muestran el nombre y RUT actuales (los ve el panel)
    const pedidos = await PedidoService.listar();
    for (const pedido of pedidos) {
      const comprador = pedido.cliente;
      if (!comprador || comprador.email.toLowerCase() !== email) continue;
      await PedidoService.actualizar(pedido.idPedido, {
        ...pedido,
        cliente: { ...comprador, nombre: cuenta.nombre, apellido: cuenta.apellido, rut: cuenta.rutUsuario },
        rutCliente: pedido.rutCliente ? cuenta.rutUsuario : null
      });
    }
    return { ok: true, sesion };
  },

  async cambiarPassword(correo: string, actual: string, nueva: string): Promise<ResultadoAuth> {
    const email = normalizarCorreo(correo);
    const cuentas = leerCuentas();
    const indice = cuentas.findIndex((c) => c.emailCliente === email);
    if (indice === -1) return falla('emailCliente', 'No se encontró la cuenta.');
    if (cuentas[indice].password !== hashClave(actual)) return falla('password', 'La contraseña actual no es correcta.');
    if (nueva.length < CLAVE_MINIMA) return falla('password', `La nueva contraseña debe tener al menos ${CLAVE_MINIMA} caracteres.`);
    cuentas[indice] = { ...cuentas[indice], password: hashClave(nueva) };
    guardarCuentas(cuentas);
    return { ok: true, sesion: aSesion(cuentas[indice]) };
  }
};

// VITE_USAR_API=true usa ms-usuario y ms-cliente; si no, localStorage
export const AuthService: ServicioAuth = USAR_API ? AuthApiService : AuthLocalService;

export default AuthService;
