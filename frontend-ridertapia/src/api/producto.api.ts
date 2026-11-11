import type { Categoria } from '../models/Categoria';
import type { Marca, Producto, ProductoPayload } from '../models/Producto';
import apiClient from './cliente';
import { obtenerLista } from './hal';
import { crearMapper } from './producto.mapper';
import type {
  CategoriaApi, EspecificacionApi, ImagenApi, ItemInventarioApi, OfertaApi, ProductoApi, VarianteApi
} from './tipos';

// ProductoService contra el backend: ms-productos + ms-inventario

const sinZona = (fecha: string): string => fecha.slice(0, 19);
const soloFecha = (d: Date): string => d.toISOString().slice(0, 10);

const deProducto = <T extends { producto: { idProducto: number } }>(lista: T[], id: number): T[] =>
  lista.filter((x) => x.producto.idProducto === id);

// Los ids locales no sirven en la BD: se buscan por nombre
const resolverCategoria = async (categoria: Categoria): Promise<{ idCategoria: number }> => {
  const lista = await obtenerLista<CategoriaApi>('/categorias');
  const encontrada = lista.find((c) => c.nombre === categoria.nombre);
  if (!encontrada) throw new Error(`La categoría "${categoria.nombre}" no existe en el backend.`);
  return { idCategoria: encontrada.idCategoria };
};

// Usa la marca existente o la crea
const resolverMarca = async (marca: Marca): Promise<{ idMarca: number }> => {
  const lista = await obtenerLista<Marca>('/marcas');
  const encontrada = lista.find((m) => m.nombre.toLowerCase() === marca.nombre.toLowerCase());
  if (encontrada) return { idMarca: encontrada.idMarca };
  const { data } = await apiClient.post<Marca>('/marcas', { nombre: marca.nombre, activa: true });
  return { idMarca: data.idMarca };
};

const cuerpoProducto = async (p: ProductoPayload) => ({
  nombre: p.nombre,
  descripcion: p.descripcion,
  precioNormal: p.precioNormal,
  estado: p.estado,
  destacado: p.destacado,
  ordenDestacado: p.ordenDestacado,
  limitePorCompra: p.limitePorCompra,
  fechaCreacion: sinZona(p.fechaCreacion),
  categoria: await resolverCategoria(p.categoria),
  marca: await resolverMarca(p.marca),
  compatibilidades: []
});

const cuerpoStock = (item: { idVariante: number; stockReservado?: number; costoPromedio?: number }, stock: number, minimo: number) => ({
  idVariante: item.idVariante,
  stockDisponible: stock,
  stockReservado: item.stockReservado ?? 0,
  stockMinimo: minimo,
  costoPromedio: item.costoPromedio ?? 0,
  fechaActualizacion: sinZona(new Date().toISOString()),
  idProveedores: []
});

// Imagen principal: crea, cambia o borra segun el formulario
const sincronizarImagen = async (idProducto: number, url: string | undefined): Promise<void> => {
  const actuales = deProducto(await obtenerLista<ImagenApi>('/imagenes'), idProducto);
  const principal = actuales.find((i) => i.esPrincipal);
  const producto = { idProducto };
  if (url && !principal) await apiClient.post('/imagenes', { url, orden: 1, esPrincipal: true, producto });
  else if (url && principal && principal.url !== url) await apiClient.put(`/imagenes/${principal.idImagenProducto}`, { url, orden: principal.orden, esPrincipal: true, producto });
  else if (!url && principal) await apiClient.delete(`/imagenes/${principal.idImagenProducto}`);
};

// Oferta vigente por un año
const sincronizarOferta = async (idProducto: number, precioOferta: number | undefined): Promise<void> => {
  const actuales = deProducto(await obtenerLista<OfertaApi>('/ofertas'), idProducto);
  const producto = { idProducto };
  const hoy = new Date();
  const enUnAnio = new Date(hoy);
  enUnAnio.setFullYear(hoy.getFullYear() + 1);
  const fechas = { fechaInicio: soloFecha(hoy), fechaTermino: soloFecha(enUnAnio) };

  if (precioOferta === undefined) {
    for (const o of actuales) await apiClient.delete(`/ofertas/${o.idOferta}`);
    return;
  }
  const [primera, ...resto] = actuales;
  if (!primera) await apiClient.post('/ofertas', { precioOferta, ...fechas, producto });
  else if (primera.precioOferta !== precioOferta) await apiClient.put(`/ofertas/${primera.idOferta}`, { precioOferta, ...fechas, producto });
  for (const o of resto) await apiClient.delete(`/ofertas/${o.idOferta}`);
};

// Si cambian, se reemplazan todas
const sincronizarEspecificaciones = async (idProducto: number, p: ProductoPayload): Promise<void> => {
  const actuales = deProducto(await obtenerLista<EspecificacionApi>('/especificaciones'), idProducto);
  const nuevas = p.especificaciones ?? [];
  const iguales = JSON.stringify(actuales.map((e) => [e.nombre, e.valor])) === JSON.stringify(nuevas.map((e) => [e.nombre, e.valor]));
  if (iguales) return;
  for (const e of actuales) await apiClient.delete(`/especificaciones/${e.idEspecificacionTecnica}`);
  for (const e of nuevas) await apiClient.post('/especificaciones', { nombre: e.nombre, valor: e.valor, producto: { idProducto } });
};

// Variantes y stock: el stock se repite en cada talla disponible
const sincronizarVariantes = async (idProducto: number, p: ProductoPayload): Promise<void> => {
  const [variantes, inventario] = await Promise.all([
    obtenerLista<VarianteApi>('/variantes'),
    obtenerLista<ItemInventarioApi>('/items-inventario')
  ]);
  const actuales = deProducto(variantes, idProducto);
  const stock = Math.max(0, p.stockDisponible ?? 0);
  const minimo = p.stockMinimo ?? 0;
  const esColor = p.variantes?.nombre === 'Color';
  const deseados = p.variantes?.valores ?? [];
  const sku = p.sku ?? `PRD-${idProducto}`;

  // Stock objetivo de cada variante
  const objetivo = new Map<number, number>();
  if (deseados.length === 0) {
    let unica = actuales.find((v) => !v.talla && !v.color);
    if (!unica) {
      const { data } = await apiClient.post<VarianteApi>('/variantes', { sku, talla: null, color: null, aro: null, producto: { idProducto } });
      unica = data;
    }
    objetivo.set(unica.idVarianteProducto, stock);
    actuales.filter((v) => v !== unica).forEach((v) => objetivo.set(v.idVarianteProducto, 0));
  } else {
    for (const [i, d] of deseados.entries()) {
      let variante = actuales.find((v) => (v.talla ?? v.color) === d.valor);
      if (!variante) {
        const { data } = await apiClient.post<VarianteApi>('/variantes', {
          sku: `${sku}-${actuales.length + i + 1}`,
          talla: esColor ? null : d.valor,
          color: esColor ? d.valor : null,
          aro: null,
          producto: { idProducto }
        });
        variante = data;
      }
      objetivo.set(variante.idVarianteProducto, d.disponible ? stock : 0);
    }
    // Las que ya no estan quedan sin stock (no se borran: pueden tener pedidos)
    actuales.filter((v) => !objetivo.has(v.idVarianteProducto)).forEach((v) => objetivo.set(v.idVarianteProducto, 0));
  }

  for (const [idVariante, cantidad] of objetivo) {
    const item = inventario.find((i) => i.idVariante === idVariante);
    if (!item) await apiClient.post('/items-inventario', cuerpoStock({ idVariante }, cantidad, minimo));
    else if (item.stockDisponible !== cantidad || item.stockMinimo !== minimo) {
      await apiClient.put(`/items-inventario/${item.idItemInventario}`, cuerpoStock(item, cantidad, minimo));
    }
  }
};

const listar = async (): Promise<Producto[]> => {
  // Las 6 listas en paralelo
  const [productos, imagenes, ofertas, especificaciones, variantes, inventario] = await Promise.all([
    obtenerLista<ProductoApi>('/productos'),
    obtenerLista<ImagenApi>('/imagenes'),
    obtenerLista<OfertaApi>('/ofertas'),
    obtenerLista<EspecificacionApi>('/especificaciones'),
    obtenerLista<VarianteApi>('/variantes'),
    obtenerLista<ItemInventarioApi>('/items-inventario')
  ]);
  const mapear = crearMapper({ imagenes, ofertas, especificaciones, variantes, inventario });
  return productos.map(mapear);
};

const obtener = async (id: number): Promise<Producto> => {
  const producto = (await listar()).find((p) => p.idProducto === id);
  if (!producto) throw new Error('Producto no encontrado.');
  return producto;
};

export const ProductoApiService = {
  listar,
  obtener,

  async crear(producto: ProductoPayload): Promise<Producto> {
    const { data } = await apiClient.post<ProductoApi>('/productos', await cuerpoProducto(producto));
    const id = data.idProducto;
    await sincronizarImagen(id, producto.imagenPrincipal);
    await sincronizarOferta(id, producto.precioOferta);
    await sincronizarEspecificaciones(id, producto);
    await sincronizarVariantes(id, producto);
    return obtener(id);
  },

  async actualizar(id: number, producto: ProductoPayload): Promise<Producto> {
    await apiClient.put(`/productos/${id}`, await cuerpoProducto(producto));
    await sincronizarImagen(id, producto.imagenPrincipal);
    await sincronizarOferta(id, producto.precioOferta);
    await sincronizarEspecificaciones(id, producto);
    await sincronizarVariantes(id, producto);
    return obtener(id);
  },

  // Borra primero lo que depende del producto
  async eliminar(id: number): Promise<void> {
    const [imagenes, ofertas, especificaciones, variantes, inventario] = await Promise.all([
      obtenerLista<ImagenApi>('/imagenes'),
      obtenerLista<OfertaApi>('/ofertas'),
      obtenerLista<EspecificacionApi>('/especificaciones'),
      obtenerLista<VarianteApi>('/variantes'),
      obtenerLista<ItemInventarioApi>('/items-inventario')
    ]);
    const susVariantes = deProducto(variantes, id);
    for (const i of deProducto(imagenes, id)) await apiClient.delete(`/imagenes/${i.idImagenProducto}`);
    for (const o of deProducto(ofertas, id)) await apiClient.delete(`/ofertas/${o.idOferta}`);
    for (const e of deProducto(especificaciones, id)) await apiClient.delete(`/especificaciones/${e.idEspecificacionTecnica}`);
    for (const v of susVariantes) {
      const item = inventario.find((i) => i.idVariante === v.idVarianteProducto);
      if (item) await apiClient.delete(`/items-inventario/${item.idItemInventario}`);
      await apiClient.delete(`/variantes/${v.idVarianteProducto}`);
    }
    await apiClient.delete(`/productos/${id}`);
  }
};

export default ProductoApiService;
