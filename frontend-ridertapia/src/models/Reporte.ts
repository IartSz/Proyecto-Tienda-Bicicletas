export type TipoReporte = 'ventas' | 'top' | 'inventario';

export type FormatoReporte = 'excel' | 'pdf';

export type CeldaReporte = string | number;

// Reporte listo para exportar
export interface Reporte {
    nombre: string;
    tipo: string;
    categoria: string;
    filas: CeldaReporte[][]; // la primera fila es el encabezado
}

// Reporte exportado, guardado en el historial (solo frontend)
export interface ReporteGuardado extends Reporte {
    idReporte: number;
    formato: FormatoReporte;
    fecha: string;
}

export type ReporteGuardadoPayload = Omit<ReporteGuardado, 'idReporte'>;
