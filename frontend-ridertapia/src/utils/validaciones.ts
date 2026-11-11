// Largo minimo de contrasena (el backend exige 8)
export const CLAVE_MINIMA = 8;

/* RUT */

// "12.345.678-k" queda "12345678K" (la K solo al final)
export const limpiarRut = (rut: string): string =>
  rut.toUpperCase().replace(/[^0-9K]/g, '').replace(/K(?=.)/g, '').slice(0, 9);

// "123456785" queda "12.345.678-5"
export const formatearRut = (rut: string): string => {
  const c = limpiarRut(rut);
  if (c.length < 2) return c;
  const cuerpo = c.slice(0, -1);
  const dv = c.slice(-1);
  return cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '-' + dv;
};

// Formato del backend: "12.345.678-5" queda "12345678-5"
export const rutApi = (rut: string): string => {
  const c = limpiarRut(rut);
  return c.length < 2 ? c : `${c.slice(0, -1)}-${c.slice(-1)}`;
};

// Modulo 11
export const calcularDV = (cuerpo: string): string => {
  let suma = 0;
  let multiplo = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += Number(cuerpo[i]) * multiplo;
    multiplo = multiplo === 7 ? 2 : multiplo + 1;
  }
  const resto = 11 - (suma % 11);
  return resto === 11 ? '0' : resto === 10 ? 'K' : String(resto);
};

export const validarRut = (rut: string): boolean => {
  const c = limpiarRut(rut);
  if (!/^\d{7,8}[0-9K]$/.test(c)) return false;
  return calcularDV(c.slice(0, -1)) === c.slice(-1);
};

// Mensaje de error o '' si es valido
export const errorRut = (rut: string): string => {
  const c = limpiarRut(rut);
  if (!c) return 'Ingresa tu RUT.';
  if (!/^\d{7,8}[0-9K]$/.test(c)) return 'Formato inválido. Ej: 12.345.678-5';
  if (!validarRut(c)) return 'El dígito verificador no corresponde a ese RUT.';
  return '';
};

/* Nombre y apellido */

const LETRAS = 'A-Za-zÁÉÍÓÚÜÑáéíóúüñ';
const REGEX_NOMBRE = new RegExp(`^[${LETRAS}]+( [${LETRAS}]+)*$`);

export const errorNombre = (valor: string, campo: string): string => {
  const v = valor.trim();
  if (!v) return `Ingresa tu ${campo}.`;
  if (!REGEX_NOMBRE.test(v)) return `El ${campo} solo puede tener letras.`;
  if (v.replace(/ /g, '').length < 2) return `El ${campo} debe tener al menos 2 letras.`;
  return '';
};

// Quita numeros y simbolos mientras se escribe
export const limpiarNombre = (valor: string): string =>
  valor.replace(new RegExp(`[^${LETRAS} ]`, 'g'), '').replace(/ {2,}/g, ' ').replace(/^ /, '');

/* Contacto */

export const errorEmail = (email: string): string => {
  const v = email.trim();
  if (!v) return 'Ingresa tu correo.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Ingresa un correo válido.';
  return '';
};

export const errorTelefono = (telefono: string): string => {
  const v = telefono.trim();
  if (!v) return 'Ingresa tu teléfono.';
  if (!/^\+?56\s?9\s?\d{4}\s?\d{4}$|^9\s?\d{4}\s?\d{4}$/.test(v)) return 'Formato: +56 9 1234 5678';
  return '';
};

// Sin espacios ni guiones, como lo pide el backend
export const telefonoApi = (telefono: string | null): string | null => {
  const v = (telefono ?? '').replace(/[\s-]/g, '');
  return v || null;
};

/* Tarjeta (pago simulado) */

// "4111111111111111" queda "4111 1111 1111 1111"
export const formatearTarjeta = (valor: string): string =>
  valor.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ');

// "1228" queda "12/28"
export const formatearVencimiento = (valor: string): string => {
  const v = valor.replace(/\D/g, '').slice(0, 4);
  return v.length > 2 ? `${v.slice(0, 2)}/${v.slice(2)}` : v;
};

export const formatearCvv = (valor: string): string => valor.replace(/\D/g, '').slice(0, 3);

export const errorTarjeta = (numero: string): string =>
  /^(\d{4} ){3}\d{4}$/.test(numero) ? '' : 'Ingresa los 16 dígitos.';

export const errorVencimiento = (vencimiento: string): string =>
  /^(0[1-9]|1[0-2])\/\d{2}$/.test(vencimiento) ? '' : 'Formato MM/AA.';

export const errorCvv = (cvv: string): string => (/^\d{3}$/.test(cvv) ? '' : '3 dígitos.');
