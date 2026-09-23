/* =========================================================
   INDUMENTARIA
   ========================================================= */
PRODUCTOS_BASE.push(

  /* ===================== CASCOS ===================== */
  {
    id: "leatt-allmtn-10", categoria: "cascos",
    nombre: "Casco Leatt AllMtn 1.0 Titanium", marca: "Leatt", tipo: "Enduro / Convertible",
    precio: 109990, precioAnterior: null,
    imagen: "img/productos/cascos/leatt-allmtn-10.jpg",
    stock: 0, stockMin: 4, proveedor: "Leatt Chile",
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
    precio: 89990, precioAnterior: null, imagen: "img/productos/cascos/fox-speedframe-mips.jpg",
    stock: 7, stockMin: 3, proveedor: "Fox Racing Chile",
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
    precio: 179990, precioAnterior: 219990, imagen: "img/productos/cascos/bell-super-air-r.jpg",
    stock: 3, stockMin: 2, proveedor: "Bell Latam",
    descripcion: "Uno de los convertibles más ventilados del mercado. Mentonera removible, MIPS, soporte para antiparras y montaje para cámara o luz.",
    caracteristicas: { "Uso": "Enduro, Descenso ligero", "Mentonera": "Desmontable", "Sistema MIPS": "Sí", "Peso aprox.": "800 g", "Ventilaciones": "18", "Certificación": "EN 1078 / CPSC", "Color": "Rojo / Gris" },
    opciones: { ...TALLA, valores: [
      { valor: "S", detalle: "52–56 cm", disponible: false },
      { valor: "M", detalle: "55–59 cm", disponible: true },
      { valor: "L", detalle: "58–62 cm", disponible: true } ] }
  },
  {
    id: "giro-register-mips", categoria: "cascos",
    nombre: "Casco Giro Register MIPS", marca: "Giro", tipo: "Urbano / MTB",
    precio: 49990, precioAnterior: null, imagen: "img/productos/cascos/giro-register-mips.jpg",
    stock: 12, stockMin: 4, proveedor: "Giro Latam",
    descripcion: "Casco de talla única con ajuste por rueda. Cómodo, liviano y con MIPS, perfecto para moverse por la ciudad o salir al cerro.",
    caracteristicas: { "Uso": "Urbano, MTB recreativo", "Sistema MIPS": "Sí", "Peso aprox.": "320 g", "Ventilaciones": "22", "Certificación": "EN 1078 / CPSC", "Color": "Titanium mate" },
    opciones: { ...TALLA, valores: [
      { valor: "Única", detalle: "54–61 cm", disponible: true } ] }
  },
  {
    id: "fox-mainframe-mips", categoria: "cascos",
    nombre: "Casco Fox Mainframe MIPS", marca: "Fox", tipo: "Trail / MTB",
    precio: 59990, precioAnterior: 79990, imagen: "img/productos/cascos/fox-mainframe-mips.jpg",
    stock: 10, stockMin: 4, proveedor: "Fox Racing Chile",
    descripcion: "Casco de trail con MIPS integrado al sistema de ajuste y mayor cobertura en la nuca. Espuma EPS moldeada para una buena ventilación y forro desmontable y lavable que evacúa la humedad.",
    caracteristicas: { "Uso": "Trail, XC", "Sistema MIPS": "Sí", "Peso aprox.": "390 g", "Forro": "Desmontable y lavable", "Certificación": "EN 1078 / CPSC", "Color": "Azul" },
    opciones: { ...TALLA, valores: [
      { valor: "S", detalle: "51–55 cm", disponible: true },
      { valor: "M", detalle: "55–59 cm", disponible: true },
      { valor: "L", detalle: "59–63 cm", disponible: true } ] }
  },
  {
    id: "bell-4forty-air-mips", categoria: "cascos",
    nombre: "Casco Bell 4Forty Air MIPS", marca: "Bell", tipo: "Trail / Enduro",
    precio: 99990, precioAnterior: null, imagen: "img/productos/cascos/bell-4forty-air-mips.jpg",
    stock: 5, stockMin: 3, proveedor: "Bell Latam",
    descripcion: "Casco de trail con cobertura extendida, visera ajustable en tres posiciones compatible con antiparras y sistema Float Fit con MIPS. Hebilla magnética y puertos para guardar los lentes.",
    caracteristicas: { "Uso": "Trail, Enduro", "Sistema MIPS": "Sí (Float Fit)", "Visera": "Ajustable, 3 posiciones", "Hebilla": "Magnética", "Certificación": "EN 1078 / CPSC", "Color": "Verde" },
    opciones: { ...TALLA, valores: [
      { valor: "M",  detalle: "55–59 cm", disponible: true },
      { valor: "L",  detalle: "58–62 cm", disponible: true },
      { valor: "XL", detalle: "61–65 cm", disponible: false } ] }
  },
  {
    id: "bell-sanction-2", categoria: "cascos",
    nombre: "Casco Integral Bell Sanction 2", marca: "Bell", tipo: "Integral / Bikepark",
    precio: 99990, precioAnterior: null, imagen: "img/productos/cascos/bell-sanction-2.jpg",
    stock: 6, stockMin: 2, proveedor: "Bell Latam",
    descripcion: "Casco integral para bikepark, BMX y descenso con la protección de un modelo mucho más caro. 14 ventilaciones, relleno Ventilated DH Air y almohadillas de mejillas extraíbles y lavables.",
    caracteristicas: { "Uso": "Bikepark, BMX, Descenso", "Tipo": "Integral (full face)", "Ventilaciones": "14", "Relleno": "Ventilated DH Air", "Certificación": "EN 1078 / CPSC", "Color": "Negro mate" },
    opciones: { ...TALLA, valores: [
      { valor: "XS/S", detalle: "51–55 cm", disponible: true },
      { valor: "M",    detalle: "55–57 cm", disponible: true },
      { valor: "L",    detalle: "57–59 cm", disponible: true },
      { valor: "XL",   detalle: "59–61 cm", disponible: true } ] }
  },
  {
    id: "fox-rampage-comp", categoria: "cascos",
    nombre: "Casco Integral Fox Rampage Comp MIPS", marca: "Fox", tipo: "Integral / Descenso",
    precio: 224990, precioAnterior: 299990, imagen: "img/productos/cascos/fox-rampage-comp.jpg",
    stock: 3, stockMin: 2, proveedor: "Fox Racing Chile",
    descripcion: "Casco integral de descenso con calota liviana de fibra de vidrio y sistema MIPS. Visera totalmente regulable compatible con antiparras y forro transpirable, desmontable y lavable.",
    caracteristicas: { "Uso": "Descenso, Enduro, Bikepark", "Tipo": "Integral (full face)", "Calota": "Fibra de vidrio", "Sistema MIPS": "Sí", "Cierre": "Doble anilla D", "Certificación": "ASTM F1952 / CPSC / EN 1078", "Color": "Negro / Blanco" },
    opciones: { ...TALLA, valores: [
      { valor: "S",  detalle: "55–56 cm", disponible: true },
      { valor: "M",  detalle: "57–58 cm", disponible: true },
      { valor: "L",  detalle: "59–60 cm", disponible: true },
      { valor: "XL", detalle: "61–62 cm", disponible: false } ] }
  },
  {
    id: "bell-avenue-mips", categoria: "cascos",
    nombre: "Casco Bell Avenue MIPS", marca: "Bell", tipo: "Urbano / Ruta",
    precio: 44990, precioAnterior: 69990, imagen: "img/productos/cascos/bell-avenue-mips.jpg",
    stock: 12, stockMin: 4, proveedor: "Bell Latam",
    descripcion: "Casco urbano y de ruta recreativa con MIPS integrado al ajuste Ergo Fit y construcción Fusion In-Mold. Una de las opciones más populares para el uso diario en la ciudad o la ciclovía.",
    caracteristicas: { "Uso": "Urbano, Ruta recreativa", "Sistema MIPS": "Sí", "Construcción": "Fusion In-Mold", "Ajuste": "Ergo Fit", "Certificación": "EN 1078 / CPSC", "Color": "Gris" },
    opciones: { ...TALLA, valores: [
      { valor: "Única", detalle: "54–61 cm", disponible: true } ] }
  },

  /* ===================== RODILLERAS ===================== */
  {
    id: "fox-launch-d3o", categoria: "rodilleras",
    nombre: "Rodilleras Fox Launch D3O", marca: "Fox", tipo: "Enduro / Trail",
    precio: 69990, precioAnterior: 99990, imagen: "img/productos/rodilleras/fox-launch-d3o.jpg",
    stock: 8, stockMin: 3, proveedor: "Fox Racing Chile",
    descripcion: "Rodillera que combina protección y movilidad sobre la bici. Piezas de D3O extraíbles que absorben los impactos y diseño en malla y Ariaprene para una buena ventilación.",
    caracteristicas: { "Uso": "Enduro, Trail, Bikepark", "Protección": "D3O extraíble", "Material": "Malla y Ariaprene", "Certificación": "EN 1621-1 nivel 1", "Color": "Negro" },
    opciones: { ...TALLA_RODILLERA, valores: [
      { valor: "S",  detalle: "38–41 cm", disponible: true },
      { valor: "M",  detalle: "41–44 cm", disponible: true },
      { valor: "L",  detalle: "44–47 cm", disponible: true },
      { valor: "XL", detalle: "47–50 cm", disponible: true } ] }
  },
  {
    id: "fox-enduro-d3o", categoria: "rodilleras",
    nombre: "Rodilleras Fox Enduro D3O", marca: "Fox", tipo: "Trail / XC",
    precio: 89990, precioAnterior: null, imagen: "img/productos/rodilleras/fox-enduro-d3o.jpg",
    stock: 10, stockMin: 3, proveedor: "Fox Racing Chile",
    descripcion: "Rodillera tipo manga, liviana y fresca para pedalear todo el día. Pieza de D3O extraíble para lavarla, malla elástica abierta y tratamiento antimicrobiano contra el mal olor.",
    caracteristicas: { "Uso": "Trail, XC", "Protección": "D3O extraíble", "Tratamiento": "Antimicrobiano", "Certificación": "EN 1621-1 nivel 1", "Color": "Negro" },
    opciones: { ...TALLA_RODILLERA, valores: [
      { valor: "XS",  detalle: "35–38 cm", disponible: true },
      { valor: "S",   detalle: "38–41 cm", disponible: true },
      { valor: "M",   detalle: "41–44 cm", disponible: true },
      { valor: "L",   detalle: "44–47 cm", disponible: true },
      { valor: "XL",  detalle: "47–50 cm", disponible: true },
      { valor: "XXL", detalle: "50–53 cm", disponible: true } ] }
  },
  {
    id: "alpinestars-paragon-plus", categoria: "rodilleras",
    nombre: "Rodilleras Alpinestars Paragon Plus", marca: "Alpinestars", tipo: "Trail / Enduro",
    precio: 34990, precioAnterior: 54990, imagen: "img/productos/rodilleras/alpinestars-paragon-plus.jpg",
    stock: 4, stockMin: 2, proveedor: "Alpinestars Chile",
    descripcion: "Rodillera de manga con protector flexible y buena ventilación, pensada para trail y enduro a un precio accesible.",
    caracteristicas: { "Uso": "Trail, Enduro", "Tipo": "Manga", "Certificación": "CE nivel 1", "Color": "Negro" },
    opciones: { ...TALLA_RODILLERA, valores: [
      { valor: "S", detalle: "38–41 cm", disponible: false },
      { valor: "M", detalle: "41–44 cm", disponible: true },
      { valor: "L", detalle: "44–47 cm", disponible: false } ] }
  },
  {
    id: "poc-vpd-system-lite", categoria: "rodilleras",
    nombre: "Rodilleras POC VPD System Lite", marca: "POC", tipo: "Enduro / Trail",
    precio: 99990, precioAnterior: 139990, imagen: "img/productos/rodilleras/poc-vpd-system-lite.jpg",
    stock: 5, stockMin: 2, proveedor: "POC Chile",
    descripcion: "Moldeada en 3D y muy ventilada. El material VPD se endurece con el impacto y su exterior de baja fricción ayuda a deslizar en caso de caída.",
    caracteristicas: { "Uso": "Enduro, Trail", "Protección": "VPD (se endurece al impacto)", "Exterior": "Baja fricción", "Certificación": "EN 1621-1", "Color": "Negro" },
    opciones: { ...TALLA_RODILLERA, valores: [
      { valor: "S", detalle: "38–41 cm", disponible: false },
      { valor: "M", detalle: "41–44 cm", disponible: true },
      { valor: "L", detalle: "44–47 cm", disponible: true } ] }
  },
  {
    id: "leatt-airflex-hybrid-pro", categoria: "rodilleras",
    nombre: "Rodilleras Leatt AirFlex Hybrid Pro", marca: "Leatt", tipo: "Enduro / Descenso",
    precio: 119990, precioAnterior: 147990, imagen: "img/productos/rodilleras/leatt-airflex-hybrid-pro.jpg",
    stock: 6, stockMin: 2, proveedor: "Leatt Chile",
    descripcion: "Rodillera súper delgada con gel de impacto AirFlex: suave y flexible, pero capaz de resistir golpes fuertes. Placa deslizante extra y acolchado lateral.",
    caracteristicas: { "Uso": "Enduro, Descenso", "Protección": "Gel AirFlex + placa deslizante", "Certificación": "CE EN 1621-1", "Color": "Negro" },
    opciones: { ...TALLA_RODILLERA, valores: [
      { valor: "S",   detalle: "38–41 cm", disponible: true },
      { valor: "M",   detalle: "41–44 cm", disponible: true },
      { valor: "L",   detalle: "44–47 cm", disponible: true },
      { valor: "XL",  detalle: "47–50 cm", disponible: true },
      { valor: "XXL", detalle: "50–53 cm", disponible: true } ] }
  },

  /* ===================== GUANTES ===================== */
  {
    id: "fox-ranger", categoria: "guantes",
    nombre: "Guantes Fox Ranger", marca: "Fox", tipo: "Trail / MTB",
    precio: 26990, precioAnterior: null, imagen: "img/productos/guantes/fox-ranger.jpg",
    stock: 20, stockMin: 6, proveedor: "Fox Racing Chile",
    descripcion: "Los guantes de MTB más vendidos de Fox: livianos, con buen agarre y compatibles con pantallas táctiles. Sirven para casi cualquier disciplina.",
    caracteristicas: { "Uso": "Trail, XC, Enduro", "Pantalla táctil": "Sí (índice y pulgar)", "Cierre": "Puño elástico sin velcro", "Color": "Verde" },
    opciones: { ...TALLA_GUANTE, valores: [
      { valor: "S",   detalle: "18–19 cm", disponible: true },
      { valor: "M",   detalle: "19–20 cm", disponible: true },
      { valor: "L",   detalle: "20–21 cm", disponible: true },
      { valor: "XL",  detalle: "21–22 cm", disponible: true },
      { valor: "XXL", detalle: "22–23 cm", disponible: true } ] }
  },
  {
    id: "fox-defend-d3o", categoria: "guantes",
    nombre: "Guantes Fox Defend D3O", marca: "Fox", tipo: "Enduro / Descenso",
    precio: 37990, precioAnterior: 49990, imagen: "img/productos/guantes/fox-defend-d3o.jpg",
    stock: 7, stockMin: 3, proveedor: "Fox Racing Chile",
    descripcion: "Guante liviano de perfil bajo con protección D3O en los nudillos y materiales resistentes a la abrasión. Cierre de velcro para un ajuste a medida.",
    caracteristicas: { "Uso": "Enduro, Descenso", "Protección": "Nudillos D3O Ghost", "Cierre": "Velcro", "Color": "Gris" },
    opciones: { ...TALLA_GUANTE, valores: [
      { valor: "S",  detalle: "18–19 cm", disponible: true },
      { valor: "M",  detalle: "19–20 cm", disponible: true },
      { valor: "L",  detalle: "20–21 cm", disponible: true },
      { valor: "XL", detalle: "21–22 cm", disponible: true } ] }
  },
  {
    id: "fox-flexair-ascent", categoria: "guantes",
    nombre: "Guantes Fox Flexair Ascent", marca: "Fox", tipo: "Trail / XC",
    precio: 19990, precioAnterior: 39990, imagen: "img/productos/guantes/fox-flexair-ascent.jpg",
    stock: 9, stockMin: 3, proveedor: "Fox Racing Chile",
    descripcion: "Guante ligero y muy transpirable, con puño moldeado por compresión y palma de ante para un tacto excelente sobre el manubrio.",
    caracteristicas: { "Uso": "Trail, XC", "Palma": "Ante", "Pantalla táctil": "Sí", "Color": "Rojo" },
    opciones: { ...TALLA_GUANTE, valores: [
      { valor: "S",   detalle: "18–19 cm", disponible: true },
      { valor: "M",   detalle: "19–20 cm", disponible: true },
      { valor: "L",   detalle: "20–21 cm", disponible: true },
      { valor: "XL",  detalle: "21–22 cm", disponible: true },
      { valor: "XXL", detalle: "22–23 cm", disponible: false } ] }
  },
  {
    id: "fox-ranger-gel", categoria: "guantes",
    nombre: "Guantes Fox Ranger Gel", marca: "Fox", tipo: "Trail / Ruta",
    precio: 20990, precioAnterior: 29990, imagen: "img/productos/guantes/fox-ranger-gel.jpg",
    stock: 5, stockMin: 2, proveedor: "Fox Racing Chile",
    descripcion: "La versión con gel del Ranger: zonas acolchadas en la palma que reducen la vibración en salidas largas. Compatible con pantallas táctiles.",
    caracteristicas: { "Uso": "Trail, Ruta, Urbano", "Palma": "Acolchado de gel", "Pantalla táctil": "Sí", "Color": "Morado" },
    opciones: { ...TALLA_GUANTE, valores: [
      { valor: "S",  detalle: "18–19 cm", disponible: false },
      { valor: "M",  detalle: "19–20 cm", disponible: false },
      { valor: "L",  detalle: "20–21 cm", disponible: false },
      { valor: "XL", detalle: "21–22 cm", disponible: true } ] }
  },

  /* ===================== CORTAVIENTOS ===================== */
  {
    id: "fox-ranger-wind", categoria: "cortavientos",
    nombre: "Chaqueta Cortaviento Fox Ranger Wind", marca: "Fox", tipo: "Anorak / MTB",
    precio: 99990, precioAnterior: null, imagen: "img/productos/cortavientos/fox-ranger-wind.jpg",
    stock: 6, stockMin: 2, proveedor: "Fox Racing Chile",
    descripcion: "Chaqueta liviana estilo anorak con tejido elástico en cuatro direcciones y capucha que se adapta sobre la mayoría de los cascos. Se ve tan bien fuera de la bici como arriba.",
    caracteristicas: { "Uso": "MTB, Urbano", "Tejido": "Elástico en 4 direcciones", "Capucha": "Compatible con casco", "Color": "Negro" },
    opciones: { ...TALLA_ROPA, valores: [
      { valor: "S",   detalle: "89–94 cm", disponible: true },
      { valor: "M",   detalle: "94–99 cm", disponible: true },
      { valor: "L",   detalle: "99–104 cm", disponible: true },
      { valor: "XL",  detalle: "104–109 cm", disponible: true },
      { valor: "XXL", detalle: "109–114 cm", disponible: true } ] }
  },
  {
    id: "fox-ranger-wind-pullover", categoria: "cortavientos",
    nombre: "Cortavientos Fox Ranger Wind Pullover", marca: "Fox", tipo: "Pullover / MTB",
    precio: 53990, precioAnterior: 89990, imagen: "img/productos/cortavientos/fox-ranger-wind-pullover.jpg",
    stock: 4, stockMin: 2, proveedor: "Fox Racing Chile",
    descripcion: "Cortavientos tipo pullover con capucha holgada, bolsillo canguro con cierre y cordón de ajuste. Se guarda dentro de su propio bolsillo.",
    caracteristicas: { "Uso": "MTB, Trail", "Material": "89% poliéster, 11% elastano", "Bolsillos": "Canguro con cierre", "Plegable": "Sí, en su bolsillo", "Color": "Burdeo / Café" },
    opciones: { ...TALLA_ROPA, valores: [
      { valor: "S",  detalle: "89–94 cm", disponible: true },
      { valor: "M",  detalle: "94–99 cm", disponible: false },
      { valor: "L",  detalle: "99–104 cm", disponible: false },
      { valor: "XL", detalle: "104–109 cm", disponible: true } ] }
  },
  {
    id: "fox-ranger-chaleco", categoria: "cortavientos",
    nombre: "Chaleco Cortavientos Fox Ranger", marca: "Fox", tipo: "Chaleco",
    precio: 69990, precioAnterior: null, imagen: "img/productos/cortavientos/fox-ranger-chaleco.jpg",
    stock: 3, stockMin: 2, proveedor: "Fox Racing Chile",
    descripcion: "Chaleco cortavientos liviano y plegable: se guarda en su propio bolsillo y apenas ocupa espacio en la riñonera. Ideal para las bajadas cuando cambia el clima.",
    caracteristicas: { "Uso": "MTB, Trail", "Tipo": "Sin mangas", "Plegable": "Sí, en su bolsillo", "Color": "Rojo" },
    opciones: { ...TALLA_ROPA, valores: [
      { valor: "S",   detalle: "89–94 cm", disponible: true },
      { valor: "M",   detalle: "94–99 cm", disponible: false },
      { valor: "L",   detalle: "99–104 cm", disponible: false },
      { valor: "XXL", detalle: "109–114 cm", disponible: true } ] }
  },
  {
    id: "gobik-pluvia-2", categoria: "cortavientos",
    nombre: "Chaqueta Impermeable Gobik Pluvia 2.0", marca: "Gobik", tipo: "Ruta / Impermeable",
    precio: 119990, precioAnterior: null, imagen: "img/productos/cortavientos/gobik-pluvia-2.jpg",
    stock: 5, stockMin: 2, proveedor: "Gobik Chile",
    descripcion: "Chaqueta ultraliviana para ruta con tejido Lightshell y membrana hidrofóbica que repele el viento y la lluvia ligera. Se pliega en su bolsillo interior.",
    caracteristicas: { "Uso": "Ruta, Gravel", "Tejido": "Lightshell con membrana hidrofóbica", "Costuras": "Selladas", "Plegable": "Sí", "Color": "Naranjo" },
    opciones: { ...TALLA_ROPA, valores: [
      { valor: "XS", detalle: "84–89 cm", disponible: true },
      { valor: "S",  detalle: "89–94 cm", disponible: true },
      { valor: "M",  detalle: "94–99 cm", disponible: true },
      { valor: "L",  detalle: "99–104 cm", disponible: true },
      { valor: "XL", detalle: "104–109 cm", disponible: true } ] }
  },
  {
    id: "bicycle-line-stelvio", categoria: "cortavientos",
    nombre: "Cortavientos Bicycle Line Stelvio Mujer", marca: "Bicycle Line", tipo: "Ruta / Mujer",
    precio: 59990, precioAnterior: null, imagen: "img/productos/cortavientos/bicycle-line-stelvio.jpg",
    stock: 4, stockMin: 2, proveedor: "Bicycle Line Chile",
    descripcion: "Cortavientos de mujer increíblemente liviano (35 g/m²), resistente al agua y fácil de guardar en el bolsillo del jersey. Con elementos reflectantes.",
    caracteristicas: { "Uso": "Ruta", "Tejido": "Cortavientos 35 g/m²", "Resistente al agua": "Sí", "Reflectantes": "Sí", "Color": "Blanco" },
    opciones: { ...TALLA_ROPA, valores: [
      { valor: "S",  detalle: "84–88 cm", disponible: true },
      { valor: "M",  detalle: "88–92 cm", disponible: true },
      { valor: "L",  detalle: "92–96 cm", disponible: true },
      { valor: "XL", detalle: "96–100 cm", disponible: false } ] }
  }
);
