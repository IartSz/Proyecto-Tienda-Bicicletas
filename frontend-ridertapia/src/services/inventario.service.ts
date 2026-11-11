import type { TipoMovimiento } from '../models/Movimiento';
import type { Producto } from '../models/Producto';
import ProductoService from './producto.service';
import MovimientoService from './movimiento.service';

// Cambia el stock de un producto y deja el movimiento registrado
export const InventarioService = {
  // cantidad positiva suma, negativa resta (el stock no baja de 0)
  async mover(idProducto: number, tipo: TipoMovimiento, cantidad: number, usuario: string, detalle: string): Promise<Producto> {
    const producto = await ProductoService.obtener(idProducto);
    const stock = Math.max(0, (producto.stockDisponible ?? 0) + cantidad);
    const actualizado = await ProductoService.actualizar(idProducto, { ...producto, stockDisponible: stock });
    await MovimientoService.registrar(actualizado, tipo, cantidad, usuario, detalle);
    return actualizado;
  },

  // Deja el stock en un valor exacto (ajuste). Sin diferencia no hace nada.
  async fijar(idProducto: number, nuevoStock: number, usuario: string, detalle: string): Promise<Producto> {
    const producto = await ProductoService.obtener(idProducto);
    const diferencia = nuevoStock - (producto.stockDisponible ?? 0);
    if (diferencia === 0) return producto;
    return this.mover(idProducto, 'AJUSTE', diferencia, usuario, detalle);
  }
};

export default InventarioService;
