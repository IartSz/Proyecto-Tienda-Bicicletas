import { beforeEach, describe, expect, it } from 'vitest';
import MovimientoService from './movimiento.service';
import { crearProducto } from '../test/fixtures';

const datos = (n: number) => ({
  fecha: '2026-03-01T00:00:00', idProducto: 1, nombre: 'Casco', tipo: 'INGRESO' as const,
  cantidad: n, stockResultante: n, usuario: 'admin', detalle: `mov ${n}`
});

beforeEach(() => localStorage.clear());

describe('HU-30 / HU-36 Movimientos de inventario', () => {
  it('HU-30 CA1: registrar anota el producto, la cantidad y el stock que quedó', async () => {
    const producto = crearProducto({ idProducto: 4, nombre: 'Guantes', stockDisponible: 7 });
    const mov = await MovimientoService.registrar(producto, 'VENTA', -3, 'Sistema', 'Pedido RT-9');
    expect(mov).toMatchObject({ idMovimiento: 1, idProducto: 4, nombre: 'Guantes', tipo: 'VENTA', cantidad: -3, stockResultante: 7, usuario: 'Sistema' });
  });

  it('HU-36 CA1: el listado muestra primero el movimiento más reciente', async () => {
    await MovimientoService.crear(datos(1));
    await MovimientoService.crear(datos(2));
    expect((await MovimientoService.listar()).map((m) => m.cantidad)).toEqual([2, 1]);
  });

  it('HU-36 CA1: guarda como máximo 500 movimientos (descarta los más antiguos)', async () => {
    for (let i = 1; i <= 502; i++) await MovimientoService.crear(datos(i));
    const lista = await MovimientoService.listar();
    expect(lista).toHaveLength(500);
    expect(lista[0].cantidad).toBe(502);
  });

  it('HU-36 CA1: con datos dañados en el almacenamiento, el listado queda vacío en vez de fallar', async () => {
    localStorage.setItem('movimientos', '{dañado');
    expect(await MovimientoService.listar()).toEqual([]);
  });
});
