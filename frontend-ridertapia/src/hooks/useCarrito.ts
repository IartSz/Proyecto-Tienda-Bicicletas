import { createContext, useContext } from 'react';
import type { ItemCarrito } from '../models/ItemCarrito';
import type { Producto } from '../models/Producto';
import type { Totales } from '../services/carrito.service';

export interface CarritoContextValue {
  items: ItemCarrito[];
  totales: Totales;
  cantidadTotal: number;
  // Devuelven un mensaje de error o null si todo bien
  agregar: (producto: Producto, cantidad: number, variante?: string) => string | null;
  cambiarCantidad: (indice: number, cantidad: number) => string | null;
  eliminar: (indice: number) => void;
  vaciar: () => void;
}

export const CarritoContext = createContext<CarritoContextValue | null>(null);

export const useCarrito = (): CarritoContextValue => {
  const contexto = useContext(CarritoContext);
  if (!contexto) throw new Error('useCarrito debe usarse dentro de CarritoProvider');
  return contexto;
};

export default useCarrito;
