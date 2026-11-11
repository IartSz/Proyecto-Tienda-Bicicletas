import type { ItemCarrito } from '../models/ItemCarrito';
import type { Pedido } from '../models/Pedido';
import type { Producto } from '../models/Producto';

// Producto publicado, con stock y sin oferta. Cada test cambia solo lo que necesita.
export const crearProducto = (cambios: Partial<Producto> = {}): Producto => ({
  idProducto: 1,
  nombre: 'Casco Trail Pro',
  descripcion: null,
  precioNormal: 15990,
  estado: 'PUBLICADO',
  destacado: false,
  ordenDestacado: null,
  limitePorCompra: 10,
  fechaCreacion: '2026-01-01T00:00:00',
  categoria: { idCategoria: 1, nombre: 'Cascos', descripcion: null, activa: true, categoriaPadre: null, icono: 'bi-shield' },
  marca: { idMarca: 1, nombre: 'Fox', activa: true },
  stockDisponible: 5,
  stockMinimo: 2,
  ...cambios
});

export const crearItem = (cambios: Partial<ItemCarrito> = {}): ItemCarrito => ({
  idProducto: 1,
  cantidad: 1,
  precioUnitario: 10000,
  nombre: 'Casco Trail Pro',
  ...cambios
});

export const COMPRADOR = {
  nombre: 'Camila',
  apellido: 'Rojas',
  rut: '12.345.678-5',
  email: 'camila@correo.cl',
  telefono: '+56 9 1234 5678'
};

// Pedido de una cuenta, pagado con tarjeta, con una linea de 2 x $10.000
export const crearPedido = (cambios: Partial<Pedido> = {}): Pedido => ({
  idPedido: 1,
  numero: 'RT-000001',
  fechaCreacion: '2026-03-15T12:00:00',
  fechaExpiracion: null,
  estado: 'PAGADO',
  canal: 'WEB',
  subtotal: 20000,
  descuento: 0,
  total: 20000,
  motivoAnulacion: null,
  rutCliente: COMPRADOR.rut,
  idCupon: null,
  idEmpleado: null,
  datosVisitante: null,
  envio: 0,
  cliente: COMPRADOR,
  medioPago: 'TARJETA',
  items: [crearItem({ idProducto: 1, cantidad: 2, precioUnitario: 10000 })],
  historial: [{ estado: 'PAGADO', fecha: '2026-03-15T12:00:00', nota: 'Pedido recibido.' }],
  ...cambios
});
