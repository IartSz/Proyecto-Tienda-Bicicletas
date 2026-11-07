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
