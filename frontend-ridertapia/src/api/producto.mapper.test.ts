import { describe, expect, it } from 'vitest';
import { aCategoria, crearMapper, type DatosCatalogo } from './producto.mapper';
import type { CategoriaApi, ProductoApi } from './tipos';

// Nombres que no existen en los datos locales: el mapper no los completa con nada
const CATEGORIA: CategoriaApi = { idCategoria: 1, nombre: 'Categoria de prueba', descripcion: null, activa: true, categoriaPadre: null };

const productoApi = (cambios: Partial<ProductoApi> = {}): ProductoApi => ({
  idProducto: 1,
  nombre: 'Producto de prueba',
  descripcion: 'Descripcion',
  precioNormal: 20000,
  estado: 'PUBLICADO',
  destacado: false,
  ordenDestacado: null,
  limitePorCompra: 5,
  fechaCreacion: '2026-01-01T00:00:00',
  categoria: CATEGORIA,
  marca: { idMarca: 1, nombre: 'Marca', activa: true },
  ...cambios
});

const sinDatos: DatosCatalogo = { imagenes: [], ofertas: [], especificaciones: [], variantes: [], inventario: [] };
const ref = { idProducto: 1 };

const stock = (idVariante: number, stockDisponible: number, stockMinimo = 2) => ({
  idItemInventario: idVariante, idVariante, stockDisponible, stockReservado: 0, stockMinimo, costoPromedio: 0, fechaActualizacion: '2026-01-01T00:00:00'
});

describe('Mapper del catálogo: categoría', () => {
  it('genera el slug a partir del nombre si no hay datos locales', () => {
    expect(aCategoria({ ...CATEGORIA, nombre: 'Ropa de Ciclismo' }).slug).toBe('ropa-de-ciclismo');
  });

  it('convierte también la categoría padre', () => {
    const hija = aCategoria({ ...CATEGORIA, nombre: 'Hija', categoriaPadre: { ...CATEGORIA, nombre: 'Padre' } });
    expect(hija.categoriaPadre?.nombre).toBe('Padre');
    expect(hija.categoriaPadre?.slug).toBe('padre');
  });
});

describe('Mapper del catálogo: producto', () => {
  it('copia los datos básicos del producto', () => {
    const p = crearMapper(sinDatos)(productoApi());
    expect(p).toMatchObject({ idProducto: 1, nombre: 'Producto de prueba', precioNormal: 20000, limitePorCompra: 5, estado: 'PUBLICADO' });
    expect(p.slug).toBe('producto-de-prueba');
  });

  it('usa la imagen marcada como principal', () => {
    const datos: DatosCatalogo = {
      ...sinDatos,
      imagenes: [
        { idImagenProducto: 1, url: 'secundaria.jpg', orden: 2, esPrincipal: false, producto: ref },
        { idImagenProducto: 2, url: 'principal.jpg', orden: 1, esPrincipal: true, producto: ref }
      ]
    };
    expect(crearMapper(datos)(productoApi()).imagenPrincipal).toBe('principal.jpg');
  });

  it('aplica la oferta vigente y descarta la vencida', () => {
    const vigente = { idOferta: 1, precioOferta: 15000, fechaInicio: '2000-01-01', fechaTermino: '2999-12-31', producto: ref };
    const vencida = { idOferta: 2, precioOferta: 9000, fechaInicio: '2000-01-01', fechaTermino: '2000-12-31', producto: ref };
    expect(crearMapper({ ...sinDatos, ofertas: [vigente] })(productoApi()).precioOferta).toBe(15000);
    expect(crearMapper({ ...sinDatos, ofertas: [vencida] })(productoApi()).precioOferta).toBeUndefined();
  });

  it('une las especificaciones técnicas del producto y no las de otro', () => {
    const datos: DatosCatalogo = {
      ...sinDatos,
      especificaciones: [
        { idEspecificacionTecnica: 1, nombre: 'Peso', valor: '300 g', producto: ref },
        { idEspecificacionTecnica: 2, nombre: 'Color', valor: 'Rojo', producto: { idProducto: 99 } }
      ]
    };
    expect(crearMapper(datos)(productoApi()).especificaciones).toEqual([{ nombre: 'Peso', valor: '300 g' }]);
  });
});

describe('Mapper del catálogo: variantes y stock', () => {
  it('sin tallas: guarda la variante única y el stock de esa variante', () => {
    const datos: DatosCatalogo = {
      ...sinDatos,
      variantes: [{ idVarianteProducto: 10, sku: 'CAS-001', talla: null, color: null, aro: null, producto: ref }],
      inventario: [stock(10, 7, 3)]
    };
    const p = crearMapper(datos)(productoApi());
    expect(p.idVariante).toBe(10);
    expect(p.variantes).toBeUndefined();
    expect(p.stockDisponible).toBe(7);
    expect(p.stockMinimo).toBe(3);
    expect(p.sku).toBe('CAS-001');
  });

  it('con tallas: crea la lista de valores y marca como no disponible la que no tiene stock', () => {
    const datos: DatosCatalogo = {
      ...sinDatos,
      variantes: [
        { idVarianteProducto: 11, sku: 'CAS-002-1', talla: 'M', color: null, aro: null, producto: ref },
        { idVarianteProducto: 12, sku: 'CAS-002-2', talla: 'L', color: null, aro: null, producto: ref }
      ],
      inventario: [stock(11, 4), stock(12, 0)]
    };
    const p = crearMapper(datos)(productoApi());
    expect(p.idVariante).toBeUndefined();
    expect(p.variantes?.valores.map((v) => [v.valor, v.disponible, v.idVariante])).toEqual([['M', true, 11], ['L', false, 12]]);
    // El SKU del producto no lleva el sufijo -1, -2 de cada talla
    expect(p.sku).toBe('CAS-002');
  });

  it('el stock del producto es el mayor entre sus tallas', () => {
    const datos: DatosCatalogo = {
      ...sinDatos,
      variantes: [
        { idVarianteProducto: 11, sku: 'X-1', talla: 'M', color: null, aro: null, producto: ref },
        { idVarianteProducto: 12, sku: 'X-2', talla: 'L', color: null, aro: null, producto: ref }
      ],
      inventario: [stock(11, 3), stock(12, 9)]
    };
    expect(crearMapper(datos)(productoApi()).stockDisponible).toBe(9);
  });

  it('sin variantes ni inventario: el stock queda en 0', () => {
    const p = crearMapper(sinDatos)(productoApi());
    expect(p.stockDisponible).toBe(0);
    expect(p.idVariante).toBeUndefined();
  });
});
