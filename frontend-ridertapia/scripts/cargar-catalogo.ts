/// <reference types="node" />
// Carga el catalogo en el backend por la API (POST).
// Uso: npx tsx scripts/cargar-catalogo.ts
import axios from 'axios';
import { categorias } from '../src/data/categorias';
import { marcas, productos } from '../src/data/productos';

const api = axios.create({ baseURL: `${process.env.API_URL ?? 'http://localhost:9000'}/api/v1` });

// POST que devuelve el id generado por la BD
const crear = async (ruta: string, cuerpo: object, campoId: string): Promise<number> => {
  const { data } = await api.post<Record<string, unknown>>(ruta, cuerpo);
  const id = data[campoId];
  if (typeof id !== 'number') throw new Error(`${ruta} no devolvio ${campoId}`);
  return id;
};

// Id local con su id del backend
const idDe = (mapa: Map<number, number>, idLocal: number): number => {
  const id = mapa.get(idLocal);
  if (id === undefined) throw new Error(`Falta el id ${idLocal}`);
  return id;
};

const soloFecha = (d: Date): string => d.toISOString().slice(0, 10);
const fechaHora = (d: Date): string => d.toISOString().slice(0, 19);

const main = async (): Promise<void> => {
  // Evita cargar dos veces
  const { data } = await api.get<{ _embedded?: unknown }>('/productos');
  if (data._embedded) {
    console.log('El backend ya tiene productos. No se cargo nada.');
    return;
  }

  // Categorias: primero las padre, para conocer su id
  const idsCategoria = new Map<number, number>();
  const ordenadas = [...categorias].sort((a, b) => Number(a.categoriaPadre !== null) - Number(b.categoriaPadre !== null));
  for (const c of ordenadas) {
    const padre = c.categoriaPadre ? { idCategoria: idDe(idsCategoria, c.categoriaPadre.idCategoria) } : null;
    const id = await crear('/categorias', { nombre: c.nombre, descripcion: c.descripcion, activa: c.activa, categoriaPadre: padre }, 'idCategoria');
    idsCategoria.set(c.idCategoria, id);
  }
  console.log(`Categorias: ${idsCategoria.size}`);

  const idsMarca = new Map<number, number>();
  for (const m of marcas) {
    idsMarca.set(m.idMarca, await crear('/marcas', { nombre: m.nombre, activa: m.activa }, 'idMarca'));
  }
  console.log(`Marcas: ${idsMarca.size}`);

  const hoy = new Date();
  const enUnAnio = new Date(hoy);
  enUnAnio.setFullYear(hoy.getFullYear() + 1);
  let totalVariantes = 0;

  for (const p of productos) {
    const idProducto = await crear('/productos', {
      nombre: p.nombre,
      descripcion: p.descripcion,
      precioNormal: p.precioNormal,
      estado: p.estado,
      destacado: p.destacado,
      ordenDestacado: p.ordenDestacado,
      limitePorCompra: p.limitePorCompra,
      fechaCreacion: p.fechaCreacion,
      categoria: { idCategoria: idDe(idsCategoria, p.categoria.idCategoria) },
      marca: { idMarca: idDe(idsMarca, p.marca.idMarca) },
      compatibilidades: []
    }, 'idProducto');
    const producto = { idProducto };

    if (p.imagenPrincipal) {
      await crear('/imagenes', { url: p.imagenPrincipal, orden: 1, esPrincipal: true, producto }, 'idImagenProducto');
    }
    if (p.precioOferta !== undefined) {
      await crear('/ofertas', { precioOferta: p.precioOferta, fechaInicio: soloFecha(hoy), fechaTermino: soloFecha(enUnAnio), producto }, 'idOferta');
    }
    for (const e of p.especificaciones ?? []) {
      await crear('/especificaciones', { nombre: e.nombre, valor: e.valor, producto }, 'idEspecificacionTecnica');
    }

    // Sin tallas: una variante unica para poder tener stock
    const sku = p.sku ?? `PRD-${p.idProducto}`;
    const esColor = p.variantes?.nombre === 'Color';
    const valores = p.variantes?.valores ?? [{ valor: '', detalle: '', disponible: true }];
    for (const [i, v] of valores.entries()) {
      const idVariante = await crear('/variantes', {
        sku: p.variantes ? `${sku}-${i + 1}` : sku,
        talla: v.valor && !esColor ? v.valor : null,
        color: v.valor && esColor ? v.valor : null,
        aro: null,
        producto
      }, 'idVarianteProducto');

      // Mismo stock en cada talla; las agotadas quedan en 0
      await crear('/items-inventario', {
        idVariante,
        stockDisponible: v.disponible ? (p.stockDisponible ?? 0) : 0,
        stockReservado: 0,
        stockMinimo: p.stockMinimo ?? 0,
        costoPromedio: 0,
        fechaActualizacion: fechaHora(new Date()),
        idProveedores: []
      }, 'idItemInventario');
      totalVariantes++;
    }
    console.log(`${idProducto}/${productos.length} ${p.nombre}`);
  }

  console.log(`Listo: ${productos.length} productos y ${totalVariantes} variantes con stock`);
};

main().catch((err: unknown) => {
  if (axios.isAxiosError(err)) {
    console.error(`Error ${err.response?.status ?? ''} en ${err.config?.method?.toUpperCase() ?? ''} ${err.config?.url ?? ''}`);
    console.error(err.response?.data ?? err.message);
  } else {
    console.error(err);
  }
  process.exit(1);
});
