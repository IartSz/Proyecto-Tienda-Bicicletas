export interface ItemCarrito {
    idProducto: number;
    cantidad: number;
    precioUnitario: number;
    idItemCarrito?: number; //Lo asigna el backend
    idVariante?: number;
    //Solo el frontend
    nombre?: string;
    variante?: string;
    imagen?: string;
}
