/* =========================================================
   PANEL DE ADMINISTRACIÓN - funciones compartidas
   Requiere cargar antes: ../js/productos.js
   ========================================================= */

const fmt = n => "$" + Math.round(n).toLocaleString("es-CL");

function fechaCorta(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("es-CL", { day: "2-digit", month: "2-digit", year: "numeric" }) + " " +
         d.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" });
}

// Evita que texto escrito por el usuario rompa el HTML
function esc(t) {
  return String(t ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// "Casco Fox Speedframe" -> "casco-fox-speedframe"
function slugify(t) {
  return String(t).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "item";
}

function nombreCategoria(slug) {
  return CATEGORIAS[slug] ? CATEGORIAS[slug].titulo : "Sin categoría";
}

/* ---------- Estado del stock ---------- */
function estadoStock(p) {
  if (p.stock <= 0) return "cero";
  if (p.stock < p.stockMin) return "bajo";
  return "ok";
}
function tagStock(p) {
  if (p.activo === false) return '<span class="tag tag-off">Dado de baja</span>';
  return { ok: '<span class="tag tag-ok">Disponible</span>',
           bajo: '<span class="tag tag-bajo">Stock bajo</span>',
           cero: '<span class="tag tag-cero">Sin stock</span>' }[estadoStock(p)];
}
function productosBajoMinimo() {
  return PRODUCTOS.filter(p => p.activo !== false && p.stock < p.stockMin);
}

// Miniatura para tablas (las rutas de imagen se escriben desde la carpeta archivos/)
function thumbProducto(p) {
  const icono = (CATEGORIAS[p.categoria] && CATEGORIAS[p.categoria].icono) || "bi-box-seam";
  return p.imagen
    ? `<span class="thumb"><img src="${esc(rutaImagen(p, "../"))}" alt="" onerror="this.outerHTML='<i class=&quot;bi ${icono}&quot;></i>'"></span>`
    : `<span class="thumb"><i class="bi ${icono}"></i></span>`;
}

/* ---------- Pedidos ---------- */
// Por defecto no incluye los pedidos cancelados (no cuentan como venta)
// Si el cliente tiene cuenta, se muestra su nombre ACTUAL (por si lo cambió en "Mi perfil")
function leerPedidos(incluirCancelados) {
  const cuentas = {};
  leerLS("usuarios", []).forEach(u => cuentas[u.email] = u);
  return leerLS("pedidos", []).map(p => {
    const u = cuentas[(p.cliente.email || "").toLowerCase()];
    const cliente = u ? { ...p.cliente, nombre: u.nombre, apellido: u.apellido } : p.cliente;
    return { ...p, cliente, fechaISO: p.fechaISO || null };
  })
    .filter(p => incluirCancelados || estadoPedido(p) !== "Cancelado");
}

// Pedidos que el admin todavía debe atender (no entregados ni cancelados)
function pedidosPorAtender() {
  return leerPedidos().filter(p => !ESTADOS_FINALES.includes(estadoPedido(p))).length;
}

function tagEstado(p) {
  const e = estadoPedido(p), cfg = ESTADOS_PEDIDO[e] || {};
  return `<span class="tag ${cfg.tag || "tag-off"}"><i class="bi ${cfg.icono || ""} me-1"></i>${e}</span>`;
}

/* ---------- Números del menú lateral (stock bajo y pedidos por atender) ---------- */
function actualizarBadges() {
  const n = productosBajoMinimo().length;
  document.querySelectorAll(".adm-badge:not(.badge-pedidos)").forEach(b => { b.textContent = n; b.style.display = n ? "" : "none"; });
  const np = pedidosPorAtender();
  document.querySelectorAll(".badge-pedidos").forEach(b => { b.textContent = np; b.style.display = np ? "" : "none"; });
}

/* ---------- Mensaje flotante ---------- */
function aviso(texto, tipo) {
  let cont = document.getElementById("avisos");
  if (!cont) {
    cont = document.createElement("div");
    cont.id = "avisos";
    cont.style.cssText = "position:fixed; bottom:20px; right:20px; z-index:2000; display:flex; flex-direction:column; gap:8px;";
    document.body.appendChild(cont);
  }
  const el = document.createElement("div");
  el.className = "alert alert-" + (tipo || "success") + " shadow mb-0 py-2 px-3";
  el.innerHTML = texto;
  cont.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

/* ---------- Descargar archivo (CSV para Excel) ---------- */
function descargarArchivo(nombre, contenido, tipo) {
  const blob = new Blob(["﻿" + contenido], { type: tipo || "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}

// filas = [["Col1","Col2"], [...]] -> texto CSV (separador ; para Excel en español)
function aCSV(filas) {
  return filas.map(f => f.map(v => '"' + String(v ?? "").replace(/"/g, '""') + '"').join(";")).join("\r\n");
}

/* ---------- Restablecer todos los datos ---------- */
function restablecerDatos() {
  if (!confirm("Esto borrará productos creados, cambios de stock, categorías, movimientos, pedidos, clientes y cuentas registradas, y volverá a los datos iniciales. ¿Continuar?")) return;
  ["productos", "categorias", "movimientos", "pedidos", "clientesEstado", "clientesLog", "reportesHistorial", "carrito", "usuarios", "usuario"]
    .forEach(k => { try { localStorage.removeItem(k); } catch (e) {} });
  location.reload();
}

/* ---------- Al cargar cualquier página del panel ---------- */
document.addEventListener("DOMContentLoaded", () => {
  // Números del menú lateral (stock bajo y pedidos por atender)
  actualizarBadges();

  // Botón para restablecer datos en el pie del menú
  const pie = document.querySelector(".adm-sidebar-foot");
  if (pie && !document.getElementById("btnRestablecer")) {
    const a = document.createElement("a");
    a.href = "#";
    a.id = "btnRestablecer";
    a.innerHTML = '<i class="bi bi-arrow-counterclockwise"></i>Restablecer datos';
    a.addEventListener("click", e => { e.preventDefault(); restablecerDatos(); });
    pie.appendChild(a);
  }
});

/* ---------- Ventas de ejemplo (para que Resumen y Reportes tengan datos) ---------- */
function generarVentasEjemplo() {
  const clientes = [
    ["Camila", "Rojas", "camila.rojas@correo.cl", "+56 9 8123 4567", "registrado"],
    ["Matías", "González", "mgonzalez@correo.cl", "+56 9 7654 3210", "registrado"],
    ["Valentina", "Muñoz", "vale.munoz@correo.cl", "+56 9 9988 7766", "invitado"],
    ["Sebastián", "Díaz", "sdiaz@correo.cl", "+56 9 6543 2109", "registrado"],
    ["Francisca", "Soto", "fran.soto@correo.cl", "+56 9 5432 1098", "invitado"],
    ["Diego", "Pérez", "dperez@correo.cl", "+56 9 4321 0987", "invitado"],
    ["Javiera", "Contreras", "jcontreras@correo.cl", "+56 9 3210 9876", "registrado"],
    ["Tomás", "Silva", "tsilva@correo.cl", "+56 9 2109 8765", "invitado"]
  ];
  const activos = PRODUCTOS.filter(p => p.activo !== false);
  const pedidos = leerLS("pedidos", []).filter(p => !p.demo);
  const hoy = new Date();
  let semilla = 7;
  const azar = n => { semilla = (semilla * 9301 + 49297) % 233280; return Math.floor(semilla / 233280 * n); };

  for (let i = 0; i < 70; i++) {
    const fecha = new Date(hoy);
    fecha.setDate(fecha.getDate() - azar(180));
    fecha.setHours(10 + azar(9), azar(60));
    const c = clientes[azar(clientes.length)];
    const items = [];
    const nItems = 1 + azar(3);
    for (let j = 0; j < nItems; j++) {
      const p = activos[azar(activos.length)];
      if (items.some(x => x.id === p.id)) continue;
      items.push({ id: p.id, nombre: p.nombre, opcion: p.opciones ? p.opciones.valores[0].valor : "Única", precio: p.precio, cantidad: 1 + azar(2) });
    }
    const subtotal = items.reduce((s, x) => s + x.precio * x.cantidad, 0);
    const entrega = azar(3) === 0 ? "retiro" : "despacho";
    const envio = entrega === "despacho" && subtotal < 50000 ? 3990 : 0;
    const dias = (hoy - fecha) / 86400000;
    const pago = azar(4) === 0 ? "transferencia" : "tarjeta";
    const estado = dias > 7 ? (azar(15) === 0 ? "Cancelado" : "Entregado")
      : dias > 3 ? (entrega === "retiro" ? "Listo para retiro" : "Enviado")
      : dias > 1 ? "En preparación" : estadoInicial(pago);
    pedidos.push({
      numero: "RT-D" + String(1000 + i), demo: true, estado,
      historial: [{ estado: estadoInicial(pago), fecha: fecha.toISOString(), nota: "Pedido recibido." }]
        .concat(estado !== estadoInicial(pago) ? [{ estado, fecha: new Date(Math.min(+hoy, +fecha + 86400000 * 2)).toISOString(), nota: "" }] : []),
      fecha: fecha.toLocaleString("es-CL"), fechaISO: fecha.toISOString(),
      cliente: { nombre: c[0], apellido: c[1], email: c[2], telefono: c[3] }, tipoCliente: c[4],
      entrega, direccion: entrega === "retiro" ? "Retiro en tienda (Centro, Concepción)" : "Concepción, Biobío",
      pago, items, subtotal, envio, total: subtotal + envio
    });
  }
  guardarLS("pedidos", pedidos);
}

function quitarVentasEjemplo() {
  guardarLS("pedidos", leerLS("pedidos", []).filter(p => !p.demo));
}

function hayVentasEjemplo() {
  return leerLS("pedidos", []).some(p => p.demo);
}
