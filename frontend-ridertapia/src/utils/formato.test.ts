import { describe, expect, it } from 'vitest';
import { diaLocal, fechaCorta, fechaRelativa, formatoCLP, iniciales, slugify } from './formato';

describe('HU-28 Precios y textos en formato chileno', () => {
  it('HU-28 CA1: el precio se muestra en pesos chilenos con punto de miles', () => {
    expect(formatoCLP(15990)).toBe('$15.990');
    expect(formatoCLP(1250000)).toBe('$1.250.000');
  });

  it('HU-28 CA1: redondea los decimales', () => {
    expect(formatoCLP(1999.6)).toBe('$2.000');
  });

  it('HU-31 CA1: slugify deja un texto apto para la dirección (sin tildes ni símbolos)', () => {
    expect(slugify('Casco Fox Speedframe')).toBe('casco-fox-speedframe');
    expect(slugify('Ropa & Protección')).toBe('ropa-proteccion');
    expect(slugify('***')).toBe('item');
  });
});

describe('HU-3 / HU-21 Datos de cuenta y fechas', () => {
  it('HU-3 CA1: las iniciales del avatar salen del nombre y apellido', () => {
    expect(iniciales('camila', 'rojas')).toBe('CR');
    expect(iniciales('Ana', '')).toBe('A');
  });

  it('HU-21 CA1: diaLocal entrega la fecha como AAAA-MM-DD', () => {
    expect(diaLocal('2026-03-05T12:00:00')).toBe('2026-03-05');
    expect(diaLocal(new Date(2026, 0, 9))).toBe('2026-01-09');
  });

  it('HU-21 CA1: fechaCorta incluye día, mes, año y hora', () => {
    expect(fechaCorta('2026-03-05T15:30:00')).toMatch(/0?5[-/.]0?3[-/.]2026.*(15|0?3)[:.]30/);
  });

  it('HU-21 CA1: fechaRelativa dice "Hoy" y "Ayer" para fechas recientes', () => {
    const hoy = new Date();
    const ayer = new Date();
    ayer.setDate(hoy.getDate() - 1);
    expect(fechaRelativa(hoy.toISOString())).toMatch(/^Hoy, /);
    expect(fechaRelativa(ayer.toISOString())).toMatch(/^Ayer, /);
  });

  it('HU-21 CA1: fechaRelativa muestra día y mes para fechas antiguas', () => {
    expect(fechaRelativa('2025-03-05T12:00:00')).toMatch(/^0?5[-/.]0?3$/);
  });
});
