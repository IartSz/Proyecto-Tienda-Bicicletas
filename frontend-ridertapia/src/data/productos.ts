import type { Categoria } from '../models/Categoria';
import type { Marca, Producto, Variantes } from '../models/Producto';
import { buscarCategoriaPorSlug } from './categorias';

// Catalogo del modo local; con backend lo carga ms-productos al arrancar

const FECHA_CARGA = '2026-03-01T00:00:00';

// Máximo de unidades de un producto por compra
export const LIMITE_POR_COMPRA = 10;

// Guías de tallas y medidas (se repiten en varios productos)
type GuiaVariantes = Omit<Variantes, 'valores'>;

const TALLA: GuiaVariantes = {
  nombre: 'Talla',
  columna: 'Circunferencia de cabeza',
  guia: 'Guía de tallas',
  nota: 'Mide tu cabeza con una huincha, 2 cm sobre las cejas.'
};

const TALLA_RODILLERA: GuiaVariantes = {
  nombre: 'Talla',
  columna: 'Contorno de muslo',
  guia: 'Guía de tallas',
  nota: 'Mide tu muslo con una huincha, unos 10 cm sobre la rodilla y con la pierna estirada.'
};

const TALLA_GUANTE: GuiaVariantes = {
  nombre: 'Talla',
  columna: 'Largo de la mano',
  guia: 'Guía de tallas',
  nota: 'Mide tu mano desde la muñeca hasta la punta del dedo del medio.'
};

const TALLA_ROPA: GuiaVariantes = {
  nombre: 'Talla',
  columna: 'Contorno de pecho',
  guia: 'Guía de tallas',
  nota: 'Mide tu pecho con una huincha por la parte más ancha.'
};

const COLOR: GuiaVariantes = {
  nombre: 'Color',
  columna: 'Terminación',
  guia: 'Colores disponibles',
  nota: ''
};

const ANCHO_SILLIN: GuiaVariantes = {
  nombre: 'Ancho',
  columna: 'Distancia entre isquiones',
  guia: 'Medidas disponibles',
  nota: 'Siéntate sobre un cartón y mide la distancia entre las dos marcas que quedan. Si tienes dudas, pregúntanos en la tienda.'
};

const RISE: GuiaVariantes = {
  nombre: 'Rise',
  columna: 'Uso recomendado',
  guia: 'Medidas disponibles',
  nota: 'El rise es cuánto sube el manubrio desde el centro. Más rise, posición más erguida.'
};

const MEDIDA_NEUMATICO: GuiaVariantes = {
  nombre: 'Medida',
  columna: 'Uso recomendado',
  guia: 'Medidas disponibles',
  nota: 'La medida está impresa en el costado de tu neumático actual (ej: 29 x 2.4).'
};

const MEDIDA_CAMARA: GuiaVariantes = {
  nombre: 'Medida',
  columna: 'Válvula',
  guia: 'Medidas disponibles',
  nota: 'La cámara debe coincidir con el aro y el rango de ancho de tu neumático. Revisa si tu aro usa válvula Presta (delgada) o Schrader (tipo auto).'
};

export const marcas: Marca[] = [
  { idMarca: 1, nombre: 'Leatt', activa: true },
  { idMarca: 2, nombre: 'Fox', activa: true },
  { idMarca: 3, nombre: 'Bell', activa: true },
  { idMarca: 4, nombre: 'Giro', activa: true },
  { idMarca: 5, nombre: 'Alpinestars', activa: true },
  { idMarca: 6, nombre: 'POC', activa: true },
  { idMarca: 7, nombre: 'Gobik', activa: true },
  { idMarca: 8, nombre: 'Bicycle Line', activa: true },
  { idMarca: 9, nombre: 'Blackburn', activa: true },
  { idMarca: 10, nombre: 'Oxford', activa: true },
  { idMarca: 11, nombre: 'Zéfal', activa: true },
  { idMarca: 12, nombre: 'Camelbak', activa: true },
  { idMarca: 13, nombre: 'NiteRider', activa: true },
  { idMarca: 14, nombre: 'Serfas', activa: true },
  { idMarca: 15, nombre: 'ODI', activa: true },
  { idMarca: 16, nombre: 'Ergon', activa: true },
  { idMarca: 17, nombre: '715 Industries', activa: true },
  { idMarca: 18, nombre: 'Cannondale', activa: true },
  { idMarca: 19, nombre: 'Peaty\'s', activa: true },
  { idMarca: 20, nombre: 'Marsh Guard', activa: true },
  { idMarca: 21, nombre: 'SRAM', activa: true },
  { idMarca: 22, nombre: 'Shimano', activa: true },
  { idMarca: 23, nombre: 'Magura', activa: true },
  { idMarca: 24, nombre: 'Hope', activa: true },
  { idMarca: 25, nombre: 'OneUp', activa: true },
  { idMarca: 26, nombre: 'Deity', activa: true },
  { idMarca: 27, nombre: 'HT Components', activa: true },
  { idMarca: 28, nombre: 'Renthal', activa: true },
  { idMarca: 29, nombre: 'Title', activa: true },
  { idMarca: 30, nombre: 'Maxxis', activa: true },
  { idMarca: 31, nombre: 'Schwalbe', activa: true },
  { idMarca: 32, nombre: 'Continental', activa: true },
  { idMarca: 33, nombre: 'Kenda', activa: true },
  { idMarca: 34, nombre: 'Chaoyang', activa: true },
  { idMarca: 35, nombre: 'Arisun', activa: true },
  { idMarca: 36, nombre: 'RideNow', activa: true },
  { idMarca: 37, nombre: 'RockShox', activa: true },
  { idMarca: 38, nombre: 'Marzocchi', activa: true },
  { idMarca: 39, nombre: 'Rider Tapia', activa: true }
];

const categoria = (slug: string): Categoria => {
  const encontrada = buscarCategoriaPorSlug(slug);
  if (!encontrada) throw new Error(`Categoría no encontrada: ${slug}`);
  return encontrada;
};

const marca = (nombre: string): Marca => {
  const encontrada = marcas.find((m) => m.nombre === nombre);
  if (!encontrada) throw new Error(`Marca no encontrada: ${nombre}`);
  return encontrada;
};

export const productos: Producto[] = [
  {
    idProducto: 1,
    nombre: 'Casco Leatt AllMtn 1.0 Titanium',
    descripcion: 'El AllMtn 1.0 te da la protección de un full-face en las bajadas y la ventilación de un casco abierto en las subidas: la mentonera se saca en segundos. Acabado Titanium.',
    precioNormal: 109990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('cascos'),
    marca: marca('Leatt'),
    slug: 'leatt-allmtn-10',
    subtipo: 'Enduro / Convertible',
    imagenPrincipal: '/img/productos/cascos/leatt-allmtn-10.jpg',
    stockDisponible: 0,
    stockMinimo: 4,
    sku: 'CAS-0001',
    proveedor: 'Leatt Chile',
    especificaciones: [
      { nombre: 'Uso', valor: 'Enduro, All Mountain' },
      { nombre: 'Mentonera', valor: 'Desmontable' },
      { nombre: 'Peso aprox.', valor: '750 g' },
      { nombre: 'Ventilaciones', valor: '16' },
      { nombre: 'Certificación', valor: 'EN 1078 / CPSC' },
      { nombre: 'Color', valor: 'Titanium' }
    ],
    variantes: {
      ...TALLA,
      valores: [
        { valor: 'S', detalle: '51–55 cm', disponible: true },
        { valor: 'M', detalle: '55–59 cm', disponible: true },
        { valor: 'L', detalle: '59–63 cm', disponible: false }
      ]
    }
  },
  {
    idProducto: 2,
    nombre: 'Casco Fox Speedframe MIPS',
    descripcion: 'Pensado para largas jornadas de trail: liviano, bien ventilado y con sistema MIPS que reduce las fuerzas de rotación en caso de impacto. Visera ajustable y ajuste trasero con rueda.',
    precioNormal: 89990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('cascos'),
    marca: marca('Fox'),
    slug: 'fox-speedframe-mips',
    subtipo: 'Trail / MTB',
    imagenPrincipal: '/img/productos/cascos/fox-speedframe-mips.jpg',
    stockDisponible: 7,
    stockMinimo: 3,
    sku: 'CAS-0002',
    proveedor: 'Fox Racing Chile',
    especificaciones: [
      { nombre: 'Uso', valor: 'Trail, XC' },
      { nombre: 'Sistema MIPS', valor: 'Sí' },
      { nombre: 'Peso aprox.', valor: '380 g' },
      { nombre: 'Ventilaciones', valor: '14' },
      { nombre: 'Certificación', valor: 'EN 1078 / CPSC' },
      { nombre: 'Color', valor: 'Negro' }
    ],
    variantes: {
      ...TALLA,
      valores: [
        { valor: 'S', detalle: '51–55 cm', disponible: true },
        { valor: 'M', detalle: '55–59 cm', disponible: true },
        { valor: 'L', detalle: '59–63 cm', disponible: true }
      ]
    }
  },
  {
    idProducto: 3,
    nombre: 'Casco Bell Super Air R MIPS',
    descripcion: 'Uno de los convertibles más ventilados del mercado. Mentonera removible, MIPS, soporte para antiparras y montaje para cámara o luz.',
    precioNormal: 219990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('cascos'),
    marca: marca('Bell'),
    slug: 'bell-super-air-r',
    subtipo: 'Enduro / Convertible',
    precioOferta: 179990,
    imagenPrincipal: '/img/productos/cascos/bell-super-air-r.jpg',
    stockDisponible: 3,
    stockMinimo: 2,
    sku: 'CAS-0003',
    proveedor: 'Bell Latam',
    especificaciones: [
      { nombre: 'Uso', valor: 'Enduro, Descenso ligero' },
      { nombre: 'Mentonera', valor: 'Desmontable' },
      { nombre: 'Sistema MIPS', valor: 'Sí' },
      { nombre: 'Peso aprox.', valor: '800 g' },
      { nombre: 'Ventilaciones', valor: '18' },
      { nombre: 'Certificación', valor: 'EN 1078 / CPSC' },
      { nombre: 'Color', valor: 'Rojo / Gris' }
    ],
    variantes: {
      ...TALLA,
      valores: [
        { valor: 'S', detalle: '52–56 cm', disponible: false },
        { valor: 'M', detalle: '55–59 cm', disponible: true },
        { valor: 'L', detalle: '58–62 cm', disponible: true }
      ]
    }
  },
  {
    idProducto: 4,
    nombre: 'Casco Giro Register MIPS',
    descripcion: 'Casco de talla única con ajuste por rueda. Cómodo, liviano y con MIPS, perfecto para moverse por la ciudad o salir al cerro.',
    precioNormal: 49990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('cascos'),
    marca: marca('Giro'),
    slug: 'giro-register-mips',
    subtipo: 'Urbano / MTB',
    imagenPrincipal: '/img/productos/cascos/giro-register-mips.jpg',
    stockDisponible: 12,
    stockMinimo: 4,
    sku: 'CAS-0004',
    proveedor: 'Giro Latam',
    especificaciones: [
      { nombre: 'Uso', valor: 'Urbano, MTB recreativo' },
      { nombre: 'Sistema MIPS', valor: 'Sí' },
      { nombre: 'Peso aprox.', valor: '320 g' },
      { nombre: 'Ventilaciones', valor: '22' },
      { nombre: 'Certificación', valor: 'EN 1078 / CPSC' },
      { nombre: 'Color', valor: 'Titanium mate' }
    ],
    variantes: {
      ...TALLA,
      valores: [
        { valor: 'Única', detalle: '54–61 cm', disponible: true }
      ]
    }
  },
  {
    idProducto: 5,
    nombre: 'Casco Fox Mainframe MIPS',
    descripcion: 'Casco de trail con MIPS integrado al sistema de ajuste y mayor cobertura en la nuca. Espuma EPS moldeada para una buena ventilación y forro desmontable y lavable que evacúa la humedad.',
    precioNormal: 79990,
    estado: 'PUBLICADO',
    destacado: true,
    ordenDestacado: 1,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('cascos'),
    marca: marca('Fox'),
    slug: 'fox-mainframe-mips',
    subtipo: 'Trail / MTB',
    precioOferta: 59990,
    imagenPrincipal: '/img/productos/cascos/fox-mainframe-mips.jpg',
    stockDisponible: 10,
    stockMinimo: 4,
    sku: 'CAS-0005',
    proveedor: 'Fox Racing Chile',
    especificaciones: [
      { nombre: 'Uso', valor: 'Trail, XC' },
      { nombre: 'Sistema MIPS', valor: 'Sí' },
      { nombre: 'Peso aprox.', valor: '390 g' },
      { nombre: 'Forro', valor: 'Desmontable y lavable' },
      { nombre: 'Certificación', valor: 'EN 1078 / CPSC' },
      { nombre: 'Color', valor: 'Azul' }
    ],
    variantes: {
      ...TALLA,
      valores: [
        { valor: 'S', detalle: '51–55 cm', disponible: true },
        { valor: 'M', detalle: '55–59 cm', disponible: true },
        { valor: 'L', detalle: '59–63 cm', disponible: true }
      ]
    }
  },
  {
    idProducto: 6,
    nombre: 'Casco Bell 4Forty Air MIPS',
    descripcion: 'Casco de trail con cobertura extendida, visera ajustable en tres posiciones compatible con antiparras y sistema Float Fit con MIPS. Hebilla magnética y puertos para guardar los lentes.',
    precioNormal: 99990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('cascos'),
    marca: marca('Bell'),
    slug: 'bell-4forty-air-mips',
    subtipo: 'Trail / Enduro',
    imagenPrincipal: '/img/productos/cascos/bell-4forty-air-mips.jpg',
    stockDisponible: 5,
    stockMinimo: 3,
    sku: 'CAS-0006',
    proveedor: 'Bell Latam',
    especificaciones: [
      { nombre: 'Uso', valor: 'Trail, Enduro' },
      { nombre: 'Sistema MIPS', valor: 'Sí (Float Fit)' },
      { nombre: 'Visera', valor: 'Ajustable, 3 posiciones' },
      { nombre: 'Hebilla', valor: 'Magnética' },
      { nombre: 'Certificación', valor: 'EN 1078 / CPSC' },
      { nombre: 'Color', valor: 'Verde' }
    ],
    variantes: {
      ...TALLA,
      valores: [
        { valor: 'M', detalle: '55–59 cm', disponible: true },
        { valor: 'L', detalle: '58–62 cm', disponible: true },
        { valor: 'XL', detalle: '61–65 cm', disponible: false }
      ]
    }
  },
  {
    idProducto: 7,
    nombre: 'Casco Integral Bell Sanction 2',
    descripcion: 'Casco integral para bikepark, BMX y descenso con la protección de un modelo mucho más caro. 14 ventilaciones, relleno Ventilated DH Air y almohadillas de mejillas extraíbles y lavables.',
    precioNormal: 99990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('cascos'),
    marca: marca('Bell'),
    slug: 'bell-sanction-2',
    subtipo: 'Integral / Bikepark',
    imagenPrincipal: '/img/productos/cascos/bell-sanction-2.jpg',
    stockDisponible: 6,
    stockMinimo: 2,
    sku: 'CAS-0007',
    proveedor: 'Bell Latam',
    especificaciones: [
      { nombre: 'Uso', valor: 'Bikepark, BMX, Descenso' },
      { nombre: 'Tipo', valor: 'Integral (full face)' },
      { nombre: 'Ventilaciones', valor: '14' },
      { nombre: 'Relleno', valor: 'Ventilated DH Air' },
      { nombre: 'Certificación', valor: 'EN 1078 / CPSC' },
      { nombre: 'Color', valor: 'Negro mate' }
    ],
    variantes: {
      ...TALLA,
      valores: [
        { valor: 'XS/S', detalle: '51–55 cm', disponible: true },
        { valor: 'M', detalle: '55–57 cm', disponible: true },
        { valor: 'L', detalle: '57–59 cm', disponible: true },
        { valor: 'XL', detalle: '59–61 cm', disponible: true }
      ]
    }
  },
  {
    idProducto: 8,
    nombre: 'Casco Integral Fox Rampage Comp MIPS',
    descripcion: 'Casco integral de descenso con calota liviana de fibra de vidrio y sistema MIPS. Visera totalmente regulable compatible con antiparras y forro transpirable, desmontable y lavable.',
    precioNormal: 299990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('cascos'),
    marca: marca('Fox'),
    slug: 'fox-rampage-comp',
    subtipo: 'Integral / Descenso',
    precioOferta: 224990,
    imagenPrincipal: '/img/productos/cascos/fox-rampage-comp.jpg',
    stockDisponible: 3,
    stockMinimo: 2,
    sku: 'CAS-0008',
    proveedor: 'Fox Racing Chile',
    especificaciones: [
      { nombre: 'Uso', valor: 'Descenso, Enduro, Bikepark' },
      { nombre: 'Tipo', valor: 'Integral (full face)' },
      { nombre: 'Calota', valor: 'Fibra de vidrio' },
      { nombre: 'Sistema MIPS', valor: 'Sí' },
      { nombre: 'Cierre', valor: 'Doble anilla D' },
      { nombre: 'Certificación', valor: 'ASTM F1952 / CPSC / EN 1078' },
      { nombre: 'Color', valor: 'Negro / Blanco' }
    ],
    variantes: {
      ...TALLA,
      valores: [
        { valor: 'S', detalle: '55–56 cm', disponible: true },
        { valor: 'M', detalle: '57–58 cm', disponible: true },
        { valor: 'L', detalle: '59–60 cm', disponible: true },
        { valor: 'XL', detalle: '61–62 cm', disponible: false }
      ]
    }
  },
  {
    idProducto: 9,
    nombre: 'Casco Bell Avenue MIPS',
    descripcion: 'Casco urbano y de ruta recreativa con MIPS integrado al ajuste Ergo Fit y construcción Fusion In-Mold. Una de las opciones más populares para el uso diario en la ciudad o la ciclovía.',
    precioNormal: 69990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('cascos'),
    marca: marca('Bell'),
    slug: 'bell-avenue-mips',
    subtipo: 'Urbano / Ruta',
    precioOferta: 44990,
    imagenPrincipal: '/img/productos/cascos/bell-avenue-mips.jpg',
    stockDisponible: 12,
    stockMinimo: 4,
    sku: 'CAS-0009',
    proveedor: 'Bell Latam',
    especificaciones: [
      { nombre: 'Uso', valor: 'Urbano, Ruta recreativa' },
      { nombre: 'Sistema MIPS', valor: 'Sí' },
      { nombre: 'Construcción', valor: 'Fusion In-Mold' },
      { nombre: 'Ajuste', valor: 'Ergo Fit' },
      { nombre: 'Certificación', valor: 'EN 1078 / CPSC' },
      { nombre: 'Color', valor: 'Gris' }
    ],
    variantes: {
      ...TALLA,
      valores: [
        { valor: 'Única', detalle: '54–61 cm', disponible: true }
      ]
    }
  },
  {
    idProducto: 10,
    nombre: 'Rodilleras Fox Launch D3O',
    descripcion: 'Rodillera que combina protección y movilidad sobre la bici. Piezas de D3O extraíbles que absorben los impactos y diseño en malla y Ariaprene para una buena ventilación.',
    precioNormal: 99990,
    estado: 'PUBLICADO',
    destacado: true,
    ordenDestacado: 2,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('rodilleras'),
    marca: marca('Fox'),
    slug: 'fox-launch-d3o',
    subtipo: 'Enduro / Trail',
    precioOferta: 69990,
    imagenPrincipal: '/img/productos/rodilleras/fox-launch-d3o.jpg',
    stockDisponible: 8,
    stockMinimo: 3,
    sku: 'ROD-0001',
    proveedor: 'Fox Racing Chile',
    especificaciones: [
      { nombre: 'Uso', valor: 'Enduro, Trail, Bikepark' },
      { nombre: 'Protección', valor: 'D3O extraíble' },
      { nombre: 'Material', valor: 'Malla y Ariaprene' },
      { nombre: 'Certificación', valor: 'EN 1621-1 nivel 1' },
      { nombre: 'Color', valor: 'Negro' }
    ],
    variantes: {
      ...TALLA_RODILLERA,
      valores: [
        { valor: 'S', detalle: '38–41 cm', disponible: true },
        { valor: 'M', detalle: '41–44 cm', disponible: true },
        { valor: 'L', detalle: '44–47 cm', disponible: true },
        { valor: 'XL', detalle: '47–50 cm', disponible: true }
      ]
    }
  },
  {
    idProducto: 11,
    nombre: 'Rodilleras Fox Enduro D3O',
    descripcion: 'Rodillera tipo manga, liviana y fresca para pedalear todo el día. Pieza de D3O extraíble para lavarla, malla elástica abierta y tratamiento antimicrobiano contra el mal olor.',
    precioNormal: 89990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('rodilleras'),
    marca: marca('Fox'),
    slug: 'fox-enduro-d3o',
    subtipo: 'Trail / XC',
    imagenPrincipal: '/img/productos/rodilleras/fox-enduro-d3o.jpg',
    stockDisponible: 10,
    stockMinimo: 3,
    sku: 'ROD-0002',
    proveedor: 'Fox Racing Chile',
    especificaciones: [
      { nombre: 'Uso', valor: 'Trail, XC' },
      { nombre: 'Protección', valor: 'D3O extraíble' },
      { nombre: 'Tratamiento', valor: 'Antimicrobiano' },
      { nombre: 'Certificación', valor: 'EN 1621-1 nivel 1' },
      { nombre: 'Color', valor: 'Negro' }
    ],
    variantes: {
      ...TALLA_RODILLERA,
      valores: [
        { valor: 'XS', detalle: '35–38 cm', disponible: true },
        { valor: 'S', detalle: '38–41 cm', disponible: true },
        { valor: 'M', detalle: '41–44 cm', disponible: true },
        { valor: 'L', detalle: '44–47 cm', disponible: true },
        { valor: 'XL', detalle: '47–50 cm', disponible: true },
        { valor: 'XXL', detalle: '50–53 cm', disponible: true }
      ]
    }
  },
  {
    idProducto: 12,
    nombre: 'Rodilleras Alpinestars Paragon Plus',
    descripcion: 'Rodillera de manga con protector flexible y buena ventilación, pensada para trail y enduro a un precio accesible.',
    precioNormal: 54990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('rodilleras'),
    marca: marca('Alpinestars'),
    slug: 'alpinestars-paragon-plus',
    subtipo: 'Trail / Enduro',
    precioOferta: 34990,
    imagenPrincipal: '/img/productos/rodilleras/alpinestars-paragon-plus.jpg',
    stockDisponible: 4,
    stockMinimo: 2,
    sku: 'ROD-0003',
    proveedor: 'Alpinestars Chile',
    especificaciones: [
      { nombre: 'Uso', valor: 'Trail, Enduro' },
      { nombre: 'Tipo', valor: 'Manga' },
      { nombre: 'Certificación', valor: 'CE nivel 1' },
      { nombre: 'Color', valor: 'Negro' }
    ],
    variantes: {
      ...TALLA_RODILLERA,
      valores: [
        { valor: 'S', detalle: '38–41 cm', disponible: false },
        { valor: 'M', detalle: '41–44 cm', disponible: true },
        { valor: 'L', detalle: '44–47 cm', disponible: false }
      ]
    }
  },
  {
    idProducto: 13,
    nombre: 'Rodilleras POC VPD System Lite',
    descripcion: 'Moldeada en 3D y muy ventilada. El material VPD se endurece con el impacto y su exterior de baja fricción ayuda a deslizar en caso de caída.',
    precioNormal: 139990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('rodilleras'),
    marca: marca('POC'),
    slug: 'poc-vpd-system-lite',
    subtipo: 'Enduro / Trail',
    precioOferta: 99990,
    imagenPrincipal: '/img/productos/rodilleras/poc-vpd-system-lite.jpg',
    stockDisponible: 5,
    stockMinimo: 2,
    sku: 'ROD-0004',
    proveedor: 'POC Chile',
    especificaciones: [
      { nombre: 'Uso', valor: 'Enduro, Trail' },
      { nombre: 'Protección', valor: 'VPD (se endurece al impacto)' },
      { nombre: 'Exterior', valor: 'Baja fricción' },
      { nombre: 'Certificación', valor: 'EN 1621-1' },
      { nombre: 'Color', valor: 'Negro' }
    ],
    variantes: {
      ...TALLA_RODILLERA,
      valores: [
        { valor: 'S', detalle: '38–41 cm', disponible: false },
        { valor: 'M', detalle: '41–44 cm', disponible: true },
        { valor: 'L', detalle: '44–47 cm', disponible: true }
      ]
    }
  },
  {
    idProducto: 14,
    nombre: 'Rodilleras Leatt AirFlex Hybrid Pro',
    descripcion: 'Rodillera súper delgada con gel de impacto AirFlex: suave y flexible, pero capaz de resistir golpes fuertes. Placa deslizante extra y acolchado lateral.',
    precioNormal: 147990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('rodilleras'),
    marca: marca('Leatt'),
    slug: 'leatt-airflex-hybrid-pro',
    subtipo: 'Enduro / Descenso',
    precioOferta: 119990,
    imagenPrincipal: '/img/productos/rodilleras/leatt-airflex-hybrid-pro.jpg',
    stockDisponible: 6,
    stockMinimo: 2,
    sku: 'ROD-0005',
    proveedor: 'Leatt Chile',
    especificaciones: [
      { nombre: 'Uso', valor: 'Enduro, Descenso' },
      { nombre: 'Protección', valor: 'Gel AirFlex + placa deslizante' },
      { nombre: 'Certificación', valor: 'CE EN 1621-1' },
      { nombre: 'Color', valor: 'Negro' }
    ],
    variantes: {
      ...TALLA_RODILLERA,
      valores: [
        { valor: 'S', detalle: '38–41 cm', disponible: true },
        { valor: 'M', detalle: '41–44 cm', disponible: true },
        { valor: 'L', detalle: '44–47 cm', disponible: true },
        { valor: 'XL', detalle: '47–50 cm', disponible: true },
        { valor: 'XXL', detalle: '50–53 cm', disponible: true }
      ]
    }
  },
  {
    idProducto: 15,
    nombre: 'Guantes Fox Ranger',
    descripcion: 'Los guantes de MTB más vendidos de Fox: livianos, con buen agarre y compatibles con pantallas táctiles. Sirven para casi cualquier disciplina.',
    precioNormal: 26990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('guantes'),
    marca: marca('Fox'),
    slug: 'fox-ranger',
    subtipo: 'Trail / MTB',
    imagenPrincipal: '/img/productos/guantes/fox-ranger.jpg',
    stockDisponible: 20,
    stockMinimo: 6,
    sku: 'GUA-0001',
    proveedor: 'Fox Racing Chile',
    especificaciones: [
      { nombre: 'Uso', valor: 'Trail, XC, Enduro' },
      { nombre: 'Pantalla táctil', valor: 'Sí (índice y pulgar)' },
      { nombre: 'Cierre', valor: 'Puño elástico sin velcro' },
      { nombre: 'Color', valor: 'Verde' }
    ],
    variantes: {
      ...TALLA_GUANTE,
      valores: [
        { valor: 'S', detalle: '18–19 cm', disponible: true },
        { valor: 'M', detalle: '19–20 cm', disponible: true },
        { valor: 'L', detalle: '20–21 cm', disponible: true },
        { valor: 'XL', detalle: '21–22 cm', disponible: true },
        { valor: 'XXL', detalle: '22–23 cm', disponible: true }
      ]
    }
  },
  {
    idProducto: 16,
    nombre: 'Guantes Fox Defend D3O',
    descripcion: 'Guante liviano de perfil bajo con protección D3O en los nudillos y materiales resistentes a la abrasión. Cierre de velcro para un ajuste a medida.',
    precioNormal: 49990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('guantes'),
    marca: marca('Fox'),
    slug: 'fox-defend-d3o',
    subtipo: 'Enduro / Descenso',
    precioOferta: 37990,
    imagenPrincipal: '/img/productos/guantes/fox-defend-d3o.jpg',
    stockDisponible: 7,
    stockMinimo: 3,
    sku: 'GUA-0002',
    proveedor: 'Fox Racing Chile',
    especificaciones: [
      { nombre: 'Uso', valor: 'Enduro, Descenso' },
      { nombre: 'Protección', valor: 'Nudillos D3O Ghost' },
      { nombre: 'Cierre', valor: 'Velcro' },
      { nombre: 'Color', valor: 'Gris' }
    ],
    variantes: {
      ...TALLA_GUANTE,
      valores: [
        { valor: 'S', detalle: '18–19 cm', disponible: true },
        { valor: 'M', detalle: '19–20 cm', disponible: true },
        { valor: 'L', detalle: '20–21 cm', disponible: true },
        { valor: 'XL', detalle: '21–22 cm', disponible: true }
      ]
    }
  },
  {
    idProducto: 17,
    nombre: 'Guantes Fox Flexair Ascent',
    descripcion: 'Guante ligero y muy transpirable, con puño moldeado por compresión y palma de ante para un tacto excelente sobre el manubrio.',
    precioNormal: 39990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('guantes'),
    marca: marca('Fox'),
    slug: 'fox-flexair-ascent',
    subtipo: 'Trail / XC',
    precioOferta: 19990,
    imagenPrincipal: '/img/productos/guantes/fox-flexair-ascent.jpg',
    stockDisponible: 9,
    stockMinimo: 3,
    sku: 'GUA-0003',
    proveedor: 'Fox Racing Chile',
    especificaciones: [
      { nombre: 'Uso', valor: 'Trail, XC' },
      { nombre: 'Palma', valor: 'Ante' },
      { nombre: 'Pantalla táctil', valor: 'Sí' },
      { nombre: 'Color', valor: 'Rojo' }
    ],
    variantes: {
      ...TALLA_GUANTE,
      valores: [
        { valor: 'S', detalle: '18–19 cm', disponible: true },
        { valor: 'M', detalle: '19–20 cm', disponible: true },
        { valor: 'L', detalle: '20–21 cm', disponible: true },
        { valor: 'XL', detalle: '21–22 cm', disponible: true },
        { valor: 'XXL', detalle: '22–23 cm', disponible: false }
      ]
    }
  },
  {
    idProducto: 18,
    nombre: 'Guantes Fox Ranger Gel',
    descripcion: 'La versión con gel del Ranger: zonas acolchadas en la palma que reducen la vibración en salidas largas. Compatible con pantallas táctiles.',
    precioNormal: 29990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('guantes'),
    marca: marca('Fox'),
    slug: 'fox-ranger-gel',
    subtipo: 'Trail / Ruta',
    precioOferta: 20990,
    imagenPrincipal: '/img/productos/guantes/fox-ranger-gel.jpg',
    stockDisponible: 5,
    stockMinimo: 2,
    sku: 'GUA-0004',
    proveedor: 'Fox Racing Chile',
    especificaciones: [
      { nombre: 'Uso', valor: 'Trail, Ruta, Urbano' },
      { nombre: 'Palma', valor: 'Acolchado de gel' },
      { nombre: 'Pantalla táctil', valor: 'Sí' },
      { nombre: 'Color', valor: 'Morado' }
    ],
    variantes: {
      ...TALLA_GUANTE,
      valores: [
        { valor: 'S', detalle: '18–19 cm', disponible: false },
        { valor: 'M', detalle: '19–20 cm', disponible: false },
        { valor: 'L', detalle: '20–21 cm', disponible: false },
        { valor: 'XL', detalle: '21–22 cm', disponible: true }
      ]
    }
  },
  {
    idProducto: 19,
    nombre: 'Chaqueta Cortaviento Fox Ranger Wind',
    descripcion: 'Chaqueta liviana estilo anorak con tejido elástico en cuatro direcciones y capucha que se adapta sobre la mayoría de los cascos. Se ve tan bien fuera de la bici como arriba.',
    precioNormal: 99990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('cortavientos'),
    marca: marca('Fox'),
    slug: 'fox-ranger-wind',
    subtipo: 'Anorak / MTB',
    imagenPrincipal: '/img/productos/cortavientos/fox-ranger-wind.jpg',
    stockDisponible: 6,
    stockMinimo: 2,
    sku: 'COR-0001',
    proveedor: 'Fox Racing Chile',
    especificaciones: [
      { nombre: 'Uso', valor: 'MTB, Urbano' },
      { nombre: 'Tejido', valor: 'Elástico en 4 direcciones' },
      { nombre: 'Capucha', valor: 'Compatible con casco' },
      { nombre: 'Color', valor: 'Negro' }
    ],
    variantes: {
      ...TALLA_ROPA,
      valores: [
        { valor: 'S', detalle: '89–94 cm', disponible: true },
        { valor: 'M', detalle: '94–99 cm', disponible: true },
        { valor: 'L', detalle: '99–104 cm', disponible: true },
        { valor: 'XL', detalle: '104–109 cm', disponible: true },
        { valor: 'XXL', detalle: '109–114 cm', disponible: true }
      ]
    }
  },
  {
    idProducto: 20,
    nombre: 'Cortavientos Fox Ranger Wind Pullover',
    descripcion: 'Cortavientos tipo pullover con capucha holgada, bolsillo canguro con cierre y cordón de ajuste. Se guarda dentro de su propio bolsillo.',
    precioNormal: 89990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('cortavientos'),
    marca: marca('Fox'),
    slug: 'fox-ranger-wind-pullover',
    subtipo: 'Pullover / MTB',
    precioOferta: 53990,
    imagenPrincipal: '/img/productos/cortavientos/fox-ranger-wind-pullover.jpg',
    stockDisponible: 4,
    stockMinimo: 2,
    sku: 'COR-0002',
    proveedor: 'Fox Racing Chile',
    especificaciones: [
      { nombre: 'Uso', valor: 'MTB, Trail' },
      { nombre: 'Material', valor: '89% poliéster, 11% elastano' },
      { nombre: 'Bolsillos', valor: 'Canguro con cierre' },
      { nombre: 'Plegable', valor: 'Sí, en su bolsillo' },
      { nombre: 'Color', valor: 'Burdeo / Café' }
    ],
    variantes: {
      ...TALLA_ROPA,
      valores: [
        { valor: 'S', detalle: '89–94 cm', disponible: true },
        { valor: 'M', detalle: '94–99 cm', disponible: false },
        { valor: 'L', detalle: '99–104 cm', disponible: false },
        { valor: 'XL', detalle: '104–109 cm', disponible: true }
      ]
    }
  },
  {
    idProducto: 21,
    nombre: 'Chaleco Cortavientos Fox Ranger',
    descripcion: 'Chaleco cortavientos liviano y plegable: se guarda en su propio bolsillo y apenas ocupa espacio en la riñonera. Ideal para las bajadas cuando cambia el clima.',
    precioNormal: 69990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('cortavientos'),
    marca: marca('Fox'),
    slug: 'fox-ranger-chaleco',
    subtipo: 'Chaleco',
    imagenPrincipal: '/img/productos/cortavientos/fox-ranger-chaleco.jpg',
    stockDisponible: 3,
    stockMinimo: 2,
    sku: 'COR-0003',
    proveedor: 'Fox Racing Chile',
    especificaciones: [
      { nombre: 'Uso', valor: 'MTB, Trail' },
      { nombre: 'Tipo', valor: 'Sin mangas' },
      { nombre: 'Plegable', valor: 'Sí, en su bolsillo' },
      { nombre: 'Color', valor: 'Rojo' }
    ],
    variantes: {
      ...TALLA_ROPA,
      valores: [
        { valor: 'S', detalle: '89–94 cm', disponible: true },
        { valor: 'M', detalle: '94–99 cm', disponible: false },
        { valor: 'L', detalle: '99–104 cm', disponible: false },
        { valor: 'XXL', detalle: '109–114 cm', disponible: true }
      ]
    }
  },
  {
    idProducto: 22,
    nombre: 'Chaqueta Impermeable Gobik Pluvia 2.0',
    descripcion: 'Chaqueta ultraliviana para ruta con tejido Lightshell y membrana hidrofóbica que repele el viento y la lluvia ligera. Se pliega en su bolsillo interior.',
    precioNormal: 119990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('cortavientos'),
    marca: marca('Gobik'),
    slug: 'gobik-pluvia-2',
    subtipo: 'Ruta / Impermeable',
    imagenPrincipal: '/img/productos/cortavientos/gobik-pluvia-2.jpg',
    stockDisponible: 5,
    stockMinimo: 2,
    sku: 'COR-0004',
    proveedor: 'Gobik Chile',
    especificaciones: [
      { nombre: 'Uso', valor: 'Ruta, Gravel' },
      { nombre: 'Tejido', valor: 'Lightshell con membrana hidrofóbica' },
      { nombre: 'Costuras', valor: 'Selladas' },
      { nombre: 'Plegable', valor: 'Sí' },
      { nombre: 'Color', valor: 'Naranjo' }
    ],
    variantes: {
      ...TALLA_ROPA,
      valores: [
        { valor: 'XS', detalle: '84–89 cm', disponible: true },
        { valor: 'S', detalle: '89–94 cm', disponible: true },
        { valor: 'M', detalle: '94–99 cm', disponible: true },
        { valor: 'L', detalle: '99–104 cm', disponible: true },
        { valor: 'XL', detalle: '104–109 cm', disponible: true }
      ]
    }
  },
  {
    idProducto: 23,
    nombre: 'Cortavientos Bicycle Line Stelvio Mujer',
    descripcion: 'Cortavientos de mujer increíblemente liviano (35 g/m²), resistente al agua y fácil de guardar en el bolsillo del jersey. Con elementos reflectantes.',
    precioNormal: 59990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('cortavientos'),
    marca: marca('Bicycle Line'),
    slug: 'bicycle-line-stelvio',
    subtipo: 'Ruta / Mujer',
    imagenPrincipal: '/img/productos/cortavientos/bicycle-line-stelvio.jpg',
    stockDisponible: 4,
    stockMinimo: 2,
    sku: 'COR-0005',
    proveedor: 'Bicycle Line Chile',
    especificaciones: [
      { nombre: 'Uso', valor: 'Ruta' },
      { nombre: 'Tejido', valor: 'Cortavientos 35 g/m²' },
      { nombre: 'Resistente al agua', valor: 'Sí' },
      { nombre: 'Reflectantes', valor: 'Sí' },
      { nombre: 'Color', valor: 'Blanco' }
    ],
    variantes: {
      ...TALLA_ROPA,
      valores: [
        { valor: 'S', detalle: '84–88 cm', disponible: true },
        { valor: 'M', detalle: '88–92 cm', disponible: true },
        { valor: 'L', detalle: '92–96 cm', disponible: true },
        { valor: 'XL', detalle: '96–100 cm', disponible: false }
      ]
    }
  },
  {
    idProducto: 24,
    nombre: 'Bombín Blackburn AirStik SL',
    descripcion: 'Mini bombín de aluminio de solo 59 g que cabe en el bolsillo del jersey o junto al portabotella. Cabezal Presta a presión, fácil de usar.',
    precioNormal: 24990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('bombines'),
    marca: marca('Blackburn'),
    slug: 'blackburn-airstik-sl',
    subtipo: 'Mini bombín',
    imagenPrincipal: '/img/productos/bombines/blackburn-airstik-sl.jpg',
    stockDisponible: 14,
    stockMinimo: 5,
    sku: 'BOM-0001',
    proveedor: 'Blackburn Chile',
    especificaciones: [
      { nombre: 'Tipo', valor: 'Mini bombín de mano' },
      { nombre: 'Válvula', valor: 'Presta' },
      { nombre: 'Material', valor: 'Aluminio' },
      { nombre: 'Peso aprox.', valor: '59 g' },
      { nombre: 'Incluye', valor: 'Soporte para cuadro' }
    ]
  },
  {
    idProducto: 25,
    nombre: 'Bombín de Pie Blackburn Core 2',
    descripcion: 'Bombín de pie para el taller de la casa, con manómetro análogo grande en la base y cabezal que sirve para válvulas Presta y Schrader.',
    precioNormal: 49990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('bombines'),
    marca: marca('Blackburn'),
    slug: 'blackburn-core-2',
    subtipo: 'Bombín de pie',
    imagenPrincipal: '/img/productos/bombines/blackburn-core-2.jpg',
    stockDisponible: 6,
    stockMinimo: 2,
    sku: 'BOM-0002',
    proveedor: 'Blackburn Chile',
    especificaciones: [
      { nombre: 'Tipo', valor: 'Bombín de pie' },
      { nombre: 'Válvula', valor: 'Presta y Schrader' },
      { nombre: 'Manómetro', valor: 'Análogo' },
      { nombre: 'Presión máx.', valor: '160 psi' }
    ]
  },
  {
    idProducto: 26,
    nombre: 'Bombín Eléctrico Oxford E-Pump Compact',
    descripcion: 'Inflador eléctrico compacto con pantalla digital: eliges la presión y se detiene solo. Recargable por USB e ideal para llevar en la mochila.',
    precioNormal: 69990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('bombines'),
    marca: marca('Oxford'),
    slug: 'oxford-e-pump',
    subtipo: 'Bombín eléctrico',
    precioOferta: 59990,
    imagenPrincipal: '/img/productos/bombines/oxford-e-pump.jpg',
    stockDisponible: 5,
    stockMinimo: 2,
    sku: 'BOM-0003',
    proveedor: 'Oxford Chile',
    especificaciones: [
      { nombre: 'Tipo', valor: 'Eléctrico recargable' },
      { nombre: 'Presión máx.', valor: '120 psi' },
      { nombre: 'Batería', valor: '500 mAh' },
      { nombre: 'Pantalla', valor: 'Digital' },
      { nombre: 'Válvula', valor: 'Presta y Schrader (adaptadores)' }
    ]
  },
  {
    idProducto: 27,
    nombre: 'Bombín Zéfal Gravel Mini',
    descripcion: 'Mini bombín pensado para neumáticos de gravel de 35 a 47 mm: buen equilibrio entre volumen de aire, presión y tamaño.',
    precioNormal: 39990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('bombines'),
    marca: marca('Zéfal'),
    slug: 'zefal-gravel-mini',
    subtipo: 'Mini bombín',
    precioOferta: 29990,
    imagenPrincipal: '/img/productos/bombines/zefal-gravel-mini.jpg',
    stockDisponible: 7,
    stockMinimo: 3,
    sku: 'BOM-0004',
    proveedor: 'Oxford Chile',
    especificaciones: [
      { nombre: 'Tipo', valor: 'Mini bombín de mano' },
      { nombre: 'Uso', valor: 'Gravel (35–47 mm)' },
      { nombre: 'Válvula', valor: 'Presta y Schrader' },
      { nombre: 'Incluye', valor: 'Soporte para cuadro' }
    ]
  },
  {
    idProducto: 28,
    nombre: 'Bombín de Suspensión Fox HP 350 psi',
    descripcion: 'Bombín de alta presión con manómetro análogo para regular horquillas y amortiguadores de aire. Conector largo para llegar fácil a la válvula.',
    precioNormal: 49990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('bombines'),
    marca: marca('Fox'),
    slug: 'fox-hp-350',
    subtipo: 'Alta presión',
    imagenPrincipal: '/img/productos/bombines/fox-hp-350.jpg',
    stockDisponible: 4,
    stockMinimo: 2,
    sku: 'BOM-0005',
    proveedor: 'Fox Racing Chile',
    especificaciones: [
      { nombre: 'Tipo', valor: 'Alta presión (suspensión)' },
      { nombre: 'Presión máx.', valor: '350 psi' },
      { nombre: 'Manómetro', valor: 'Análogo' },
      { nombre: 'Conector', valor: 'Largo' }
    ]
  },
  {
    idProducto: 29,
    nombre: 'Botella Camelbak Podium 710 ml',
    descripcion: 'La botella de referencia del ciclismo: cuerpo fácil de apretar para tomar más con menos esfuerzo, válvula autosellante y buen ajuste en el portabotella.',
    precioNormal: 14990,
    estado: 'PUBLICADO',
    destacado: true,
    ordenDestacado: 7,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('botellas'),
    marca: marca('Camelbak'),
    slug: 'camelbak-podium-710',
    subtipo: 'Botella',
    imagenPrincipal: '/img/productos/botellas/camelbak-podium-710.jpg',
    stockDisponible: 18,
    stockMinimo: 6,
    sku: 'BOT-0001',
    proveedor: 'Camelbak Chile',
    especificaciones: [
      { nombre: 'Capacidad', valor: '710 ml' },
      { nombre: 'Válvula', valor: 'Jet Valve autosellante' },
      { nombre: 'Material', valor: 'Libre de BPA' },
      { nombre: 'Color', valor: 'Gris' }
    ]
  },
  {
    idProducto: 30,
    nombre: 'Botella Térmica Camelbak Podium Chill 710 ml',
    descripcion: 'Botella con aislación de doble pared que mantiene el agua fría el doble de tiempo que una botella normal. Tapa autosellante de alto flujo.',
    precioNormal: 19990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('botellas'),
    marca: marca('Camelbak'),
    slug: 'camelbak-podium-chill-710',
    subtipo: 'Botella térmica',
    imagenPrincipal: '/img/productos/botellas/camelbak-podium-chill-710.jpg',
    stockDisponible: 12,
    stockMinimo: 4,
    sku: 'BOT-0002',
    proveedor: 'Camelbak Chile',
    especificaciones: [
      { nombre: 'Capacidad', valor: '710 ml' },
      { nombre: 'Aislación', valor: 'Doble pared' },
      { nombre: 'Válvula', valor: 'Autosellante de alto flujo' },
      { nombre: 'Material', valor: 'Polipropileno TruTaste' },
      { nombre: 'Color', valor: 'Negro' }
    ]
  },
  {
    idProducto: 31,
    nombre: 'Botella Camelbak Podium Dirt Series 440 ml',
    descripcion: 'Versión compacta para MTB con tapa antibarro que mantiene la válvula limpia en el cerro. Ideal para cuadros pequeños o doble suspensión.',
    precioNormal: 14990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('botellas'),
    marca: marca('Camelbak'),
    slug: 'camelbak-podium-dirt-440',
    subtipo: 'Botella MTB',
    imagenPrincipal: '/img/productos/botellas/camelbak-podium-dirt-440.jpg',
    stockDisponible: 10,
    stockMinimo: 4,
    sku: 'BOT-0003',
    proveedor: 'Camelbak Chile',
    especificaciones: [
      { nombre: 'Capacidad', valor: '440 ml' },
      { nombre: 'Tapa', valor: 'Antibarro' },
      { nombre: 'Válvula', valor: 'Jet Valve autosellante' },
      { nombre: 'Color', valor: 'Negro camo' }
    ]
  },
  {
    idProducto: 32,
    nombre: 'Botella Fox Base 650 ml',
    descripcion: 'Botella simple y económica con tapón MoFlo que se abre con la boca mientras pedaleas y no gotea cuando está cerrado.',
    precioNormal: 5990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('botellas'),
    marca: marca('Fox'),
    slug: 'fox-base-22oz',
    subtipo: 'Botella',
    imagenPrincipal: '/img/productos/botellas/fox-base-22oz.jpg',
    stockDisponible: 25,
    stockMinimo: 8,
    sku: 'BOT-0004',
    proveedor: 'Fox Racing Chile',
    especificaciones: [
      { nombre: 'Capacidad', valor: '650 ml' },
      { nombre: 'Tapón', valor: 'MoFlo a prueba de fugas' },
      { nombre: 'Material', valor: 'Libre de BPA' },
      { nombre: 'Color', valor: 'Negro' }
    ]
  },
  {
    idProducto: 33,
    nombre: 'Luz Delantera NiteRider Lumina Micro 650',
    descripcion: 'Luz delantera compacta de 650 lúmenes con 5 modos, incluido un modo caminata que dura hasta 20 horas. Ideal para salidas nocturnas en la ciudad o el cerro.',
    precioNormal: 59990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('luces'),
    marca: marca('NiteRider'),
    slug: 'niterider-lumina-micro-650',
    subtipo: 'Delantera',
    imagenPrincipal: '/img/productos/luces/niterider-lumina-micro-650.jpg',
    stockDisponible: 8,
    stockMinimo: 3,
    sku: 'LUZ-0001',
    proveedor: 'NiteRider Chile',
    especificaciones: [
      { nombre: 'Potencia', valor: '650 lúmenes' },
      { nombre: 'Modos', valor: '5 (alto, medio, bajo, flash, caminata)' },
      { nombre: 'Autonomía', valor: '1:30 h (alto) a 20 h (caminata)' },
      { nombre: 'Carga', valor: 'USB' },
      { nombre: 'Batería', valor: 'Li-Ion' },
      { nombre: 'Peso aprox.', valor: '130 g' }
    ]
  },
  {
    idProducto: 34,
    nombre: 'Kit Luces Blackburn Dayblazer 400 + Click USB',
    descripcion: 'Set simple y muy brillante: la delantera Dayblazer 400 tiene modo diurno BLITZ y buena visibilidad lateral, y la trasera Click USB entrega 20 lúmenes en un formato compacto.',
    precioNormal: 59990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('luces'),
    marca: marca('Blackburn'),
    slug: 'blackburn-dayblazer-400-click',
    subtipo: 'Kit delantera + trasera',
    imagenPrincipal: '/img/productos/luces/blackburn-dayblazer-400-click.jpg',
    stockDisponible: 9,
    stockMinimo: 3,
    sku: 'LUZ-0002',
    proveedor: 'Blackburn Chile',
    especificaciones: [
      { nombre: 'Incluye', valor: 'Dayblazer 400 + Click USB trasera' },
      { nombre: 'Potencia', valor: '400 / 20 lúmenes' },
      { nombre: 'Modo diurno', valor: 'BLITZ' },
      { nombre: 'Resistencia al agua', valor: 'IP67' },
      { nombre: 'Carga', valor: 'USB' },
      { nombre: 'Norma', valor: 'ANSI FL-1' }
    ]
  },
  {
    idProducto: 35,
    nombre: 'Kit Luces Blackburn Luminate 360',
    descripcion: 'Visibilidad desde cualquier ángulo: delantera Dayblazer 550 con modo Blitz, trasera Grid y luces laterales Grid Side en color ámbar con tecnología COB.',
    precioNormal: 129990,
    estado: 'PUBLICADO',
    destacado: true,
    ordenDestacado: 3,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('luces'),
    marca: marca('Blackburn'),
    slug: 'blackburn-luminate-360',
    subtipo: 'Kit 360° (delantera, trasera y laterales)',
    precioOferta: 77990,
    imagenPrincipal: '/img/productos/luces/blackburn-luminate-360.jpg',
    stockDisponible: 4,
    stockMinimo: 2,
    sku: 'LUZ-0003',
    proveedor: 'Blackburn Chile',
    especificaciones: [
      { nombre: 'Incluye', valor: 'Dayblazer 550 + Grid trasera + 2 Grid Side' },
      { nombre: 'Potencia delantera', valor: '550 lúmenes' },
      { nombre: 'Tecnología', valor: 'LED COB' },
      { nombre: 'Luces laterales', valor: 'Ámbar' },
      { nombre: 'Carga', valor: 'USB' }
    ]
  },
  {
    idProducto: 36,
    nombre: 'Luz Delantera Blackburn Grid',
    descripcion: 'Pequeña luz delantera con tecnología COB de brillo amplio y 4 modos. Perfecta para ser visto en la ciudad.',
    precioNormal: 24990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('luces'),
    marca: marca('Blackburn'),
    slug: 'blackburn-grid-delantera',
    subtipo: 'Delantera',
    imagenPrincipal: '/img/productos/luces/blackburn-grid-delantera.jpg',
    stockDisponible: 15,
    stockMinimo: 5,
    sku: 'LUZ-0004',
    proveedor: 'Blackburn Chile',
    especificaciones: [
      { nombre: 'Potencia', valor: '110 lúmenes' },
      { nombre: 'Modos', valor: '4' },
      { nombre: 'Tecnología', valor: 'LED COB' },
      { nombre: 'Carga', valor: 'USB' }
    ]
  },
  {
    idProducto: 37,
    nombre: 'Luz Delantera Zéfal Supervision F800',
    descripcion: 'Luz delantera de 800 lúmenes para rutas de noche en la ciudad o el cerro, con varios modos y carga USB.',
    precioNormal: 69990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('luces'),
    marca: marca('Zéfal'),
    slug: 'zefal-supervision-f800',
    subtipo: 'Delantera',
    precioOferta: 55990,
    imagenPrincipal: '/img/productos/luces/zefal-supervision-f800.jpg',
    stockDisponible: 6,
    stockMinimo: 2,
    sku: 'LUZ-0005',
    proveedor: 'Oxford Chile',
    especificaciones: [
      { nombre: 'Potencia', valor: '800 lúmenes' },
      { nombre: 'Carga', valor: 'USB' },
      { nombre: 'Montaje', valor: 'Manubrio' },
      { nombre: 'Uso', valor: 'Urbano, MTB' }
    ]
  },
  {
    idProducto: 38,
    nombre: 'Luz Trasera Zéfal Supervision R150',
    descripcion: 'Luz trasera muy potente para ser visto incluso de día, con varios modos y carga USB.',
    precioNormal: 39990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('luces'),
    marca: marca('Zéfal'),
    slug: 'zefal-supervision-r150',
    subtipo: 'Trasera',
    precioOferta: 31990,
    imagenPrincipal: '/img/productos/luces/zefal-supervision-r150.jpg',
    stockDisponible: 8,
    stockMinimo: 3,
    sku: 'LUZ-0006',
    proveedor: 'Oxford Chile',
    especificaciones: [
      { nombre: 'Potencia', valor: '150 lúmenes' },
      { nombre: 'Carga', valor: 'USB' },
      { nombre: 'Montaje', valor: 'Tija de sillín' },
      { nombre: 'Uso', valor: 'Ruta, Urbano' }
    ]
  },
  {
    idProducto: 39,
    nombre: 'Luz Delantera Serfas True MTB 600',
    descripcion: 'Luz delantera robusta de la serie True de Serfas, con haz amplio pensado para senderos y funciones inteligentes.',
    precioNormal: 59990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('luces'),
    marca: marca('Serfas'),
    slug: 'serfas-true-mtb-600',
    subtipo: 'Delantera',
    precioOferta: 44990,
    imagenPrincipal: '/img/productos/luces/serfas-true-mtb-600.jpg',
    stockDisponible: 5,
    stockMinimo: 2,
    sku: 'LUZ-0007',
    proveedor: 'Serfas Chile',
    especificaciones: [
      { nombre: 'Potencia', valor: '600 lúmenes' },
      { nombre: 'Carga', valor: 'USB' },
      { nombre: 'Uso', valor: 'MTB, senderos' },
      { nombre: 'Montaje', valor: 'Manubrio' }
    ]
  },
  {
    idProducto: 40,
    nombre: 'Luz Delantera Oxford Pro 850',
    descripcion: '850 lúmenes en una carcasa de aluminio resistente. Buena opción calidad/precio para ver y ser visto en la ciudad o en senderos oscuros.',
    precioNormal: 39990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('luces'),
    marca: marca('Oxford'),
    slug: 'oxford-pro-850',
    subtipo: 'Delantera',
    precioOferta: 29990,
    imagenPrincipal: '/img/productos/luces/oxford-pro-850.jpg',
    stockDisponible: 12,
    stockMinimo: 4,
    sku: 'LUZ-0008',
    proveedor: 'Oxford Chile',
    especificaciones: [
      { nombre: 'Potencia', valor: '850 lúmenes' },
      { nombre: 'Carcasa', valor: 'Aluminio' },
      { nombre: 'Carga', valor: 'USB-C' },
      { nombre: 'Montaje', valor: 'Manubrio' }
    ]
  },
  {
    idProducto: 41,
    nombre: 'Luz Trasera Oxford Pro 20',
    descripcion: 'Luz trasera compacta de 20 lúmenes con carga USB-C y montaje de silicona para tija o mochila.',
    precioNormal: 14990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('luces'),
    marca: marca('Oxford'),
    slug: 'oxford-pro-20-trasera',
    subtipo: 'Trasera',
    precioOferta: 8990,
    imagenPrincipal: '/img/productos/luces/oxford-pro-20-trasera.jpg',
    stockDisponible: 20,
    stockMinimo: 6,
    sku: 'LUZ-0009',
    proveedor: 'Oxford Chile',
    especificaciones: [
      { nombre: 'Potencia', valor: '20 lúmenes' },
      { nombre: 'Carga', valor: 'USB-C' },
      { nombre: 'Montaje', valor: 'Elástico de silicona' }
    ]
  },
  {
    idProducto: 42,
    nombre: 'Puños ODI Elite Pro V2.1 Lock-On',
    descripcion: 'Puños con acolchado donde más se necesita, sin sentirse voluminosos. Patrón half-waffle para más control y sistema Lock-On que no se gira.',
    precioNormal: 27990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('punos'),
    marca: marca('ODI'),
    slug: 'odi-elite-pro',
    subtipo: 'Trail / Enduro',
    imagenPrincipal: '/img/productos/punos/odi-elite-pro.jpg',
    stockDisponible: 12,
    stockMinimo: 4,
    sku: 'PUN-0001',
    proveedor: 'Cross Mountain',
    especificaciones: [
      { nombre: 'Uso', valor: 'Trail, Enduro' },
      { nombre: 'Fijación', valor: 'Lock-On (1 abrazadera)' },
      { nombre: 'Largo', valor: '130 mm' },
      { nombre: 'Diseño', valor: 'Half-waffle' }
    ],
    variantes: {
      ...COLOR,
      valores: [
        { valor: 'Negro', detalle: 'Negro', disponible: true },
        { valor: 'Rojo', detalle: 'Rojo', disponible: true },
        { valor: 'Verde', detalle: 'Verde', disponible: false }
      ]
    }
  },
  {
    idProducto: 43,
    nombre: 'Puños ODI Reflex V2.1 Lock-On',
    descripcion: 'Diseñados para reducir los impactos y vibraciones que llegan a las manos, para que aguantes más tiempo en las bajadas.',
    precioNormal: 27990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('punos'),
    marca: marca('ODI'),
    slug: 'odi-reflex',
    subtipo: 'Trail / Enduro',
    imagenPrincipal: '/img/productos/punos/odi-reflex.jpg',
    stockDisponible: 10,
    stockMinimo: 4,
    sku: 'PUN-0002',
    proveedor: 'Cross Mountain',
    especificaciones: [
      { nombre: 'Uso', valor: 'Trail, Enduro' },
      { nombre: 'Fijación', valor: 'Lock-On' },
      { nombre: 'Enfoque', valor: 'Absorción de vibraciones' }
    ],
    variantes: {
      ...COLOR,
      valores: [
        { valor: 'Negro', detalle: 'Negro', disponible: true },
        { valor: 'Naranjo', detalle: 'Naranjo', disponible: true },
        { valor: 'Gris', detalle: 'Gris', disponible: false }
      ]
    }
  },
  {
    idProducto: 44,
    nombre: 'Puños Ergon GE1 Evo',
    descripcion: 'Desarrollado para la Enduro World Series: forma ergonómica pensada para manubrios altos, con más comodidad y agarre en terreno técnico.',
    precioNormal: 39990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('punos'),
    marca: marca('Ergon'),
    slug: 'ergon-ge1-evo',
    subtipo: 'Enduro',
    precioOferta: 34990,
    imagenPrincipal: '/img/productos/punos/ergon-ge1-evo.jpg',
    stockDisponible: 8,
    stockMinimo: 3,
    sku: 'PUN-0003',
    proveedor: 'Oxford Chile',
    especificaciones: [
      { nombre: 'Uso', valor: 'Enduro, Trail' },
      { nombre: 'Fijación', valor: 'Lock-On' },
      { nombre: 'Forma', valor: 'Ergonómica' },
      { nombre: 'Color', valor: 'Negro' }
    ]
  },
  {
    idProducto: 45,
    nombre: 'Puños Ergon GD1 Evo',
    descripcion: 'Puño de descenso desarrollado con Rémy Métailler y Vali Höll. Forma cónica que pide menos fuerza de agarre y zona del pulgar muy suave.',
    precioNormal: 39990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('punos'),
    marca: marca('Ergon'),
    slug: 'ergon-gd1-evo',
    subtipo: 'Descenso',
    precioOferta: 34990,
    imagenPrincipal: '/img/productos/punos/ergon-gd1-evo.jpg',
    stockDisponible: 6,
    stockMinimo: 2,
    sku: 'PUN-0004',
    proveedor: 'Oxford Chile',
    especificaciones: [
      { nombre: 'Uso', valor: 'Descenso, Enduro' },
      { nombre: 'Fijación', valor: 'Lock-On' },
      { nombre: 'Forma', valor: 'Cónica' },
      { nombre: 'Color', valor: 'Negro' }
    ]
  },
  {
    idProducto: 46,
    nombre: 'Puños Ergon GA3',
    descripcion: 'Puño con mini ala que apoya la muñeca y alivia el dolor típico en salidas largas, sin perder control en el sendero.',
    precioNormal: 39990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('punos'),
    marca: marca('Ergon'),
    slug: 'ergon-ga3',
    subtipo: 'Trail / Confort',
    precioOferta: 34990,
    imagenPrincipal: '/img/productos/punos/ergon-ga3.jpg',
    stockDisponible: 9,
    stockMinimo: 3,
    sku: 'PUN-0005',
    proveedor: 'Oxford Chile',
    especificaciones: [
      { nombre: 'Uso', valor: 'Trail, XC, Paseo' },
      { nombre: 'Fijación', valor: 'Lock-On' },
      { nombre: 'Forma', valor: 'Mini ala de apoyo' },
      { nombre: 'Color', valor: 'Negro' }
    ],
    variantes: {
      nombre: 'Talla',
      columna: 'Ancho de mano',
      guia: 'Tallas disponibles',
      nota: 'Mide el ancho de tu palma a la altura de los nudillos.',
      valores: [
        { valor: 'S', detalle: 'Hasta 9 cm', disponible: false },
        { valor: 'L', detalle: 'Sobre 9 cm', disponible: true }
      ]
    }
  },
  {
    idProducto: 47,
    nombre: 'Sillín Ergon SMC Hombre',
    descripcion: 'Sillín cómodo y dinámico con espuma ortopédica más gruesa y canal de alivio que evita el entumecimiento en salidas largas.',
    precioNormal: 89990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('sillines'),
    marca: marca('Ergon'),
    slug: 'ergon-smc',
    subtipo: 'Trail / Confort',
    precioOferta: 69990,
    imagenPrincipal: '/img/productos/sillines/ergon-smc.jpg',
    stockDisponible: 5,
    stockMinimo: 2,
    sku: 'SIL-0001',
    proveedor: 'Oxford Chile',
    especificaciones: [
      { nombre: 'Uso', valor: 'Trail, All Mountain' },
      { nombre: 'Relleno', valor: 'Espuma ortopédica' },
      { nombre: 'Canal de alivio', valor: 'Sí' },
      { nombre: 'Género', valor: 'Hombre' }
    ],
    variantes: {
      ...ANCHO_SILLIN,
      valores: [
        { valor: 'S/M', detalle: 'Hasta 12 cm', disponible: false },
        { valor: 'M/L', detalle: 'Sobre 12 cm', disponible: true }
      ]
    }
  },
  {
    idProducto: 48,
    nombre: 'Sillín Ergon SM Enduro Hombre Stealth',
    descripcion: 'Desarrollado con pilotos de la Enduro World Series: forma que no se engancha al bajar detrás del sillín y comodidad para las subidas largas.',
    precioNormal: 89990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('sillines'),
    marca: marca('Ergon'),
    slug: 'ergon-enduro-stealth',
    subtipo: 'Enduro',
    precioOferta: 79990,
    imagenPrincipal: '/img/productos/sillines/ergon-enduro-stealth.jpg',
    stockDisponible: 6,
    stockMinimo: 2,
    sku: 'SIL-0002',
    proveedor: 'Oxford Chile',
    especificaciones: [
      { nombre: 'Uso', valor: 'Enduro, Trail' },
      { nombre: 'Canal de alivio', valor: 'Sí' },
      { nombre: 'Género', valor: 'Hombre' },
      { nombre: 'Color', valor: 'Negro (Stealth)' }
    ],
    variantes: {
      ...ANCHO_SILLIN,
      valores: [
        { valor: 'S/M', detalle: 'Hasta 12 cm', disponible: true },
        { valor: 'M/L', detalle: 'Sobre 12 cm', disponible: true }
      ]
    }
  },
  {
    idProducto: 49,
    nombre: 'Sillín 715 Cabra (GOAT)',
    descripcion: 'Sillín de perfil clásico con la cola levemente elevada, que da un punto de apoyo extra para pedalear con más fuerza en salidas largas.',
    precioNormal: 49990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('sillines'),
    marca: marca('715 Industries'),
    slug: '715-cabra',
    subtipo: 'MTB',
    imagenPrincipal: '/img/productos/sillines/715-cabra.jpg',
    stockDisponible: 7,
    stockMinimo: 3,
    sku: 'SIL-0003',
    proveedor: '715 Industries',
    especificaciones: [
      { nombre: 'Uso', valor: 'MTB, Trail' },
      { nombre: 'Perfil', valor: 'Cola levemente elevada' },
      { nombre: 'Color', valor: 'Negro' }
    ]
  },
  {
    idProducto: 50,
    nombre: 'Sillín Cannondale Scoop Steel Radius',
    descripcion: 'Sillín premiado por su construcción de tres partes, que equilibra comodidad y rendimiento para distintos tipos de ciclistas.',
    precioNormal: 49990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('sillines'),
    marca: marca('Cannondale'),
    slug: 'cannondale-scoop-steel',
    subtipo: 'Ruta / MTB',
    precioOferta: 29990,
    imagenPrincipal: '/img/productos/sillines/cannondale-scoop-steel.jpg',
    stockDisponible: 8,
    stockMinimo: 3,
    sku: 'SIL-0004',
    proveedor: 'Oxford Chile',
    especificaciones: [
      { nombre: 'Uso', valor: 'Ruta, MTB' },
      { nombre: 'Rieles', valor: 'Acero' },
      { nombre: 'Perfil', valor: 'Radius (curvo)' },
      { nombre: 'Color', valor: 'Negro' }
    ]
  },
  {
    idProducto: 51,
    nombre: 'Sillín Serfas Exerciser Lycra',
    descripcion: 'Sillín ancho de confort con capa superior de gel, espuma progresiva y ranura de alivio. Ideal para bicicleta estática, paseo o ciudad.',
    precioNormal: 29990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('sillines'),
    marca: marca('Serfas'),
    slug: 'serfas-exerciser',
    subtipo: 'Confort / Urbano',
    precioOferta: 24990,
    imagenPrincipal: '/img/productos/sillines/serfas-exerciser.jpg',
    stockDisponible: 10,
    stockMinimo: 3,
    sku: 'SIL-0005',
    proveedor: 'Serfas Chile',
    especificaciones: [
      { nombre: 'Uso', valor: 'Urbano, Paseo, Estática' },
      { nombre: 'Relleno', valor: 'Gel + espuma progresiva' },
      { nombre: 'Cubierta', valor: 'Lycra' },
      { nombre: 'Color', valor: 'Negro' }
    ]
  },
  {
    idProducto: 52,
    nombre: 'Tapabarro Peaty\'s MarshGuard Repeat Crown',
    descripcion: 'Tapabarro delantero de plástico 100% reciclado con tinta de alta duración. Talla única compatible con las horquillas actuales de las principales marcas.',
    precioNormal: 25990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('tapabarros'),
    marca: marca('Peaty\'s'),
    slug: 'peatys-repeat-crown',
    subtipo: 'Delantero',
    imagenPrincipal: '/img/productos/tapabarros/peatys-repeat-crown.jpg',
    stockDisponible: 9,
    stockMinimo: 3,
    sku: 'TAP-0001',
    proveedor: 'Trailstore',
    especificaciones: [
      { nombre: 'Posición', valor: 'Delantero (horquilla)' },
      { nombre: 'Material', valor: 'Plástico reciclado' },
      { nombre: 'Montaje', valor: 'Bridas' },
      { nombre: 'Color', valor: 'Negro' }
    ]
  },
  {
    idProducto: 53,
    nombre: 'Tapabarro Fox 36/38 XL',
    descripcion: 'Tapabarro XL de protección total contra el barro para horquillas Fox 36 y 38 Float, modelos 2021 en adelante. Se atornilla directo a la horquilla.',
    precioNormal: 39990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('tapabarros'),
    marca: marca('Fox'),
    slug: 'fox-tapabarro-36-38',
    subtipo: 'Delantero',
    imagenPrincipal: '/img/productos/tapabarros/fox-tapabarro-36-38.jpg',
    stockDisponible: 4,
    stockMinimo: 2,
    sku: 'TAP-0002',
    proveedor: 'Fox Racing Chile',
    especificaciones: [
      { nombre: 'Posición', valor: 'Delantero' },
      { nombre: 'Compatibilidad', valor: 'Fox 36 y 38 (2021+)' },
      { nombre: 'Tamaño', valor: 'XL' },
      { nombre: 'Montaje', valor: 'Atornillado' }
    ]
  },
  {
    idProducto: 54,
    nombre: 'Juego de Tapabarros Zéfal Shield G50',
    descripcion: 'Juego de tapabarros envolventes para gravel y ciclismo urbano, que protegen de salpicaduras al rodar sobre suelo mojado.',
    precioNormal: 42990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('tapabarros'),
    marca: marca('Zéfal'),
    slug: 'zefal-shield-g50',
    subtipo: 'Delantero + trasero',
    precioOferta: 39990,
    imagenPrincipal: '/img/productos/tapabarros/zefal-shield-g50.jpg',
    stockDisponible: 5,
    stockMinimo: 2,
    sku: 'TAP-0003',
    proveedor: 'Oxford Chile',
    especificaciones: [
      { nombre: 'Incluye', valor: 'Delantero + trasero' },
      { nombre: 'Uso', valor: 'Gravel, Urbano' },
      { nombre: 'Montaje', valor: 'Sin herramientas' }
    ]
  },
  {
    idProducto: 55,
    nombre: 'Tapabarro de Sillín Zéfal Shield S20',
    descripcion: 'Tapabarro trasero liviano y discreto que se fija en los rieles del sillín en segundos. Compatible con casi todos los sillines de MTB.',
    precioNormal: 7990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('tapabarros'),
    marca: marca('Zéfal'),
    slug: 'zefal-shield-s20',
    subtipo: 'Trasero',
    precioOferta: 6990,
    imagenPrincipal: '/img/productos/tapabarros/zefal-shield-s20.jpg',
    stockDisponible: 15,
    stockMinimo: 5,
    sku: 'TAP-0004',
    proveedor: 'Oxford Chile',
    especificaciones: [
      { nombre: 'Posición', valor: 'Trasero' },
      { nombre: 'Montaje', valor: 'Rieles del sillín' },
      { nombre: 'Uso', valor: 'MTB' }
    ]
  },
  {
    idProducto: 56,
    nombre: 'Tapabarro Marsh Guard Delantero',
    descripcion: 'El clásico tapabarro delantero flexible que se fija con bridas a la horquilla. Evita que el barro te llegue a la cara.',
    precioNormal: 14990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('tapabarros'),
    marca: marca('Marsh Guard'),
    slug: 'marshguard-275',
    subtipo: 'Delantero',
    imagenPrincipal: '/img/productos/tapabarros/marshguard-275.jpg',
    stockDisponible: 11,
    stockMinimo: 4,
    sku: 'TAP-0005',
    proveedor: 'Rock and Road',
    especificaciones: [
      { nombre: 'Posición', valor: 'Delantero (horquilla)' },
      { nombre: 'Montaje', valor: 'Bridas' },
      { nombre: 'Material', valor: 'Polipropileno flexible' },
      { nombre: 'Color', valor: 'Negro' }
    ]
  },
  {
    idProducto: 57,
    nombre: 'Cadena SRAM GX Eagle 12v',
    descripcion: 'Cadena de 12 velocidades para transmisiones Eagle, silenciosa y durable. Incluye PowerLock para instalarla y sacarla sin herramientas especiales.',
    precioNormal: 59990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('transmision'),
    marca: marca('SRAM'),
    slug: 'sram-cadena-gx-eagle',
    subtipo: 'Cadena',
    imagenPrincipal: '/img/productos/transmision/sram-cadena-gx-eagle.jpg',
    stockDisponible: 10,
    stockMinimo: 4,
    sku: 'TRA-0001',
    proveedor: 'SRAM Latam',
    especificaciones: [
      { nombre: 'Velocidades', valor: '12' },
      { nombre: 'Compatibilidad', valor: 'SRAM Eagle' },
      { nombre: 'Eslabones', valor: '126' },
      { nombre: 'Unión', valor: 'PowerLock' },
      { nombre: 'Color', valor: 'Plata / Negro' }
    ]
  },
  {
    idProducto: 58,
    nombre: 'Cadena Shimano XTR CN-M9100 12v',
    descripcion: 'Cadena tope de línea de Shimano para transmisiones Hyperglide+ de 12 velocidades. Liviana, precisa y compatible con e-bikes.',
    precioNormal: 104390,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('transmision'),
    marca: marca('Shimano'),
    slug: 'shimano-cadena-xtr-m9100',
    subtipo: 'Cadena',
    imagenPrincipal: '/img/productos/transmision/shimano-cadena-xtr-m9100.jpg',
    stockDisponible: 5,
    stockMinimo: 2,
    sku: 'TRA-0002',
    proveedor: 'Shimano Chile',
    especificaciones: [
      { nombre: 'Velocidades', valor: '12' },
      { nombre: 'Línea', valor: 'XTR' },
      { nombre: 'Eslabones', valor: '126' },
      { nombre: 'Unión', valor: 'Quick-Link incluido' },
      { nombre: 'Compatible e-bike', valor: 'Sí' }
    ]
  },
  {
    idProducto: 59,
    nombre: 'Cassette Shimano 105 CS-R7000 11v',
    descripcion: 'Cassette de 11 velocidades del grupo 105 R7000: la tecnología de Ultegra y Dura-Ace a un precio accesible para ruta.',
    precioNormal: 74990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('transmision'),
    marca: marca('Shimano'),
    slug: 'shimano-105-r7000',
    subtipo: 'Cassette',
    imagenPrincipal: '/img/productos/transmision/shimano-105-r7000.jpg',
    stockDisponible: 6,
    stockMinimo: 2,
    sku: 'TRA-0003',
    proveedor: 'Shimano Chile',
    especificaciones: [
      { nombre: 'Velocidades', valor: '11' },
      { nombre: 'Grupo', valor: '105 R7000' },
      { nombre: 'Uso', valor: 'Ruta' },
      { nombre: 'Núcleo', valor: 'Shimano HG' }
    ],
    variantes: {
      nombre: 'Relación',
      columna: 'Uso recomendado',
      guia: 'Relaciones disponibles',
      nota: 'Revisa que tu cambio trasero aguante un piñón de 32 dientes.',
      valores: [
        { valor: '11-28T', detalle: 'Ruta, terreno plano', disponible: false },
        { valor: '11-32T', detalle: 'Ruta con subidas', disponible: true }
      ]
    }
  },
  {
    idProducto: 60,
    nombre: 'Mando de Cambio SRAM SX Eagle 12v',
    descripcion: 'Mando de cambio trasero tipo gatillo para transmisiones Eagle de 12 velocidades. Incluye abrazadera y cable.',
    precioNormal: 59990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('transmision'),
    marca: marca('SRAM'),
    slug: 'sram-sx-eagle-shifter',
    subtipo: 'Mando de cambio',
    imagenPrincipal: '/img/productos/transmision/sram-sx-eagle-shifter.jpg',
    stockDisponible: 7,
    stockMinimo: 3,
    sku: 'TRA-0004',
    proveedor: 'SRAM Latam',
    especificaciones: [
      { nombre: 'Velocidades', valor: '12' },
      { nombre: 'Actuación', valor: 'X-Actuation' },
      { nombre: 'Tipo', valor: 'Gatillo' },
      { nombre: 'Abrazadera', valor: 'Incluida' },
      { nombre: 'Cable', valor: '2200 mm' }
    ]
  },
  {
    idProducto: 61,
    nombre: 'Cambio Trasero SRAM NX 11v',
    descripcion: 'Cambio trasero de caja larga para transmisiones 1x de 11 velocidades, con tecnología X-Horizon que reduce los cambios fantasma y el golpe de cadena.',
    precioNormal: 118990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('transmision'),
    marca: marca('SRAM'),
    slug: 'sram-nx-cambio-11v',
    subtipo: 'Cambio trasero',
    imagenPrincipal: '/img/productos/transmision/sram-nx-cambio-11v.jpg',
    stockDisponible: 4,
    stockMinimo: 2,
    sku: 'TRA-0005',
    proveedor: 'SRAM Latam',
    especificaciones: [
      { nombre: 'Velocidades', valor: '11' },
      { nombre: 'Actuación', valor: 'X-Actuation' },
      { nombre: 'Piñón máx.', valor: '42T' },
      { nombre: 'Caja', valor: 'Larga' },
      { nombre: 'Color', valor: 'Negro' }
    ]
  },
  {
    idProducto: 62,
    nombre: 'Freno Hidráulico Shimano MT200 Trasero',
    descripcion: 'Freno de disco hidráulico completo (maneta, caliper y manguera) listo para instalar. La forma más simple de pasar a frenos hidráulicos.',
    precioNormal: 54990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('frenos'),
    marca: marca('Shimano'),
    slug: 'shimano-mt200-trasero',
    subtipo: 'Freno de disco',
    imagenPrincipal: '/img/productos/frenos/shimano-mt200-trasero.jpg',
    stockDisponible: 8,
    stockMinimo: 3,
    sku: 'FRE-0001',
    proveedor: 'Shimano Chile',
    especificaciones: [
      { nombre: 'Posición', valor: 'Trasero' },
      { nombre: 'Tipo', valor: 'Hidráulico, 2 pistones' },
      { nombre: 'Incluye', valor: 'Maneta + caliper + manguera' },
      { nombre: 'Rotor', valor: 'No incluido' },
      { nombre: 'Color', valor: 'Negro' }
    ]
  },
  {
    idProducto: 63,
    nombre: 'Freno Magura MT5 Next 4 Pistones',
    descripcion: 'Toda la potencia de un freno de 4 pistones Magura a un precio accesible. Mucho control para enduro y trail agresivo.',
    precioNormal: 169990,
    estado: 'PUBLICADO',
    destacado: true,
    ordenDestacado: 6,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('frenos'),
    marca: marca('Magura'),
    slug: 'magura-mt5-next',
    subtipo: 'Freno de disco',
    imagenPrincipal: '/img/productos/frenos/magura-mt5-next.jpg',
    stockDisponible: 4,
    stockMinimo: 2,
    sku: 'FRE-0002',
    proveedor: 'Magura Chile',
    especificaciones: [
      { nombre: 'Tipo', valor: 'Hidráulico, 4 pistones' },
      { nombre: 'Uso', valor: 'Enduro, Trail' },
      { nombre: 'Fluido', valor: 'Aceite mineral Royal Blood' },
      { nombre: 'Rotor', valor: 'No incluido' }
    ]
  },
  {
    idProducto: 64,
    nombre: 'Freno SRAM DB6 Delantero',
    descripcion: 'Freno potente de aceite mineral y bajo mantenimiento, con maneta Stealth que acerca la manguera al manubrio y se integra con los mandos Eagle (MatchMaker).',
    precioNormal: 131990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('frenos'),
    marca: marca('SRAM'),
    slug: 'sram-db6-delantero',
    subtipo: 'Freno de disco',
    imagenPrincipal: '/img/productos/frenos/sram-db6-delantero.jpg',
    stockDisponible: 4,
    stockMinimo: 2,
    sku: 'FRE-0003',
    proveedor: 'SRAM Latam',
    especificaciones: [
      { nombre: 'Posición', valor: 'Delantero' },
      { nombre: 'Tipo', valor: 'Hidráulico, 4 pistones' },
      { nombre: 'Fluido', valor: 'Aceite mineral' },
      { nombre: 'Manguera', valor: '2000 mm' },
      { nombre: 'Montaje', valor: 'MatchMaker X' }
    ]
  },
  {
    idProducto: 65,
    nombre: 'Pastillas Shimano N03A Resina Ice-Tech',
    descripcion: 'Pastillas de resina con aletas Ice-Tech que disipan el calor. Frenada progresiva y silenciosa para frenos Shimano de 4 pistones.',
    precioNormal: 34990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('frenos'),
    marca: marca('Shimano'),
    slug: 'shimano-n03a',
    subtipo: 'Pastillas',
    imagenPrincipal: '/img/productos/frenos/shimano-n03a.jpg',
    stockDisponible: 15,
    stockMinimo: 5,
    sku: 'FRE-0004',
    proveedor: 'Shimano Chile',
    especificaciones: [
      { nombre: 'Compuesto', valor: 'Resina' },
      { nombre: 'Disipador', valor: 'Ice-Tech' },
      { nombre: 'Compatibilidad', valor: 'XTR M9120, XT M8120, SLX M7120' }
    ]
  },
  {
    idProducto: 66,
    nombre: 'Rotor Magura Storm CL Center Lock',
    descripcion: 'Rotor de 2 piezas para mazas Center Lock: resiste altas temperaturas y trabaja perfecto con frenos Magura de 4 pistones. Incluye anillo de montaje.',
    precioNormal: 49990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('frenos'),
    marca: marca('Magura'),
    slug: 'magura-storm-cl',
    subtipo: 'Rotor',
    imagenPrincipal: '/img/productos/frenos/magura-storm-cl.jpg',
    stockDisponible: 9,
    stockMinimo: 3,
    sku: 'FRE-0005',
    proveedor: 'Magura Chile',
    especificaciones: [
      { nombre: 'Montaje', valor: 'Center Lock' },
      { nombre: 'Construcción', valor: '2 piezas' },
      { nombre: 'Incluye', valor: 'Lock ring' }
    ],
    variantes: {
      nombre: 'Diámetro',
      columna: 'Peso aprox.',
      guia: 'Medidas disponibles',
      nota: 'Revisa hasta qué diámetro de disco aceptan tu cuadro y tu horquilla.',
      valores: [
        { valor: '160 mm', detalle: '194 g', disponible: true },
        { valor: '180 mm', detalle: '221 g', disponible: true },
        { valor: '203 mm', detalle: '253 g', disponible: true }
      ]
    }
  },
  {
    idProducto: 67,
    nombre: 'Maza Trasera Shimano FH-MT410 12v',
    descripcion: 'Maza trasera Deore de 12 velocidades para freno de disco, con eje pasante E-Thru y sellado de laberinto para una larga vida útil.',
    precioNormal: 62890,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('mazas'),
    marca: marca('Shimano'),
    slug: 'shimano-fh-mt410',
    subtipo: 'Trasera',
    imagenPrincipal: '/img/productos/mazas/shimano-fh-mt410.jpg',
    stockDisponible: 5,
    stockMinimo: 2,
    sku: 'MAZ-0001',
    proveedor: 'Shimano Chile',
    especificaciones: [
      { nombre: 'Posición', valor: 'Trasera' },
      { nombre: 'Velocidades', valor: '12 (Micro Spline)' },
      { nombre: 'Rayos', valor: '32' },
      { nombre: 'Disco', valor: 'Center Lock' },
      { nombre: 'Eje', valor: '12 x 142 mm E-Thru' }
    ]
  },
  {
    idProducto: 68,
    nombre: 'Maza Delantera Shimano Deore XT HB-M8010',
    descripcion: 'Maza delantera XT con rodamientos de contacto angular y sellos de alta calidad. Liviana y durable en cualquier clima.',
    precioNormal: 83190,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('mazas'),
    marca: marca('Shimano'),
    slug: 'shimano-xt-hb-m8010',
    subtipo: 'Delantera',
    imagenPrincipal: '/img/productos/mazas/shimano-xt-hb-m8010.jpg',
    stockDisponible: 4,
    stockMinimo: 2,
    sku: 'MAZ-0002',
    proveedor: 'Shimano Chile',
    especificaciones: [
      { nombre: 'Posición', valor: 'Delantera' },
      { nombre: 'Rayos', valor: '32' },
      { nombre: 'Disco', valor: 'Center Lock' },
      { nombre: 'Peso aprox.', valor: '148 g' },
      { nombre: 'Rodamientos', valor: 'Contacto angular' }
    ]
  },
  {
    idProducto: 69,
    nombre: 'Maza Delantera Hope Pro 5 Boost',
    descripcion: 'La nueva generación de mazas Hope: cuerpo más rígido sin agregar peso y rodamientos más grandes. Fabricada en Inglaterra, fácil de mantener.',
    precioNormal: 154900,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('mazas'),
    marca: marca('Hope'),
    slug: 'hope-pro5-delantera',
    subtipo: 'Delantera',
    imagenPrincipal: '/img/productos/mazas/hope-pro5-delantera.jpg',
    stockDisponible: 3,
    stockMinimo: 1,
    sku: 'MAZ-0003',
    proveedor: 'Rock and Road',
    especificaciones: [
      { nombre: 'Posición', valor: 'Delantera' },
      { nombre: 'Rayos', valor: '32' },
      { nombre: 'Eje', valor: '15 x 110 mm (Boost)' },
      { nombre: 'Disco', valor: '6 pernos' },
      { nombre: 'Color', valor: 'Negro' }
    ]
  },
  {
    idProducto: 70,
    nombre: 'Maza Trasera Hope Pro 5 Boost HG',
    descripcion: 'Maza trasera Pro 5 con núcleo HG, el famoso sonido Hope y rodamientos más grandes que la Pro 4. Hecha para durar años.',
    precioNormal: 359900,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('mazas'),
    marca: marca('Hope'),
    slug: 'hope-pro5-trasera',
    subtipo: 'Trasera',
    imagenPrincipal: '/img/productos/mazas/hope-pro5-trasera.jpg',
    stockDisponible: 2,
    stockMinimo: 1,
    sku: 'MAZ-0004',
    proveedor: 'Rock and Road',
    especificaciones: [
      { nombre: 'Posición', valor: 'Trasera' },
      { nombre: 'Rayos', valor: '32' },
      { nombre: 'Eje', valor: '12 x 148 mm (Boost)' },
      { nombre: 'Núcleo', valor: 'Shimano HG' },
      { nombre: 'Color', valor: 'Azul' }
    ]
  },
  {
    idProducto: 71,
    nombre: 'Maza Trasera 715 Industries Ultra XD',
    descripcion: 'Maza premium con sistema de 6 trinquetes y 612 puntos de enganche: acople casi instantáneo de 0,55° para una respuesta inmediata al pedalear.',
    precioNormal: 189990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('mazas'),
    marca: marca('715 Industries'),
    slug: '715-ultra-trasera',
    subtipo: 'Trasera',
    imagenPrincipal: '/img/productos/mazas/715-ultra-trasera.jpg',
    stockDisponible: 3,
    stockMinimo: 1,
    sku: 'MAZ-0005',
    proveedor: '715 Industries',
    especificaciones: [
      { nombre: 'Posición', valor: 'Trasera' },
      { nombre: 'Enganche', valor: '612 puntos (0,55°)' },
      { nombre: 'Trinquetes', valor: '6' },
      { nombre: 'Eje', valor: '12 x 148 mm (Boost)' },
      { nombre: 'Núcleo', valor: 'SRAM XD' },
      { nombre: 'Color', valor: 'Negro' }
    ]
  },
  {
    idProducto: 72,
    nombre: 'Pedales Planos OneUp Composite',
    descripcion: 'Plataforma enorme de 115 x 105 mm con 10 pines de acero por lado y perfil convexo que se acomoda al arco del pie. Solo 355 g.',
    precioNormal: 59990,
    estado: 'PUBLICADO',
    destacado: true,
    ordenDestacado: 4,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('pedales'),
    marca: marca('OneUp'),
    slug: 'oneup-composite',
    subtipo: 'Plano',
    imagenPrincipal: '/img/productos/pedales/oneup-composite.jpg',
    stockDisponible: 10,
    stockMinimo: 3,
    sku: 'PED-0001',
    proveedor: 'OneUp Chile',
    especificaciones: [
      { nombre: 'Tipo', valor: 'Plano' },
      { nombre: 'Material', valor: 'Composite (nylon)' },
      { nombre: 'Plataforma', valor: '115 x 105 mm' },
      { nombre: 'Pines', valor: '10 por lado' },
      { nombre: 'Peso aprox.', valor: '355 g (par)' }
    ],
    variantes: {
      ...COLOR,
      valores: [
        { valor: 'Negro', detalle: 'Negro', disponible: true },
        { valor: 'Naranjo', detalle: 'Naranjo', disponible: true },
        { valor: 'Azul', detalle: 'Azul', disponible: true },
        { valor: 'Verde', detalle: 'Verde', disponible: true }
      ]
    }
  },
  {
    idProducto: 73,
    nombre: 'Pedales Planos OneUp Aluminio',
    descripcion: 'Pedales de aluminio ultradelgados que se enganchan menos en las piedras. Pines reemplazables y la misma plataforma grande de 115 x 105 mm.',
    precioNormal: 199990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('pedales'),
    marca: marca('OneUp'),
    slug: 'oneup-aluminio',
    subtipo: 'Plano',
    imagenPrincipal: '/img/productos/pedales/oneup-aluminio.jpg',
    stockDisponible: 3,
    stockMinimo: 1,
    sku: 'PED-0002',
    proveedor: 'OneUp Chile',
    especificaciones: [
      { nombre: 'Tipo', valor: 'Plano' },
      { nombre: 'Material', valor: 'Aluminio' },
      { nombre: 'Plataforma', valor: '115 x 105 mm' },
      { nombre: 'Pines', valor: '10 por lado, reemplazables' },
      { nombre: 'Color', valor: 'Negro' }
    ]
  },
  {
    idProducto: 74,
    nombre: 'Pedales Planos Deity Black Kat',
    descripcion: 'Pedal de aluminio 6061 con plataforma grande y cóncava, cuerpo delgado y rodamientos sellados de mayor tamaño para aguantar el descenso más extremo.',
    precioNormal: 139990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('pedales'),
    marca: marca('Deity'),
    slug: 'deity-black-kat',
    subtipo: 'Plano',
    imagenPrincipal: '/img/productos/pedales/deity-black-kat.jpg',
    stockDisponible: 3,
    stockMinimo: 1,
    sku: 'PED-0003',
    proveedor: 'Rock and Road',
    especificaciones: [
      { nombre: 'Tipo', valor: 'Plano' },
      { nombre: 'Material', valor: 'Aluminio 6061' },
      { nombre: 'Forma', valor: 'Cóncava' },
      { nombre: 'Rodamientos', valor: 'Doble sellado' },
      { nombre: 'Color', valor: 'Plateado' }
    ]
  },
  {
    idProducto: 75,
    nombre: 'Pedales de Clip HT M2 XC',
    descripcion: 'Pedal automático para cross country aprobado por Nino Schurter. Evacúa muy bien el barro y tiene tensión regulable en cada lado.',
    precioNormal: 119990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('pedales'),
    marca: marca('HT Components'),
    slug: 'ht-m2',
    subtipo: 'Clip (automático)',
    imagenPrincipal: '/img/productos/pedales/ht-m2.jpg',
    stockDisponible: 4,
    stockMinimo: 2,
    sku: 'PED-0004',
    proveedor: 'Rock and Road',
    especificaciones: [
      { nombre: 'Tipo', valor: 'Clip (automático)' },
      { nombre: 'Uso', valor: 'XC' },
      { nombre: 'Peso aprox.', valor: '305 g (par)' },
      { nombre: 'Cuerpo', valor: 'Aluminio CNC' },
      { nombre: 'Eje', valor: 'Cromoly CNC' },
      { nombre: 'Incluye', valor: 'Calas' }
    ]
  },
  {
    idProducto: 76,
    nombre: 'Pedales Planos HT PA03A',
    descripcion: 'Pedal plano de nylon reforzado, liviano y económico, con pines reemplazables y doble rodamiento sellado.',
    precioNormal: 69990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('pedales'),
    marca: marca('HT Components'),
    slug: 'ht-pa03a',
    subtipo: 'Plano',
    precioOferta: 27990,
    imagenPrincipal: '/img/productos/pedales/ht-pa03a.jpg',
    stockDisponible: 12,
    stockMinimo: 4,
    sku: 'PED-0005',
    proveedor: 'Terrafirma',
    especificaciones: [
      { nombre: 'Tipo', valor: 'Plano' },
      { nombre: 'Material', valor: 'Nylon reforzado' },
      { nombre: 'Plataforma', valor: '107 x 105 mm' },
      { nombre: 'Peso aprox.', valor: '345 g (par)' },
      { nombre: 'Eje', valor: 'Cromoly CNC' }
    ],
    variantes: {
      ...COLOR,
      valores: [
        { valor: 'Rojo', detalle: 'Rojo', disponible: true },
        { valor: 'Morado', detalle: 'Morado', disponible: true },
        { valor: 'Naranjo', detalle: 'Naranjo flúor', disponible: true }
      ]
    }
  },
  {
    idProducto: 77,
    nombre: 'Manubrio 715 Industries Riser 35 mm',
    descripcion: 'Manubrio de aluminio 6061 para descenso y enduro: rígido, liviano y resistente a los golpes en terreno técnico.',
    precioNormal: 54990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('manubrios'),
    marca: marca('715 Industries'),
    slug: '715-riser-40',
    subtipo: 'Riser',
    imagenPrincipal: '/img/productos/manubrios/715-riser-40.jpg',
    stockDisponible: 6,
    stockMinimo: 2,
    sku: 'MAN-0001',
    proveedor: '715 Industries',
    especificaciones: [
      { nombre: 'Uso', valor: 'Descenso, Enduro' },
      { nombre: 'Material', valor: 'Aluminio 6061' },
      { nombre: 'Abrazadera', valor: '35 mm' },
      { nombre: 'Rise', valor: '40 mm' },
      { nombre: 'Color', valor: 'Negro' }
    ]
  },
  {
    idProducto: 78,
    nombre: 'Manubrio Deity Racepoint 35',
    descripcion: 'Manubrio probado durante 12 a 24 meses con los riders más exigentes. Tecnología Gradient Butting para una flexión controlada.',
    precioNormal: 109990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('manubrios'),
    marca: marca('Deity'),
    slug: 'deity-racepoint-35',
    subtipo: 'Riser',
    imagenPrincipal: '/img/productos/manubrios/deity-racepoint-35.jpg',
    stockDisponible: 4,
    stockMinimo: 2,
    sku: 'MAN-0002',
    proveedor: 'Rock and Road',
    especificaciones: [
      { nombre: 'Uso', valor: 'Enduro, Trail' },
      { nombre: 'Material', valor: 'Aluminio 7050' },
      { nombre: 'Abrazadera', valor: '35 mm' },
      { nombre: 'Rise', valor: '38 mm' },
      { nombre: 'Ancho', valor: '810 mm (cortable)' },
      { nombre: 'Color', valor: 'Negro (Stealth)' }
    ]
  },
  {
    idProducto: 79,
    nombre: 'Manubrio Renthal Fatbar Zero Rise',
    descripcion: 'Manubrio plano con tecnología heredada del motocross: aluminio serie 7, liviano y durable. Marcas láser para centrarlo y cortarlo fácil.',
    precioNormal: 115990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('manubrios'),
    marca: marca('Renthal'),
    slug: 'renthal-fatbar-zero',
    subtipo: 'Plano',
    precioOferta: 93990,
    imagenPrincipal: '/img/productos/manubrios/renthal-fatbar-zero.jpg',
    stockDisponible: 3,
    stockMinimo: 1,
    sku: 'MAN-0003',
    proveedor: 'Cross Mountain',
    especificaciones: [
      { nombre: 'Uso', valor: 'XC, Trail' },
      { nombre: 'Material', valor: 'Aluminio serie 7' },
      { nombre: 'Abrazadera', valor: '31,8 mm' },
      { nombre: 'Rise', valor: '0 mm' },
      { nombre: 'Color', valor: 'Gris claro' }
    ]
  },
  {
    idProducto: 80,
    nombre: 'Manubrio Title AH1 35',
    descripcion: 'Manubrio de aluminio de la marca de Olly Wilkins, pensado para trail y enduro. Disponible en dos alturas.',
    precioNormal: 109990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('manubrios'),
    marca: marca('Title'),
    slug: 'title-ah1-35',
    subtipo: 'Riser',
    imagenPrincipal: '/img/productos/manubrios/title-ah1-35.jpg',
    stockDisponible: 5,
    stockMinimo: 2,
    sku: 'MAN-0004',
    proveedor: 'Cross Mountain',
    especificaciones: [
      { nombre: 'Uso', valor: 'Trail, Enduro' },
      { nombre: 'Material', valor: 'Aluminio' },
      { nombre: 'Abrazadera', valor: '35 mm' },
      { nombre: 'Color', valor: 'Gris' }
    ],
    variantes: {
      ...RISE,
      valores: [
        { valor: '38 mm', detalle: 'Trail, Enduro', disponible: true },
        { valor: '50 mm', detalle: 'Enduro, Descenso', disponible: true }
      ]
    }
  },
  {
    idProducto: 81,
    nombre: 'Manubrio ODI Flight Control Stealth 800 mm',
    descripcion: 'Manubrio con patrón de flexión pensado para trabajar con los puños ODI: reduce la vibración, el bombeo de antebrazos y la fatiga de manos.',
    precioNormal: 119990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('manubrios'),
    marca: marca('ODI'),
    slug: 'odi-flight-800',
    subtipo: 'Riser',
    imagenPrincipal: '/img/productos/manubrios/odi-flight-800.jpg',
    stockDisponible: 4,
    stockMinimo: 2,
    sku: 'MAN-0005',
    proveedor: 'Cross Mountain',
    especificaciones: [
      { nombre: 'Uso', valor: 'Enduro, Trail' },
      { nombre: 'Abrazadera', valor: '35 mm' },
      { nombre: 'Ancho', valor: '800 mm' },
      { nombre: 'Color', valor: 'Negro' }
    ],
    variantes: {
      ...RISE,
      valores: [
        { valor: '25 mm', detalle: 'Trail, XC', disponible: true },
        { valor: '38 mm', detalle: 'Trail, Enduro', disponible: true },
        { valor: '50 mm', detalle: 'Enduro, Descenso', disponible: true }
      ]
    }
  },
  {
    idProducto: 82,
    nombre: 'Neumático Maxxis Minion DHF 3C EXO TR',
    descripcion: 'El delantero de referencia para enduro: tacos laterales agresivos para curvas con máximo agarre. Tubeless ready y protección EXO.',
    precioNormal: 44990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('neumaticos'),
    marca: marca('Maxxis'),
    slug: 'maxxis-minion-dhf',
    subtipo: 'MTB Enduro',
    imagenPrincipal: '/img/productos/neumaticos/maxxis-minion-dhf.jpg',
    stockDisponible: 2,
    stockMinimo: 6,
    sku: 'NEU-0001',
    proveedor: 'Distribuidora Andes',
    especificaciones: [
      { nombre: 'Uso', valor: 'Enduro, Trail agresivo' },
      { nombre: 'Compuesto', valor: '3C MaxxTerra' },
      { nombre: 'Carcasa', valor: 'EXO (anti cortes)' },
      { nombre: 'Tubeless', valor: 'Sí (TR)' },
      { nombre: 'Talón', valor: 'Plegable' }
    ],
    variantes: {
      ...MEDIDA_NEUMATICO,
      valores: [
        { valor: '27.5 x 2.5', detalle: 'Enduro, aro 27.5"', disponible: true },
        { valor: '29 x 2.5', detalle: 'Enduro, aro 29"', disponible: true },
        { valor: '29 x 2.6', detalle: 'Enduro, aro 29"', disponible: false }
      ]
    }
  },
  {
    idProducto: 83,
    nombre: 'Neumático Maxxis Ardent EXO TR',
    descripcion: 'Neumático rápido y versátil para trail, con buen rodado y agarre en terreno seco o suelto.',
    precioNormal: 34990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('neumaticos'),
    marca: marca('Maxxis'),
    slug: 'maxxis-ardent',
    subtipo: 'MTB Trail',
    imagenPrincipal: '/img/productos/neumaticos/maxxis-ardent.jpg',
    stockDisponible: 11,
    stockMinimo: 6,
    sku: 'NEU-0002',
    proveedor: 'Distribuidora Andes',
    especificaciones: [
      { nombre: 'Uso', valor: 'Trail, XC' },
      { nombre: 'Compuesto', valor: 'Dual' },
      { nombre: 'Carcasa', valor: 'EXO' },
      { nombre: 'Tubeless', valor: 'Sí (TR)' },
      { nombre: 'Talón', valor: 'Plegable' }
    ],
    variantes: {
      ...MEDIDA_NEUMATICO,
      valores: [
        { valor: '27.5 x 2.25', detalle: 'Trail, aro 27.5"', disponible: true },
        { valor: '29 x 2.25', detalle: 'Trail, aro 29"', disponible: true },
        { valor: '29 x 2.4', detalle: 'Trail, aro 29"', disponible: true }
      ]
    }
  },
  {
    idProducto: 84,
    nombre: 'Neumático Schwalbe Nobby Nic Addix',
    descripcion: 'Todo terreno clásico de Schwalbe. Compuesto Addix con buen equilibrio entre agarre y duración.',
    precioNormal: 56990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('neumaticos'),
    marca: marca('Schwalbe'),
    slug: 'schwalbe-nobby-nic',
    subtipo: 'MTB Trail',
    precioOferta: 49990,
    imagenPrincipal: '/img/productos/neumaticos/schwalbe-nobby-nic.jpg',
    stockDisponible: 7,
    stockMinimo: 4,
    sku: 'NEU-0003',
    proveedor: 'Schwalbe Chile',
    especificaciones: [
      { nombre: 'Uso', valor: 'Trail, All Mountain' },
      { nombre: 'Compuesto', valor: 'Addix SpeedGrip' },
      { nombre: 'Tubeless', valor: 'Sí (TLE)' },
      { nombre: 'Talón', valor: 'Plegable' }
    ],
    variantes: {
      ...MEDIDA_NEUMATICO,
      valores: [
        { valor: '27.5 x 2.35', detalle: 'Trail, aro 27.5"', disponible: true },
        { valor: '29 x 2.35', detalle: 'Trail, aro 29"', disponible: true }
      ]
    }
  },
  {
    idProducto: 85,
    nombre: 'Neumático Continental Grand Prix 5000',
    descripcion: 'Neumático de ruta de alto rendimiento: baja resistencia al rodado y buena protección contra pinchazos.',
    precioNormal: 54990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('neumaticos'),
    marca: marca('Continental'),
    slug: 'continental-gp5000',
    subtipo: 'Ruta',
    imagenPrincipal: '/img/productos/neumaticos/continental-gp5000.jpg',
    stockDisponible: 3,
    stockMinimo: 4,
    sku: 'NEU-0004',
    proveedor: 'Continental Chile',
    especificaciones: [
      { nombre: 'Uso', valor: 'Ruta, Competición' },
      { nombre: 'Compuesto', valor: 'BlackChili' },
      { nombre: 'Protección', valor: 'Vectran Breaker' },
      { nombre: 'Talón', valor: 'Plegable' }
    ],
    variantes: {
      ...MEDIDA_NEUMATICO,
      valores: [
        { valor: '700 x 25c', detalle: 'Ruta', disponible: true },
        { valor: '700 x 28c', detalle: 'Ruta / Endurance', disponible: true },
        { valor: '700 x 32c', detalle: 'Endurance / Gravel ligero', disponible: false }
      ]
    }
  },
  {
    idProducto: 86,
    nombre: 'Neumático Continental Kryptotal-F Enduro',
    descripcion: 'Neumático delantero para enduro y descenso: control, tracción y estabilidad en terreno técnico. Carcasa Enduro Casing y compuesto Super Soft para máximo agarre.',
    precioNormal: 109990,
    estado: 'PUBLICADO',
    destacado: true,
    ordenDestacado: 5,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('neumaticos'),
    marca: marca('Continental'),
    slug: 'continental-kryptotal-f',
    subtipo: 'MTB Enduro',
    imagenPrincipal: '/img/productos/neumaticos/continental-kryptotal-f.jpg',
    stockDisponible: 6,
    stockMinimo: 3,
    sku: 'NEU-0005',
    proveedor: 'Continental Chile',
    especificaciones: [
      { nombre: 'Uso', valor: 'Enduro, Descenso' },
      { nombre: 'Posición', valor: 'Delantero' },
      { nombre: 'Compuesto', valor: 'Super Soft' },
      { nombre: 'Carcasa', valor: 'Enduro Casing' },
      { nombre: 'Tubeless', valor: 'Sí (TR)' },
      { nombre: 'Talón', valor: 'Plegable' }
    ],
    variantes: {
      ...MEDIDA_NEUMATICO,
      valores: [
        { valor: '27.5 x 2.4', detalle: 'Enduro, aro 27.5"', disponible: true },
        { valor: '29 x 2.4', detalle: 'Enduro, aro 29"', disponible: true },
        { valor: '29 x 2.6', detalle: 'Enduro, aro 29"', disponible: true }
      ]
    }
  },
  {
    idProducto: 87,
    nombre: 'Neumático Continental Cross King ShieldWall',
    descripcion: 'Neumático versátil para terreno mixto: rueda rápido en suelo compacto y mantiene el control en senderos y curvas. Protección ShieldWall contra cortes.',
    precioNormal: 44990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('neumaticos'),
    marca: marca('Continental'),
    slug: 'continental-cross-king',
    subtipo: 'MTB Trail',
    imagenPrincipal: '/img/productos/neumaticos/continental-cross-king.jpg',
    stockDisponible: 10,
    stockMinimo: 4,
    sku: 'NEU-0006',
    proveedor: 'Continental Chile',
    especificaciones: [
      { nombre: 'Uso', valor: 'Trail, XC' },
      { nombre: 'Compuesto', valor: 'PureGrip' },
      { nombre: 'Protección', valor: 'ShieldWall System' },
      { nombre: 'Tubeless', valor: 'Sí (TR)' },
      { nombre: 'Talón', valor: 'Plegable' }
    ],
    variantes: {
      ...MEDIDA_NEUMATICO,
      valores: [
        { valor: '27.5 x 2.3', detalle: 'Trail, aro 27.5"', disponible: true },
        { valor: '29 x 2.3', detalle: 'Trail, aro 29"', disponible: true }
      ]
    }
  },
  {
    idProducto: 88,
    nombre: 'Neumático Continental Race King ShieldWall',
    descripcion: 'Pensado para la velocidad en terreno seco y compacto. Baja resistencia al rodado, carcasa ShieldWall y compuesto PureGrip.',
    precioNormal: 49990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('neumaticos'),
    marca: marca('Continental'),
    slug: 'continental-race-king',
    subtipo: 'MTB XC',
    imagenPrincipal: '/img/productos/neumaticos/continental-race-king.jpg',
    stockDisponible: 8,
    stockMinimo: 4,
    sku: 'NEU-0007',
    proveedor: 'Continental Chile',
    especificaciones: [
      { nombre: 'Uso', valor: 'XC, Trail rápido' },
      { nombre: 'Compuesto', valor: 'PureGrip' },
      { nombre: 'Protección', valor: 'ShieldWall System' },
      { nombre: 'Tubeless', valor: 'Sí (TR)' },
      { nombre: 'Talón', valor: 'Plegable' }
    ],
    variantes: {
      ...MEDIDA_NEUMATICO,
      valores: [
        { valor: '27.5 x 2.2', detalle: 'XC, aro 27.5"', disponible: true },
        { valor: '29 x 2.2', detalle: 'XC, aro 29"', disponible: true }
      ]
    }
  },
  {
    idProducto: 89,
    nombre: 'Neumático Maxxis Ikon 3C MaxxSpeed EXO TR',
    descripcion: 'Neumático liviano y de alto volumen para XC y maratón. Compuesto 3C MaxxSpeed para un rodado muy eficiente y protección EXO contra cortes.',
    precioNormal: 59990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('neumaticos'),
    marca: marca('Maxxis'),
    slug: 'maxxis-ikon',
    subtipo: 'MTB XC',
    precioOferta: 35990,
    imagenPrincipal: '/img/productos/neumaticos/maxxis-ikon.jpg',
    stockDisponible: 9,
    stockMinimo: 4,
    sku: 'NEU-0008',
    proveedor: 'Distribuidora Andes',
    especificaciones: [
      { nombre: 'Uso', valor: 'XC, Maratón' },
      { nombre: 'Compuesto', valor: '3C MaxxSpeed' },
      { nombre: 'Carcasa', valor: 'EXO' },
      { nombre: 'Tubeless', valor: 'Sí (TR)' },
      { nombre: 'Talón', valor: 'Plegable' }
    ],
    variantes: {
      ...MEDIDA_NEUMATICO,
      valores: [
        { valor: '27.5 x 2.35', detalle: 'XC, aro 27.5"', disponible: true },
        { valor: '29 x 2.2', detalle: 'XC, aro 29"', disponible: true }
      ]
    }
  },
  {
    idProducto: 90,
    nombre: 'Neumático Continental Terra Trail ShieldWall',
    descripcion: 'Neumático de gravel para rutas exigentes y bikepacking: control y tracción en terreno mixto, con protección ShieldWall y compuesto PureGrip.',
    precioNormal: 49990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('neumaticos'),
    marca: marca('Continental'),
    slug: 'continental-terra-trail',
    subtipo: 'Gravel',
    imagenPrincipal: '/img/productos/neumaticos/continental-terra-trail.jpg',
    stockDisponible: 5,
    stockMinimo: 3,
    sku: 'NEU-0009',
    proveedor: 'Continental Chile',
    especificaciones: [
      { nombre: 'Uso', valor: 'Gravel, Bikepacking' },
      { nombre: 'Compuesto', valor: 'PureGrip' },
      { nombre: 'Protección', valor: 'ShieldWall System' },
      { nombre: 'Tubeless', valor: 'Sí (TR)' },
      { nombre: 'Talón', valor: 'Plegable' }
    ],
    variantes: {
      ...MEDIDA_NEUMATICO,
      valores: [
        { valor: '700 x 40c', detalle: 'Gravel', disponible: true },
        { valor: '700 x 45c', detalle: 'Gravel / Bikepacking', disponible: true }
      ]
    }
  },
  {
    idProducto: 91,
    nombre: 'Cámara Maxxis Welter Weight',
    descripcion: 'Cámara de butilo resistente para MTB, buena relación entre peso y durabilidad.',
    precioNormal: 7990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('camaras'),
    marca: marca('Maxxis'),
    slug: 'maxxis-welter-weight',
    subtipo: 'MTB',
    imagenPrincipal: '/img/productos/camaras/maxxis-welter-weight.jpg',
    stockDisponible: 30,
    stockMinimo: 10,
    sku: 'CAM-0001',
    proveedor: 'Distribuidora Andes',
    especificaciones: [
      { nombre: 'Material', valor: 'Butilo' },
      { nombre: 'Largo válvula', valor: '48 mm' },
      { nombre: 'Peso aprox.', valor: '200 g' }
    ],
    variantes: {
      ...MEDIDA_CAMARA,
      valores: [
        { valor: '27.5 x 1.9–2.35', detalle: 'Presta', disponible: true },
        { valor: '29 x 1.9–2.35', detalle: 'Presta', disponible: true },
        { valor: '29 x 1.9–2.35 (S)', detalle: 'Schrader', disponible: true }
      ]
    }
  },
  {
    idProducto: 92,
    nombre: 'Cámara Kenda Estándar',
    descripcion: 'Cámara económica y confiable para uso diario.',
    precioNormal: 4990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('camaras'),
    marca: marca('Kenda'),
    slug: 'kenda-26-schrader',
    subtipo: 'Urbano / MTB',
    imagenPrincipal: '/img/productos/camaras/kenda-26-schrader.jpg',
    stockDisponible: 40,
    stockMinimo: 10,
    sku: 'CAM-0002',
    proveedor: 'Kenda Chile',
    especificaciones: [
      { nombre: 'Material', valor: 'Butilo' },
      { nombre: 'Largo válvula', valor: '35 mm' }
    ],
    variantes: {
      ...MEDIDA_CAMARA,
      valores: [
        { valor: '26 x 1.9–2.125', detalle: 'Schrader', disponible: true },
        { valor: '27.5 x 1.9–2.125', detalle: 'Schrader', disponible: true },
        { valor: '700 x 28–35c', detalle: 'Schrader', disponible: false }
      ]
    }
  },
  {
    idProducto: 93,
    nombre: 'Cámara Continental Race 28',
    descripcion: 'Cámara liviana para bicicletas de ruta.',
    precioNormal: 8490,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('camaras'),
    marca: marca('Continental'),
    slug: 'continental-race-28',
    subtipo: 'Ruta',
    imagenPrincipal: '/img/productos/camaras/continental-race-28.jpg',
    stockDisponible: 16,
    stockMinimo: 6,
    sku: 'CAM-0003',
    proveedor: 'Continental Chile',
    especificaciones: [
      { nombre: 'Material', valor: 'Butilo' },
      { nombre: 'Largo válvula', valor: '60 mm' },
      { nombre: 'Peso aprox.', valor: '100 g' }
    ],
    variantes: {
      ...MEDIDA_CAMARA,
      valores: [
        { valor: '700 x 20–25c', detalle: 'Presta', disponible: true },
        { valor: '700 x 25–32c', detalle: 'Presta', disponible: true }
      ]
    }
  },
  {
    idProducto: 94,
    nombre: 'Cámara Serfas MTB',
    descripcion: 'Cámara de butilo para aros de MTB, disponible con válvula Presta o Schrader.',
    precioNormal: 5990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('camaras'),
    marca: marca('Serfas'),
    slug: 'serfas-mtb',
    subtipo: 'MTB',
    precioOferta: 5390,
    imagenPrincipal: '/img/productos/camaras/serfas-mtb.jpg',
    stockDisponible: 35,
    stockMinimo: 10,
    sku: 'CAM-0004',
    proveedor: 'Serfas Chile',
    especificaciones: [
      { nombre: 'Material', valor: 'Butilo' },
      { nombre: 'Largo válvula', valor: '48 mm (Presta) / 33–60 mm (Schrader)' }
    ],
    variantes: {
      ...MEDIDA_CAMARA,
      valores: [
        { valor: '26 x 1.75–2.2', detalle: 'Schrader', disponible: true },
        { valor: '27.5 x 1.75–2.3', detalle: 'Presta', disponible: true },
        { valor: '27.5 x 1.75–2.3 (S)', detalle: 'Schrader', disponible: true },
        { valor: '29 x 1.75–2.35', detalle: 'Presta', disponible: true },
        { valor: '29 x 1.75–2.35 (S)', detalle: 'Schrader', disponible: true }
      ]
    }
  },
  {
    idProducto: 95,
    nombre: 'Cámara Chaoyang 700 x 33/37c',
    descripcion: 'Cámara de butilo para neumáticos 700c anchos, típicos de gravel, híbridas y bicis urbanas.',
    precioNormal: 5990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('camaras'),
    marca: marca('Chaoyang'),
    slug: 'chaoyang-700-33-37',
    subtipo: 'Gravel / Urbano',
    imagenPrincipal: '/img/productos/camaras/chaoyang-700-33-37.jpg',
    stockDisponible: 20,
    stockMinimo: 8,
    sku: 'CAM-0005',
    proveedor: 'Chaoyang Chile',
    especificaciones: [
      { nombre: 'Material', valor: 'Butilo' },
      { nombre: 'Largo válvula', valor: '60 mm' }
    ],
    variantes: {
      ...MEDIDA_CAMARA,
      valores: [
        { valor: '700 x 33–37c', detalle: 'Presta', disponible: true }
      ]
    }
  },
  {
    idProducto: 96,
    nombre: 'Cámara Arisun 27.5"',
    descripcion: 'Cámara de butilo para aro 27.5", confiable y económica para el uso diario en el cerro.',
    precioNormal: 5990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('camaras'),
    marca: marca('Arisun'),
    slug: 'arisun-275',
    subtipo: 'MTB',
    imagenPrincipal: '/img/productos/camaras/arisun-275.jpg',
    stockDisponible: 25,
    stockMinimo: 8,
    sku: 'CAM-0006',
    proveedor: 'Arisun Chile',
    especificaciones: [
      { nombre: 'Material', valor: 'Butilo' },
      { nombre: 'Largo válvula', valor: '33 mm' }
    ],
    variantes: {
      ...MEDIDA_CAMARA,
      valores: [
        { valor: '27.5 x 1.75–2.35', detalle: 'Presta', disponible: true },
        { valor: '27.5 x 1.75–2.35 (S)', detalle: 'Schrader', disponible: true }
      ]
    }
  },
  {
    idProducto: 97,
    nombre: 'Cámara RideNow TPU Gravel',
    descripcion: 'Cámara de TPU ultraliviana para gravel: pesa unos 45 g y ocupa muy poco espacio en el bolso de sillín.',
    precioNormal: 14990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('camaras'),
    marca: marca('RideNow'),
    slug: 'ridenow-tpu-gravel',
    subtipo: 'Gravel',
    imagenPrincipal: '/img/productos/camaras/ridenow-tpu-gravel.jpg',
    stockDisponible: 7,
    stockMinimo: 3,
    sku: 'CAM-0007',
    proveedor: 'RideNow Chile',
    especificaciones: [
      { nombre: 'Material', valor: 'TPU' },
      { nombre: 'Peso aprox.', valor: '45 g' },
      { nombre: 'Válvula', valor: 'Presta' }
    ],
    variantes: {
      ...MEDIDA_CAMARA,
      valores: [
        { valor: '700 x 32–47c', detalle: 'Presta', disponible: true }
      ]
    }
  },
  {
    idProducto: 98,
    nombre: 'Horquilla RockShox Recon Silver RL 29"',
    descripcion: 'El nuevo punto de referencia en calidad/precio: corona y botellas de la Reba con barras de acero de 32 mm y amortiguación Motion Control con bloqueo.',
    precioNormal: 511990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('suspensiones'),
    marca: marca('RockShox'),
    slug: 'rockshox-recon-silver',
    subtipo: 'Horquilla XC',
    imagenPrincipal: '/img/productos/suspensiones/rockshox-recon-silver.jpg',
    stockDisponible: 3,
    stockMinimo: 1,
    sku: 'SUS-0001',
    proveedor: 'SRAM Latam',
    especificaciones: [
      { nombre: 'Aro', valor: '29"' },
      { nombre: 'Recorrido', valor: '100 mm' },
      { nombre: 'Barras', valor: '32 mm acero' },
      { nombre: 'Amortiguación', valor: 'Motion Control RL' },
      { nombre: 'Eje', valor: '15 x 110 mm (Boost)' },
      { nombre: 'Color', valor: 'Negro' }
    ]
  },
  {
    idProducto: 99,
    nombre: 'Horquilla RockShox Judy Gold RL 27.5"',
    descripcion: 'Horquilla de aire para XC y All Mountain con amortiguación Motion Control, bloqueo en la corona y ajuste externo de rebote.',
    precioNormal: 511990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('suspensiones'),
    marca: marca('RockShox'),
    slug: 'rockshox-judy-gold',
    subtipo: 'Horquilla XC',
    imagenPrincipal: '/img/productos/suspensiones/rockshox-judy-gold.jpg',
    stockDisponible: 2,
    stockMinimo: 1,
    sku: 'SUS-0002',
    proveedor: 'SRAM Latam',
    especificaciones: [
      { nombre: 'Aro', valor: '27.5"' },
      { nombre: 'Recorrido', valor: '100 mm' },
      { nombre: 'Resorte', valor: 'Aire' },
      { nombre: 'Amortiguación', valor: 'Motion Control RL' },
      { nombre: 'Offset', valor: '42 mm' },
      { nombre: 'Freno', valor: 'Post Mount 160 mm' }
    ]
  },
  {
    idProducto: 100,
    nombre: 'Horquilla Fox 32 Float SC Performance 29"',
    descripcion: 'Horquilla Step-Cast superliviana (menos de 1.300 g) para maratón. Amortiguador GRIP SL y arco invertido, 40% más rígida que su antecesora. Con bloqueo remoto.',
    precioNormal: 1240000,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('suspensiones'),
    marca: marca('Fox'),
    slug: 'fox-32-float-sc',
    subtipo: 'Horquilla XC / Maratón',
    imagenPrincipal: '/img/productos/suspensiones/fox-32-float-sc.jpg',
    stockDisponible: 2,
    stockMinimo: 1,
    sku: 'SUS-0003',
    proveedor: 'Fox Racing Chile',
    especificaciones: [
      { nombre: 'Aro', valor: '29"' },
      { nombre: 'Recorrido', valor: '100 mm' },
      { nombre: 'Barras', valor: '32 mm' },
      { nombre: 'Amortiguación', valor: 'GRIP SL con remoto' },
      { nombre: 'Peso aprox.', valor: '1.300 g' },
      { nombre: 'Color', valor: 'Negro brillante' }
    ]
  },
  {
    idProducto: 101,
    nombre: 'Horquilla RockShox Lyrik Ultimate 27.5"',
    descripcion: 'Horquilla de enduro con resorte DebonAir y amortiguador Charger 2.1 RC2. Sellos SKF de baja fricción para una sensación muy suave.',
    precioNormal: 1144990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('suspensiones'),
    marca: marca('RockShox'),
    slug: 'rockshox-lyrik-ultimate',
    subtipo: 'Horquilla Enduro',
    imagenPrincipal: '/img/productos/suspensiones/rockshox-lyrik-ultimate.jpg',
    stockDisponible: 2,
    stockMinimo: 1,
    sku: 'SUS-0004',
    proveedor: 'SRAM Latam',
    especificaciones: [
      { nombre: 'Aro', valor: '27.5"' },
      { nombre: 'Recorrido', valor: '160 mm' },
      { nombre: 'Barras', valor: '35 mm' },
      { nombre: 'Resorte', valor: 'DebonAir' },
      { nombre: 'Amortiguación', valor: 'Charger 2.1 RC2' },
      { nombre: 'Eje', valor: '15 x 110 mm (Boost)' },
      { nombre: 'Color', valor: 'Rojo' }
    ]
  },
  {
    idProducto: 102,
    nombre: 'Horquilla Marzocchi Bomber Z1 29"',
    descripcion: 'La herencia freeride de Marzocchi: barras de 38 mm, amortiguador GRIP y chasis de la Super Z. Ideal para bicis de enduro o freeride.',
    precioNormal: 999990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('suspensiones'),
    marca: marca('Marzocchi'),
    slug: 'marzocchi-bomber-z1',
    subtipo: 'Horquilla Enduro / Freeride',
    imagenPrincipal: '/img/productos/suspensiones/marzocchi-bomber-z1.jpg',
    stockDisponible: 2,
    stockMinimo: 1,
    sku: 'SUS-0005',
    proveedor: 'Fox Racing Chile',
    especificaciones: [
      { nombre: 'Aro', valor: '29"' },
      { nombre: 'Recorrido', valor: '170 mm' },
      { nombre: 'Barras', valor: '38 mm' },
      { nombre: 'Amortiguación', valor: 'GRIP Sweep-Adj' },
      { nombre: 'Offset', valor: '44 mm' },
      { nombre: 'Apta e-bike', valor: 'Sí' },
      { nombre: 'Color', valor: 'Negro' }
    ]
  },
  {
    idProducto: 103,
    nombre: 'Mantención Básica',
    descripcion: 'Una revisión general para que tu bici quede andando bien: ajustamos cambios y frenos, lubricamos la cadena y revisamos que todo esté firme.',
    precioNormal: 19990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('mantenimiento'),
    marca: marca('Rider Tapia'),
    slug: 'mantencion-basica',
    subtipo: 'Servicio de taller',
    imagenPrincipal: '/img/productos/mantenimiento/mantencion-basica.jpg',
    stockDisponible: 99,
    stockMinimo: 5,
    sku: 'MNT-0001',
    proveedor: 'Taller Rider Tapia',
    especificaciones: [
      { nombre: 'Incluye', valor: 'Revisión general, ajuste de cambios, ajuste de frenos, lubricación de cadena, revisión de presión de neumáticos, apriete general de pernos, revisión visual de ruedas, dirección y transmisión.' },
      { nombre: 'Lugar', valor: 'Taller Rider Tapia, Centro, Concepción' }
    ]
  },
  {
    idProducto: 104,
    nombre: 'Mantención Semi',
    descripcion: 'Todo lo de la básica, más limpieza de la transmisión, una regulación más fina de cambios y frenos y el centrado básico de las ruedas.',
    precioNormal: 34990,
    estado: 'PUBLICADO',
    destacado: false,
    ordenDestacado: null,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('mantenimiento'),
    marca: marca('Rider Tapia'),
    slug: 'mantencion-semi',
    subtipo: 'Servicio de taller',
    imagenPrincipal: '/img/productos/mantenimiento/mantencion-semi.jpg',
    stockDisponible: 99,
    stockMinimo: 5,
    sku: 'MNT-0002',
    proveedor: 'Taller Rider Tapia',
    especificaciones: [
      { nombre: 'Incluye', valor: 'Todo lo de la básica + limpieza de transmisión, regulación más fina de cambios y frenos, centrado básico de ruedas, revisión de piñón, cadena y plato, ajuste de dirección, ajuste de caja motor, revisión de pastillas o zapatas de freno.' },
      { nombre: 'Lugar', valor: 'Taller Rider Tapia, Centro, Concepción' }
    ]
  },
  {
    idProducto: 105,
    nombre: 'Mantención Full',
    descripcion: 'La mantención completa: desarmamos, limpiamos a fondo y dejamos tu bici como nueva, con diagnóstico completo del desgaste.',
    precioNormal: 59990,
    estado: 'PUBLICADO',
    destacado: true,
    ordenDestacado: 8,
    limitePorCompra: LIMITE_POR_COMPRA,
    fechaCreacion: FECHA_CARGA,
    categoria: categoria('mantenimiento'),
    marca: marca('Rider Tapia'),
    slug: 'mantencion-full',
    subtipo: 'Servicio de taller',
    imagenPrincipal: '/img/productos/mantenimiento/mantencion-full.jpg',
    stockDisponible: 99,
    stockMinimo: 5,
    sku: 'MNT-0003',
    proveedor: 'Taller Rider Tapia',
    especificaciones: [
      { nombre: 'Incluye', valor: 'Todo lo anterior + desarme, limpieza profunda y lubricación de transmisión, mantención de masas, dirección y motor, centrado completo de ruedas, purgado de frenos hidráulicos si aplica, revisión de suspensión si aplica, cambio o instalación de componentes menores, diagnóstico completo de desgaste.' },
      { nombre: 'Lugar', valor: 'Taller Rider Tapia, Centro, Concepción' }
    ]
  }
];
