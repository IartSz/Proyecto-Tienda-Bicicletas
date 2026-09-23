/* =========================================================
   CATÁLOGO DE PRODUCTOS - Rider Tapia

   IMPORTANTE: los productos de abajo son los datos INICIALES.
   La primera vez que se abre la tienda se copian al navegador
   (localStorage) y desde ahí se leen y modifican, tanto en la
   tienda como en el Panel de Administración.
   Si cambias algo aquí y no lo ves, usa "Restablecer datos" en el panel.

   Para agregar un producto, copia un bloque { ... } y cambia los datos:
   - id: único, sin espacios ni tildes (se usa en producto.html?id=...)
   - categoria: "cascos", "luces", "neumaticos" o "camaras"
   - imagen: ruta desde la carpeta "archivos". Si queda "" se muestra un ícono.
   - precioAnterior: número si está en oferta, o null si no.
   - opciones: tallas/medidas a elegir. disponible: false = agotado.
     Si el producto no tiene opciones, pon: opciones: null
   ========================================================= */

const CATEGORIAS_BASE = {
  cascos:     { titulo: "Cascos",     grupo: "Indumentaria", icono: "bi-shield",        subtitulo: "Protección para ciudad, trail y enduro." },
  luces:      { titulo: "Luces",      grupo: "Accesorios",   icono: "bi-lightbulb",     subtitulo: "Que la noche no pare la ruta." },
  neumaticos: { titulo: "Neumáticos", grupo: "Neumáticos",   icono: "bi-circle",        subtitulo: "Agarre y rendimiento para cada terreno." },
  camaras:    { titulo: "Cámaras",    grupo: "Neumáticos",   icono: "bi-record-circle", subtitulo: "Cámaras de repuesto para todas las medidas." }
};

// Opciones reutilizables
const TALLA = { nombre: "Talla", columna: "Circunferencia de cabeza", guia: "Guía de tallas",
                nota: "Mide tu cabeza con una huincha, 2 cm sobre las cejas." };
const MEDIDA_NEUMATICO = { nombre: "Medida", columna: "Uso recomendado", guia: "Medidas disponibles",
                nota: "La medida está impresa en el costado de tu neumático actual (ej: 29 x 2.4)." };
const MEDIDA_CAMARA = { nombre: "Medida", columna: "Válvula", guia: "Medidas disponibles",
                nota: "La cámara debe coincidir con el aro y el rango de ancho de tu neumático. Revisa si tu aro usa válvula Presta (delgada) o Schrader (tipo auto)." };

const PRODUCTOS_BASE = [

  /* ===================== CASCOS ===================== */
  {
    id: "leatt-allmtn-10", categoria: "cascos",
    nombre: "Casco Leatt AllMtn 1.0 Titanium", marca: "Leatt", tipo: "Enduro / Convertible",
    precio: 109990, precioAnterior: null,
    imagen: "img/categorias/Casco-Leatt-AllMtn-1.0-Titanium.jpg",
    descripcion: "El AllMtn 1.0 te da la protección de un full-face en las bajadas y la ventilación de un casco abierto en las subidas: la mentonera se saca en segundos. Acabado Titanium.",
    caracteristicas: { "Uso": "Enduro, All Mountain", "Mentonera": "Desmontable", "Peso aprox.": "750 g", "Ventilaciones": "16", "Certificación": "EN 1078 / CPSC", "Color": "Titanium" },
    opciones: { ...TALLA, valores: [
      { valor: "S", detalle: "51–55 cm", disponible: true },
      { valor: "M", detalle: "55–59 cm", disponible: true },
      { valor: "L", detalle: "59–63 cm", disponible: false } ] }
  },
  {
    id: "fox-speedframe-mips", categoria: "cascos",
    nombre: "Casco Fox Speedframe MIPS", marca: "Fox", tipo: "Trail / MTB",
    precio: 89990, precioAnterior: null, imagen: "",
    descripcion: "Pensado para largas jornadas de trail: liviano, bien ventilado y con sistema MIPS que reduce las fuerzas de rotación en caso de impacto. Visera ajustable y ajuste trasero con rueda.",
    caracteristicas: { "Uso": "Trail, XC", "Sistema MIPS": "Sí", "Peso aprox.": "380 g", "Ventilaciones": "14", "Certificación": "EN 1078 / CPSC", "Color": "Negro" },
    opciones: { ...TALLA, valores: [
      { valor: "S", detalle: "51–55 cm", disponible: true },
      { valor: "M", detalle: "55–59 cm", disponible: true },
      { valor: "L", detalle: "59–63 cm", disponible: true } ] }
  },
  {
    id: "bell-super-air-r", categoria: "cascos",
    nombre: "Casco Bell Super Air R MIPS", marca: "Bell", tipo: "Enduro / Convertible",
    precio: 179990, precioAnterior: 219990, imagen: "",
    descripcion: "Uno de los convertibles más ventilados del mercado. Mentonera removible, MIPS, soporte para antiparras y montaje para cámara o luz.",
    caracteristicas: { "Uso": "Enduro, Descenso ligero", "Mentonera": "Desmontable", "Sistema MIPS": "Sí", "Peso aprox.": "800 g", "Ventilaciones": "18", "Certificación": "EN 1078 / CPSC", "Color": "Gris / Negro" },
    opciones: { ...TALLA, valores: [
      { valor: "S", detalle: "52–56 cm", disponible: false },
      { valor: "M", detalle: "55–59 cm", disponible: true },
      { valor: "L", detalle: "58–62 cm", disponible: true } ] }
  },
  {
    id: "specialized-align-ii", categoria: "cascos",
    nombre: "Casco Specialized Align II MIPS", marca: "Specialized", tipo: "MTB / Ruta",
    precio: 54990, precioAnterior: 64990, imagen: "",
    descripcion: "Un casco para todo: ruta, ciudad o sendero. Ajuste simple, MIPS incluido y visera fija. Excelente relación precio/protección.",
    caracteristicas: { "Uso": "MTB, Ruta, Urbano", "Sistema MIPS": "Sí", "Peso aprox.": "360 g", "Ventilaciones": "15", "Certificación": "EN 1078", "Color": "Negro mate" },
    opciones: { ...TALLA, valores: [
      { valor: "S/M", detalle: "52–56 cm", disponible: true },
      { valor: "M/L", detalle: "56–60 cm", disponible: true },
      { valor: "XL",  detalle: "60–64 cm", disponible: true } ] }
  },
  {
    id: "giro-register-mips", categoria: "cascos",
    nombre: "Casco Giro Register MIPS", marca: "Giro", tipo: "Urbano / MTB",
    precio: 49990, precioAnterior: null, imagen: "",
    descripcion: "Casco de talla única con ajuste por rueda. Cómodo, liviano y con MIPS, perfecto para moverse por la ciudad o salir al cerro.",
    caracteristicas: { "Uso": "Urbano, MTB recreativo", "Sistema MIPS": "Sí", "Peso aprox.": "320 g", "Ventilaciones": "22", "Certificación": "EN 1078 / CPSC", "Color": "Azul mate" },
    opciones: { ...TALLA, valores: [
      { valor: "Única", detalle: "54–61 cm", disponible: true } ] }
  },
  {
    id: "radical-mountain-casco-urbano", categoria: "cascos",
    nombre: "Casco Radical Mountain Urbano", marca: "Radical Mountain", tipo: "Urbano",
    precio: 24990, precioAnterior: null, imagen: "",
    descripcion: "Casco de entrada para la ciudad, con luz LED trasera integrada para ser visto de noche y ajuste con rueda.",
    caracteristicas: { "Uso": "Urbano", "Luz trasera": "LED integrada", "Peso aprox.": "290 g", "Ventilaciones": "12", "Certificación": "EN 1078", "Color": "Blanco" },
    opciones: { ...TALLA, valores: [
      { valor: "M", detalle: "54–58 cm", disponible: true },
      { valor: "L", detalle: "58–62 cm", disponible: true } ] }
  },

  /* ===================== LUCES ===================== */
  {
    id: "cateye-ampp-800", categoria: "luces",
    nombre: "Luz Delantera Cateye AMPP 800", marca: "Cateye", tipo: "Delantera",
    precio: 49990, precioAnterior: null, imagen: "",
    descripcion: "Luz delantera potente y compacta, ideal para salidas nocturnas en ciudad o cerro. Carga por USB y soporte de manubrio incluido.",
    caracteristicas: { "Potencia": "800 lúmenes", "Modos": "5 (alto, medio, bajo, flash, hyper)", "Autonomía": "Hasta 20 h (modo bajo)", "Carga": "USB-C", "Resistencia al agua": "IPX4", "Montaje": "Manubrio 22–32 mm" },
    opciones: null
  },
  {
    id: "lezyne-lite-drive-1200", categoria: "luces",
    nombre: "Luz Delantera Lezyne Lite Drive 1200+", marca: "Lezyne", tipo: "Delantera",
    precio: 69990, precioAnterior: 79990, imagen: "",
    descripcion: "Cuerpo de aluminio mecanizado, 1200 lúmenes y modo de sobrecarga para bajadas técnicas de noche.",
    caracteristicas: { "Potencia": "1200 lúmenes", "Modos": "8", "Autonomía": "Hasta 67 h (modo economía)", "Carga": "USB", "Material": "Aluminio", "Resistencia al agua": "IPX7" },
    opciones: null
  },
  {
    id: "cateye-rapid-x2", categoria: "luces",
    nombre: "Luz Trasera Cateye Rapid X2", marca: "Cateye", tipo: "Trasera",
    precio: 24990, precioAnterior: null, imagen: "",
    descripcion: "Luz trasera de alta visibilidad con banda LED, se ve desde lejos incluso de día.",
    caracteristicas: { "Potencia": "50 lúmenes", "Modos": "6", "Autonomía": "Hasta 30 h", "Carga": "USB", "Montaje": "Tija o mochila" },
    opciones: null
  },
  {
    id: "lezyne-strip-drive-pro", categoria: "luces",
    nombre: "Luz Trasera Lezyne Strip Drive Pro 300", marca: "Lezyne", tipo: "Trasera",
    precio: 32990, precioAnterior: null, imagen: "",
    descripcion: "Luz trasera con 5 LED en línea para una visibilidad lateral y trasera excelente.",
    caracteristicas: { "Potencia": "300 lúmenes", "Modos": "9", "Autonomía": "Hasta 53 h", "Carga": "USB", "Resistencia al agua": "IPX7" },
    opciones: null
  },
  {
    id: "radical-mountain-kit-luces", categoria: "luces",
    nombre: "Kit Luces LED USB Radical Mountain", marca: "Radical Mountain", tipo: "Kit delantera + trasera",
    precio: 12990, precioAnterior: 16990, imagen: "",
    descripcion: "Kit básico de luz delantera y trasera recargables. Ideal para ser visto en la ciudad.",
    caracteristicas: { "Incluye": "Luz delantera + trasera", "Potencia": "200 / 20 lúmenes", "Carga": "USB", "Montaje": "Elástico de silicona" },
    opciones: { nombre: "Color", columna: "Carcasa", guia: "Colores disponibles", nota: "", valores: [
      { valor: "Negro",  detalle: "Carcasa negra",  disponible: true },
      { valor: "Blanco", detalle: "Carcasa blanca", disponible: true },
      { valor: "Rojo",   detalle: "Carcasa roja",   disponible: false } ] }
  },

  /* ===================== NEUMÁTICOS ===================== */
  {
    id: "maxxis-minion-dhf", categoria: "neumaticos",
    nombre: "Neumático Maxxis Minion DHF 3C EXO TR", marca: "Maxxis", tipo: "MTB Enduro",
    precio: 44990, precioAnterior: null, imagen: "",
    descripcion: "El delantero de referencia para enduro: tacos laterales agresivos para curvas con máximo agarre. Tubeless ready y protección EXO.",
    caracteristicas: { "Uso": "Enduro, Trail agresivo", "Compuesto": "3C MaxxTerra", "Carcasa": "EXO (anti cortes)", "Tubeless": "Sí (TR)", "Talón": "Plegable" },
    opciones: { ...MEDIDA_NEUMATICO, valores: [
      { valor: "27.5 x 2.5", detalle: "Enduro, aro 27.5\"", disponible: true },
      { valor: "29 x 2.5",   detalle: "Enduro, aro 29\"",   disponible: true },
      { valor: "29 x 2.6",   detalle: "Enduro, aro 29\"",   disponible: false } ] }
  },
  {
    id: "maxxis-ardent", categoria: "neumaticos",
    nombre: "Neumático Maxxis Ardent EXO TR", marca: "Maxxis", tipo: "MTB Trail",
    precio: 34990, precioAnterior: null, imagen: "",
    descripcion: "Neumático rápido y versátil para trail, con buen rodado y agarre en terreno seco o suelto.",
    caracteristicas: { "Uso": "Trail, XC", "Compuesto": "Dual", "Carcasa": "EXO", "Tubeless": "Sí (TR)", "Talón": "Plegable" },
    opciones: { ...MEDIDA_NEUMATICO, valores: [
      { valor: "27.5 x 2.25", detalle: "Trail, aro 27.5\"", disponible: true },
      { valor: "29 x 2.25",   detalle: "Trail, aro 29\"",   disponible: true },
      { valor: "29 x 2.4",    detalle: "Trail, aro 29\"",   disponible: true } ] }
  },
  {
    id: "schwalbe-nobby-nic", categoria: "neumaticos",
    nombre: "Neumático Schwalbe Nobby Nic Addix", marca: "Schwalbe", tipo: "MTB Trail",
    precio: 49990, precioAnterior: 56990, imagen: "",
    descripcion: "Todo terreno clásico de Schwalbe. Compuesto Addix con buen equilibrio entre agarre y duración.",
    caracteristicas: { "Uso": "Trail, All Mountain", "Compuesto": "Addix SpeedGrip", "Tubeless": "Sí (TLE)", "Talón": "Plegable" },
    opciones: { ...MEDIDA_NEUMATICO, valores: [
      { valor: "27.5 x 2.35", detalle: "Trail, aro 27.5\"", disponible: true },
      { valor: "29 x 2.35",   detalle: "Trail, aro 29\"",   disponible: true } ] }
  },
  {
    id: "continental-gp5000", categoria: "neumaticos",
    nombre: "Neumático Continental Grand Prix 5000", marca: "Continental", tipo: "Ruta",
    precio: 54990, precioAnterior: null, imagen: "",
    descripcion: "Neumático de ruta de alto rendimiento: baja resistencia al rodado y buena protección contra pinchazos.",
    caracteristicas: { "Uso": "Ruta, Competición", "Compuesto": "BlackChili", "Protección": "Vectran Breaker", "Talón": "Plegable" },
    opciones: { ...MEDIDA_NEUMATICO, valores: [
      { valor: "700 x 25c", detalle: "Ruta", disponible: true },
      { valor: "700 x 28c", detalle: "Ruta / Endurance", disponible: true },
      { valor: "700 x 32c", detalle: "Endurance / Gravel ligero", disponible: false } ] }
  },
  {
    id: "kenda-kwest", categoria: "neumaticos",
    nombre: "Neumático Kenda Kwest Urbano", marca: "Kenda", tipo: "Urbano",
    precio: 14990, precioAnterior: null, imagen: "",
    descripcion: "Neumático liso de ciudad, rueda rápido sobre pavimento y tiene buena duración.",
    caracteristicas: { "Uso": "Urbano, Paseo", "Banda de rodado": "Semi lisa", "Talón": "Alambre" },
    opciones: { ...MEDIDA_NEUMATICO, valores: [
      { valor: "26 x 1.5",  detalle: "Urbano, aro 26\"", disponible: true },
      { valor: "700 x 35c", detalle: "Urbano / Híbrida", disponible: true } ] }
  },

  /* ===================== CÁMARAS ===================== */
  {
    id: "maxxis-welter-weight", categoria: "camaras",
    nombre: "Cámara Maxxis Welter Weight", marca: "Maxxis", tipo: "MTB",
    precio: 7990, precioAnterior: null, imagen: "",
    descripcion: "Cámara de butilo resistente para MTB, buena relación entre peso y durabilidad.",
    caracteristicas: { "Material": "Butilo", "Largo válvula": "48 mm", "Peso aprox.": "200 g" },
    opciones: { ...MEDIDA_CAMARA, valores: [
      { valor: "27.5 x 1.9–2.35", detalle: "Presta", disponible: true },
      { valor: "29 x 1.9–2.35",   detalle: "Presta", disponible: true },
      { valor: "29 x 1.9–2.35 (S)", detalle: "Schrader", disponible: true } ] }
  },
  {
    id: "schwalbe-sv19", categoria: "camaras",
    nombre: "Cámara Schwalbe SV19", marca: "Schwalbe", tipo: "MTB",
    precio: 8990, precioAnterior: null, imagen: "",
    descripcion: "Cámara de calidad alemana para aros de 29\", con válvula Presta desmontable.",
    caracteristicas: { "Material": "Butilo", "Largo válvula": "40 mm", "Núcleo de válvula": "Desmontable" },
    opciones: { ...MEDIDA_CAMARA, valores: [
      { valor: "29 x 1.5–2.4", detalle: "Presta", disponible: true } ] }
  },
  {
    id: "kenda-26-schrader", categoria: "camaras",
    nombre: "Cámara Kenda Estándar", marca: "Kenda", tipo: "Urbano / MTB",
    precio: 4990, precioAnterior: null, imagen: "",
    descripcion: "Cámara económica y confiable para uso diario.",
    caracteristicas: { "Material": "Butilo", "Largo válvula": "35 mm" },
    opciones: { ...MEDIDA_CAMARA, valores: [
      { valor: "26 x 1.9–2.125",   detalle: "Schrader", disponible: true },
      { valor: "27.5 x 1.9–2.125", detalle: "Schrader", disponible: true },
      { valor: "700 x 28–35c",     detalle: "Schrader", disponible: false } ] }
  },
  {
    id: "continental-race-28", categoria: "camaras",
    nombre: "Cámara Continental Race 28", marca: "Continental", tipo: "Ruta",
    precio: 8490, precioAnterior: null, imagen: "",
    descripcion: "Cámara liviana para bicicletas de ruta.",
    caracteristicas: { "Material": "Butilo", "Largo válvula": "60 mm", "Peso aprox.": "100 g" },
    opciones: { ...MEDIDA_CAMARA, valores: [
      { valor: "700 x 20–25c", detalle: "Presta", disponible: true },
      { valor: "700 x 25–32c", detalle: "Presta", disponible: true } ] }
  },
  {
    id: "tubolito-tubo-mtb", categoria: "camaras",
    nombre: "Cámara Tubolito Tubo MTB (TPU)", marca: "Tubolito", tipo: "MTB",
    precio: 29990, precioAnterior: 34990, imagen: "",
    descripcion: "Cámara de TPU ultraliviana: pesa menos de la mitad que una cámara tradicional y ocupa muy poco espacio en la mochila.",
    caracteristicas: { "Material": "TPU", "Peso aprox.": "90 g", "Válvula": "Presta 42 mm" },
    opciones: { ...MEDIDA_CAMARA, valores: [
      { valor: "27.5 x 1.8–2.5", detalle: "Presta", disponible: true },
      { valor: "29 x 1.8–2.5",   detalle: "Presta", disponible: true } ] }
  }
];

/* =========================================================
   DATOS INICIALES DE INVENTARIO (código, stock, proveedor)
   ========================================================= */
const INVENTARIO_BASE = {
  "leatt-allmtn-10":               { stock: 0,  stockMin: 4, proveedor: "Leatt Chile" },
  "fox-speedframe-mips":           { stock: 7,  stockMin: 3, proveedor: "Fox Racing Chile" },
  "bell-super-air-r":              { stock: 3,  stockMin: 2, proveedor: "Bell Latam" },
  "specialized-align-ii":          { stock: 9,  stockMin: 3, proveedor: "Specialized Chile" },
  "giro-register-mips":            { stock: 12, stockMin: 4, proveedor: "Giro Latam" },
  "radical-mountain-casco-urbano": { stock: 15, stockMin: 5, proveedor: "Radical Mountain" },
  "cateye-ampp-800":               { stock: 10, stockMin: 4, proveedor: "Cateye Chile" },
  "lezyne-lite-drive-1200":        { stock: 6,  stockMin: 3, proveedor: "Lezyne Chile" },
  "cateye-rapid-x2":               { stock: 14, stockMin: 4, proveedor: "Cateye Chile" },
  "lezyne-strip-drive-pro":        { stock: 8,  stockMin: 3, proveedor: "Lezyne Chile" },
  "radical-mountain-kit-luces":    { stock: 25, stockMin: 8, proveedor: "Radical Mountain" },
  "maxxis-minion-dhf":             { stock: 2,  stockMin: 6, proveedor: "Distribuidora Andes" },
  "maxxis-ardent":                 { stock: 11, stockMin: 6, proveedor: "Distribuidora Andes" },
  "schwalbe-nobby-nic":            { stock: 7,  stockMin: 4, proveedor: "Schwalbe Chile" },
  "continental-gp5000":            { stock: 3,  stockMin: 4, proveedor: "Continental Chile" },
  "kenda-kwest":                   { stock: 18, stockMin: 6, proveedor: "Kenda Chile" },
  "maxxis-welter-weight":          { stock: 30, stockMin: 10, proveedor: "Distribuidora Andes" },
  "schwalbe-sv19":                 { stock: 20, stockMin: 8, proveedor: "Schwalbe Chile" },
  "kenda-26-schrader":             { stock: 40, stockMin: 10, proveedor: "Kenda Chile" },
  "continental-race-28":           { stock: 16, stockMin: 6, proveedor: "Continental Chile" },
  "tubolito-tubo-mtb":             { stock: 5,  stockMin: 3, proveedor: "Tubolito" }
};

const PREFIJOS = { cascos: "CAS", luces: "LUZ", neumaticos: "NEU", camaras: "CAM" };

/* =========================================================
   PERSISTENCIA (localStorage)
   Claves: "productos", "categorias", "movimientos", "pedidos"
   ========================================================= */

function leerLS(clave, porDefecto) {
  try {
    const v = JSON.parse(localStorage.getItem(clave));
    return v === null || v === undefined ? porDefecto : v;
  } catch (e) { return porDefecto; }
}
function guardarLS(clave, valor) {
  try { localStorage.setItem(clave, JSON.stringify(valor)); return true; }
  catch (e) { alert("No se pudo guardar: el almacenamiento del navegador está lleno (prueba con imágenes más livianas)."); return false; }
}

function cargarCategorias() {
  const guardadas = leerLS("categorias", null);
  if (guardadas) return guardadas;
  const base = JSON.parse(JSON.stringify(CATEGORIAS_BASE));
  guardarLS("categorias", base);
  return base;
}

function cargarProductos() {
  const guardados = leerLS("productos", null);
  if (guardados) return guardados;

  // Primera vez: copiar los productos base y agregarles datos de inventario
  const contadores = {};
  const base = PRODUCTOS_BASE.map(p => {
    const pref = PREFIJOS[p.categoria] || "PRD";
    contadores[pref] = (contadores[pref] || 0) + 1;
    const inv = INVENTARIO_BASE[p.id] || { stock: 10, stockMin: 3, proveedor: "" };
    return { ...p, codigo: pref + "-" + String(contadores[pref]).padStart(4, "0"),
             stock: inv.stock, stockMin: inv.stockMin, proveedor: inv.proveedor, activo: true };
  });
  guardarLS("productos", base);
  return base;
}

let CATEGORIAS = cargarCategorias();
let PRODUCTOS = cargarProductos();

function guardarProductos()  { return guardarLS("productos", PRODUCTOS); }
function guardarCategorias() { return guardarLS("categorias", CATEGORIAS); }

// Productos visibles en la tienda (los dados de baja no se muestran)
function productosActivos() {
  return PRODUCTOS.filter(p => p.activo !== false);
}

/* ---------- Movimientos de inventario ---------- */
function leerMovimientos() { return leerLS("movimientos", []); }

function registrarMovimiento(producto, tipo, cantidad, usuario, detalle) {
  const movs = leerMovimientos();
  movs.unshift({
    fecha: new Date().toISOString(),
    productoId: producto.id,
    nombre: producto.nombre,
    tipo, cantidad,
    stockResultante: producto.stock,
    usuario, detalle: detalle || ""
  });
  guardarLS("movimientos", movs.slice(0, 500));
}

/* ---------- Venta desde el checkout: descuenta stock ---------- */
// Devuelve un texto de error si falta stock, o null si todo bien
function validarStockCarrito(carrito) {
  const cantidades = {};
  carrito.forEach(i => cantidades[i.id] = (cantidades[i.id] || 0) + i.cantidad);
  for (const id in cantidades) {
    const p = PRODUCTOS.find(x => x.id === id);
    if (!p || p.activo === false) return "Un producto de tu carrito ya no está disponible.";
    if (p.stock < cantidades[id]) return `Solo quedan ${p.stock} unidades de "${p.nombre}".`;
  }
  return null;
}

function registrarVenta(pedido) {
  PRODUCTOS = cargarProductos(); // leer lo último guardado
  pedido.items.forEach(item => {
    const p = PRODUCTOS.find(x => x.id === item.id);
    if (!p) return;
    p.stock = Math.max(0, p.stock - item.cantidad);
    registrarMovimiento(p, "Venta", -item.cantidad, "Sistema", "Pedido " + pedido.numero);
  });
  guardarProductos();
}

/* =========================================================
   FUNCIONES COMPARTIDAS

   ========================================================= */

// 109990 -> "$109.990"
function formatoPrecio(n) {
  return "$" + n.toLocaleString("es-CL");
}

// Imagen del producto, o el ícono de su categoría si no tiene imagen
function rutaImagen(p, prefijo) {
  if (!p.imagen) return "";
  if (p.imagen.startsWith("data:") || p.imagen.startsWith("http")) return p.imagen;
  return (prefijo || "") + p.imagen;
}

function htmlImagen(p, alto, prefijo) {
  const icono = (CATEGORIAS[p.categoria] && CATEGORIAS[p.categoria].icono) || "bi-box-seam";
  const placeholder = `<div class="d-flex align-items-center justify-content-center h-100"><i class="bi ${icono}" style="font-size:4rem; color:#999;"></i></div>`;
  if (!p.imagen) return placeholder;
  return `<img src="${rutaImagen(p, prefijo)}" alt="${p.nombre}" style="width:100%; height:${alto}; object-fit:contain;"
            onerror="this.outerHTML='${placeholder.replace(/"/g, "&quot;")}'">`;
}

// Dibuja el listado de una categoría en la página (cascos.html, luces.html, etc.)
function renderCatalogo(categoria) {
  const contenedor = document.getElementById("listaProductos");
  const selectOrden = document.getElementById("orden");

  function mostrar() {
    let lista = productosActivos().filter(p => p.categoria === categoria);
    if (selectOrden.value === "asc")  lista.sort((a, b) => a.precio - b.precio);
    if (selectOrden.value === "desc") lista.sort((a, b) => b.precio - a.precio);

    contenedor.innerHTML = lista.map(p => `
      <div class="col-6 col-md-4 col-lg-3">
        <a href="producto.html?id=${p.id}" class="text-decoration-none text-reset d-block h-100">
          <div class="product-card h-100 bg-white position-relative">
            ${p.stock <= 0 ? '<span class="badge bg-secondary position-absolute m-2" style="z-index:1;">AGOTADO</span>'
              : p.precioAnterior ? '<span class="badge badge-offer position-absolute m-2" style="z-index:1;">OFERTA</span>' : ''}
            <div class="product-thumb" style="height:220px; padding:10px;">${htmlImagen(p, "200px")}</div>
            <div class="p-3">
              <small class="text-muted text-uppercase" style="font-size:.7rem; letter-spacing:1px;">${p.marca} · ${p.tipo}</small>
              <h6 class="mb-1 mt-1">${p.nombre}</h6>
              ${p.precioAnterior ? `<span class="price-old">${formatoPrecio(p.precioAnterior)}</span>` : ''}
              <span class="price-new">${formatoPrecio(p.precio)}</span>
              ${p.opciones ? `<div class="mt-2" style="font-size:.8rem;">${p.opciones.nombre}: ${p.opciones.valores.map(v => v.valor).join(" · ")}</div>` : ''}
            </div>
          </div>
        </a>
      </div>`).join("");

    if (lista.length === 0) {
      contenedor.innerHTML = '<div class="col-12 text-center text-muted py-5"><i class="bi bi-box-seam" style="font-size:2.5rem;"></i><p class="mt-2">Aún no hay productos en esta categoría.</p></div>';
    }
    document.getElementById("contador").textContent = lista.length + " productos";
  }

  // Título de la categoría (por si fue renombrada en el panel)
  const cat = CATEGORIAS[categoria];
  if (cat) {
    document.title = cat.titulo + " - Rider Tapia";
    document.querySelectorAll("[data-cat-titulo]").forEach(e => e.textContent = cat.titulo);
    document.querySelectorAll("[data-cat-subtitulo]").forEach(e => e.textContent = cat.subtitulo || "");
    document.querySelectorAll("[data-cat-grupo]").forEach(e => e.textContent = cat.grupo || "");
  }

  selectOrden.addEventListener("change", mostrar);
  mostrar();
}

// Página de una categoría: las 4 originales tienen su propio archivo,
// las creadas desde el panel usan categoria.html?cat=...
function urlCategoria(slug) {
  return ["cascos", "luces", "neumaticos", "camaras"].includes(slug) ? slug + ".html" : "categoria.html?cat=" + slug;
}

/* =========================================================
   ESTADOS DE LOS PEDIDOS (los usa la tienda y el panel)
   ========================================================= */
const ESTADOS_PEDIDO = {
  "Pendiente de pago": { icono: "bi-hourglass-split",  badge: "bg-warning text-dark", tag: "tag-bajo",    texto: "Esperando la transferencia." },
  "Pagado":            { icono: "bi-credit-card",      badge: "bg-info text-dark",    tag: "tag-ingreso", texto: "Recibimos tu pago." },
  "En preparación":    { icono: "bi-box-seam",         badge: "bg-primary",           tag: "tag-ajuste",  texto: "Estamos preparando tu pedido." },
  "Enviado":           { icono: "bi-truck",            badge: "bg-primary",           tag: "tag-venta",   texto: "Tu pedido va en camino." },
  "Listo para retiro": { icono: "bi-shop",             badge: "bg-success",           tag: "tag-venta",   texto: "Puedes retirarlo en la tienda (Centro, Concepción)." },
  "Entregado":         { icono: "bi-check2-circle",    badge: "bg-success",           tag: "tag-ok",      texto: "Pedido entregado. ¡Gracias por tu compra!" },
  "Cancelado":         { icono: "bi-x-circle",         badge: "bg-danger",            tag: "tag-cero",    texto: "El pedido fue cancelado." }
};
const ESTADOS_FINALES = ["Entregado", "Cancelado"];

// Pasos que se muestran en la barra de avance del cliente
function pasosPedido(p) {
  const pasos = ["Pagado", "En preparación", p.entrega === "retiro" ? "Listo para retiro" : "Enviado", "Entregado"];
  return p.pago === "transferencia" ? ["Pendiente de pago", ...pasos] : pasos;
}

// Estado inicial al crear un pedido
function estadoInicial(pago) {
  return pago === "transferencia" ? "Pendiente de pago" : "Pagado";
}

// Estado actual (los pedidos antiguos no tenían el campo)
function estadoPedido(p) {
  return p.estado || estadoInicial(p.pago);
}

function historialPedido(p) {
  return p.historial && p.historial.length ? p.historial
    : [{ estado: estadoInicial(p.pago), fecha: p.fechaISO || new Date().toISOString(), nota: "Pedido recibido." }];
}

// Cambia el estado, guarda el historial y marca novedad para el cliente.
// Si se cancela, devuelve el stock de los productos.
function cambiarEstadoPedido(numero, nuevoEstado, nota, seguimiento) {
  const pedidos = leerLS("pedidos", []);
  const p = pedidos.find(x => x.numero === numero);
  if (!p) return { ok: false, error: "Pedido no encontrado." };
  const actual = estadoPedido(p);
  if (ESTADOS_FINALES.includes(actual)) return { ok: false, error: "El pedido ya está " + actual.toLowerCase() + " y no se puede cambiar." };
  if (actual === nuevoEstado && !nota && !seguimiento) return { ok: false, error: "El pedido ya está en ese estado." };

  p.historial = historialPedido(p);
  p.historial.push({ estado: nuevoEstado, fecha: new Date().toISOString(), nota: (nota || "").trim() });
  p.estado = nuevoEstado;
  if (seguimiento) p.seguimiento = seguimiento.trim();
  p.novedad = true;   // el cliente verá un aviso hasta que abra "Mis pedidos"

  if (nuevoEstado === "Cancelado" && !p.demo) {
    PRODUCTOS = cargarProductos();
    p.items.forEach(i => {
      const prod = PRODUCTOS.find(x => x.id === i.id);
      if (!prod) return;
      prod.stock += i.cantidad;
      registrarMovimiento(prod, "Ajuste", i.cantidad, "admin", "Cancelación pedido " + p.numero);
    });
    guardarProductos();
  }
  guardarLS("pedidos", pedidos);
  return { ok: true, pedido: p };
}
