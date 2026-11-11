export const formatoCLP = (monto: number): string => '$' + Math.round(monto).toLocaleString('es-CL');

// "Casco Fox Speedframe" -> "casco-fox-speedframe"
export const slugify = (texto: string): string =>
  texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'item';

// "Camila" + "Rojas" -> "CR"
export const iniciales = (nombre: string, apellido: string): string =>
  ((nombre[0] ?? '') + (apellido[0] ?? '')).toUpperCase();

// "09-11-2026 15:30"
export const fechaCorta = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' +
    d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
};

// "Hoy, 15:30", "Ayer, 10:00" o "09-11"
export const fechaRelativa = (iso: string): string => {
  const d = new Date(iso);
  const hoy = new Date();
  const ayer = new Date();
  ayer.setDate(hoy.getDate() - 1);
  const hora = d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  if (d.toDateString() === hoy.toDateString()) return `Hoy, ${hora}`;
  if (d.toDateString() === ayer.toDateString()) return `Ayer, ${hora}`;
  return d.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit' });
};

// Fecha en hora local como YYYY-MM-DD (para comparar con inputs date)
export const diaLocal = (fecha: Date | string): string => {
  const d = typeof fecha === 'string' ? new Date(fecha) : fecha;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
