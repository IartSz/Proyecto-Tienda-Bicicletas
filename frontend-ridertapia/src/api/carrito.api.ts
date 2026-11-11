import type { ItemCarrito } from '../models/ItemCarrito';
import { rutApi } from '../utils/validaciones';
import apiClient from './cliente';
import { estadoHttp } from './auth.api';

// Copia del carrito en ms-carrito. El carrito de la pantalla sigue en el navegador;
// aca se guarda en la BD y se recupera al iniciar sesion

const CLAVE_ID = 'carritoId';

export interface LineaCarritoApi {
  idItemCarrito: number;
  idVariante: number;
  cantidad: number;
  precioUnitario: number;
  fechaAgregado: string;
  idProducto?: number;
}

interface CarritoApi {
  idCarrito: number;
  rutCliente: string | null;
  tokenSesion: string | null;
  fechaCreacion: string;
  fechaActualizacion: string;
  estado: 'ACTIVO' | 'CONVERTIDO_EN_PEDIDO' | 'ABANDONADO';
  items: LineaCarritoApi[];
}

const ahora = (): string => new Date().toISOString().slice(0, 19);

const leerId = (): number | null => {
  try {
    return Number(localStorage.getItem(CLAVE_ID)) || null;
  } catch {
    return null;
  }
};

const guardarId = (id: number | null): void => {
  try {
    if (id) localStorage.setItem(CLAVE_ID, String(id));
    else localStorage.removeItem(CLAVE_ID);
  } catch {
    // Sin acceso al almacenamiento
  }
};

const carritoActivo = async (): Promise<CarritoApi | null> => {
  const id = leerId();
  if (!id) return null;
  try {
    const { data } = await apiClient.get<CarritoApi>(`/carritos/${id}`);
    return data.estado === 'ACTIVO' ? data : null;
  } catch (err) {
    if (estadoHttp(err) === 404) return null;
    throw err;
  }
};

type Linea = Pick<ItemCarrito, 'precioUnitario' | 'cantidad'>;

const subtotal = (items: Linea[]): number => items.reduce((s, i) => s + i.precioUnitario * i.cantidad, 0);

const cabecera = (c: Pick<CarritoApi, 'tokenSesion' | 'fechaCreacion' | 'estado'>, rut: string | null, items: Linea[]) => ({
  rutCliente: rut,
  tokenSesion: c.tokenSesion,
  fechaCreacion: c.fechaCreacion,
  fechaActualizacion: ahora(),
  estado: c.estado,
  subtotal: subtotal(items),
  descuento: 0,
  total: subtotal(items),
  idCupon: null
});

const sincronizar = async (items: ItemCarrito[], rutCliente: string | null): Promise<void> => {
  const lineas = items.filter((i) => i.idVariante);
  const rut = rutCliente ? rutApi(rutCliente) : null;
  const actual = await carritoActivo();

  if (!actual) {
    guardarId(null);
    if (lineas.length === 0) return;
    const { data } = await apiClient.post<CarritoApi>('/carritos', {
      ...cabecera({ tokenSesion: crypto.randomUUID(), fechaCreacion: ahora(), estado: 'ACTIVO' }, rut, lineas),
      items: lineas.map((i) => ({ idVariante: i.idVariante, cantidad: i.cantidad, precioUnitario: i.precioUnitario, fechaAgregado: ahora() }))
    });
    guardarId(data.idCarrito);
    return;
  }

  // Solo se envia lo que cambio
  const carrito = { idCarrito: actual.idCarrito };
  for (const e of actual.items) {
    if (!lineas.some((i) => i.idVariante === e.idVariante)) await apiClient.delete(`/items-carrito/${e.idItemCarrito}`);
  }
  for (const i of lineas) {
    const e = actual.items.find((x) => x.idVariante === i.idVariante);
    const linea = { idVariante: i.idVariante, cantidad: i.cantidad, precioUnitario: i.precioUnitario, carrito };
    if (!e) await apiClient.post('/items-carrito', { ...linea, fechaAgregado: ahora() });
    else if (e.cantidad !== i.cantidad || e.precioUnitario !== i.precioUnitario) {
      await apiClient.put(`/items-carrito/${e.idItemCarrito}`, { ...linea, fechaAgregado: e.fechaAgregado });
    }
  }
  // Sin sesion se mantiene el cliente que ya tenia
  await apiClient.put(`/carritos/${actual.idCarrito}`, cabecera(actual, rut ?? actual.rutCliente, lineas));
};

// Una sincronizacion a la vez, en orden
let cola: Promise<void> = Promise.resolve();

export const sincronizarCarrito = (items: ItemCarrito[], rutCliente: string | null): Promise<void> => {
  cola = cola.then(() => sincronizar(items, rutCliente)).catch((err: unknown) => console.error('No se pudo guardar el carrito.', err));
  return cola;
};

// Al confirmar la compra el carrito pasa a pedido
export const cerrarCarrito = (): Promise<void> => {
  cola = cola.then(async () => {
    const actual = await carritoActivo();
    guardarId(null);
    if (actual) await apiClient.put(`/carritos/${actual.idCarrito}`, cabecera({ ...actual, estado: 'CONVERTIDO_EN_PEDIDO' }, actual.rutCliente, actual.items));
  }).catch((err: unknown) => console.error('No se pudo cerrar el carrito.', err));
  return cola;
};

// Al cerrar sesion el carrito queda guardado a nombre del cliente
export const olvidarCarrito = (): void => guardarId(null);

// Ultimo carrito activo del cliente (por ejemplo, armado en otro dispositivo)
export const recuperarCarrito = async (rutCliente: string): Promise<LineaCarritoApi[]> => {
  const { data } = await apiClient.get<{ _embedded?: Record<string, CarritoApi[]> }>(`/carritos/rutCliente/${rutApi(rutCliente)}`);
  const activos = Object.values(data._embedded ?? {}).flat()
    .filter((c) => c.estado === 'ACTIVO')
    .sort((a, b) => b.fechaActualizacion.localeCompare(a.fechaActualizacion));
  const [ultimo] = activos;
  if (!ultimo) return [];
  guardarId(ultimo.idCarrito);
  return ultimo.items;
};
