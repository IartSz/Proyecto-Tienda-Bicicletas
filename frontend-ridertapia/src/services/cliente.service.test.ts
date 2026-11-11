import { beforeEach, describe, expect, it, vi } from 'vitest';
import ClienteService from './cliente.service';
import AuthService, { leerEstadosCuenta } from './auth.service';
import PedidoService from './pedido.service';
import { COMPRADOR, crearPedido } from '../test/fixtures';

// MOCK: la lista de pedidos se reemplaza para controlar quien compro y cuanto.
vi.mock('./pedido.service', () => ({ default: { listar: vi.fn(), actualizar: vi.fn() } }));
const listarPedidos = vi.mocked(PedidoService.listar);

const INVITADO = { nombre: 'Ivo', apellido: 'Soto', rut: '', email: 'Ivo@Correo.cl', telefono: '+56 9 1111 2222' };

beforeEach(async () => {
  localStorage.clear();
  listarPedidos.mockReset();
  listarPedidos.mockResolvedValue([]);
});

describe('HU-5 Desactivar cuenta (panel de clientes)', () => {
  it('HU-5 CA1: desactivar marca la cuenta como inactiva y queda en el registro de acciones', async () => {
    await ClienteService.cambiarEstado('camila@correo.cl', 'Camila Rojas', false);
    expect(leerEstadosCuenta()['camila@correo.cl']).toBe('inactivo');
    expect((await ClienteService.registro())[0]).toMatchObject({ accion: 'Cuenta desactivada', nombre: 'Camila Rojas' });
  });

  it('HU-5 CA1: activar de nuevo quita la marca y también queda registrado', async () => {
    await ClienteService.cambiarEstado('camila@correo.cl', 'Camila Rojas', false);
    await ClienteService.cambiarEstado('camila@correo.cl', 'Camila Rojas', true);
    expect(leerEstadosCuenta()['camila@correo.cl']).toBeUndefined();
    expect((await ClienteService.registro())[0].accion).toBe('Cuenta activada');
  });

  it('HU-5 CA1: el registro de acciones guarda como máximo 100 entradas', async () => {
    for (let i = 0; i < 102; i++) await ClienteService.cambiarEstado(`c${i}@correo.cl`, `Cliente ${i}`, false);
    expect(await ClienteService.registro()).toHaveLength(100);
  });

  it('HU-5 CA1: un cliente desactivado aparece como inactivo en el listado', async () => {
    await AuthService.registrar({ nombre: 'Camila', apellido: 'Rojas', rutUsuario: '12.345.678-5', emailCliente: 'camila@correo.cl', password: 'secreto1' });
    await ClienteService.cambiarEstado('camila@correo.cl', 'Camila Rojas', false);
    const camila = (await ClienteService.listar()).find((c) => c.email === 'camila@correo.cl');
    expect(camila?.activo).toBe(false);
  });
});

describe('HU-5 / HU-21 Listado de clientes', () => {
  it('HU-5 CA1: una cuenta registrada aparece aunque todavía no haya comprado', async () => {
    await AuthService.registrar({ nombre: 'Camila', apellido: 'Rojas', rutUsuario: '12.345.678-5', emailCliente: 'camila@correo.cl', password: 'secreto1' });
    const [camila] = await ClienteService.listar();
    expect(camila).toMatchObject({ email: 'camila@correo.cl', tipo: 'registrado', pedidos: 0, total: 0, activo: true });
  });

  it('HU-2 CA1: quien compró como invitado aparece como "invitado" con sus totales', async () => {
    listarPedidos.mockResolvedValue([
      crearPedido({ idPedido: 1, total: 5000, cliente: INVITADO, rutCliente: null }),
      crearPedido({ idPedido: 2, total: 7000, cliente: INVITADO, rutCliente: null, fechaCreacion: '2026-04-01T12:00:00' })
    ]);
    const [ivo] = await ClienteService.listar();
    expect(ivo).toMatchObject({ email: 'ivo@correo.cl', tipo: 'invitado', pedidos: 2, total: 12000, nombre: 'Ivo Soto' });
  });

  it('HU-22 CA1: los pedidos cancelados no suman al total comprado', async () => {
    listarPedidos.mockResolvedValue([
      crearPedido({ idPedido: 1, total: 5000, cliente: INVITADO, rutCliente: null }),
      crearPedido({ idPedido: 2, total: 9000, cliente: INVITADO, rutCliente: null, estado: 'CANCELADO' })
    ]);
    const [ivo] = await ClienteService.listar();
    expect(ivo.pedidos).toBe(1);
    expect(ivo.total).toBe(5000);
  });

  it('HU-21 CA1: un pedido hecho con cuenta marca al cliente como "registrado"', async () => {
    listarPedidos.mockResolvedValue([crearPedido({ cliente: COMPRADOR, rutCliente: COMPRADOR.rut })]);
    const [cliente] = await ClienteService.listar();
    expect(cliente.tipo).toBe('registrado');
  });

  it('HU-21 CA1: el cliente con la compra más reciente aparece primero', async () => {
    listarPedidos.mockResolvedValue([
      crearPedido({ idPedido: 1, fechaCreacion: '2026-01-01T12:00:00', cliente: INVITADO, rutCliente: null }),
      crearPedido({ idPedido: 2, fechaCreacion: '2026-05-01T12:00:00', cliente: COMPRADOR })
    ]);
    expect((await ClienteService.listar()).map((c) => c.email)).toEqual(['camila@correo.cl', 'ivo@correo.cl']);
  });
});
