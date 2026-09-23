
function leerCarrito() {
  try { return JSON.parse(localStorage.getItem("carrito")) || []; }
  catch (e) { return []; }
}

function guardarCarrito(carrito) {
  try { localStorage.setItem("carrito", JSON.stringify(carrito)); } catch (e) {}
  actualizarBadgeCarrito();
}

// Agrega un producto (si ya existe con la misma opción, suma la cantidad)
function agregarAlCarrito(item) {
  const carrito = leerCarrito();
  const existente = carrito.find(i => i.id === item.id && i.opcion === item.opcion);
  if (existente) existente.cantidad += item.cantidad;
  else carrito.push(item);
  guardarCarrito(carrito);
}

// Busca el numerito que está junto al ícono del carrito y lo actualiza
function actualizarBadgeCarrito() {
  const total = leerCarrito().reduce((suma, item) => suma + item.cantidad, 0);
  document.querySelectorAll(".bi-cart3").forEach(icono => {
    const badge = icono.parentElement.querySelector(".badge");
    if (badge) badge.textContent = total;
  });
}

// Al cargar la página
document.addEventListener("DOMContentLoaded", actualizarBadgeCarrito);
// Al volver con el botón "atrás" (el navegador puede mostrar la página guardada en caché)
window.addEventListener("pageshow", actualizarBadgeCarrito);
// Si el carrito cambia en otra pestaña
window.addEventListener("storage", actualizarBadgeCarrito);

/* ---------- Funciones para la página del carrito y el checkout ---------- */

function cambiarCantidad(indice, nuevaCantidad) {
  const carrito = leerCarrito();
  if (!carrito[indice]) return;
  carrito[indice].cantidad = Math.max(1, Math.min(10, nuevaCantidad));
  guardarCarrito(carrito);
}

function eliminarDelCarrito(indice) {
  const carrito = leerCarrito();
  carrito.splice(indice, 1);
  guardarCarrito(carrito);
}

function vaciarCarrito() {
  guardarCarrito([]);
}

// Solo hay retiro en tienda (gratis), así que el envío siempre es 0
function calcularTotales() {
  const subtotal = leerCarrito().reduce((s, i) => s + i.precio * i.cantidad, 0);
  return { subtotal, envio: 0, total: subtotal };
}

function formatoCLP(n) {
  return "$" + n.toLocaleString("es-CL");
}

/* La sesión del usuario está en js/sesion.js */
