// Los productos y las categorías están en js/datos/ (un archivo por grupo del menú)

// Productos que ya no se venden (si alguien los tenía guardados, se borran)
const PRODUCTOS_RETIRADOS = [
  "specialized-align-ii", "radical-mountain-casco-urbano", "cateye-ampp-800", "lezyne-lite-drive-1200",
  "cateye-rapid-x2", "lezyne-strip-drive-pro", "radical-mountain-kit-luces", "kenda-kwest",
  "schwalbe-sv19", "tubolito-tubo-mtb",
  "peatys-all-weather", "peatys-desengrasante-1l", "muc-off-wet-ceramic", "muc-off-nano-tech",
  "oneup-multiherramienta", "peatys-sellante-500", "peatys-limpiador-frenos"
];

/* =========================================================
   PERSISTENCIA (localStorage)
   Claves: "productos", "categorias", "categoriasEliminadas", "movimientos", "pedidos"
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

// Si ya había categorías guardadas, agrega las nuevas (menos las que se borraron en el panel)
function cargarCategorias() {
  const guardadas = leerLS("categorias", null);
  if (!guardadas) {
    const base = JSON.parse(JSON.stringify(CATEGORIAS_BASE));
    guardarLS("categorias", base);
    return base;
  }
  const eliminadas = leerLS("categoriasEliminadas", []);
  let cambios = false;
  Object.keys(CATEGORIAS_BASE).forEach(slug => {
    if (!guardadas[slug] && !eliminadas.includes(slug)) {
      guardadas[slug] = { ...CATEGORIAS_BASE[slug] };
      cambios = true;
    }
  });
  if (cambios) guardarLS("categorias", guardadas);
  return guardadas;
}

// Se usa en el panel al borrar una categoría, para no volver a agregarla
function marcarCategoriaEliminada(slug) {
  const eliminadas = leerLS("categoriasEliminadas", []);
  if (!eliminadas.includes(slug)) { eliminadas.push(slug); guardarLS("categoriasEliminadas", eliminadas); }
}

// Le pone código (CAS-0001...), stock y proveedor a un producto base
function productoConInventario(p, lista) {
  const pref = PREFIJOS[p.categoria] || "PRD";
  let max = 0;
  lista.forEach(x => { const m = (x.codigo || "").match(new RegExp("^" + pref + "-(\\d+)$")); if (m) max = Math.max(max, +m[1]); });
  return { ...p, codigo: pref + "-" + String(max + 1).padStart(4, "0"),
           stock: p.stock ?? 10, stockMin: p.stockMin ?? 3, proveedor: p.proveedor || "", activo: true };
}

function cargarProductos() {
  const guardados = leerLS("productos", null);
  if (guardados) return sincronizarBase(guardados);

  // Primera vez: copiar los productos base y agregarles datos de inventario
  const base = [];
  PRODUCTOS_BASE.forEach(p => base.push(productoConInventario(p, base)));
  guardarLS("productos", base);
  return base;
}

// Si ya había productos guardados: saca los que ya no se venden, agrega los nuevos
// y arregla las imágenes que faltaban o que cambiaron de carpeta
function sincronizarBase(guardados) {
  const lista = guardados.filter(p => !PRODUCTOS_RETIRADOS.includes(p.id));
  let cambios = lista.length !== guardados.length;
  PRODUCTOS_BASE.forEach(b => {
    const p = lista.find(x => x.id === b.id);
    if (!p) {
      lista.push(productoConInventario(b, lista));
      cambios = true;
    } else if (b.imagen && p.imagen !== b.imagen && (!p.imagen || p.imagen.startsWith("img/categorias/"))) {
      p.imagen = b.imagen;
      cambios = true;
    }
  });
  if (cambios) guardarLS("productos", lista);
  return lista;
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

// Tarjeta de un producto (la usan las páginas de categoría y los destacados del inicio)
// raiz: lo que hay que subir para llegar a archivos/ (ej: "../../")
function htmlTarjeta(p, raiz) {
  raiz = raiz || "";
  return `
      <div class="col-6 col-md-4 col-lg-3">
        <a href="${raiz}producto.html?id=${p.id}" class="text-decoration-none text-reset d-block h-100">
          <div class="product-card h-100 bg-white position-relative">
            ${p.stock <= 0 ? '<span class="badge bg-secondary position-absolute m-2" style="z-index:1;">AGOTADO</span>'
              : p.precioAnterior ? '<span class="badge badge-offer position-absolute m-2" style="z-index:1;">OFERTA</span>' : ''}
            <div class="product-thumb" style="height:220px; padding:10px;">${htmlImagen(p, "200px", raiz)}</div>
            <div class="p-3">
              <small class="text-muted text-uppercase" style="font-size:.7rem; letter-spacing:1px;">${p.marca} · ${p.tipo}</small>
              <h6 class="mb-1 mt-1">${p.nombre}</h6>
              ${p.precioAnterior ? `<span class="price-old">${formatoPrecio(p.precioAnterior)}</span>` : ''}
              <span class="price-new">${formatoPrecio(p.precio)}</span>
              ${p.opciones ? `<div class="mt-2" style="font-size:.8rem;">${p.opciones.nombre}: ${p.opciones.valores.map(v => v.valor).join(" · ")}</div>` : ''}
            </div>
          </div>
        </a>
      </div>`;
}

// Dibuja el listado de una categoría en su página (categorias/indumentaria/cascos.html, etc.)
function renderCatalogo(categoria, raiz) {
  // Título de la categoría (por si fue renombrada en el panel)
  const cat = CATEGORIAS[categoria];
  if (cat) {
    document.title = cat.titulo + " - Rider Tapia";
    document.querySelectorAll("[data-cat-titulo]").forEach(e => e.textContent = cat.titulo);
    document.querySelectorAll("[data-cat-subtitulo]").forEach(e => e.textContent = cat.subtitulo || "");
    document.querySelectorAll("[data-cat-grupo]").forEach(e => e.textContent = cat.grupo || "");
  }
  mostrarListado(p => p.categoria === categoria, raiz);
}

// Página de un grupo del menú (Indumentaria, Accesorios, Componentes): todos sus productos
// y un botón para ir a cada una de sus categorías
function renderGrupo(grupo, raiz) {
  const slugs = Object.keys(CATEGORIAS).filter(s => CATEGORIAS[s].grupo === grupo);
  document.getElementById("subcategorias").innerHTML = slugs.map(s =>
    `<a href="${raiz}${urlCategoria(s)}" class="btn btn-outline-light btn-sm">${CATEGORIAS[s].titulo}</a>`).join("");
  mostrarListado(p => slugs.includes(p.categoria), raiz);
}

// Lista de productos con el selector de orden (usa #listaProductos, #orden y #contador)
function mostrarListado(filtro, raiz) {
  const contenedor = document.getElementById("listaProductos");
  const selectOrden = document.getElementById("orden");

  function mostrar() {
    let lista = productosActivos().filter(filtro);
    if (selectOrden.value === "asc")  lista.sort((a, b) => a.precio - b.precio);
    if (selectOrden.value === "desc") lista.sort((a, b) => b.precio - a.precio);

    contenedor.innerHTML = lista.map(p => htmlTarjeta(p, raiz)).join("");

    if (lista.length === 0) {
      contenedor.innerHTML = '<div class="col-12 text-center text-muted py-5"><i class="bi bi-box-seam" style="font-size:2.5rem;"></i><p class="mt-2">Aún no hay productos en esta categoría.</p></div>';
    }
    document.getElementById("contador").textContent = lista.length + " productos";
  }

  selectOrden.addEventListener("change", mostrar);
  mostrar();
}

// Página de una categoría: las de base están en categorias/<carpeta>/,
// las creadas desde el panel usan categorias/categoria.html?cat=...
function urlCategoria(slug) {
  const base = CATEGORIAS_BASE[slug];
  return base ? "categorias/" + base.carpeta + "/" + slug + ".html" : "categorias/categoria.html?cat=" + slug;
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
