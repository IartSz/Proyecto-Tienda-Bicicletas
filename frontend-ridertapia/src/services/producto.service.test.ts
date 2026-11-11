import { beforeEach, describe, expect, it } from 'vitest';
import ProductoService, { estadoStock, precioActual } from './producto.service';
import { crearProducto } from '../test/fixtures';

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('productos', JSON.stringify([crearProducto({ idProducto: 1 })]));
});

describe('HU-37 Alerta de stock bajo (estadoStock)', () => {
  it('HU-37 CA1: bajo el mínimo configurado el estado es "bajo"', () => {
    expect(estadoStock(crearProducto({ stockDisponible: 1, stockMinimo: 3 }))).toBe('bajo');
  });

  it('HU-37 CA2: sobre el mínimo no hay alerta', () => {
    expect(estadoStock(crearProducto({ stockDisponible: 10, stockMinimo: 3 }))).toBe('ok');
    expect(estadoStock(crearProducto({ stockDisponible: 3, stockMinimo: 3 }))).toBe('ok');
  });

  it('HU-36 CA2: con stock cero (o negativo) el estado es "cero"', () => {
    expect(estadoStock(crearProducto({ stockDisponible: 0 }))).toBe('cero');
    expect(estadoStock(crearProducto({ stockDisponible: -2 }))).toBe('cero');
  });
});

describe('HU-28 / HU-29 Precio vigente', () => {
  it('HU-28 CA2: con oferta, el cliente paga el precio rebajado', () => {
    expect(precioActual(crearProducto({ precioNormal: 20000, precioOferta: 15000 }))).toBe(15000);
  });

  it('HU-28 CA1: sin oferta, paga el precio normal', () => {
    expect(precioActual(crearProducto({ precioNormal: 20000 }))).toBe(20000);
  });
});

describe('HU-34 / HU-35 Agregar y eliminar productos del inventario', () => {
  it('HU-34 CA1: un producto nuevo recibe el siguiente id y queda en la lista', async () => {
    const nuevo = await ProductoService.crear(crearProducto({ nombre: 'Guantes' }));
    expect(nuevo.idProducto).toBe(2);
    expect((await ProductoService.listar()).map((p) => p.nombre)).toContain('Guantes');
  });

  it('HU-34 CA1: actualizar cambia solo el producto indicado', async () => {
    const actualizado = await ProductoService.actualizar(1, crearProducto({ nombre: 'Casco Pro 2' }));
    expect(actualizado.nombre).toBe('Casco Pro 2');
    await expect(ProductoService.actualizar(99, crearProducto())).rejects.toThrow('Producto no encontrado.');
  });

  it('HU-35 CA1: eliminar quita el producto de la lista', async () => {
    await ProductoService.eliminar(1);
    expect(await ProductoService.listar()).toEqual([]);
  });

  it('HU-28 CA1: obtener un producto inexistente informa el error', async () => {
    await expect(ProductoService.obtener(99)).rejects.toThrow('Producto no encontrado.');
  });
});
