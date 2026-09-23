/* =========================================================
   COMPONENTES
   ========================================================= */
PRODUCTOS_BASE.push(

  /* ===================== TRANSMISIÓN ===================== */
  {
    id: "sram-cadena-gx-eagle", categoria: "transmision",
    nombre: "Cadena SRAM GX Eagle 12v", marca: "SRAM", tipo: "Cadena",
    precio: 59990, precioAnterior: null, imagen: "img/productos/transmision/sram-cadena-gx-eagle.jpg",
    stock: 10, stockMin: 4, proveedor: "SRAM Latam",
    descripcion: "Cadena de 12 velocidades para transmisiones Eagle, silenciosa y durable. Incluye PowerLock para instalarla y sacarla sin herramientas especiales.",
    caracteristicas: { "Velocidades": "12", "Compatibilidad": "SRAM Eagle", "Eslabones": "126", "Unión": "PowerLock", "Color": "Plata / Negro" },
    opciones: null
  },
  {
    id: "shimano-cadena-xtr-m9100", categoria: "transmision",
    nombre: "Cadena Shimano XTR CN-M9100 12v", marca: "Shimano", tipo: "Cadena",
    precio: 104390, precioAnterior: null, imagen: "img/productos/transmision/shimano-cadena-xtr-m9100.jpg",
    stock: 5, stockMin: 2, proveedor: "Shimano Chile",
    descripcion: "Cadena tope de línea de Shimano para transmisiones Hyperglide+ de 12 velocidades. Liviana, precisa y compatible con e-bikes.",
    caracteristicas: { "Velocidades": "12", "Línea": "XTR", "Eslabones": "126", "Unión": "Quick-Link incluido", "Compatible e-bike": "Sí" },
    opciones: null
  },
  {
    id: "shimano-105-r7000", categoria: "transmision",
    nombre: "Cassette Shimano 105 CS-R7000 11v", marca: "Shimano", tipo: "Cassette",
    precio: 74990, precioAnterior: null, imagen: "img/productos/transmision/shimano-105-r7000.jpg",
    stock: 6, stockMin: 2, proveedor: "Shimano Chile",
    descripcion: "Cassette de 11 velocidades del grupo 105 R7000: la tecnología de Ultegra y Dura-Ace a un precio accesible para ruta.",
    caracteristicas: { "Velocidades": "11", "Grupo": "105 R7000", "Uso": "Ruta", "Núcleo": "Shimano HG" },
    opciones: { nombre: "Relación", columna: "Uso recomendado", guia: "Relaciones disponibles", nota: "Revisa que tu cambio trasero aguante un piñón de 32 dientes.", valores: [
      { valor: "11-28T", detalle: "Ruta, terreno plano", disponible: false },
      { valor: "11-32T", detalle: "Ruta con subidas", disponible: true } ] }
  },
  {
    id: "sram-sx-eagle-shifter", categoria: "transmision",
    nombre: "Mando de Cambio SRAM SX Eagle 12v", marca: "SRAM", tipo: "Mando de cambio",
    precio: 59990, precioAnterior: null, imagen: "img/productos/transmision/sram-sx-eagle-shifter.jpg",
    stock: 7, stockMin: 3, proveedor: "SRAM Latam",
    descripcion: "Mando de cambio trasero tipo gatillo para transmisiones Eagle de 12 velocidades. Incluye abrazadera y cable.",
    caracteristicas: { "Velocidades": "12", "Actuación": "X-Actuation", "Tipo": "Gatillo", "Abrazadera": "Incluida", "Cable": "2200 mm" },
    opciones: null
  },
  {
    id: "sram-nx-cambio-11v", categoria: "transmision",
    nombre: "Cambio Trasero SRAM NX 11v", marca: "SRAM", tipo: "Cambio trasero",
    precio: 118990, precioAnterior: null, imagen: "img/productos/transmision/sram-nx-cambio-11v.jpg",
    stock: 4, stockMin: 2, proveedor: "SRAM Latam",
    descripcion: "Cambio trasero de caja larga para transmisiones 1x de 11 velocidades, con tecnología X-Horizon que reduce los cambios fantasma y el golpe de cadena.",
    caracteristicas: { "Velocidades": "11", "Actuación": "X-Actuation", "Piñón máx.": "42T", "Caja": "Larga", "Color": "Negro" },
    opciones: null
  },

  /* ===================== FRENOS ===================== */
  {
    id: "shimano-mt200-trasero", categoria: "frenos",
    nombre: "Freno Hidráulico Shimano MT200 Trasero", marca: "Shimano", tipo: "Freno de disco",
    precio: 54990, precioAnterior: null, imagen: "img/productos/frenos/shimano-mt200-trasero.jpg",
    stock: 8, stockMin: 3, proveedor: "Shimano Chile",
    descripcion: "Freno de disco hidráulico completo (maneta, caliper y manguera) listo para instalar. La forma más simple de pasar a frenos hidráulicos.",
    caracteristicas: { "Posición": "Trasero", "Tipo": "Hidráulico, 2 pistones", "Incluye": "Maneta + caliper + manguera", "Rotor": "No incluido", "Color": "Negro" },
    opciones: null
  },
  {
    id: "magura-mt5-next", categoria: "frenos",
    nombre: "Freno Magura MT5 Next 4 Pistones", marca: "Magura", tipo: "Freno de disco",
    precio: 169990, precioAnterior: null, imagen: "img/productos/frenos/magura-mt5-next.jpg",
    stock: 4, stockMin: 2, proveedor: "Magura Chile",
    descripcion: "Toda la potencia de un freno de 4 pistones Magura a un precio accesible. Mucho control para enduro y trail agresivo.",
    caracteristicas: { "Tipo": "Hidráulico, 4 pistones", "Uso": "Enduro, Trail", "Fluido": "Aceite mineral Royal Blood", "Rotor": "No incluido" },
    opciones: null
  },
  {
    id: "sram-db6-delantero", categoria: "frenos",
    nombre: "Freno SRAM DB6 Delantero", marca: "SRAM", tipo: "Freno de disco",
    precio: 131990, precioAnterior: null, imagen: "img/productos/frenos/sram-db6-delantero.jpg",
    stock: 4, stockMin: 2, proveedor: "SRAM Latam",
    descripcion: "Freno potente de aceite mineral y bajo mantenimiento, con maneta Stealth que acerca la manguera al manubrio y se integra con los mandos Eagle (MatchMaker).",
    caracteristicas: { "Posición": "Delantero", "Tipo": "Hidráulico, 4 pistones", "Fluido": "Aceite mineral", "Manguera": "2000 mm", "Montaje": "MatchMaker X" },
    opciones: null
  },
  {
    id: "shimano-n03a", categoria: "frenos",
    nombre: "Pastillas Shimano N03A Resina Ice-Tech", marca: "Shimano", tipo: "Pastillas",
    precio: 34990, precioAnterior: null, imagen: "img/productos/frenos/shimano-n03a.jpg",
    stock: 15, stockMin: 5, proveedor: "Shimano Chile",
    descripcion: "Pastillas de resina con aletas Ice-Tech que disipan el calor. Frenada progresiva y silenciosa para frenos Shimano de 4 pistones.",
    caracteristicas: { "Compuesto": "Resina", "Disipador": "Ice-Tech", "Compatibilidad": "XTR M9120, XT M8120, SLX M7120" },
    opciones: null
  },
  {
    id: "magura-storm-cl", categoria: "frenos",
    nombre: "Rotor Magura Storm CL Center Lock", marca: "Magura", tipo: "Rotor",
    precio: 49990, precioAnterior: null, imagen: "img/productos/frenos/magura-storm-cl.jpg",
    stock: 9, stockMin: 3, proveedor: "Magura Chile",
    descripcion: "Rotor de 2 piezas para mazas Center Lock: resiste altas temperaturas y trabaja perfecto con frenos Magura de 4 pistones. Incluye anillo de montaje.",
    caracteristicas: { "Montaje": "Center Lock", "Construcción": "2 piezas", "Incluye": "Lock ring" },
    opciones: { nombre: "Diámetro", columna: "Peso aprox.", guia: "Medidas disponibles", nota: "Revisa hasta qué diámetro de disco aceptan tu cuadro y tu horquilla.", valores: [
      { valor: "160 mm", detalle: "194 g", disponible: true },
      { valor: "180 mm", detalle: "221 g", disponible: true },
      { valor: "203 mm", detalle: "253 g", disponible: true } ] }
  },

  /* ===================== MAZAS ===================== */
  {
    id: "shimano-fh-mt410", categoria: "mazas",
    nombre: "Maza Trasera Shimano FH-MT410 12v", marca: "Shimano", tipo: "Trasera",
    precio: 62890, precioAnterior: null, imagen: "img/productos/mazas/shimano-fh-mt410.jpg",
    stock: 5, stockMin: 2, proveedor: "Shimano Chile",
    descripcion: "Maza trasera Deore de 12 velocidades para freno de disco, con eje pasante E-Thru y sellado de laberinto para una larga vida útil.",
    caracteristicas: { "Posición": "Trasera", "Velocidades": "12 (Micro Spline)", "Rayos": "32", "Disco": "Center Lock", "Eje": "12 x 142 mm E-Thru" },
    opciones: null
  },
  {
    id: "shimano-xt-hb-m8010", categoria: "mazas",
    nombre: "Maza Delantera Shimano Deore XT HB-M8010", marca: "Shimano", tipo: "Delantera",
    precio: 83190, precioAnterior: null, imagen: "img/productos/mazas/shimano-xt-hb-m8010.jpg",
    stock: 4, stockMin: 2, proveedor: "Shimano Chile",
    descripcion: "Maza delantera XT con rodamientos de contacto angular y sellos de alta calidad. Liviana y durable en cualquier clima.",
    caracteristicas: { "Posición": "Delantera", "Rayos": "32", "Disco": "Center Lock", "Peso aprox.": "148 g", "Rodamientos": "Contacto angular" },
    opciones: null
  },
  {
    id: "hope-pro5-delantera", categoria: "mazas",
    nombre: "Maza Delantera Hope Pro 5 Boost", marca: "Hope", tipo: "Delantera",
    precio: 154900, precioAnterior: null, imagen: "img/productos/mazas/hope-pro5-delantera.jpg",
    stock: 3, stockMin: 1, proveedor: "Rock and Road",
    descripcion: "La nueva generación de mazas Hope: cuerpo más rígido sin agregar peso y rodamientos más grandes. Fabricada en Inglaterra, fácil de mantener.",
    caracteristicas: { "Posición": "Delantera", "Rayos": "32", "Eje": "15 x 110 mm (Boost)", "Disco": "6 pernos", "Color": "Negro" },
    opciones: null
  },
  {
    id: "hope-pro5-trasera", categoria: "mazas",
    nombre: "Maza Trasera Hope Pro 5 Boost HG", marca: "Hope", tipo: "Trasera",
    precio: 359900, precioAnterior: null, imagen: "img/productos/mazas/hope-pro5-trasera.jpg",
    stock: 2, stockMin: 1, proveedor: "Rock and Road",
    descripcion: "Maza trasera Pro 5 con núcleo HG, el famoso sonido Hope y rodamientos más grandes que la Pro 4. Hecha para durar años.",
    caracteristicas: { "Posición": "Trasera", "Rayos": "32", "Eje": "12 x 148 mm (Boost)", "Núcleo": "Shimano HG", "Color": "Azul" },
    opciones: null
  },
  {
    id: "715-ultra-trasera", categoria: "mazas",
    nombre: "Maza Trasera 715 Industries Ultra XD", marca: "715 Industries", tipo: "Trasera",
    precio: 189990, precioAnterior: null, imagen: "img/productos/mazas/715-ultra-trasera.jpg",
    stock: 3, stockMin: 1, proveedor: "715 Industries",
    descripcion: "Maza premium con sistema de 6 trinquetes y 612 puntos de enganche: acople casi instantáneo de 0,55° para una respuesta inmediata al pedalear.",
    caracteristicas: { "Posición": "Trasera", "Enganche": "612 puntos (0,55°)", "Trinquetes": "6", "Eje": "12 x 148 mm (Boost)", "Núcleo": "SRAM XD", "Color": "Negro" },
    opciones: null
  },

  /* ===================== PEDALES ===================== */
  {
    id: "oneup-composite", categoria: "pedales",
    nombre: "Pedales Planos OneUp Composite", marca: "OneUp", tipo: "Plano",
    precio: 59990, precioAnterior: null, imagen: "img/productos/pedales/oneup-composite.jpg",
    stock: 10, stockMin: 3, proveedor: "OneUp Chile",
    descripcion: "Plataforma enorme de 115 x 105 mm con 10 pines de acero por lado y perfil convexo que se acomoda al arco del pie. Solo 355 g.",
    caracteristicas: { "Tipo": "Plano", "Material": "Composite (nylon)", "Plataforma": "115 x 105 mm", "Pines": "10 por lado", "Peso aprox.": "355 g (par)" },
    opciones: { ...COLOR, valores: [
      { valor: "Negro",   detalle: "Negro",   disponible: true },
      { valor: "Naranjo", detalle: "Naranjo", disponible: true },
      { valor: "Azul",    detalle: "Azul",    disponible: true },
      { valor: "Verde",   detalle: "Verde",   disponible: true } ] }
  },
  {
    id: "oneup-aluminio", categoria: "pedales",
    nombre: "Pedales Planos OneUp Aluminio", marca: "OneUp", tipo: "Plano",
    precio: 199990, precioAnterior: null, imagen: "img/productos/pedales/oneup-aluminio.jpg",
    stock: 3, stockMin: 1, proveedor: "OneUp Chile",
    descripcion: "Pedales de aluminio ultradelgados que se enganchan menos en las piedras. Pines reemplazables y la misma plataforma grande de 115 x 105 mm.",
    caracteristicas: { "Tipo": "Plano", "Material": "Aluminio", "Plataforma": "115 x 105 mm", "Pines": "10 por lado, reemplazables", "Color": "Negro" },
    opciones: null
  },
  {
    id: "deity-black-kat", categoria: "pedales",
    nombre: "Pedales Planos Deity Black Kat", marca: "Deity", tipo: "Plano",
    precio: 139990, precioAnterior: null, imagen: "img/productos/pedales/deity-black-kat.jpg",
    stock: 3, stockMin: 1, proveedor: "Rock and Road",
    descripcion: "Pedal de aluminio 6061 con plataforma grande y cóncava, cuerpo delgado y rodamientos sellados de mayor tamaño para aguantar el descenso más extremo.",
    caracteristicas: { "Tipo": "Plano", "Material": "Aluminio 6061", "Forma": "Cóncava", "Rodamientos": "Doble sellado", "Color": "Plateado" },
    opciones: null
  },
  {
    id: "ht-m2", categoria: "pedales",
    nombre: "Pedales de Clip HT M2 XC", marca: "HT Components", tipo: "Clip (automático)",
    precio: 119990, precioAnterior: null, imagen: "img/productos/pedales/ht-m2.jpg",
    stock: 4, stockMin: 2, proveedor: "Rock and Road",
    descripcion: "Pedal automático para cross country aprobado por Nino Schurter. Evacúa muy bien el barro y tiene tensión regulable en cada lado.",
    caracteristicas: { "Tipo": "Clip (automático)", "Uso": "XC", "Peso aprox.": "305 g (par)", "Cuerpo": "Aluminio CNC", "Eje": "Cromoly CNC", "Incluye": "Calas" },
    opciones: null
  },
  {
    id: "ht-pa03a", categoria: "pedales",
    nombre: "Pedales Planos HT PA03A", marca: "HT Components", tipo: "Plano",
    precio: 27990, precioAnterior: 69990, imagen: "img/productos/pedales/ht-pa03a.jpg",
    stock: 12, stockMin: 4, proveedor: "Terrafirma",
    descripcion: "Pedal plano de nylon reforzado, liviano y económico, con pines reemplazables y doble rodamiento sellado.",
    caracteristicas: { "Tipo": "Plano", "Material": "Nylon reforzado", "Plataforma": "107 x 105 mm", "Peso aprox.": "345 g (par)", "Eje": "Cromoly CNC" },
    opciones: { ...COLOR, valores: [
      { valor: "Rojo",    detalle: "Rojo",    disponible: true },
      { valor: "Morado",  detalle: "Morado",  disponible: true },
      { valor: "Naranjo", detalle: "Naranjo flúor", disponible: true } ] }
  },

  /* ===================== MANUBRIOS ===================== */
  {
    id: "715-riser-40", categoria: "manubrios",
    nombre: "Manubrio 715 Industries Riser 35 mm", marca: "715 Industries", tipo: "Riser",
    precio: 54990, precioAnterior: null, imagen: "img/productos/manubrios/715-riser-40.jpg",
    stock: 6, stockMin: 2, proveedor: "715 Industries",
    descripcion: "Manubrio de aluminio 6061 para descenso y enduro: rígido, liviano y resistente a los golpes en terreno técnico.",
    caracteristicas: { "Uso": "Descenso, Enduro", "Material": "Aluminio 6061", "Abrazadera": "35 mm", "Rise": "40 mm", "Color": "Negro" },
    opciones: null
  },
  {
    id: "deity-racepoint-35", categoria: "manubrios",
    nombre: "Manubrio Deity Racepoint 35", marca: "Deity", tipo: "Riser",
    precio: 109990, precioAnterior: null, imagen: "img/productos/manubrios/deity-racepoint-35.jpg",
    stock: 4, stockMin: 2, proveedor: "Rock and Road",
    descripcion: "Manubrio probado durante 12 a 24 meses con los riders más exigentes. Tecnología Gradient Butting para una flexión controlada.",
    caracteristicas: { "Uso": "Enduro, Trail", "Material": "Aluminio 7050", "Abrazadera": "35 mm", "Rise": "38 mm", "Ancho": "810 mm (cortable)", "Color": "Negro (Stealth)" },
    opciones: null
  },
  {
    id: "renthal-fatbar-zero", categoria: "manubrios",
    nombre: "Manubrio Renthal Fatbar Zero Rise", marca: "Renthal", tipo: "Plano",
    precio: 93990, precioAnterior: 115990, imagen: "img/productos/manubrios/renthal-fatbar-zero.jpg",
    stock: 3, stockMin: 1, proveedor: "Cross Mountain",
    descripcion: "Manubrio plano con tecnología heredada del motocross: aluminio serie 7, liviano y durable. Marcas láser para centrarlo y cortarlo fácil.",
    caracteristicas: { "Uso": "XC, Trail", "Material": "Aluminio serie 7", "Abrazadera": "31,8 mm", "Rise": "0 mm", "Color": "Gris claro" },
    opciones: null
  },
  {
    id: "title-ah1-35", categoria: "manubrios",
    nombre: "Manubrio Title AH1 35", marca: "Title", tipo: "Riser",
    precio: 109990, precioAnterior: null, imagen: "img/productos/manubrios/title-ah1-35.jpg",
    stock: 5, stockMin: 2, proveedor: "Cross Mountain",
    descripcion: "Manubrio de aluminio de la marca de Olly Wilkins, pensado para trail y enduro. Disponible en dos alturas.",
    caracteristicas: { "Uso": "Trail, Enduro", "Material": "Aluminio", "Abrazadera": "35 mm", "Color": "Gris" },
    opciones: { ...RISE, valores: [
      { valor: "38 mm", detalle: "Trail, Enduro", disponible: true },
      { valor: "50 mm", detalle: "Enduro, Descenso", disponible: true } ] }
  },
  {
    id: "odi-flight-800", categoria: "manubrios",
    nombre: "Manubrio ODI Flight Control Stealth 800 mm", marca: "ODI", tipo: "Riser",
    precio: 119990, precioAnterior: null, imagen: "img/productos/manubrios/odi-flight-800.jpg",
    stock: 4, stockMin: 2, proveedor: "Cross Mountain",
    descripcion: "Manubrio con patrón de flexión pensado para trabajar con los puños ODI: reduce la vibración, el bombeo de antebrazos y la fatiga de manos.",
    caracteristicas: { "Uso": "Enduro, Trail", "Abrazadera": "35 mm", "Ancho": "800 mm", "Color": "Negro" },
    opciones: { ...RISE, valores: [
      { valor: "25 mm", detalle: "Trail, XC", disponible: true },
      { valor: "38 mm", detalle: "Trail, Enduro", disponible: true },
      { valor: "50 mm", detalle: "Enduro, Descenso", disponible: true } ] }
  }
);
