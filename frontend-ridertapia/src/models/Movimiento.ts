export type TipoMovimiento = 'INGRESO' | 'AJUSTE' | 'VENTA' | 'TALLER';

export interface MovimientoInventario {
    idMovimiento: number;
    fecha: string;
    idProducto: number;
    nombre: string;
    tipo: TipoMovimiento;
    cantidad: number; // positivo suma, negativo resta
    stockResultante: number;
    usuario: string;
    detalle: string;
}

export type MovimientoPayload = Omit<MovimientoInventario, 'idMovimiento'>;
