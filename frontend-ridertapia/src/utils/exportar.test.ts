import { afterEach, describe, expect, it, vi } from 'vitest';
import { aCSV, abrirImprimible, descargarArchivo, nombreArchivo } from './exportar';
import type { Reporte } from '../models/Reporte';

const reporte = (cambios: Partial<Reporte> = {}): Reporte => ({
  nombre: 'Ventas por mes',
  tipo: 'Ventas',
  categoria: 'Todas',
  filas: [['Período', 'Pedidos', 'Ventas'], ['Marzo', 2, 50000]],
  ...cambios
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Reportes: exportar a Excel (CSV)', () => {
  it('Reportes: el CSV usa ; como separador y comillas en cada celda', () => {
    expect(aCSV([['Producto', 'Unidades'], ['Casco', 3]])).toBe('"Producto";"Unidades"\r\n"Casco";"3"');
  });

  it('Reportes: las comillas dentro de una celda se duplican para no romper el archivo', () => {
    expect(aCSV([['Casco "Pro"']])).toBe('"Casco ""Pro"""');
  });

  it('Reportes: el nombre del archivo no lleva símbolos ni espacios', () => {
    expect(nombreArchivo('Ventas por mes 2026-03-01 a 2026-04-01')).toBe('Ventas_por_mes_2026-03-01_a_2026-04-01');
    expect(nombreArchivo('Más vendidos: top/10')).toBe('Más_vendidos_top10');
  });

  it('Reportes: descargarArchivo crea un archivo CSV y simula el clic de descarga', () => {
    const crear = vi.fn(() => 'blob:prueba');
    URL.createObjectURL = crear;
    URL.revokeObjectURL = vi.fn();
    const clic = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);

    descargarArchivo('reporte.csv', 'a;b');

    expect(crear).toHaveBeenCalledTimes(1);
    const blob = (crear.mock.calls[0] as unknown[])[0] as Blob;
    expect(blob.type).toBe('text/csv;charset=utf-8');
    expect(clic).toHaveBeenCalledTimes(1);
  });
});

describe('Reportes: exportar a PDF (ventana imprimible)', () => {
  it('Reportes: abre una ventana con el reporte y los montos en pesos', () => {
    const escribir = vi.fn();
    vi.spyOn(window, 'open').mockReturnValue({ document: { write: escribir, close: vi.fn() } } as unknown as Window);

    expect(abrirImprimible(reporte())).toBe(true);

    const html = String((escribir.mock.calls[0] as unknown[])[0]);
    expect(html).toContain('Ventas por mes');
    expect(html).toContain('$50.000');
    expect(html).toContain('<td>2</td>'); // los números chicos no se formatean como dinero
  });

  it('Reportes: el texto escrito por el usuario no inyecta HTML en la ventana', () => {
    const escribir = vi.fn();
    vi.spyOn(window, 'open').mockReturnValue({ document: { write: escribir, close: vi.fn() } } as unknown as Window);

    abrirImprimible(reporte({ nombre: '<b>Informe</b>' }));

    const html = String((escribir.mock.calls[0] as unknown[])[0]);
    expect(html).toContain('&lt;b&gt;Informe&lt;/b&gt;');
    expect(html).not.toContain('<b>Informe</b>');
  });

  it('Reportes: si el navegador bloquea la ventana emergente, informa que no se pudo abrir', () => {
    vi.spyOn(window, 'open').mockReturnValue(null);
    expect(abrirImprimible(reporte())).toBe(false);
  });
});
