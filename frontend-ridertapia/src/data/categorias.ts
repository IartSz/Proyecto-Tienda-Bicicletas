import type { Categoria } from '../models/Categoria';

// Datos locales; más adelante se reemplazan por la API de ms-productos

// Grupos del menú (categorías padre)
const INDUMENTARIA: Categoria = {
  idCategoria: 1,
  nombre: 'Indumentaria',
  descripcion: 'Cascos, protecciones y ropa para salir a rodar.',
  activa: true,
  categoriaPadre: null,
  slug: 'indumentaria',
  icono: 'bi-person-arms-up'
};

const ACCESORIOS: Categoria = {
  idCategoria: 2,
  nombre: 'Accesorios',
  descripcion: 'Todo lo que le suma a tu bici y a tus salidas.',
  activa: true,
  categoriaPadre: null,
  slug: 'accesorios',
  icono: 'bi-backpack2'
};

const COMPONENTES: Categoria = {
  idCategoria: 3,
  nombre: 'Componentes',
  descripcion: 'Repuestos para mantener tu bici en marcha.',
  activa: true,
  categoriaPadre: null,
  slug: 'componentes',
  icono: 'bi-gear-wide-connected'
};

const RUEDAS: Categoria = {
  idCategoria: 4,
  nombre: 'Ruedas',
  descripcion: 'Neumáticos y cámaras para cada terreno.',
  activa: true,
  categoriaPadre: null,
  slug: 'ruedas',
  icono: 'bi-circle'
};

export const categorias: Categoria[] = [
  INDUMENTARIA,
  ACCESORIOS,
  COMPONENTES,
  RUEDAS,
  {
    idCategoria: 5,
    nombre: 'Cascos',
    descripcion: 'Protección para ciudad, trail y enduro.',
    activa: true,
    categoriaPadre: INDUMENTARIA,
    slug: 'cascos',
    icono: 'bi-shield'
  },
  {
    idCategoria: 6,
    nombre: 'Rodilleras',
    descripcion: 'Protege tus rodillas sin perder movilidad.',
    activa: true,
    categoriaPadre: INDUMENTARIA,
    slug: 'rodilleras',
    icono: 'bi-shield-plus'
  },
  {
    idCategoria: 7,
    nombre: 'Guantes',
    descripcion: 'Agarre, tacto y protección para tus manos.',
    activa: true,
    categoriaPadre: INDUMENTARIA,
    slug: 'guantes',
    icono: 'bi-hand-index-thumb'
  },
  {
    idCategoria: 8,
    nombre: 'Cortavientos',
    descripcion: 'Livianos y plegables para cuando cambia el clima.',
    activa: true,
    categoriaPadre: INDUMENTARIA,
    slug: 'cortavientos',
    icono: 'bi-wind'
  },
  {
    idCategoria: 9,
    nombre: 'Bombines',
    descripcion: 'Para la casa, la mochila o la suspensión.',
    activa: true,
    categoriaPadre: ACCESORIOS,
    slug: 'bombines',
    icono: 'bi-fuel-pump'
  },
  {
    idCategoria: 10,
    nombre: 'Botellas',
    descripcion: 'Hidratación para cada salida.',
    activa: true,
    categoriaPadre: ACCESORIOS,
    slug: 'botellas',
    icono: 'bi-cup-straw'
  },
  {
    idCategoria: 11,
    nombre: 'Luces',
    descripcion: 'Que la noche no pare la ruta.',
    activa: true,
    categoriaPadre: ACCESORIOS,
    slug: 'luces',
    icono: 'bi-lightbulb'
  },
  {
    idCategoria: 12,
    nombre: 'Puños',
    descripcion: 'Comodidad y control en el manubrio.',
    activa: true,
    categoriaPadre: ACCESORIOS,
    slug: 'punos',
    icono: 'bi-grip-horizontal'
  },
  {
    idCategoria: 13,
    nombre: 'Sillines',
    descripcion: 'Comodidad para ruta, trail o ciudad.',
    activa: true,
    categoriaPadre: ACCESORIOS,
    slug: 'sillines',
    icono: 'bi-bicycle'
  },
  {
    idCategoria: 14,
    nombre: 'Tapabarros',
    descripcion: 'Que el barro se quede en el camino.',
    activa: true,
    categoriaPadre: ACCESORIOS,
    slug: 'tapabarros',
    icono: 'bi-cloud-drizzle'
  },
  {
    idCategoria: 15,
    nombre: 'Transmisión',
    descripcion: 'Cadenas, cassettes, mandos y cambios.',
    activa: true,
    categoriaPadre: COMPONENTES,
    slug: 'transmision',
    icono: 'bi-gear-wide-connected'
  },
  {
    idCategoria: 16,
    nombre: 'Frenos',
    descripcion: 'Frenos, pastillas y rotores.',
    activa: true,
    categoriaPadre: COMPONENTES,
    slug: 'frenos',
    icono: 'bi-disc'
  },
  {
    idCategoria: 17,
    nombre: 'Mazas',
    descripcion: 'Mazas delanteras y traseras.',
    activa: true,
    categoriaPadre: COMPONENTES,
    slug: 'mazas',
    icono: 'bi-bullseye'
  },
  {
    idCategoria: 18,
    nombre: 'Pedales',
    descripcion: 'Planos o de clip, para cada estilo.',
    activa: true,
    categoriaPadre: COMPONENTES,
    slug: 'pedales',
    icono: 'bi-gear'
  },
  {
    idCategoria: 19,
    nombre: 'Manubrios',
    descripcion: 'Control y posición sobre la bici.',
    activa: true,
    categoriaPadre: COMPONENTES,
    slug: 'manubrios',
    icono: 'bi-arrows-angle-expand'
  },
  {
    idCategoria: 20,
    nombre: 'Neumáticos',
    descripcion: 'Agarre y rendimiento para cada terreno.',
    activa: true,
    categoriaPadre: RUEDAS,
    slug: 'neumaticos',
    icono: 'bi-circle'
  },
  {
    idCategoria: 21,
    nombre: 'Cámaras',
    descripcion: 'Cámaras de repuesto para todas las medidas.',
    activa: true,
    categoriaPadre: RUEDAS,
    slug: 'camaras',
    icono: 'bi-record-circle'
  },
  {
    idCategoria: 22,
    nombre: 'Suspensiones',
    descripcion: 'Horquillas para XC, trail y enduro.',
    activa: true,
    categoriaPadre: null,
    slug: 'suspensiones',
    icono: 'bi-arrow-down-up'
  },
  {
    idCategoria: 23,
    nombre: 'Mantenimiento',
    descripcion: 'Mantenciones en nuestro taller.',
    activa: true,
    categoriaPadre: null,
    slug: 'mantenimiento',
    icono: 'bi-tools'
  }
];

export const buscarCategoriaPorSlug = (slug: string): Categoria | undefined =>
  categorias.find((c) => c.slug === slug);

// Categorías que dependen de un grupo del menú
export const subcategoriasDe = (slugPadre: string): Categoria[] =>
  categorias.filter((c) => c.categoriaPadre?.slug === slugPadre);

// Categorias que pueden tener productos (sin subcategorias)
export const categoriasConProductos = (): Categoria[] =>
  categorias.filter((c) => subcategoriasDe(c.slug ?? '').length === 0);
