import type { CeldaReporte, Reporte } from '../models/Reporte';
import { formatoCLP } from './formato';

// Evita que texto escrito por el usuario rompa el HTML
const ENTIDADES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

const escapar = (texto: string | number): string =>
  String(texto).replace(/[&<>"']/g, (c) => ENTIDADES[c] ?? c);

// Filas a texto CSV (separador ; para Excel en espanol)
export const aCSV = (filas: CeldaReporte[][]): string =>
  filas.map((fila) => fila.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(';')).join('\r\n');

export const descargarArchivo = (nombre: string, contenido: string): void => {
  const blob = new Blob(['﻿' + contenido], { type: 'text/csv;charset=utf-8' });
  const enlace = document.createElement('a');
  enlace.href = URL.createObjectURL(blob);
  enlace.download = nombre;
  document.body.appendChild(enlace);
  enlace.click();
  window.setTimeout(() => {
    URL.revokeObjectURL(enlace.href);
    enlace.remove();
  }, 500);
};

export const nombreArchivo = (nombre: string): string =>
  nombre.replace(/[^\w\-áéíóúñ ]/gi, '').replace(/\s+/g, '_');

const htmlImprimible = (reporte: Reporte): string => {
  const [cabecera, ...cuerpo] = reporte.filas;
  const celda = (c: CeldaReporte): string => escapar(typeof c === 'number' && c > 999 ? formatoCLP(c) : c);
  return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>${escapar(reporte.nombre)}</title>
<style>body{font-family:Arial,sans-serif;padding:24px;color:#222}h1{font-size:20px;margin:0}p{color:#666;font-size:12px}
table{border-collapse:collapse;width:100%;font-size:12px;margin-top:12px}th,td{border:1px solid #ccc;padding:6px 8px;text-align:left}th{background:#eee}</style></head>
<body><h1>Rider Tapia · ${escapar(reporte.nombre)}</h1><p>${escapar(reporte.tipo)} · Categoría: ${escapar(reporte.categoria)} · Generado ${new Date().toLocaleString('es-CL')}</p>
<table><thead><tr>${(cabecera ?? []).map((c) => `<th>${escapar(c)}</th>`).join('')}</tr></thead>
<tbody>${cuerpo.map((f) => `<tr>${f.map((c) => `<td>${celda(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>
<script>window.onload=function(){window.print()}</script></body></html>`;
};

// Abre el reporte en otra ventana para imprimirlo o guardarlo como PDF.
// Devuelve false si el navegador bloqueo la ventana.
export const abrirImprimible = (reporte: Reporte): boolean => {
  const ventana = window.open('', '_blank');
  if (!ventana) return false;
  ventana.document.write(htmlImprimible(reporte));
  ventana.document.close();
  return true;
};
