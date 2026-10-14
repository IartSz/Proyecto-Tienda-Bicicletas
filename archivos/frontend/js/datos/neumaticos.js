/* =========================================================
   NEUMÁTICOS
   ========================================================= */
PRODUCTOS_BASE.push(

  /* ===================== NEUMÁTICOS ===================== */
  {
    id: "maxxis-minion-dhf", categoria: "neumaticos",
    nombre: "Neumático Maxxis Minion DHF 3C EXO TR", marca: "Maxxis", tipo: "MTB Enduro",
    precio: 44990, precioAnterior: null, imagen: "img/productos/neumaticos/maxxis-minion-dhf.jpg",
    stock: 2, stockMin: 6, proveedor: "Distribuidora Andes",
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
    precio: 34990, precioAnterior: null, imagen: "img/productos/neumaticos/maxxis-ardent.jpg",
    stock: 11, stockMin: 6, proveedor: "Distribuidora Andes",
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
    precio: 49990, precioAnterior: 56990, imagen: "img/productos/neumaticos/schwalbe-nobby-nic.jpg",
    stock: 7, stockMin: 4, proveedor: "Schwalbe Chile",
    descripcion: "Todo terreno clásico de Schwalbe. Compuesto Addix con buen equilibrio entre agarre y duración.",
    caracteristicas: { "Uso": "Trail, All Mountain", "Compuesto": "Addix SpeedGrip", "Tubeless": "Sí (TLE)", "Talón": "Plegable" },
    opciones: { ...MEDIDA_NEUMATICO, valores: [
      { valor: "27.5 x 2.35", detalle: "Trail, aro 27.5\"", disponible: true },
      { valor: "29 x 2.35",   detalle: "Trail, aro 29\"",   disponible: true } ] }
  },
  {
    id: "continental-gp5000", categoria: "neumaticos",
    nombre: "Neumático Continental Grand Prix 5000", marca: "Continental", tipo: "Ruta",
    precio: 54990, precioAnterior: null, imagen: "img/productos/neumaticos/continental-gp5000.jpg",
    stock: 3, stockMin: 4, proveedor: "Continental Chile",
    descripcion: "Neumático de ruta de alto rendimiento: baja resistencia al rodado y buena protección contra pinchazos.",
    caracteristicas: { "Uso": "Ruta, Competición", "Compuesto": "BlackChili", "Protección": "Vectran Breaker", "Talón": "Plegable" },
    opciones: { ...MEDIDA_NEUMATICO, valores: [
      { valor: "700 x 25c", detalle: "Ruta", disponible: true },
      { valor: "700 x 28c", detalle: "Ruta / Endurance", disponible: true },
      { valor: "700 x 32c", detalle: "Endurance / Gravel ligero", disponible: false } ] }
  },
  {
    id: "continental-kryptotal-f", categoria: "neumaticos",
    nombre: "Neumático Continental Kryptotal-F Enduro", marca: "Continental", tipo: "MTB Enduro",
    precio: 109990, precioAnterior: null, imagen: "img/productos/neumaticos/continental-kryptotal-f.jpg",
    stock: 6, stockMin: 3, proveedor: "Continental Chile",
    descripcion: "Neumático delantero para enduro y descenso: control, tracción y estabilidad en terreno técnico. Carcasa Enduro Casing y compuesto Super Soft para máximo agarre.",
    caracteristicas: { "Uso": "Enduro, Descenso", "Posición": "Delantero", "Compuesto": "Super Soft", "Carcasa": "Enduro Casing", "Tubeless": "Sí (TR)", "Talón": "Plegable" },
    opciones: { ...MEDIDA_NEUMATICO, valores: [
      { valor: "27.5 x 2.4", detalle: "Enduro, aro 27.5\"", disponible: true },
      { valor: "29 x 2.4",   detalle: "Enduro, aro 29\"",   disponible: true },
      { valor: "29 x 2.6",   detalle: "Enduro, aro 29\"",   disponible: true } ] }
  },
  {
    id: "continental-cross-king", categoria: "neumaticos",
    nombre: "Neumático Continental Cross King ShieldWall", marca: "Continental", tipo: "MTB Trail",
    precio: 44990, precioAnterior: null, imagen: "img/productos/neumaticos/continental-cross-king.jpg",
    stock: 10, stockMin: 4, proveedor: "Continental Chile",
    descripcion: "Neumático versátil para terreno mixto: rueda rápido en suelo compacto y mantiene el control en senderos y curvas. Protección ShieldWall contra cortes.",
    caracteristicas: { "Uso": "Trail, XC", "Compuesto": "PureGrip", "Protección": "ShieldWall System", "Tubeless": "Sí (TR)", "Talón": "Plegable" },
    opciones: { ...MEDIDA_NEUMATICO, valores: [
      { valor: "27.5 x 2.3", detalle: "Trail, aro 27.5\"", disponible: true },
      { valor: "29 x 2.3",   detalle: "Trail, aro 29\"",   disponible: true } ] }
  },
  {
    id: "continental-race-king", categoria: "neumaticos",
    nombre: "Neumático Continental Race King ShieldWall", marca: "Continental", tipo: "MTB XC",
    precio: 49990, precioAnterior: null, imagen: "img/productos/neumaticos/continental-race-king.jpg",
    stock: 8, stockMin: 4, proveedor: "Continental Chile",
    descripcion: "Pensado para la velocidad en terreno seco y compacto. Baja resistencia al rodado, carcasa ShieldWall y compuesto PureGrip.",
    caracteristicas: { "Uso": "XC, Trail rápido", "Compuesto": "PureGrip", "Protección": "ShieldWall System", "Tubeless": "Sí (TR)", "Talón": "Plegable" },
    opciones: { ...MEDIDA_NEUMATICO, valores: [
      { valor: "27.5 x 2.2", detalle: "XC, aro 27.5\"", disponible: true },
      { valor: "29 x 2.2",   detalle: "XC, aro 29\"",   disponible: true } ] }
  },
  {
    id: "maxxis-ikon", categoria: "neumaticos",
    nombre: "Neumático Maxxis Ikon 3C MaxxSpeed EXO TR", marca: "Maxxis", tipo: "MTB XC",
    precio: 35990, precioAnterior: 59990, imagen: "img/productos/neumaticos/maxxis-ikon.jpg",
    stock: 9, stockMin: 4, proveedor: "Distribuidora Andes",
    descripcion: "Neumático liviano y de alto volumen para XC y maratón. Compuesto 3C MaxxSpeed para un rodado muy eficiente y protección EXO contra cortes.",
    caracteristicas: { "Uso": "XC, Maratón", "Compuesto": "3C MaxxSpeed", "Carcasa": "EXO", "Tubeless": "Sí (TR)", "Talón": "Plegable" },
    opciones: { ...MEDIDA_NEUMATICO, valores: [
      { valor: "27.5 x 2.35", detalle: "XC, aro 27.5\"", disponible: true },
      { valor: "29 x 2.2",    detalle: "XC, aro 29\"",   disponible: true } ] }
  },
  {
    id: "continental-terra-trail", categoria: "neumaticos",
    nombre: "Neumático Continental Terra Trail ShieldWall", marca: "Continental", tipo: "Gravel",
    precio: 49990, precioAnterior: null, imagen: "img/productos/neumaticos/continental-terra-trail.jpg",
    stock: 5, stockMin: 3, proveedor: "Continental Chile",
    descripcion: "Neumático de gravel para rutas exigentes y bikepacking: control y tracción en terreno mixto, con protección ShieldWall y compuesto PureGrip.",
    caracteristicas: { "Uso": "Gravel, Bikepacking", "Compuesto": "PureGrip", "Protección": "ShieldWall System", "Tubeless": "Sí (TR)", "Talón": "Plegable" },
    opciones: { ...MEDIDA_NEUMATICO, valores: [
      { valor: "700 x 40c", detalle: "Gravel", disponible: true },
      { valor: "700 x 45c", detalle: "Gravel / Bikepacking", disponible: true } ] }
  },

  /* ===================== CÁMARAS ===================== */
  {
    id: "maxxis-welter-weight", categoria: "camaras",
    nombre: "Cámara Maxxis Welter Weight", marca: "Maxxis", tipo: "MTB",
    precio: 7990, precioAnterior: null, imagen: "img/productos/camaras/maxxis-welter-weight.jpg",
    stock: 30, stockMin: 10, proveedor: "Distribuidora Andes",
    descripcion: "Cámara de butilo resistente para MTB, buena relación entre peso y durabilidad.",
    caracteristicas: { "Material": "Butilo", "Largo válvula": "48 mm", "Peso aprox.": "200 g" },
    opciones: { ...MEDIDA_CAMARA, valores: [
      { valor: "27.5 x 1.9–2.35", detalle: "Presta", disponible: true },
      { valor: "29 x 1.9–2.35",   detalle: "Presta", disponible: true },
      { valor: "29 x 1.9–2.35 (S)", detalle: "Schrader", disponible: true } ] }
  },
  {
    id: "kenda-26-schrader", categoria: "camaras",
    nombre: "Cámara Kenda Estándar", marca: "Kenda", tipo: "Urbano / MTB",
    precio: 4990, precioAnterior: null, imagen: "img/productos/camaras/kenda-26-schrader.jpg",
    stock: 40, stockMin: 10, proveedor: "Kenda Chile",
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
    precio: 8490, precioAnterior: null, imagen: "img/productos/camaras/continental-race-28.jpg",
    stock: 16, stockMin: 6, proveedor: "Continental Chile",
    descripcion: "Cámara liviana para bicicletas de ruta.",
    caracteristicas: { "Material": "Butilo", "Largo válvula": "60 mm", "Peso aprox.": "100 g" },
    opciones: { ...MEDIDA_CAMARA, valores: [
      { valor: "700 x 20–25c", detalle: "Presta", disponible: true },
      { valor: "700 x 25–32c", detalle: "Presta", disponible: true } ] }
  },
  {
    id: "serfas-mtb", categoria: "camaras",
    nombre: "Cámara Serfas MTB", marca: "Serfas", tipo: "MTB",
    precio: 5390, precioAnterior: 5990, imagen: "img/productos/camaras/serfas-mtb.jpg",
    stock: 35, stockMin: 10, proveedor: "Serfas Chile",
    descripcion: "Cámara de butilo para aros de MTB, disponible con válvula Presta o Schrader.",
    caracteristicas: { "Material": "Butilo", "Largo válvula": "48 mm (Presta) / 33–60 mm (Schrader)" },
    opciones: { ...MEDIDA_CAMARA, valores: [
      { valor: "26 x 1.75–2.2",       detalle: "Schrader", disponible: true },
      { valor: "27.5 x 1.75–2.3",     detalle: "Presta",   disponible: true },
      { valor: "27.5 x 1.75–2.3 (S)", detalle: "Schrader", disponible: true },
      { valor: "29 x 1.75–2.35",      detalle: "Presta",   disponible: true },
      { valor: "29 x 1.75–2.35 (S)",  detalle: "Schrader", disponible: true } ] }
  },
  {
    id: "chaoyang-700-33-37", categoria: "camaras",
    nombre: "Cámara Chaoyang 700 x 33/37c", marca: "Chaoyang", tipo: "Gravel / Urbano",
    precio: 5990, precioAnterior: null, imagen: "img/productos/camaras/chaoyang-700-33-37.jpg",
    stock: 20, stockMin: 8, proveedor: "Chaoyang Chile",
    descripcion: "Cámara de butilo para neumáticos 700c anchos, típicos de gravel, híbridas y bicis urbanas.",
    caracteristicas: { "Material": "Butilo", "Largo válvula": "60 mm" },
    opciones: { ...MEDIDA_CAMARA, valores: [
      { valor: "700 x 33–37c", detalle: "Presta", disponible: true } ] }
  },
  {
    id: "arisun-275", categoria: "camaras",
    nombre: "Cámara Arisun 27.5\"", marca: "Arisun", tipo: "MTB",
    precio: 5990, precioAnterior: null, imagen: "img/productos/camaras/arisun-275.jpg",
    stock: 25, stockMin: 8, proveedor: "Arisun Chile",
    descripcion: "Cámara de butilo para aro 27.5\", confiable y económica para el uso diario en el cerro.",
    caracteristicas: { "Material": "Butilo", "Largo válvula": "33 mm" },
    opciones: { ...MEDIDA_CAMARA, valores: [
      { valor: "27.5 x 1.75–2.35",     detalle: "Presta",   disponible: true },
      { valor: "27.5 x 1.75–2.35 (S)", detalle: "Schrader", disponible: true } ] }
  },
  {
    id: "ridenow-tpu-gravel", categoria: "camaras",
    nombre: "Cámara RideNow TPU Gravel", marca: "RideNow", tipo: "Gravel",
    precio: 14990, precioAnterior: null, imagen: "img/productos/camaras/ridenow-tpu-gravel.jpg",
    stock: 7, stockMin: 3, proveedor: "RideNow Chile",
    descripcion: "Cámara de TPU ultraliviana para gravel: pesa unos 45 g y ocupa muy poco espacio en el bolso de sillín.",
    caracteristicas: { "Material": "TPU", "Peso aprox.": "45 g", "Válvula": "Presta" },
    opciones: { ...MEDIDA_CAMARA, valores: [
      { valor: "700 x 32–47c", detalle: "Presta", disponible: true } ] }
  }
);
