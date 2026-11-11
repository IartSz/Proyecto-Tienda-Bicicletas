import { beforeEach, describe, expect, it, vi } from 'vitest';
import { crearItem, crearProducto } from '../test/fixtures';
import { armarPedido } from '../services/pedido.service';
import PedidoApiService from './pedido.api';

// MOCK 1: el cliente HTTP. No hay backend: cada "post" devuelve lo que devolveria el servidor.
const { post } = vi.hoisted(() => ({ post: vi.fn() }));
vi.mock('./cliente', () => ({ default: { post, get: vi.fn(), put: vi.fn(), delete: vi.fn() }, USAR_API: true }));

// MOCK 2: el servicio de productos (el stock se descuenta con el)
const { obtener, actualizar } = vi.hoisted(() => ({ obtener: vi.fn(), actualizar: vi.fn() }));
vi.mock('../services/producto.service', () => ({ default: { obtener, actualizar, listar: vi.fn() } }));

const COMPRADOR = { nombre: 'Camila', apellido: 'Rojas', rut: '12.345.678-9', email: 'camila@correo.cl', telefono: '+56911111111' };
const ITEMS = [crearItem({ idProducto: 1, idVariante: 10, cantidad: 2, precioUnitario: 10000 })];

const llamadasA = (ruta: string) => (post.mock.calls as [string, Record<string, unknown>][]).filter(([url]) => url === ruta);

beforeEach(() => {
  post.mockReset();
  obtener.mockReset();
  actualizar.mockReset();
  post.mockImplementation(async (url: string) => {
    if (url === '/visitantes') return { data: { idDatosVisitante: 7 } };
    if (url === '/pedidos') return { data: { idPedido: 42 } };
    return { data: {} };
  });
  obtener.mockResolvedValue(crearProducto({ idProducto: 1, stockDisponible: 5 }));
  actualizar.mockResolvedValue(undefined);
});

describe('PedidoApiService.crear (modo backend)', () => {
  it('compra con cuenta: no envía el RUT (ms-cliente no conoce las cuentas) y registra al comprador como visitante', async () => {
    await PedidoApiService.crear(armarPedido(ITEMS, COMPRADOR, 'TARJETA', COMPRADOR.rut));

    expect(llamadasA('/visitantes')[0][1]).toEqual({ nombre: 'Camila Rojas', correo: 'camila@correo.cl', telefono: '+56911111111' });
    const cuerpo = llamadasA('/pedidos')[0][1];
    expect(cuerpo.rutCliente).toBeNull();
    expect(cuerpo.datosVisitante).toEqual({ idDatosVisitante: 7 });
  });

  it('compra como invitado: registra al visitante igual', async () => {
    await PedidoApiService.crear(armarPedido(ITEMS, COMPRADOR, 'EFECTIVO'));
    expect(llamadasA('/visitantes')).toHaveLength(1);
    expect(llamadasA('/pedidos')[0][1].rutCliente).toBeNull();
  });

  it('guarda un detalle por producto con su subtotal', async () => {
    await PedidoApiService.crear(armarPedido(ITEMS, COMPRADOR, 'TARJETA'));
    const detalle = llamadasA('/detalles')[0][1];
    expect(detalle).toMatchObject({ idVariante: 10, cantidad: 2, precioUnitario: 10000, subtotal: 20000, pedido: { idPedido: 42 } });
  });

  it('registra el primer estado en el historial', async () => {
    await PedidoApiService.crear(armarPedido(ITEMS, COMPRADOR, 'TARJETA'));
    expect(llamadasA('/historial-estados')[0][1]).toMatchObject({ estadoNuevo: 'PAGADO', pedido: { idPedido: 42 } });
  });

  it('descuenta el stock de cada producto', async () => {
    await PedidoApiService.crear(armarPedido(ITEMS, COMPRADOR, 'TARJETA'));
    expect(actualizar).toHaveBeenCalledWith(1, expect.objectContaining({ stockDisponible: 3 }));
  });

  it('rechaza el carrito con productos sin variante y no llama al backend', async () => {
    const sinVariante = [crearItem({ idProducto: 1, cantidad: 1 })];
    await expect(PedidoApiService.crear(armarPedido(sinVariante, COMPRADOR, 'TARJETA'))).rejects.toThrow('sin variante');
    expect(post).not.toHaveBeenCalled();
  });

  it('devuelve el pedido con el id que asignó el backend', async () => {
    const pedido = await PedidoApiService.crear(armarPedido(ITEMS, COMPRADOR, 'TARJETA'));
    expect(pedido.idPedido).toBe(42);
  });
});
