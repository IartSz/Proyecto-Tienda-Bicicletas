import type { CanalVenta, EstadoPedido, Pedido, PedidoPayload } from '../models/Pedido';
import { ESTADOS_FINALES, ESTADOS_PEDIDO, ESTADOS_QUE_DEVUELVEN } from '../utils/estadosPedido';
import type { ItemCarrito } from '../models/ItemCarrito';
import ProductoService from '../services/producto.service';
import apiClient from './cliente';
import type { ServicioPedidos } from '../services/pedido.service';
import { obtenerLista } from './hal';
import type { CanalVentaApi, DatosVisitanteApi, DetallePedidoApi, HistorialEstadoApi, PedidoApi } from './tipos';

// PedidoService contra ms-pedidos

const sinZona = (fecha: string): string => fecha.slice(0, 19);

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
  rutCliente: p.rutCliente,
  idCupon: p.idCupon,
  idEmpleado: p.idEmpleado,
  datosVisitante
});

// Junta pedido + detalles + historial en nuestro Pedido
const listar = async (): Promise<Pedido[]> => {
  const [pedidos, detalles, historial, productos] = await Promise.all([
    obtenerLista<PedidoApi>('/pedidos'),
    obtenerLista<DetallePedidoApi>('/detalles'),
    obtenerLista<HistorialEstadoApi>('/historial-estados'),
    ProductoService.listar()
  ]);

  // idVariante -> producto y talla, para mostrar el nombre
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
    const visitante = p.datosVisitante;
    return {
      ...p,
      canal: aCanal(p.canal),
      datosVisitante: visitante,
      envio: 0,
      // Sin cuenta: el comprador sale de DatosVisitante
      cliente: visitante
        ? { nombre: visitante.nombre, apellido: '', rut: p.rutCliente ?? '', email: visitante.correo, telefono: visitante.telefono ?? '' }
        : undefined,
      items,
      historial: historial
        .filter((h) => h.pedido.idPedido === p.idPedido)
        .map((h) => ({ estado: h.estadoNuevo, fecha: h.fechaCambio, nota: '' }))
    };
  });
};

const obtener = async (id: number): Promise<Pedido> => {
  const pedido = (await listar()).find((p) => p.idPedido === id);
  if (!pedido) throw new Error('Pedido no encontrado.');
  return pedido;
};

const registrarEstado = async (idPedido: number, anterior: Pedido['estado'] | null, nuevo: Pedido['estado']): Promise<void> => {
  await apiClient.post('/historial-estados', {
    // El backend no acepta null: el primer registro repite el estado
    estadoAnterior: anterior ?? nuevo,
    estadoNuevo: nuevo,
    fechaCambio: sinZona(new Date().toISOString()),
    idEmpleado: null,
    pedido: { idPedido }
  });
};

export const PedidoApiService: ServicioPedidos = {
  listar,
  obtener,

  // Visitante -> pedido -> detalles -> historial -> stock
  async crear(pedido: PedidoPayload): Promise<Pedido> {
    const items = pedido.items ?? [];
    if (items.some((i) => !i.idVariante)) {
      throw new Error('Hay productos sin variante en el carrito. Vuelve a agregarlos.');
    }

    // Las cuentas viven en el navegador y ms-cliente no las conoce: con rutCliente el backend
    // respondia 404. Todo pedido se registra con los datos del comprador (visitante) y sin RUT.
    const cliente = pedido.cliente;
    const comprador = pedido.datosVisitante
      ?? (cliente ? { nombre: `${cliente.nombre} ${cliente.apellido}`.trim(), correo: cliente.email, telefono: cliente.telefono } : null);

    let visitante: { idDatosVisitante: number } | null = null;
    if (comprador) {
      const { data } = await apiClient.post<DatosVisitanteApi>('/visitantes', {
        nombre: comprador.nombre,
        correo: comprador.correo,
        telefono: comprador.telefono
      });
      visitante = { idDatosVisitante: data.idDatosVisitante };
    }

    const { data } = await apiClient.post<PedidoApi>('/pedidos', cuerpoPedido({ ...pedido, rutCliente: null }, visitante));
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
    await registrarEstado(idPedido, null, pedido.estado);

    // Descuenta stock (se repite en cada talla)
    const unidades = new Map<number, number>();
    items.forEach((i) => unidades.set(i.idProducto, (unidades.get(i.idProducto) ?? 0) + i.cantidad));
    for (const [idProducto, cantidad] of unidades) {
      const producto = await ProductoService.obtener(idProducto);
      await ProductoService.actualizar(idProducto, { ...producto, stockDisponible: Math.max(0, (producto.stockDisponible ?? 0) - cantidad) });
    }

    return {
      ...pedido,
      idPedido,
      datosVisitante: comprador && visitante ? { ...comprador, idDatosVisitante: visitante.idDatosVisitante } : pedido.datosVisitante
    };
  },

  async actualizar(id: number, pedido: PedidoPayload): Promise<Pedido> {
    const actual = await apiClient.get<PedidoApi>(`/pedidos/${id}`);
    const visitante = actual.data.datosVisitante ? { idDatosVisitante: actual.data.datosVisitante.idDatosVisitante } : null;
    await apiClient.put(`/pedidos/${id}`, cuerpoPedido(pedido, visitante));
    if (actual.data.estado !== pedido.estado) await registrarEstado(id, actual.data.estado, pedido.estado);
    return obtener(id);
  },

  // Cambia el estado (queda en el historial del backend). Si se cancela o anula, el stock vuelve.
  async cambiarEstado(id: number, estado: EstadoPedido, nota: string): Promise<Pedido> {
    const pedido = await obtener(id);
    const texto = nota.trim();
    if (ESTADOS_FINALES.includes(pedido.estado)) {
      throw new Error(`El pedido ya está ${ESTADOS_PEDIDO[pedido.estado].etiqueta.toLowerCase()} y no se puede cambiar.`);
    }
    if (pedido.estado === estado && !texto) throw new Error('El pedido ya está en ese estado.');
    if (estado === 'ANULADO' && !texto) throw new Error('Indica el motivo de la anulación.');

    const devuelve = ESTADOS_QUE_DEVUELVEN.includes(estado);
    const { idPedido: _id, ...payload } = pedido;
    void _id;
    const actualizado = await PedidoApiService.actualizar(id, {
      ...payload,
      estado,
      motivoAnulacion: devuelve ? (texto || null) : pedido.motivoAnulacion
    });

    if (devuelve) {
      const unidades = new Map<number, number>();
      (pedido.items ?? []).forEach((i) => unidades.set(i.idProducto, (unidades.get(i.idProducto) ?? 0) + i.cantidad));
      for (const [idProducto, cantidad] of unidades) {
        const producto = await ProductoService.obtener(idProducto);
        await ProductoService.actualizar(idProducto, { ...producto, stockDisponible: (producto.stockDisponible ?? 0) + cantidad });
      }
    }
    return actualizado;
  },

  async agregarVarios(): Promise<void> {
    throw new Error('Los pedidos de ejemplo solo están disponibles en modo local (VITE_USAR_API=false).');
  },

  async eliminarDemo(): Promise<void> {
    // No hay pedidos de ejemplo en el backend
  },

  // Borra primero detalles e historial
  async eliminar(id: number): Promise<void> {
    const [detalles, historial] = await Promise.all([
      obtenerLista<DetallePedidoApi>(`/detalles/pedido/${id}`),
      obtenerLista<HistorialEstadoApi>(`/historial-estados/pedido/${id}`)
    ]);
    for (const d of detalles) await apiClient.delete(`/detalles/${d.idDetallePedido}`);
    for (const h of historial) await apiClient.delete(`/historial-estados/${h.idHistorialEstadoPedido}`);
    await apiClient.delete(`/pedidos/${id}`);
  }
};

export default PedidoApiService;
