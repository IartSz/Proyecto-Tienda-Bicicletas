/* =========================================================
   CATEGORÍAS Y OPCIONES
   Va antes que los otros archivos de js/datos/
   ========================================================= */

// carpeta: donde está su página dentro de categorias/
const CATEGORIAS_BASE = {
  cascos:       { titulo: "Cascos",       grupo: "Indumentaria",  carpeta: "indumentaria",  icono: "bi-shield",              subtitulo: "Protección para ciudad, trail y enduro." },
  rodilleras:   { titulo: "Rodilleras",   grupo: "Indumentaria",  carpeta: "indumentaria",  icono: "bi-shield-plus",         subtitulo: "Protege tus rodillas sin perder movilidad." },
  guantes:      { titulo: "Guantes",      grupo: "Indumentaria",  carpeta: "indumentaria",  icono: "bi-hand-index-thumb",    subtitulo: "Agarre, tacto y protección para tus manos." },
  cortavientos: { titulo: "Cortavientos", grupo: "Indumentaria",  carpeta: "indumentaria",  icono: "bi-wind",                subtitulo: "Livianos y plegables para cuando cambia el clima." },
  bombines:     { titulo: "Bombines",     grupo: "Accesorios",    carpeta: "accesorios",    icono: "bi-fuel-pump",           subtitulo: "Para la casa, la mochila o la suspensión." },
  botellas:     { titulo: "Botellas",     grupo: "Accesorios",    carpeta: "accesorios",    icono: "bi-cup-straw",           subtitulo: "Hidratación para cada salida." },
  luces:        { titulo: "Luces",        grupo: "Accesorios",    carpeta: "accesorios",    icono: "bi-lightbulb",           subtitulo: "Que la noche no pare la ruta." },
  punos:        { titulo: "Puños",        grupo: "Accesorios",    carpeta: "accesorios",    icono: "bi-grip-horizontal",     subtitulo: "Comodidad y control en el manubrio." },
  sillines:     { titulo: "Sillines",     grupo: "Accesorios",    carpeta: "accesorios",    icono: "bi-bicycle",             subtitulo: "Comodidad para ruta, trail o ciudad." },
  tapabarros:   { titulo: "Tapabarros",   grupo: "Accesorios",    carpeta: "accesorios",    icono: "bi-cloud-drizzle",       subtitulo: "Que el barro se quede en el camino." },
  transmision:  { titulo: "Transmisión",  grupo: "Componentes",   carpeta: "componentes",   icono: "bi-gear-wide-connected", subtitulo: "Cadenas, cassettes, mandos y cambios." },
  frenos:       { titulo: "Frenos",       grupo: "Componentes",   carpeta: "componentes",   icono: "bi-disc",                subtitulo: "Frenos, pastillas y rotores." },
  mazas:        { titulo: "Mazas",        grupo: "Componentes",   carpeta: "componentes",   icono: "bi-bullseye",            subtitulo: "Mazas delanteras y traseras." },
  pedales:      { titulo: "Pedales",      grupo: "Componentes",   carpeta: "componentes",   icono: "bi-gear",                subtitulo: "Planos o de clip, para cada estilo." },
  manubrios:    { titulo: "Manubrios",    grupo: "Componentes",   carpeta: "componentes",   icono: "bi-arrows-angle-expand", subtitulo: "Control y posición sobre la bici." },
  neumaticos:   { titulo: "Neumáticos",   grupo: "Neumáticos",    carpeta: "neumaticos",    icono: "bi-circle",              subtitulo: "Agarre y rendimiento para cada terreno." },
  camaras:      { titulo: "Cámaras",      grupo: "Neumáticos",    carpeta: "neumaticos",    icono: "bi-record-circle",       subtitulo: "Cámaras de repuesto para todas las medidas." },
  suspensiones: { titulo: "Suspensiones", grupo: "Suspensiones",  carpeta: "suspensiones",  icono: "bi-arrow-down-up",       subtitulo: "Horquillas para XC, trail y enduro." },
  mantenimiento:{ titulo: "Mantenimiento",grupo: "Mantenimiento", carpeta: "mantenimiento", icono: "bi-tools",               subtitulo: "Mantenciones en nuestro taller." }
};

// Prefijos para el código de inventario (CAS-0001, LUZ-0001...)
const PREFIJOS = {
  cascos: "CAS", rodilleras: "ROD", guantes: "GUA", cortavientos: "COR",
  bombines: "BOM", botellas: "BOT", luces: "LUZ", punos: "PUN", sillines: "SIL", tapabarros: "TAP",
  transmision: "TRA", frenos: "FRE", mazas: "MAZ", pedales: "PED", manubrios: "MAN",
  neumaticos: "NEU", camaras: "CAM", suspensiones: "SUS", mantenimiento: "MNT"
};

// Opciones reutilizables
const TALLA = { nombre: "Talla", columna: "Circunferencia de cabeza", guia: "Guía de tallas",
                nota: "Mide tu cabeza con una huincha, 2 cm sobre las cejas." };
const TALLA_RODILLERA = { nombre: "Talla", columna: "Contorno de muslo", guia: "Guía de tallas",
                nota: "Mide tu muslo con una huincha, unos 10 cm sobre la rodilla y con la pierna estirada." };
const TALLA_GUANTE = { nombre: "Talla", columna: "Largo de la mano", guia: "Guía de tallas",
                nota: "Mide tu mano desde la muñeca hasta la punta del dedo del medio." };
const TALLA_ROPA = { nombre: "Talla", columna: "Contorno de pecho", guia: "Guía de tallas",
                nota: "Mide tu pecho con una huincha por la parte más ancha." };
const MEDIDA_NEUMATICO = { nombre: "Medida", columna: "Uso recomendado", guia: "Medidas disponibles",
                nota: "La medida está impresa en el costado de tu neumático actual (ej: 29 x 2.4)." };
const MEDIDA_CAMARA = { nombre: "Medida", columna: "Válvula", guia: "Medidas disponibles",
                nota: "La cámara debe coincidir con el aro y el rango de ancho de tu neumático. Revisa si tu aro usa válvula Presta (delgada) o Schrader (tipo auto)." };
const ANCHO_SILLIN = { nombre: "Ancho", columna: "Distancia entre isquiones", guia: "Medidas disponibles",
                nota: "Siéntate sobre un cartón y mide la distancia entre las dos marcas que quedan. Si tienes dudas, pregúntanos en la tienda." };
const RISE = { nombre: "Rise", columna: "Uso recomendado", guia: "Medidas disponibles",
                nota: "El rise es cuánto sube el manubrio desde el centro. Más rise, posición más erguida." };
const COLOR = { nombre: "Color", columna: "Terminación", guia: "Colores disponibles", nota: "" };

// Cada archivo de js/datos/ agrega sus productos acá
const PRODUCTOS_BASE = [];
