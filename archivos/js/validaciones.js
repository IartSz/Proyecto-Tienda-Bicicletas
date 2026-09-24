/* =========================================================
   VALIDACIONES DE FORMULARIOS - Rider Tapia
   - RUT chileno: formato 12.345.678-5 y dígito verificador (módulo 11)
   - Nombre y apellido: solo letras (con tildes y ñ) y espacios entre palabras
   ========================================================= */

/* ---------- RUT ---------- */

// "12.345.678-k" -> "12345678K"  (la K solo puede ir al final)
function limpiarRut(rut) {
  let c = String(rut || "").toUpperCase().replace(/[^0-9K]/g, "");
  c = c.replace(/K(?=.)/g, "");          // quitar K que no estén al final
  return c.slice(0, 9);                  // máximo 8 dígitos + DV
}

// "123456785" -> "12.345.678-5"
function formatearRut(rut) {
  const c = limpiarRut(rut);
  if (c.length < 2) return c;
  const cuerpo = c.slice(0, -1), dv = c.slice(-1);
  return cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "-" + dv;
}

// Algoritmo módulo 11
function calcularDV(cuerpo) {
  let suma = 0, multiplo = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += Number(cuerpo[i]) * multiplo;
    multiplo = multiplo === 7 ? 2 : multiplo + 1;
  }
  const resto = 11 - (suma % 11);
  return resto === 11 ? "0" : resto === 10 ? "K" : String(resto);
}

function validarRut(rut) {
  const c = limpiarRut(rut);
  if (!/^\d{7,8}[0-9K]$/.test(c)) return false;
  return calcularDV(c.slice(0, -1)) === c.slice(-1);
}

// Devuelve el mensaje de error, o "" si el RUT es válido
function errorRut(rut) {
  const c = limpiarRut(rut);
  if (!c) return "Ingresa tu RUT.";
  if (!/^\d{7,8}[0-9K]$/.test(c)) return "Formato inválido. Ej: 12.345.678-5";
  if (!validarRut(c)) return "El dígito verificador no corresponde a ese RUT.";
  return "";
}

/* ---------- Nombre / apellido ---------- */

const LETRAS = "A-Za-zÁÉÍÓÚÜÑáéíóúüñ";
const REGEX_NOMBRE = new RegExp(`^[${LETRAS}]+( [${LETRAS}]+)*$`);

function errorNombre(valor, campo) {
  const v = String(valor || "").trim();
  if (!v) return `Ingresa tu ${campo}.`;
  if (!REGEX_NOMBRE.test(v)) return `El ${campo} solo puede tener letras.`;
  if (v.replace(/ /g, "").length < 2) return `El ${campo} debe tener al menos 2 letras.`;
  return "";
}

/* ---------- Mensaje de error bajo el campo ---------- */
function mensajeCampo(input) {
  let msg = input.parentElement.parentElement.querySelector(`.msg-validacion[data-para="${input.id}"]`);
  if (!msg) {
    msg = document.createElement("div");
    msg.className = "msg-validacion text-danger mt-1 d-none";
    msg.style.fontSize = ".85rem";
    msg.dataset.para = input.id;
    // Si el campo está dentro de un input-group, el mensaje va después del grupo
    const ancla = input.closest(".input-group") || input;
    ancla.insertAdjacentElement("afterend", msg);
  }
  return msg;
}

function marcarCampo(input, error, mostrar) {
  input.setCustomValidity(error);
  const msg = mensajeCampo(input);
  msg.textContent = error;
  const ver = mostrar && !!error;
  msg.classList.toggle("d-none", !ver);
  input.classList.toggle("is-invalid", ver);
  input.classList.toggle("is-valid", mostrar && !error && !!input.value);
}

/* ---------- Activar la validación en un campo ----------
   extra: función opcional que recibe el valor y devuelve un error adicional
   (ej: "Ese RUT ya está registrado")                                   */
function activarCampoRut(input, extra) {
  input.setAttribute("maxlength", "12");
  input.setAttribute("autocomplete", "off");
  if (!input.placeholder) input.placeholder = "12.345.678-5";
  let tocado = false;
  const revisar = () => {
    let error = errorRut(input.value);
    if (!error && extra) error = extra(formatearRut(input.value)) || "";
    marcarCampo(input, error, tocado);
  };
  input.addEventListener("input", () => {
    input.value = formatearRut(input.value);   // formato automático mientras escribe
    revisar();
  });
  input.addEventListener("blur", () => { tocado = true; revisar(); });
  input.form && input.form.addEventListener("submit", () => { tocado = true; revisar(); }, true);
  if (input.value) input.value = formatearRut(input.value);
  revisar();
}

function activarCampoNombre(input, campo) {
  input.setAttribute("maxlength", "40");
  let tocado = false;
  const revisar = () => marcarCampo(input, errorNombre(input.value, campo), tocado);
  input.addEventListener("input", () => {
    // Quitar números y símbolos al escribir; evitar espacios dobles o al inicio
    const limpio = input.value.replace(new RegExp(`[^${LETRAS} ]`, "g"), "").replace(/ {2,}/g, " ").replace(/^ /, "");
    if (limpio !== input.value) input.value = limpio;
    revisar();
  });
  input.addEventListener("blur", () => { input.value = input.value.trim(); tocado = true; revisar(); });
  input.form && input.form.addEventListener("submit", () => { input.value = input.value.trim(); tocado = true; revisar(); }, true);
  revisar();
}
