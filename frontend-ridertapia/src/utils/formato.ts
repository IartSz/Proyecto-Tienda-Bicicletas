export const formatoCLP = (monto: number): string => '$' + Math.round(monto).toLocaleString('es-CL');
