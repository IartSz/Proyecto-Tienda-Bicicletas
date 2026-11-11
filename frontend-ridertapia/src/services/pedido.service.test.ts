import { beforeEach, describe, expect, it, vi } from 'vitest';
import PedidoService, { armarPedido, EVENTO_PEDIDOS, estadoInicial, pedidosDeCorreo } from './pedido.service';
import InventarioService from './inventario.service';
import { COMPRADOR, crearItem, crearPedido, crearProducto } from '../test/fixtures';

// MOCK: el inventario se reemplaza por una funcion falsa. Asi estos tests prueban
// solo la logica de pedidos y se puede comprobar "se descontó el stock" sin tocar productos reales.
vi.mock('./inventario.service', () => ({ default: { mover: vi.fn() } }));
const mover = vi.mocked(InventarioService.mover);

const itemsDePrueba = () => [crearItem({ idProducto: 1, cantidad: 2, precioUnitario: 10000 })];

beforeEach(() => {
  localStorage.clear();
  mover.mockReset();
  mover.mockResolvedValue(crearProducto());
});

describe('HU-17 / HU-18 Crear y confirmar pedido (armarPedido)', () => {
  it('HU-18 CA1: el pedido sale con los totales del carrito y un número RT-', () => {
    const pedido = armarPedido(itemsDePrueba(), COMPRADOR, 'TARJETA');
    expect(pedido.subtotal).toBe(20000);
    expect(pedido.total).toBe(20000);
    expect(pedido.numero).toMatch(/^RT-\d{6}$/);
    expect(pedido.canal).toBe('WEB');
  });

  it('HU-19 CA1: pagar con tarjeta deja el pedido PAGADO', () => {
    expect(estadoInicial('TARJETA')).toBe('PAGADO');
    expect(armarPedido(itemsDePrueba(), COMPRADOR, 'TARJETA').estado).toBe('PAGADO');
  });

  it('HU-19 CA2: transferencia y efectivo quedan pendientes de pago', () => {
    expect(armarPedido(itemsDePrueba(), COMPRADOR, 'TRANSFERENCIA').estado).toBe('PENDIENTE_PAGO');
    expect(armarPedido(itemsDePrueba(), COMPRADOR, 'EFECTIVO').estado).toBe('PENDIENTE_PAGO');
  });

  it('HU-2 CA1: sin cuenta, el pedido guarda los datos de visitante y no tiene RUT de cliente', () => {
    const pedido = armarPedido(itemsDePrueba(), COMPRADOR, 'TARJETA');
    expect(pedido.rutCliente).toBeNull();
    expect(pedido.datosVisitante).toEqual({ nombre: 'Camila Rojas', correo: 'camila@correo.cl', telefono: '+56 9 1234 5678' });
  });

  it('HU-17 CA1: con cuenta, el pedido queda ligado al RUT y no usa datos de visitante', () => {
    const pedido = armarPedido(itemsDePrueba(), COMPRADOR, 'TARJETA', COMPRADOR.rut);
    expect(pedido.rutCliente).toBe('12.345.678-5');
    expect(pedido.datosVisitante).toBeNull();
  });

  it('HU-23 CA2: el historial parte con un registro "Pedido recibido."', () => {
    const { historial, estado } = armarPedido(itemsDePrueba(), COMPRADOR, 'TARJETA');
    expect(historial).toHaveLength(1);
    expect(historial?.[0]).toMatchObject({ estado, nota: 'Pedido recibido.' });
  });
});

describe('HU-17 Crear pedido (PedidoService.crear)', () => {
  it('HU-17 CA1: guarda el pedido con un id nuevo y lo deja disponible en la lista', async () => {
    const primero = await PedidoService.crear(armarPedido(itemsDePrueba(), COMPRADOR, 'TARJETA'));
    const segundo = await PedidoService.crear(armarPedido(itemsDePrueba(), COMPRADOR, 'TARJETA'));
    expect([primero.idPedido, segundo.idPedido]).toEqual([1, 2]);
    expect(await PedidoService.listar()).toHaveLength(2);
  });

  it('HU-17 CA1: descuenta del stock cada producto comprado (verifica el mock)', async () => {
    const items = [crearItem({ idProducto: 1, cantidad: 2 }), crearItem({ idProducto: 2, cantidad: 1 })];
    const pedido = await PedidoService.crear(armarPedido(items, COMPRADOR, 'TARJETA'));
    expect(mover).toHaveBeenCalledTimes(2);
    expect(mover).toHaveBeenCalledWith(1, 'VENTA', -2, 'Sistema', `Pedido ${pedido.numero}`);
    expect(mover).toHaveBeenCalledWith(2, 'VENTA', -1, 'Sistema', `Pedido ${pedido.numero}`);
  });

  it('HU-17 CA1: avisa a la pantalla con el evento "pedidos-actualizados"', async () => {
    const espia = vi.spyOn(window, 'dispatchEvent');
    await PedidoService.crear(armarPedido(itemsDePrueba(), COMPRADOR, 'TARJETA'));
    expect(espia).toHaveBeenCalledWith(expect.objectContaining({ type: EVENTO_PEDIDOS }));
    espia.mockRestore();
  });

  it('HU-21 CA1: obtener devuelve el pedido; uno inexistente informa el error', async () => {
    const creado = await PedidoService.crear(armarPedido(itemsDePrueba(), COMPRADOR, 'TARJETA'));
    expect((await PedidoService.obtener(creado.idPedido)).numero).toBe(creado.numero);
    await expect(PedidoService.obtener(999)).rejects.toThrow('Pedido no encontrado.');
  });
});

describe('HU-22 / HU-23 Cambiar estado, cancelar y trazabilidad', () => {
  const crearPagado = async () => {
    const pedido = await PedidoService.crear(armarPedido(itemsDePrueba(), COMPRADOR, 'TARJETA'));
    mover.mockClear(); // se ignora el descuento del momento de la compra
    return pedido;
  };

  it('HU-23 CA1: cambia el estado y marca la novedad para el cliente', async () => {
    const pedido = await crearPagado();
    const nuevo = await PedidoService.cambiarEstado(pedido.idPedido, 'EN_PREPARACION', '');
    expect(nuevo.estado).toBe('EN_PREPARACION');
    expect(nuevo.novedad).toBe(true);
  });

  it('HU-23 CA2: cada cambio queda en el historial con su nota', async () => {
    const pedido = await crearPagado();
    const nuevo = await PedidoService.cambiarEstado(pedido.idPedido, 'EN_PREPARACION', 'Armando el pedido');
    expect(nuevo.historial).toHaveLength(2);
    expect(nuevo.historial?.[1]).toMatchObject({ estado: 'EN_PREPARACION', nota: 'Armando el pedido' });
  });

  it('HU-22 CA1: cancelar devuelve las unidades al stock (verifica el mock)', async () => {
    const pedido = await crearPagado();
    const nuevo = await PedidoService.cambiarEstado(pedido.idPedido, 'CANCELADO', 'El cliente lo pidió');
    expect(nuevo.estado).toBe('CANCELADO');
    expect(mover).toHaveBeenCalledWith(1, 'AJUSTE', 2, 'admin', `Cancelación pedido ${pedido.numero}`);
  });

  it('HU-22 CA2: un pedido ya retirado no se puede cancelar y el stock no cambia', async () => {
    const pedido = await crearPagado();
    await PedidoService.cambiarEstado(pedido.idPedido, 'RETIRADO', '');
    await expect(PedidoService.cambiarEstado(pedido.idPedido, 'CANCELADO', 'tarde'))
      .rejects.toThrow('El pedido ya está retirado y no se puede cambiar.');
    expect(mover).not.toHaveBeenCalled();
  });

  it('HU-22 CA1: anular exige un motivo y lo deja guardado', async () => {
    const pedido = await crearPagado();
    await expect(PedidoService.cambiarEstado(pedido.idPedido, 'ANULADO', '  ')).rejects.toThrow('Indica el motivo de la anulación.');
    const nuevo = await PedidoService.cambiarEstado(pedido.idPedido, 'ANULADO', 'Pago duplicado');
    expect(nuevo.motivoAnulacion).toBe('Pago duplicado');
  });

  it('HU-23 CA1: no permite "cambiar" al mismo estado sin una nota', async () => {
    const pedido = await crearPagado();
    await expect(PedidoService.cambiarEstado(pedido.idPedido, 'PAGADO', '')).rejects.toThrow('El pedido ya está en ese estado.');
  });

  it('HU-22 CA1: cancelar un pedido de ejemplo (demo) no devuelve stock porque nunca lo descontó', async () => {
    await PedidoService.agregarVarios([{ ...armarPedido(itemsDePrueba(), COMPRADOR, 'TARJETA'), demo: true }]);
    const [demo] = await PedidoService.listar();
    await PedidoService.cambiarEstado(demo.idPedido, 'CANCELADO', 'prueba');
    expect(mover).not.toHaveBeenCalled();
  });

  it('HU-23 CA1: cambiar el estado de un pedido que no existe informa el error', async () => {
    await expect(PedidoService.cambiarEstado(999, 'PAGADO', 'x')).rejects.toThrow('Pedido no encontrado.');
  });
});

describe('HU-21 Consultar historial de pedidos (pedidosDeCorreo)', () => {
  const pedidos = [
    crearPedido({ idPedido: 1, fechaCreacion: '2026-03-01T10:00:00', cliente: { ...COMPRADOR, email: 'Camila@Correo.cl' } }),
    crearPedido({ idPedido: 2, fechaCreacion: '2026-04-01T10:00:00' }),
    crearPedido({ idPedido: 3, fechaCreacion: '2026-02-01T10:00:00', cliente: undefined, rutCliente: null, datosVisitante: { nombre: 'Camila', correo: 'camila@correo.cl', telefono: null } }),
    crearPedido({ idPedido: 4, cliente: { ...COMPRADOR, email: 'otra@correo.cl' } })
  ];

  it('HU-21 CA1: muestra solo los pedidos del cliente, del más reciente al más antiguo', () => {
    expect(pedidosDeCorreo(pedidos, 'camila@correo.cl').map((p) => p.idPedido)).toEqual([2, 1, 3]);
  });

  it('HU-21 CA1: ignora mayúsculas y espacios en el correo', () => {
    expect(pedidosDeCorreo(pedidos, '  CAMILA@correo.cl ')).toHaveLength(3);
  });

  it('HU-21 CA3: sin pedidos registrados devuelve una lista vacía', () => {
    expect(pedidosDeCorreo(pedidos, 'nuevo@correo.cl')).toEqual([]);
  });
});

describe('HU-23 / panel: actualizar y eliminar pedidos', () => {
  it('HU-23 CA1: actualizar reemplaza los datos del pedido y conserva su id', async () => {
    const creado = await PedidoService.crear(armarPedido(itemsDePrueba(), COMPRADOR, 'TARJETA'));
    const nuevo = await PedidoService.actualizar(creado.idPedido, { ...creado, estado: 'EN_PREPARACION' });
    expect(nuevo.idPedido).toBe(creado.idPedido);
    expect((await PedidoService.obtener(creado.idPedido)).estado).toBe('EN_PREPARACION');
  });

  it('HU-23 CA1: actualizar un pedido que no existe informa el error', async () => {
    await expect(PedidoService.actualizar(99, armarPedido(itemsDePrueba(), COMPRADOR, 'TARJETA'))).rejects.toThrow('Pedido no encontrado.');
  });

  it('Pedidos (sin HU): eliminar quita solo el pedido indicado', async () => {
    await PedidoService.crear(armarPedido(itemsDePrueba(), COMPRADOR, 'TARJETA'));
    await PedidoService.crear(armarPedido(itemsDePrueba(), COMPRADOR, 'TARJETA'));
    await PedidoService.eliminar(1);
    expect((await PedidoService.listar()).map((p) => p.idPedido)).toEqual([2]);
  });
});

describe('Pedidos de ejemplo (ventas demo)', () => {
  it('Pedidos (sin HU): agregarVarios numera los pedidos y no toca el stock (verifica el mock)', async () => {
    await PedidoService.agregarVarios([
      { ...armarPedido(itemsDePrueba(), COMPRADOR, 'TARJETA'), demo: true },
      { ...armarPedido(itemsDePrueba(), COMPRADOR, 'TARJETA'), demo: true }
    ]);
    expect((await PedidoService.listar()).map((p) => p.idPedido)).toEqual([1, 2]);
    expect(mover).not.toHaveBeenCalled();
  });

  it('Pedidos (sin HU): eliminarDemo borra los pedidos de ejemplo y deja los reales', async () => {
    await PedidoService.crear(armarPedido(itemsDePrueba(), COMPRADOR, 'TARJETA'));
    await PedidoService.agregarVarios([{ ...armarPedido(itemsDePrueba(), COMPRADOR, 'TARJETA'), demo: true }]);
    await PedidoService.eliminarDemo();
    const restantes = await PedidoService.listar();
    expect(restantes).toHaveLength(1);
    expect(restantes[0].demo).toBeUndefined();
  });

  it('HU-21 CA3: con datos dañados en el almacenamiento, la lista de pedidos queda vacía en vez de fallar', async () => {
    localStorage.setItem('pedidos', '{dañado');
    expect(await PedidoService.listar()).toEqual([]);
  });
});
