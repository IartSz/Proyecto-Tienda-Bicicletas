/* =========================================================
   MANTENIMIENTO
   ========================================================= */
PRODUCTOS_BASE.push(

  /* ===================== MANTENCIONES ===================== */
  {
    id: "mantencion-basica", categoria: "mantenimiento",
    nombre: "Mantención Básica", marca: "Rider Tapia", tipo: "Servicio de taller",
    precio: 19990, precioAnterior: null, imagen: "img/productos/mantenimiento/mantencion-basica.jpg",
    stock: 99, stockMin: 5, proveedor: "Taller Rider Tapia",
    descripcion: "Una revisión general para que tu bici quede andando bien: ajustamos cambios y frenos, lubricamos la cadena y revisamos que todo esté firme.",
    caracteristicas: {
      "Incluye": "Revisión general, ajuste de cambios, ajuste de frenos, lubricación de cadena, revisión de presión de neumáticos, apriete general de pernos, revisión visual de ruedas, dirección y transmisión.",
      "Lugar": "Taller Rider Tapia, Centro, Concepción"
    },
    opciones: null
  },
  {
    id: "mantencion-semi", categoria: "mantenimiento",
    nombre: "Mantención Semi", marca: "Rider Tapia", tipo: "Servicio de taller",
    precio: 34990, precioAnterior: null, imagen: "img/productos/mantenimiento/mantencion-semi.jpg",
    stock: 99, stockMin: 5, proveedor: "Taller Rider Tapia",
    descripcion: "Todo lo de la básica, más limpieza de la transmisión, una regulación más fina de cambios y frenos y el centrado básico de las ruedas.",
    caracteristicas: {
      "Incluye": "Todo lo de la básica + limpieza de transmisión, regulación más fina de cambios y frenos, centrado básico de ruedas, revisión de piñón, cadena y plato, ajuste de dirección, ajuste de caja motor, revisión de pastillas o zapatas de freno.",
      "Lugar": "Taller Rider Tapia, Centro, Concepción"
    },
    opciones: null
  },
  {
    id: "mantencion-full", categoria: "mantenimiento",
    nombre: "Mantención Full", marca: "Rider Tapia", tipo: "Servicio de taller",
    precio: 59990, precioAnterior: null, imagen: "img/productos/mantenimiento/mantencion-full.jpg",
    stock: 99, stockMin: 5, proveedor: "Taller Rider Tapia",
    descripcion: "La mantención completa: desarmamos, limpiamos a fondo y dejamos tu bici como nueva, con diagnóstico completo del desgaste.",
    caracteristicas: {
      "Incluye": "Todo lo anterior + desarme, limpieza profunda y lubricación de transmisión, mantención de masas, dirección y motor, centrado completo de ruedas, purgado de frenos hidráulicos si aplica, revisión de suspensión si aplica, cambio o instalación de componentes menores, diagnóstico completo de desgaste.",
      "Lugar": "Taller Rider Tapia, Centro, Concepción"
    },
    opciones: null
  }
);
