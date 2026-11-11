import type { Categoria } from '../models/Categoria';
import type { Producto, ValorVariante } from '../models/Producto';
import { categorias as categoriasLocales } from '../data/categorias';
import { productos as productosLocales } from '../data/productos';
import { slugify } from '../utils/formato';
import type {
  CategoriaApi, EspecificacionApi, ImagenApi, ItemInventarioApi, OfertaApi, ProductoApi, VarianteApi
} from './tipos';

// Todo lo que el backend tiene repartido en varias tablas
export interface DatosCatalogo {
  imagenes: ImagenApi[];
  ofertas: OfertaApi[];
  especificaciones: EspecificacionApi[];
  variantes: VarianteApi[];
  inventario: ItemInventarioApi[];
}

// Agrupa una lista por idProducto para buscar rapido
const agrupar = <T extends { producto: { idProducto: number } }>(lista: T[]): Map<number, T[]> => {
  const mapa = new Map<number, T[]>();
  lista.forEach((x) => mapa.set(x.producto.idProducto, [...(mapa.get(x.producto.idProducto) ?? []), x]));
  return mapa;
};

// Slug e icono no existen en el backend: salen de los datos locales
export const aCategoria = (c: CategoriaApi): Categoria => {
  const local = categoriasLocales.find((x) => x.nombre === c.nombre);
  return {
    idCategoria: c.idCategoria,
    nombre: c.nombre,
    descripcion: c.descripcion,
    activa: c.activa,
    categoriaPadre: c.categoriaPadre ? aCategoria(c.categoriaPadre) : null,
    slug: local?.slug ?? slugify(c.nombre),
    icono: local?.icono
  };
};

const hoy = (): string => new Date().toISOString().slice(0, 10);

// Junta producto + imagen + oferta + especificaciones + variantes + stock
export const crearMapper = (datos: DatosCatalogo) => {
  const imagenes = agrupar(datos.imagenes);
  const ofertas = agrupar(datos.ofertas);
  const especificaciones = agrupar(datos.especificaciones);
  const variantes = agrupar(datos.variantes);
  const stockPorVariante = new Map(datos.inventario.map((i) => [i.idVariante, i]));

  return (p: ProductoApi): Producto => {
    const local = productosLocales.find((x) => x.nombre === p.nombre);
    const susVariantes = variantes.get(p.idProducto) ?? [];
    const stocks = susVariantes.map((v) => stockPorVariante.get(v.idVarianteProducto));
    const oferta = (ofertas.get(p.idProducto) ?? []).find((o) => o.fechaInicio <= hoy() && hoy() <= o.fechaTermino);
    const imagen = (imagenes.get(p.idProducto) ?? []).find((i) => i.esPrincipal);

    // Valores con talla o color; la guia de tallas viene de los datos locales
    const valores: ValorVariante[] = susVariantes
      .filter((v) => v.talla || v.color)
      .map((v, i) => {
        const valor = v.talla ?? v.color ?? '';
        return {
          valor,
          detalle: local?.variantes?.valores.find((x) => x.valor === valor)?.detalle ?? '',
          disponible: (stocks[i]?.stockDisponible ?? 0) > 0,
          idVariante: v.idVarianteProducto
        };
      });
    const guia = local?.variantes;

    return {
      idProducto: p.idProducto,
      nombre: p.nombre,
      descripcion: p.descripcion,
      precioNormal: p.precioNormal,
      estado: p.estado,
      destacado: p.destacado,
      ordenDestacado: p.ordenDestacado,
      limitePorCompra: p.limitePorCompra,
      fechaCreacion: p.fechaCreacion,
      categoria: aCategoria(p.categoria),
      marca: p.marca,
      slug: local?.slug ?? slugify(p.nombre),
      subtipo: local?.subtipo,
      precioOferta: oferta?.precioOferta,
      imagenPrincipal: imagen?.url,
      // El stock se repite en cada talla: el del producto es el mayor
      stockDisponible: Math.max(0, ...stocks.map((s) => s?.stockDisponible ?? 0)),
      stockMinimo: stocks[0]?.stockMinimo ?? 0,
      // Con tallas, el SKU de cada una termina en -1, -2...: se quita
      sku: local?.sku ?? (valores.length > 0 ? susVariantes[0]?.sku.replace(/-\d+$/, '') : susVariantes[0]?.sku),
      proveedor: local?.proveedor,
      especificaciones: (especificaciones.get(p.idProducto) ?? []).map((e) => ({ nombre: e.nombre, valor: e.valor })),
      variantes: valores.length > 0
        ? { nombre: guia?.nombre ?? 'Talla', columna: guia?.columna ?? 'Detalle', guia: guia?.guia ?? 'Medidas disponibles', nota: guia?.nota ?? '', valores }
        : undefined,
      // Sin tallas: la variante unica (la usa el carrito)
      idVariante: valores.length === 0 ? susVariantes[0]?.idVarianteProducto : undefined
    };
  };
};
