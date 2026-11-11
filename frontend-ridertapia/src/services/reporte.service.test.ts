import { beforeEach, describe, expect, it } from 'vitest';
import ReporteService, { masVendidos, productosDeInventario, ventasEntre, ventasPorPeriodo } from './reporte.service';
import { crearItem, crearPedido, crearProducto } from '../test/fixtures';

// Reportes del panel: en el documento de HU no hay una historia propia, por eso van como "Reportes".
const pedidos = [
  crearPedido({ idPedido: 1, fechaCreacion: '2026-03-10T12:00:00', total: 20000 }),
  crearPedido({ idPedido: 2, fechaCreacion: '2026-03-20T12:00:00', total: 30000 }),
  crearPedido({ idPedido: 3, fechaCreacion: '2026-04-05T12:00:00', total: 10000 }),
  crearPedido({ idPedido: 4, fechaCreacion: '2026-04-06T12:00:00', total: 99999, estado: 'CANCELADO' })
];

describe('Reportes: ventas por período', () => {
  it('Reportes: los pedidos cancelados y anulados no cuentan como venta', () => {
    expect(ventasEntre(pedidos, '', '').map((p) => p.idPedido)).toEqual([1, 2, 3]);
  });

  it('Reportes: el rango de fechas incluye el día inicial y el final', () => {
    expect(ventasEntre(pedidos, '2026-03-20', '2026-04-05').map((p) => p.idPedido)).toEqual([2, 3]);
  });

  it('Reportes: agrupa por mes sumando pedidos y ventas, en orden cronológico', () => {
    const filas = ventasPorPeriodo(ventasEntre(pedidos, '', ''), 'mes');
    expect(filas.map((f) => [f.label, f.pedidos, f.ventas])).toEqual([['Mar', 2, 50000], ['Abr', 1, 10000]]);
  });

  it('Reportes: agrupa por día cuando se pide ese detalle', () => {
    expect(ventasPorPeriodo(ventasEntre(pedidos, '', ''), 'dia')).toHaveLength(3);
  });

  it('Reportes: agrupa por semana (desde el lunes)', () => {
    const filas = ventasPorPeriodo([crearPedido({ fechaCreacion: '2026-03-11T12:00:00' }), crearPedido({ fechaCreacion: '2026-03-12T12:00:00' })], 'semana');
    expect(filas).toHaveLength(1);
    expect(filas[0].clave).toBe('2026-03-09');
  });
});

describe('Reportes: más vendidos e inventario', () => {
  const productos = [
    crearProducto({ idProducto: 1, nombre: 'Casco' }),
    crearProducto({ idProducto: 2, nombre: 'Guantes', categoria: { idCategoria: 2, nombre: 'Ropa', descripcion: null, activa: true, categoriaPadre: null } })
  ];
  const ventas = [
    crearPedido({ items: [crearItem({ idProducto: 1, nombre: 'Casco', cantidad: 1, precioUnitario: 50000 }), crearItem({ idProducto: 2, nombre: 'Guantes', cantidad: 4, precioUnitario: 5000 })] }),
    crearPedido({ idPedido: 2, items: [crearItem({ idProducto: 2, nombre: 'Guantes', cantidad: 1, precioUnitario: 5000 })] })
  ];

  it('Reportes: ordena por unidades vendidas', () => {
    const top = masVendidos(ventas, productos, '', 'unidades');
    expect(top.map((f) => [f.nombre, f.unidades])).toEqual([['Guantes', 5], ['Casco', 1]]);
  });

  it('Reportes: ordena por ingresos cuando se pide', () => {
    expect(masVendidos(ventas, productos, '', 'ingresos').map((f) => f.nombre)).toEqual(['Casco', 'Guantes']);
  });

  it('Reportes: filtra por categoría', () => {
    expect(masVendidos(ventas, productos, '2', 'unidades').map((f) => f.nombre)).toEqual(['Guantes']);
  });

  it('HU-37 CA1: el reporte de inventario filtra por estado de stock y oculta los productos ocultos', () => {
    const lista = [
      crearProducto({ idProducto: 1, stockDisponible: 0, sku: 'B' }),
      crearProducto({ idProducto: 2, stockDisponible: 10, sku: 'A' }),
      crearProducto({ idProducto: 3, stockDisponible: 0, estado: 'OCULTO', sku: 'C' })
    ];
    expect(productosDeInventario(lista, '', 'cero').map((p) => p.idProducto)).toEqual([1]);
    expect(productosDeInventario(lista, '', '').map((p) => p.sku)).toEqual(['A', 'B']);
  });
});

describe('Reportes: historial de exportaciones', () => {
  beforeEach(() => localStorage.clear());

  const reporte = (n: number) => ({ nombre: `R${n}`, tipo: 'Ventas', categoria: 'Todas', filas: [['a']], formato: 'excel' as const, fecha: '2026-03-01T00:00:00' });

  it('Reportes: el reporte guardado queda primero en el historial con un id nuevo', async () => {
    await ReporteService.crear(reporte(1));
    const segundo = await ReporteService.crear(reporte(2));
    expect(segundo.idReporte).toBe(2);
    expect((await ReporteService.listar()).map((r) => r.nombre)).toEqual(['R2', 'R1']);
  });

  it('Reportes: el historial guarda como máximo 30 reportes', async () => {
    for (let i = 1; i <= 32; i++) await ReporteService.crear(reporte(i));
    expect(await ReporteService.listar()).toHaveLength(30);
  });
});
