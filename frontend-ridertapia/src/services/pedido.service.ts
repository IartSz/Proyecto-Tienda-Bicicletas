import type { DatosComprador, EstadoPedido, MedioPago, Pedido, PedidoPayload } from '../models/Pedido';
import type { ItemCarrito } from '../models/ItemCarrito';
import InventarioService from './inventario.service';
import { calcularTotales } from './carrito.service';
import { ESTADOS_FINALES, ESTADOS_PEDIDO, ESTADOS_QUE_DEVUELVEN } from '../utils/estadosPedido';

// Por ahora en localStorage; luego se cambia por la API
const CLAVE = 'pedidos';

// Avisa a los hooks de la misma pestana que los pedidos cambiaron
export const EVENTO_PEDIDOS = 'pedidos-actualizados';

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
  window.dispatchEvent(new Event(EVENTO_PEDIDOS));
};

// Correo del comprador (cuenta o invitado)
const correoDe = (pedido: Pedido): string =>
  (pedido.cliente?.email ?? pedido.datosVisitante?.correo ?? '').toLowerCase();

// Pedidos de un cliente, del mas reciente al mas antiguo
export const pedidosDeCorreo = (pedidos: Pedido[], correo: string): Pedido[] =>
  pedidos
    .filter((p) => correoDe(p) === correo.trim().toLowerCase())
    .sort((a, b) => b.fechaCreacion.localeCompare(a.fechaCreacion));

// Transferencia y efectivo quedan pendientes hasta recibir el pago
export const estadoInicial = (medioPago: MedioPago): EstadoPedido =>
  medioPago === 'TARJETA' ? 'PAGADO' : 'PENDIENTE_PAGO';

// Arma el pedido a partir del carrito y los datos del checkout.
// Con rutCliente el pedido es de una cuenta; sin el, de un invitado.
export const armarPedido = (items: ItemCarrito[], cliente: DatosComprador, medioPago: MedioPago, rutCliente: string | null = null): PedidoPayload => {
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
    rutCliente,
    idCupon: null,
    idEmpleado: null,
    datosVisitante: rutCliente ? null : { nombre: `${cliente.nombre} ${cliente.apellido}`, correo: cliente.email, telefono: cliente.telefono },
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
      await InventarioService.mover(item.idProducto, 'VENTA', -item.cantidad, 'Sistema', `Pedido ${pedido.numero}`);
    }
    return nuevo;
  },

  // Cambia el estado y anota el historial. Si se cancela o anula, el stock vuelve.
  async cambiarEstado(id: number, estado: EstadoPedido, nota: string): Promise<Pedido> {
    const lista = leer();
    const indice = lista.findIndex((p) => p.idPedido === id);
    if (indice === -1) throw new Error('Pedido no encontrado.');
    const pedido = lista[indice];
    const texto = nota.trim();
    if (ESTADOS_FINALES.includes(pedido.estado)) {
      throw new Error(`El pedido ya está ${ESTADOS_PEDIDO[pedido.estado].etiqueta.toLowerCase()} y no se puede cambiar.`);
    }
    if (pedido.estado === estado && !texto) throw new Error('El pedido ya está en ese estado.');
    if (estado === 'ANULADO' && !texto) throw new Error('Indica el motivo de la anulación.');

    const devuelve = ESTADOS_QUE_DEVUELVEN.includes(estado);
    const actualizado: Pedido = {
      ...pedido,
      estado,
      novedad: true, // el cliente lo ve en Mis pedidos
      motivoAnulacion: devuelve ? (texto || null) : pedido.motivoAnulacion,
      historial: [...(pedido.historial ?? []), { estado, fecha: new Date().toISOString(), nota: texto }]
    };
    lista[indice] = actualizado;
    guardar(lista);

    // Los pedidos de ejemplo no descontaron stock
    if (devuelve && !pedido.demo) {
      for (const item of pedido.items ?? []) {
        await InventarioService.mover(item.idProducto, 'AJUSTE', item.cantidad, 'admin', `Cancelación pedido ${pedido.numero}`);
      }
    }
    return actualizado;
  },

  // Agrega pedidos tal cual, sin tocar el stock (ventas de ejemplo)
  async agregarVarios(nuevos: PedidoPayload[]): Promise<void> {
    const lista = leer();
    let idPedido = Math.max(0, ...lista.map((p) => p.idPedido));
    guardar([...lista, ...nuevos.map((p) => ({ ...p, idPedido: ++idPedido }))]);
  },

  async eliminarDemo(): Promise<void> {
    guardar(leer().filter((p) => !p.demo));
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
