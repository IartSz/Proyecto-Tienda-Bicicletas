import PedidoService from './pedido.service';
import AuthService, { guardarEstadosCuenta, leerEstadosCuenta } from './auth.service';
import { esVenta } from '../utils/estadosPedido';
import { USAR_API } from '../api/cliente';
import { cambiarEstadoCuenta, cambiosDeEstado } from '../api/auth.api';
import { formatearRut } from '../utils/validaciones';

// Modo local: estados y registro en localStorage. Con backend: ms-usuario
const CLAVE_REGISTRO = 'clientesLog';
const MAXIMO_REGISTRO = 100;

export interface ClienteResumen {
  email: string;
  nombre: string;
  rut: string;
  telefono: string;
  pedidos: number;
  total: number;
  tipo: 'registrado' | 'invitado';
  ultima: string; // fecha del ultimo pedido o del registro
  activo: boolean;
}

export interface AccionCliente {
  accion: string;
  nombre: string;
  fecha: string;
}

const leerRegistro = (): AccionCliente[] => {
  try {
    const guardado = localStorage.getItem(CLAVE_REGISTRO);
    return guardado ? (JSON.parse(guardado) as AccionCliente[]) : [];
  } catch {
    return [];
  }
};

export const ClienteService = {
  // Cuentas registradas e invitados que compraron, con sus totales
  async listar(): Promise<ClienteResumen[]> {
    const estados = leerEstadosCuenta();
    const mapa = new Map<string, ClienteResumen>();
    const inactivas = new Set<string>();

    const pedidos = (await PedidoService.listar()).filter(esVenta);
    for (const p of pedidos) {
      const comprador = p.cliente;
      if (!comprador?.email) continue;
      const email = comprador.email.toLowerCase();
      const c: ClienteResumen = mapa.get(email) ?? { email, nombre: '', rut: '', telefono: '', pedidos: 0, total: 0, tipo: 'invitado', ultima: '', activo: true };
      c.nombre = `${comprador.nombre} ${comprador.apellido}`;
      if (comprador.rut) c.rut = comprador.rut;
      c.telefono = comprador.telefono;
      c.pedidos++;
      c.total += p.total;
      if (p.rutCliente) c.tipo = 'registrado';
      if (p.fechaCreacion > c.ultima) c.ultima = p.fechaCreacion;
      mapa.set(email, c);
    }

    // Cuentas registradas (aunque aun no hayan comprado); su nombre actual manda
    for (const cuenta of (await AuthService.listar()).filter((s) => s.rol === 'CLIENTE')) {
      const c: ClienteResumen = mapa.get(cuenta.emailCliente) ?? { email: cuenta.emailCliente, nombre: '', rut: '', telefono: '', pedidos: 0, total: 0, tipo: 'registrado', ultima: cuenta.fechaCreacion ?? '', activo: true };
      c.nombre = `${cuenta.nombre} ${cuenta.apellido}`;
      c.rut = cuenta.rutUsuario;
      if (cuenta.telefono) c.telefono = cuenta.telefono;
      c.tipo = 'registrado';
      mapa.set(cuenta.emailCliente, c);
      if (cuenta.activo === false) inactivas.add(cuenta.emailCliente);
    }

    return [...mapa.values()]
      .map((c) => ({ ...c, activo: USAR_API ? !inactivas.has(c.email) : estados[c.email] !== 'inactivo' }))
      .sort((a, b) => b.ultima.localeCompare(a.ultima));
  },

  // Un cliente desactivado no puede iniciar sesion ni comprar con ese correo
  async cambiarEstado(email: string, nombre: string, activar: boolean, rut = ''): Promise<void> {
    // En el backend el estado es de la cuenta y el cambio queda registrado alli
    if (USAR_API) {
      if (!rut) throw new Error('Solo las cuentas registradas se pueden desactivar.');
      await cambiarEstadoCuenta(rut, activar);
      return;
    }
    const estados = leerEstadosCuenta();
    if (activar) delete estados[email];
    else estados[email] = 'inactivo';
    guardarEstadosCuenta(estados);

    const registro = [{ accion: activar ? 'Cuenta activada' : 'Cuenta desactivada', nombre, fecha: new Date().toISOString() }, ...leerRegistro()];
    try {
      localStorage.setItem(CLAVE_REGISTRO, JSON.stringify(registro.slice(0, MAXIMO_REGISTRO)));
    } catch {
      throw new Error('No se pudo guardar el registro de acciones.');
    }
  },

  async registro(): Promise<AccionCliente[]> {
    if (!USAR_API) return leerRegistro();
    const [cambios, cuentas] = await Promise.all([cambiosDeEstado(), AuthService.listar()]);
    return cambios.map((c) => {
      const cuenta = cuentas.find((x) => x.rutUsuario === formatearRut(c.rutUsuario));
      return {
        accion: c.activo ? 'Cuenta activada' : 'Cuenta desactivada',
        nombre: cuenta ? `${cuenta.nombre} ${cuenta.apellido}`.trim() || cuenta.emailCliente : formatearRut(c.rutUsuario),
        fecha: c.fecha
      };
    });
  }
};

export default ClienteService;
