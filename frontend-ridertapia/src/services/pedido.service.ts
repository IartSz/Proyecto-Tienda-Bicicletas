import type { DatosComprador, EstadoPedido, MedioPago, Pedido, PedidoPayload } from '../models/Pedido';
import type { ItemCarrito } from '../models/ItemCarrito';
import ProductoService from './producto.service';
import { calcularTotales } from './carrito.service';

// Por ahora en localStorage; luego se cambia por la API
const CLAVE = 'pedidos';

const leer = (): Pedido[] => {
  try {
    const guardados = localStorage.getItem(CLAVE);
    return guardados ? (JSON.parse(guardados) as Pedido[]) : [];
  } catch {
    return [];
  }
};

const guardar = (lista: Pedido[]): void => {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(lista));
  } catch {
    throw new Error('No se pudo guardar el pedido.');
  }
};

// Transferencia y efectivo quedan pendientes hasta recibir el pago
export const estadoInicial = (medioPago: MedioPago): EstadoPedido =>
  medioPago === 'TARJETA' ? 'PAGADO' : 'PENDIENTE_PAGO';

// Arma el pedido a partir del carrito y los datos del checkout
export const armarPedido = (items: ItemCarrito[], cliente: DatosComprador, medioPago: MedioPago): PedidoPayload => {
  const totales = calcularTotales(items);
  const ahora = new Date().toISOString();
  const estado = estadoInicial(medioPago);
  return {
    numero: 'RT-' + Date.now().toString().slice(-6),
    fechaCreacion: ahora,
    fechaExpiracion: null,
    estado,
    canal: 'WEB',
    subtotal: totales.subtotal,
    descuento: 0,
    total: totales.total,
    motivoAnulacion: null,
    rutCliente: null,
    idCupon: null,
    idEmpleado: null,
    datosVisitante: { nombre: `${cliente.nombre} ${cliente.apellido}`, correo: cliente.email, telefono: cliente.telefono },
    envio: totales.envio,
    cliente,
    medioPago,
    items,
    historial: [{ estado, fecha: ahora, nota: 'Pedido recibido.' }],
    novedad: false
  };
};

export const PedidoService = {
  async listar(): Promise<Pedido[]> {
    return leer();
  },

  async obtener(id: number): Promise<Pedido> {
    const pedido = leer().find((p) => p.idPedido === id);
    if (!pedido) throw new Error('Pedido no encontrado.');
    return pedido;
  },

  // Guarda el pedido y descuenta el stock
  async crear(pedido: PedidoPayload): Promise<Pedido> {
    const lista = leer();
    const idPedido = Math.max(0, ...lista.map((p) => p.idPedido)) + 1;
    const nuevo: Pedido = { ...pedido, idPedido };
    guardar([...lista, nuevo]);

    for (const item of pedido.items ?? []) {
      const producto = await ProductoService.obtener(item.idProducto);
      const stock = Math.max(0, (producto.stockDisponible ?? 0) - item.cantidad);
      await ProductoService.actualizar(producto.idProducto, { ...producto, stockDisponible: stock });
    }
    return nuevo;
  },

  async actualizar(id: number, pedido: PedidoPayload): Promise<Pedido> {
    const lista = leer();
    const indice = lista.findIndex((p) => p.idPedido === id);
    if (indice === -1) throw new Error('Pedido no encontrado.');
    const actualizado: Pedido = { ...pedido, idPedido: id };
    lista[indice] = actualizado;
    guardar(lista);
    return actualizado;
  },

  async eliminar(id: number): Promise<void> {
    guardar(leer().filter((p) => p.idPedido !== id));
  }
};

export default PedidoService;
