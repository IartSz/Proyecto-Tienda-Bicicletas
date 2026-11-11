import { beforeEach, describe, expect, it, vi } from 'vitest';
import InventarioService from './inventario.service';
import ProductoService from './producto.service';
import MovimientoService from './movimiento.service';
import { crearProducto } from '../test/fixtures';

// MOCK: el registro de movimientos se reemplaza para comprobar que se llama, sin escribir historial real.
vi.mock('./movimiento.service', () => ({ default: { registrar: vi.fn() } }));
const registrar = vi.mocked(MovimientoService.registrar);

beforeEach(() => {
  localStorage.clear();
  registrar.mockReset();
  // Un producto con 5 unidades, guardado como "base de datos" de la prueba
  localStorage.setItem('productos', JSON.stringify([crearProducto({ idProducto: 1, stockDisponible: 5 })]));
});

describe('HU-30 / HU-36 Registrar y ajustar stock', () => {
  it('HU-30 CA1: una venta resta unidades y el nuevo stock queda guardado', async () => {
    const actualizado = await InventarioService.mover(1, 'VENTA', -2, 'Sistema', 'Pedido RT-1');
    expect(actualizado.stockDisponible).toBe(3);
    expect((await ProductoService.obtener(1)).stockDisponible).toBe(3);
  });

  it('HU-30 CA1: un ingreso suma unidades', async () => {
    const actualizado = await InventarioService.mover(1, 'INGRESO', 10, 'admin', 'Proveedor');
    expect(actualizado.stockDisponible).toBe(15);
  });

  it('HU-30 CA1: cada cambio deja un movimiento registrado (verifica el mock)', async () => {
    const actualizado = await InventarioService.mover(1, 'VENTA', -2, 'Sistema', 'Pedido RT-1');
    expect(registrar).toHaveBeenCalledTimes(1);
    expect(registrar).toHaveBeenCalledWith(actualizado, 'VENTA', -2, 'Sistema', 'Pedido RT-1');
  });

  it('HU-36 CA2: el stock nunca baja de cero', async () => {
    const actualizado = await InventarioService.mover(1, 'VENTA', -99, 'Sistema', 'exceso');
    expect(actualizado.stockDisponible).toBe(0);
  });

  it('HU-36 CA1: fijar un stock exacto registra la diferencia como ajuste', async () => {
    const actualizado = await InventarioService.fijar(1, 8, 'admin', 'Conteo físico');
    expect(actualizado.stockDisponible).toBe(8);
    expect(registrar).toHaveBeenCalledWith(actualizado, 'AJUSTE', 3, 'admin', 'Conteo físico');
  });

  it('HU-36 CA1: fijar el mismo stock no hace nada ni registra movimiento', async () => {
    await InventarioService.fijar(1, 5, 'admin', 'sin cambios');
    expect(registrar).not.toHaveBeenCalled();
  });

  it('HU-30 CA1: mover stock de un producto inexistente informa el error', async () => {
    await expect(InventarioService.mover(99, 'VENTA', -1, 'Sistema', 'x')).rejects.toThrow('Producto no encontrado.');
    expect(registrar).not.toHaveBeenCalled();
  });
});
