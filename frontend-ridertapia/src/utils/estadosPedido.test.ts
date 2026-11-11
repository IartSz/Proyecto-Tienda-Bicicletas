import { describe, expect, it } from 'vitest';
import { ESTADOS, ESTADOS_FINALES, ESTADOS_PEDIDO, esVenta, estaAbierto, estadosElegibles, pasosPedido } from './estadosPedido';
import { crearPedido } from '../test/fixtures';

describe('HU-22 / HU-23 Estados del pedido', () => {
  it('HU-22 CA2: retirado, cancelado y anulado son estados finales (ya no se pueden cambiar)', () => {
    expect(ESTADOS_FINALES).toEqual(['RETIRADO', 'CANCELADO', 'ANULADO']);
    expect(estaAbierto(crearPedido({ estado: 'PAGADO' }))).toBe(true);
    expect(estaAbierto(crearPedido({ estado: 'RETIRADO' }))).toBe(false);
  });

  it('HU-22 CA1: los pedidos cancelados y anulados no cuentan como venta', () => {
    expect(esVenta(crearPedido({ estado: 'PAGADO' }))).toBe(true);
    expect(esVenta(crearPedido({ estado: 'CANCELADO' }))).toBe(false);
    expect(esVenta(crearPedido({ estado: 'ANULADO' }))).toBe(false);
  });

  it('HU-23 CA1: todos los estados tienen etiqueta para mostrar al cliente', () => {
    for (const estado of ESTADOS) expect(ESTADOS_PEDIDO[estado].etiqueta.length).toBeGreaterThan(0);
  });

  it('HU-19 CA1: con tarjeta, el avance parte desde "Pagado"', () => {
    expect(pasosPedido(crearPedido({ medioPago: 'TARJETA' }))[0]).toBe('PAGADO');
  });

  it('HU-19 CA2: con transferencia o efectivo, el avance parte desde "Pendiente de pago"', () => {
    expect(pasosPedido(crearPedido({ medioPago: 'TRANSFERENCIA' }))[0]).toBe('PENDIENTE_PAGO');
    expect(pasosPedido(crearPedido({ medioPago: 'EFECTIVO' }))).toHaveLength(5);
  });

  it('HU-23 CA1: el admin no puede elegir el estado actual', () => {
    const opciones = estadosElegibles(crearPedido({ estado: 'EN_PREPARACION' }));
    expect(opciones).not.toContain('EN_PREPARACION');
    expect(opciones).toContain('CANCELADO');
  });

  it('HU-23 CA1: un pedido pagado con tarjeta no puede volver a "Pendiente de pago"', () => {
    expect(estadosElegibles(crearPedido({ estado: 'PAGADO', medioPago: 'TARJETA' }))).not.toContain('PENDIENTE_PAGO');
    expect(estadosElegibles(crearPedido({ estado: 'PAGADO', medioPago: 'TRANSFERENCIA' }))).toContain('PENDIENTE_PAGO');
  });
});
