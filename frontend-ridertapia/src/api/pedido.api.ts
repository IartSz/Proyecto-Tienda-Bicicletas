import type { CanalVenta, DatosComprador, EstadoPedido, Pedido, PedidoPayload } from '../models/Pedido';
import { ESTADOS_FINALES, ESTADOS_PEDIDO, ESTADOS_QUE_DEVUELVEN } from '../utils/estadosPedido';
import type { ItemCarrito } from '../models/ItemCarrito';
import ProductoService from '../services/producto.service';
import InventarioService from '../services/inventario.service';
import type { ServicioPedidos } from '../services/pedido.service';
import { formatearRut, rutApi } from '../utils/validaciones';
import apiClient from './cliente';
import { obtenerLista } from './hal';
import { eliminarPagos, mediosDePago, registrarPago, sincronizarPago } from './pago.api';
import { cerrarCarrito } from './carrito.api';
import type {
  CanalVentaApi, ClienteApi, DatosVisitanteApi, DetallePedidoApi, HistorialEstadoApi, NotificacionApi, PedidoApi, UsuarioApi
} from './tipos';

// PedidoService contra ms-pedidos (+ ms-pagos, ms-usuario y ms-cliente para leer)

const TIPO_AVISO = 'CAMBIO_ESTADO';

const sinZona = (fecha: string): string => fecha.slice(0, 19);
const ahora = (): string => sinZona(new Date().toISOString());

// El front y el backend usan los mismos canales: WEB y TIENDA
const aCanalApi = (canal: CanalVenta): CanalVentaApi => canal;
const aCanal = (canal: CanalVentaApi): CanalVenta => canal;

const cuerpoPedido = (p: PedidoPayload, datosVisitante: { idDatosVisitante: number } | null) => ({
  numero: p.numero,
  fechaCreacion: sinZona(p.fechaCreacion),
  fechaExpiracion: p.fechaExpiracion ? sinZona(p.fechaExpiracion) : null,
  estado: p.estado,
  canal: aCanalApi(p.canal),
  subtotal: p.subtotal,
  descuento: p.descuento,
  total: p.total,
  motivoAnulacion: p.motivoAnulacion,
  rutCliente: p.rutCliente ? rutApi(p.rutCliente) : null,
  idCupon: p.idCupon,
  idEmpleado: p.idEmpleado,
  datosVisitante
});

// Unidades por producto (el stock se repite en cada talla)
const unidadesPorProducto = (items: ItemCarrito[]): Map<number, number> => {
  const unidades = new Map<number, number>();
  items.forEach((i) => unidades.set(i.idProducto, (unidades.get(i.idProducto) ?? 0) + i.cantidad));
  return unidades;
};

// Comprador: de su cuenta (ms-cliente) o de DatosVisitante
const comprador = (p: PedidoApi, usuarios: UsuarioApi[], clientes: ClienteApi[]): DatosComprador | undefined => {
  if (p.rutCliente) {
    const cliente = clientes.find((c) => c.rutUsuario === p.rutCliente);
    const usuario = usuarios.find((u) => u.rutUsuario === p.rutCliente);
    return {
      nombre: cliente?.nombre ?? '',
      apellido: cliente?.apellido ?? '',
      rut: formatearRut(p.rutCliente),
      email: usuario?.emailCliente ?? '',
      telefono: cliente?.telefono ?? ''
    };
  }
  const v = p.datosVisitante;
  return v ? { nombre: v.nombre, apellido: '', rut: '', email: v.correo, telefono: v.telefono ?? '' } : undefined;
};

// Junta pedido + detalles + historial + pago + avisos en nuestro Pedido
const listar = async (): Promise<Pedido[]> => {
  const [pedidos, detalles, historial, productos, usuarios, clientes, medios, avisos] = await Promise.all([
    obtenerLista<PedidoApi>('/pedidos'),
    obtenerLista<DetallePedidoApi>('/detalles'),
    obtenerLista<HistorialEstadoApi>('/historial-estados'),
    ProductoService.listar(),
    obtenerLista<UsuarioApi>('/usuarios'),
    obtenerLista<ClienteApi>('/clientes'),
    mediosDePago(),
    obtenerLista<NotificacionApi>('/notificaciones')
  ]);

  // Producto y talla de cada idVariante, para mostrar el nombre
  const porVariante = new Map<number, { idProducto: number; nombre: string; imagen?: string; variante?: string }>();
  productos.forEach((p) => {
    if (p.idVariante) porVariante.set(p.idVariante, { idProducto: p.idProducto, nombre: p.nombre, imagen: p.imagenPrincipal });
    p.variantes?.valores.forEach((v) => {
      if (v.idVariante) porVariante.set(v.idVariante, { idProducto: p.idProducto, nombre: p.nombre, imagen: p.imagenPrincipal, variante: v.valor });
    });
  });

  return pedidos.map((p): Pedido => {
    const items: ItemCarrito[] = detalles
      .filter((d) => d.pedido.idPedido === p.idPedido)
      .map((d) => {
        const info = porVariante.get(d.idVariante);
        return {
          idProducto: info?.idProducto ?? 0,
          idVariante: d.idVariante,
          cantidad: d.cantidad,
          precioUnitario: d.precioUnitario,
          nombre: info?.nombre,
          variante: info?.variante,
          imagen: info?.imagen
        };
      });
    return {
      ...p,
      canal: aCanal(p.canal),
      rutCliente: p.rutCliente ? formatearRut(p.rutCliente) : null,
      envio: 0,
      cliente: comprador(p, usuarios, clientes),
      medioPago: medios.get(p.idPedido),
      items,
      historial: historial
        .filter((h) => h.pedido.idPedido === p.idPedido)
        .sort((a, b) => a.fechaCambio.localeCompare(b.fechaCambio))
        .map((h) => ({ estado: h.estadoNuevo, fecha: h.fechaCambio, nota: h.nota ?? '' })),
      novedad: avisos.some((a) => a.pedido.idPedido === p.idPedido && a.tipo === TIPO_AVISO && !a.enviada)
    };
  });
};

const obtener = async (id: number): Promise<Pedido> => {
  const pedido = (await listar()).find((p) => p.idPedido === id);
  if (!pedido) throw new Error('Pedido no encontrado.');
  return pedido;
};

const registrarEstado = async (idPedido: number, anterior: EstadoPedido | null, nuevo: EstadoPedido, nota: string): Promise<void> => {
  await apiClient.post('/historial-estados', {
    // El backend no acepta null: el primer registro repite el estado
    estadoAnterior: anterior ?? nuevo,
    estadoNuevo: nuevo,
    fechaCambio: ahora(),
    idEmpleado: null,
    nota: nota || null,
    pedido: { idPedido }
  });
};

// El cliente vera el aviso en Mis pedidos hasta que lo abra
const avisarCliente = async (pedido: Pedido): Promise<void> => {
  await apiClient.post('/notificaciones', {
    tipo: TIPO_AVISO,
    destinatario: pedido.cliente?.email || pedido.datosVisitante?.correo || 'sin correo',
    fechaEnvio: ahora(),
    enviada: false,
    pedido: { idPedido: pedido.idPedido }
  });
};

const marcarAvisosVistos = async (idPedido: number): Promise<void> => {
  const avisos = await obtenerLista<NotificacionApi>(`/notificaciones/pedido/${idPedido}`);
  for (const { idNotificacionPedido, tipo, destinatario, fechaEnvio, enviada } of avisos) {
    if (tipo !== TIPO_AVISO || enviada) continue;
    await apiClient.put(`/notificaciones/${idNotificacionPedido}`, { tipo, destinatario, fechaEnvio, enviada: true, pedido: { idPedido } });
  }
};

// Mantiene el visitante actual si el pedido ya tenia uno
const visitanteDe = async (id: number): Promise<{ idDatosVisitante: number } | null> => {
  const { data } = await apiClient.get<PedidoApi>(`/pedidos/${id}`);
  return data.datosVisitante ? { idDatosVisitante: data.datosVisitante.idDatosVisitante } : null;
};

export const PedidoApiService: ServicioPedidos = {
  listar,
  obtener,

  // Orden: visitante (solo invitados), pedido, detalles, historial, pago y stock
  async crear(pedido: PedidoPayload): Promise<Pedido> {
    const items = pedido.items ?? [];
    if (items.some((i) => !i.idVariante)) {
      throw new Error('Hay productos sin variante en el carrito. Vuelve a agregarlos.');
    }

    let visitante: { idDatosVisitante: number } | null = null;
    if (!pedido.rutCliente && pedido.datosVisitante) {
      const { data } = await apiClient.post<DatosVisitanteApi>('/visitantes', {
        nombre: pedido.datosVisitante.nombre,
        correo: pedido.datosVisitante.correo,
        telefono: pedido.datosVisitante.telefono
      });
      visitante = { idDatosVisitante: data.idDatosVisitante };
    }

    const { data } = await apiClient.post<PedidoApi>('/pedidos', cuerpoPedido(pedido, visitante));
    const idPedido = data.idPedido;

    for (const item of items) {
      await apiClient.post('/detalles', {
        idVariante: item.idVariante,
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario,
        subtotal: item.precioUnitario * item.cantidad,
        pedido: { idPedido }
      });
    }
    await registrarEstado(idPedido, null, pedido.estado, pedido.historial?.[0]?.nota ?? '');
    if (pedido.medioPago) await registrarPago(idPedido, pedido.medioPago, pedido.total, pedido.ultimosDigitosTarjeta);

    for (const [idProducto, cantidad] of unidadesPorProducto(items)) {
      await InventarioService.mover(idProducto, 'VENTA', -cantidad, 'Sistema', `Pedido ${pedido.numero}`);
    }
    await cerrarCarrito();

    return {
      ...pedido,
      idPedido,
      datosVisitante: visitante && pedido.datosVisitante ? { ...pedido.datosVisitante, ...visitante } : pedido.datosVisitante
    };
  },

  async actualizar(id: number, pedido: PedidoPayload): Promise<Pedido> {
    const { data: actual } = await apiClient.get<PedidoApi>(`/pedidos/${id}`);
    const visitante = actual.datosVisitante ? { idDatosVisitante: actual.datosVisitante.idDatosVisitante } : null;
    await apiClient.put(`/pedidos/${id}`, cuerpoPedido(pedido, visitante));
    if (actual.estado !== pedido.estado) await registrarEstado(id, actual.estado, pedido.estado, '');
    // novedad false: el cliente ya vio los cambios
    if (pedido.novedad === false) await marcarAvisosVistos(id);
    return obtener(id);
  },

  // Cambia el estado con su nota, avisa al cliente y ajusta pago y stock
  async cambiarEstado(id: number, estado: EstadoPedido, nota: string): Promise<Pedido> {
    const pedido = await obtener(id);
    const texto = nota.trim();
    if (ESTADOS_FINALES.includes(pedido.estado)) {
      throw new Error(`El pedido ya está ${ESTADOS_PEDIDO[pedido.estado].etiqueta.toLowerCase()} y no se puede cambiar.`);
    }
    if (pedido.estado === estado && !texto) throw new Error('El pedido ya está en ese estado.');
    if (estado === 'ANULADO' && !texto) throw new Error('Indica el motivo de la anulación.');

    const devuelve = ESTADOS_QUE_DEVUELVEN.includes(estado);
    await apiClient.put(`/pedidos/${id}`, cuerpoPedido({
      ...pedido,
      estado,
      motivoAnulacion: devuelve ? (texto || null) : pedido.motivoAnulacion
    }, await visitanteDe(id)));
    await registrarEstado(id, pedido.estado, estado, texto);
    await avisarCliente(pedido);
    await sincronizarPago(id, pedido.medioPago, estado);

    if (devuelve) {
      for (const [idProducto, cantidad] of unidadesPorProducto(pedido.items ?? [])) {
        await InventarioService.mover(idProducto, 'AJUSTE', cantidad, 'admin', `Cancelación pedido ${pedido.numero}`);
      }
    }
    return obtener(id);
  },

  async agregarVarios(): Promise<void> {
    throw new Error('Los pedidos de ejemplo solo están disponibles en modo local (VITE_USAR_API=false).');
  },

  async eliminarDemo(): Promise<void> {
    // No hay pedidos de ejemplo en el backend
  },

  // Borra primero lo que depende del pedido
  async eliminar(id: number): Promise<void> {
    const [detalles, historial, avisos] = await Promise.all([
      obtenerLista<DetallePedidoApi>(`/detalles/pedido/${id}`),
      obtenerLista<HistorialEstadoApi>(`/historial-estados/pedido/${id}`),
      obtenerLista<NotificacionApi>(`/notificaciones/pedido/${id}`)
    ]);
    for (const d of detalles) await apiClient.delete(`/detalles/${d.idDetallePedido}`);
    for (const h of historial) await apiClient.delete(`/historial-estados/${h.idHistorialEstadoPedido}`);
    for (const a of avisos) await apiClient.delete(`/notificaciones/${a.idNotificacionPedido}`);
    await eliminarPagos(id);
    await apiClient.delete(`/pedidos/${id}`);
  }
};

export default PedidoApiService;
