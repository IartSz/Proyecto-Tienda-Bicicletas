import { beforeEach, describe, expect, it, vi } from 'vitest';
import { crearItem, crearProducto } from '../test/fixtures';
import { armarPedido } from '../services/pedido.service';
import PedidoApiService from './pedido.api';
import { estadoPagoPara } from './pago.api';

// MOCK 1: el cliente HTTP. No hay backend: cada "post" devuelve lo que devolveria el servidor.
const { post } = vi.hoisted(() => ({ post: vi.fn() }));
vi.mock('./cliente', () => ({ default: { post, get: vi.fn(), put: vi.fn(), delete: vi.fn() }, USAR_API: true }));

// MOCK 2: el inventario (descuenta stock y anota el movimiento)
const { mover } = vi.hoisted(() => ({ mover: vi.fn() }));
vi.mock('../services/inventario.service', () => ({ default: { mover } }));

// MOCK 3: el carrito guardado en el backend
const { cerrarCarrito } = vi.hoisted(() => ({ cerrarCarrito: vi.fn() }));
vi.mock('./carrito.api', () => ({ cerrarCarrito }));

const COMPRADOR = { nombre: 'Camila', apellido: 'Rojas', rut: '12.345.678-5', email: 'camila@correo.cl', telefono: '+56911111111' };
const ITEMS = [crearItem({ idProducto: 1, idVariante: 10, cantidad: 2, precioUnitario: 10000 })];

const llamadasA = (ruta: string) => (post.mock.calls as [string, Record<string, unknown>][]).filter(([url]) => url === ruta);

beforeEach(() => {
  post.mockReset();
  mover.mockReset();
  cerrarCarrito.mockReset();
  post.mockImplementation(async (url: string) => {
    if (url === '/visitantes') return { data: { idDatosVisitante: 7 } };
    if (url === '/pedidos') return { data: { idPedido: 42 } };
    return { data: {} };
  });
  mover.mockResolvedValue(crearProducto({ idProducto: 1 }));
});

describe('PedidoApiService.crear (modo backend)', () => {
  it('compra con cuenta: envía el RUT en formato del backend y no crea visitante', async () => {
    await PedidoApiService.crear(armarPedido(ITEMS, COMPRADOR, 'TARJETA', COMPRADOR.rut));

    expect(llamadasA('/visitantes')).toHaveLength(0);
    const cuerpo = llamadasA('/pedidos')[0][1];
    expect(cuerpo.rutCliente).toBe('12345678-5');
    expect(cuerpo.datosVisitante).toBeNull();
  });

  it('compra como invitado: registra al visitante y no envía RUT', async () => {
    await PedidoApiService.crear(armarPedido(ITEMS, COMPRADOR, 'EFECTIVO'));

    expect(llamadasA('/visitantes')[0][1]).toEqual({ nombre: 'Camila Rojas', correo: 'camila@correo.cl', telefono: '+56911111111' });
    const cuerpo = llamadasA('/pedidos')[0][1];
    expect(cuerpo.rutCliente).toBeNull();
    expect(cuerpo.datosVisitante).toEqual({ idDatosVisitante: 7 });
  });

  it('guarda un detalle por producto con su subtotal', async () => {
    await PedidoApiService.crear(armarPedido(ITEMS, COMPRADOR, 'TARJETA'));
    const detalle = llamadasA('/detalles')[0][1];
    expect(detalle).toMatchObject({ idVariante: 10, cantidad: 2, precioUnitario: 10000, subtotal: 20000, pedido: { idPedido: 42 } });
  });

  it('registra el primer estado en el historial con su nota', async () => {
    await PedidoApiService.crear(armarPedido(ITEMS, COMPRADOR, 'TARJETA'));
    expect(llamadasA('/historial-estados')[0][1]).toMatchObject({ estadoNuevo: 'PAGADO', nota: 'Pedido recibido.', pedido: { idPedido: 42 } });
  });

  it('tarjeta: registra el pago aprobado en ms-pagos con los 4 últimos dígitos', async () => {
    await PedidoApiService.crear({ ...armarPedido(ITEMS, COMPRADOR, 'TARJETA'), ultimosDigitosTarjeta: '1111' });
    expect(llamadasA('/pagos-webpay')[0][1]).toMatchObject({ idPedido: 42, monto: 20000, estado: 'APROBADO', ultimosDigitosTarjeta: '1111' });
  });

  it('transferencia y efectivo: el pago queda pendiente en su tabla', async () => {
    await PedidoApiService.crear(armarPedido(ITEMS, COMPRADOR, 'TRANSFERENCIA'));
    await PedidoApiService.crear(armarPedido(ITEMS, COMPRADOR, 'EFECTIVO'));
    expect(llamadasA('/pagos-transferencia')[0][1]).toMatchObject({ idPedido: 42, estado: 'PENDIENTE' });
    expect(llamadasA('/pagos-transferencia')[0][1].fechaLimite).toBeTruthy();
    expect(llamadasA('/pagos-presenciales')[0][1]).toMatchObject({ idPedido: 42, estado: 'PENDIENTE', medioPago: 'EFECTIVO' });
  });

  it('descuenta el stock con un movimiento de venta y cierra el carrito', async () => {
    await PedidoApiService.crear(armarPedido(ITEMS, COMPRADOR, 'TARJETA'));
    expect(mover).toHaveBeenCalledWith(1, 'VENTA', -2, 'Sistema', expect.stringContaining('Pedido RT-'));
    expect(cerrarCarrito).toHaveBeenCalled();
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

describe('Estado del pago según el pedido', () => {
  it('al marcar el pedido pagado, el pago pendiente queda aprobado', () => {
    expect(estadoPagoPara('PENDIENTE', 'PAGADO')).toBe('APROBADO');
  });

  it('al cancelar: lo aprobado se reembolsa y lo pendiente se rechaza', () => {
    expect(estadoPagoPara('APROBADO', 'CANCELADO')).toBe('REEMBOLSADO');
    expect(estadoPagoPara('PENDIENTE', 'ANULADO')).toBe('RECHAZADO');
  });

  it('otros cambios no tocan el pago', () => {
    expect(estadoPagoPara('APROBADO', 'EN_PREPARACION')).toBeNull();
  });
});
