
// Carpeta "archivos/" calculada desde la ubicación de este script
const RAIZ_SITIO = (document.currentScript && document.currentScript.src || "").replace(/js\/sesion\.js.*$/, "");

/* ---------- Datos ---------- */
function leerUsuarios() {
  try { return JSON.parse(localStorage.getItem("usuarios")) || []; } catch (e) { return []; }
}
function guardarUsuarios(lista) {
  try { localStorage.setItem("usuarios", JSON.stringify(lista)); } catch (e) {}
}
function obtenerUsuario() {
  try { return JSON.parse(localStorage.getItem("usuario")); } catch (e) { return null; }
}
function guardarSesion(u) {
  // En la sesión NO se guarda la contraseña
  const sesion = { email: u.email, nombre: u.nombre, apellido: u.apellido, rut: u.rut || "", telefono: u.telefono || "",
                   direccion: u.direccion || "", comuna: u.comuna || "", region: u.region || "" };
  try { localStorage.setItem("usuario", JSON.stringify(sesion)); } catch (e) {}
}
function cerrarSesion() {
  try { localStorage.removeItem("usuario"); } catch (e) {}
}

// Hash simple para no guardar la contraseña en texto plano (solo simulación, NO es seguro)
function hashClave(texto) {
  let h = 5381;
  for (let i = 0; i < texto.length; i++) h = ((h << 5) + h + texto.charCodeAt(i)) >>> 0;
  return "h" + h.toString(16);
}

function buscarUsuario(email) {
  return leerUsuarios().find(u => u.email === email.trim().toLowerCase());
}

// Compara RUT sin puntos ni guion (ej: "12.345.678-5" = "123456785")
function normalizarRut(rut) {
  return String(rut || "").toUpperCase().replace(/[^0-9K]/g, "");
}
function buscarUsuarioPorRut(rut) {
  const r = normalizarRut(rut);
  return r ? leerUsuarios().find(u => normalizarRut(u.rut) === r) : undefined;
}

// Devuelve { ok: true } o { ok: false, error: "..." }
function registrarUsuario(datos) {
  const email = datos.email.trim().toLowerCase();
  if (buscarUsuario(email)) return { ok: false, error: "Ya existe una cuenta con ese correo.", campo: "email" };
  if (datos.rut && buscarUsuarioPorRut(datos.rut)) return { ok: false, error: "Ya existe una cuenta con ese RUT.", campo: "rut" };
  const usuarios = leerUsuarios();
  const nuevo = { nombre: datos.nombre.trim(), apellido: datos.apellido.trim(), rut: datos.rut || "", email,
                  clave: hashClave(datos.password), creado: new Date().toISOString() };
  usuarios.push(nuevo);
  guardarUsuarios(usuarios);
  guardarSesion(nuevo);
  return { ok: true };
}

function iniciarSesion(email, password) {
  const u = buscarUsuario(email);
  if (!u) return { ok: false, error: "No existe una cuenta con ese correo.", campo: "email" };
  if (u.clave !== hashClave(password)) return { ok: false, error: "Contraseña incorrecta.", campo: "password" };
  let estados = {};
  try { estados = JSON.parse(localStorage.getItem("clientesEstado")) || {}; } catch (e) {}
  if (estados[u.email] === "inactivo") return { ok: false, error: "Tu cuenta está desactivada. Contáctanos para más información.", campo: "email" };
  guardarSesion(u);
  return { ok: true };
}

// Actualiza datos del perfil (y la sesión)
function actualizarUsuario(email, cambios) {
  const usuarios = leerUsuarios();
  const u = usuarios.find(x => x.email === email);
  if (!u) return false;
  Object.assign(u, cambios);
  guardarUsuarios(usuarios);
  guardarSesion(u);

  // Si cambió el nombre o el RUT, actualizarlo también en sus pedidos (los ve el panel de administración)
  if (cambios.nombre || cambios.apellido || cambios.rut) {
    try {
      const pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
      pedidos.forEach(p => {
        if ((p.cliente.email || "").toLowerCase() === email) {
          p.cliente.nombre = u.nombre; p.cliente.apellido = u.apellido;
          if (u.rut) p.cliente.rut = u.rut;
        }
      });
      localStorage.setItem("pedidos", JSON.stringify(pedidos));
    } catch (e) {}
  }
  return true;
}

// Página actual relativa a "archivos/" (para volver después del login)
function paginaActual() {
  return location.href.startsWith(RAIZ_SITIO) ? location.href.slice(RAIZ_SITIO.length).split("#")[0] : "index.html";
}

/* =========================================================
   INTERFAZ: nombre en el menú + menú lateral
   ========================================================= */
function iniciales(u) {
  return ((u.nombre || "")[0] || "").toUpperCase() + ((u.apellido || "")[0] || "").toUpperCase();
}

function pedidosDeUsuario(email) {
  try { return (JSON.parse(localStorage.getItem("pedidos")) || []).filter(p => (p.cliente.email || "").toLowerCase() === email); }
  catch (e) { return []; }
}
function contarPedidos(email) { return pedidosDeUsuario(email).length; }
// Pedidos cuyo estado cambió desde la última vez que el cliente vio "Mis pedidos"
function contarNovedades(email) { return pedidosDeUsuario(email).filter(p => p.novedad).length; }

function pintarUsuarioEnMenu() {
  let enlace = document.getElementById("enlaceUsuario");
  if (!enlace) {
    const icono = document.querySelector(".nav-icons .bi-person, .nav-icons .bi-person-fill");
    if (!icono) return;                   // página sin menú de tienda (login, registro...)
    enlace = icono.closest("a");
    enlace.id = "enlaceUsuario";
  }
  const u = obtenerUsuario();

  document.getElementById("sidebarUsuario")?.remove();

  if (!u) {
    enlace.href = RAIZ_SITIO + "login/login.html?volver=" + encodeURIComponent(paginaActual());
    enlace.removeAttribute("data-bs-toggle");
    enlace.removeAttribute("role");
    enlace.title = "Iniciar sesión";
    enlace.innerHTML = '<i class="bi bi-person"></i>';
    return;
  }

  // Botón con avatar + nombre y apellido
  enlace.href = "#";
  enlace.setAttribute("role", "button");
  enlace.setAttribute("data-bs-toggle", "offcanvas");
  enlace.setAttribute("data-bs-target", "#sidebarUsuario");
  enlace.setAttribute("aria-controls", "sidebarUsuario");
  enlace.title = "Mi cuenta";
  enlace.classList.add("d-inline-flex", "align-items-center", "gap-2", "text-decoration-none");
  const novedades = contarNovedades(u.email);
  enlace.innerHTML = `
    <span class="position-relative d-inline-flex align-items-center justify-content-center rounded-circle bg-dark text-white fw-bold"
          style="width:32px; height:32px; font-size:.75rem; letter-spacing:.5px;">${iniciales(u)}
      ${novedades ? '<span class="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle" title="Tus pedidos tienen novedades"></span>' : ""}</span>
    <span class="fw-semibold" style="font-size:.9rem; color:#222;">${escaparHTML(u.nombre + " " + u.apellido)}</span>`;

  // Menú lateral (offcanvas de Bootstrap)
  const nPedidos = contarPedidos(u.email);
  const nCarrito = (typeof leerCarrito === "function") ? leerCarrito().reduce((s, i) => s + i.cantidad, 0) : 0;
  const R = RAIZ_SITIO;
  const opcion = (href, icono, texto, extra) => `
    <a href="${href}" class="list-group-item list-group-item-action d-flex align-items-center gap-3 py-3 border-0">
      <i class="bi ${icono} fs-5"></i><span class="flex-grow-1">${texto}</span>${extra || '<i class="bi bi-chevron-right text-muted small"></i>'}
    </a>`;

  document.body.insertAdjacentHTML("beforeend", `
  <div class="offcanvas offcanvas-end" tabindex="-1" id="sidebarUsuario" aria-labelledby="sidebarUsuarioTitulo" style="max-width:340px;">
    <div class="offcanvas-header text-white align-items-start" style="background:linear-gradient(135deg,#2b2b2b,#555);">
      <div class="d-flex align-items-center gap-3">
        <span class="d-inline-flex align-items-center justify-content-center rounded-circle bg-white text-dark fw-bold"
              style="width:52px; height:52px; font-size:1.1rem;">${iniciales(u)}</span>
        <div>
          <div class="small" style="opacity:.8;">¡Hola, Rider!</div>
          <h5 class="offcanvas-title mb-0" id="sidebarUsuarioTitulo">${escaparHTML(u.nombre + " " + u.apellido)}</h5>
          <div class="small" style="opacity:.8;">${escaparHTML(u.email)}</div>
        </div>
      </div>
      <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Cerrar"></button>
    </div>
    <div class="offcanvas-body p-0 d-flex flex-column">
      <div class="list-group list-group-flush">
        <div class="px-3 pt-3 pb-1 text-uppercase text-muted" style="font-size:.7rem; letter-spacing:1px;">Mi cuenta</div>
        ${opcion(R + "perfil/perfil.html", "bi-person-circle", "Mi perfil")}
        ${opcion(R + "pedido/mis-pedidos.html", "bi-bag-check", "Mis pedidos",
            novedades ? `<span class="badge rounded-pill bg-danger">${novedades} ${novedades === 1 ? "novedad" : "novedades"}</span>`
            : nPedidos ? `<span class="badge rounded-pill bg-dark">${nPedidos}</span>` : "")}
        ${opcion(R + "carrito/carrito.html", "bi-cart3", "Mi carrito", nCarrito ? `<span class="badge rounded-pill bg-dark">${nCarrito}</span>` : "")}
        <div class="px-3 pt-3 pb-1 text-uppercase text-muted" style="font-size:.7rem; letter-spacing:1px;">Tienda</div>
        ${opcion(R + "index.html", "bi-shop", "Ir al inicio")}
        ${opcion(R + "categorias/indumentaria/cascos.html", "bi-shield", "Cascos")}
        ${opcion(R + "categorias/accesorios/luces.html", "bi-lightbulb", "Luces")}
        ${opcion(R + "categorias/neumaticos/neumaticos.html", "bi-circle", "Neumáticos")}
        <div class="px-3 pt-3 pb-1 text-uppercase text-muted" style="font-size:.7rem; letter-spacing:1px;">Ayuda</div>
        ${opcion(R + "politica/informacion-contacto.html", "bi-headset", "Contacto")}
        ${opcion(R + "politica/politica-retiro.html", "bi-shop", "Retiro en tienda")}
        ${opcion(R + "politica/politica-reembolso.html", "bi-arrow-repeat", "Cambios y devoluciones")}
      </div>
      <div class="mt-auto p-3 border-top">
        <button type="button" class="btn btn-outline-dark w-100" id="btnCerrarSesionMenu">
          <i class="bi bi-box-arrow-right me-2"></i>Cerrar sesión
        </button>
      </div>
    </div>
  </div>`);

  document.getElementById("btnCerrarSesionMenu").addEventListener("click", () => {
    cerrarSesion();
    // Si estaba en una página solo para usuarios, volver al inicio
    if (/(perfil|mis-pedidos)\.html/.test(location.pathname)) location.href = R + "index.html";
    else location.reload();
  });
}

function escaparHTML(t) {
  return String(t ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

document.addEventListener("DOMContentLoaded", pintarUsuarioEnMenu);
// Al volver con "atrás", o si se inicia/cierra sesión en otra pestaña
window.addEventListener("pageshow", e => { if (e.persisted) pintarUsuarioEnMenu(); });
window.addEventListener("storage", e => { if (e.key === "usuario") pintarUsuarioEnMenu(); });
