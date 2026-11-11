// Ruta a la que se vuelve despues de iniciar sesion o registrarse.
// Solo acepta rutas internas; si no es valida, vuelve al inicio.
const BLOQUEADAS = ['/login', '/registro', '/recuperar'];

export const rutaVolver = (parametro: string | null): string => {
  if (!parametro) return '/';
  const ruta = parametro.startsWith('/') ? parametro : `/${parametro}`;
  const valida = /^\/[\w\-/]*(\?[\w=&%-]*)?$/.test(ruta) && !ruta.includes('..');
  const bloqueada = BLOQUEADAS.some((b) => ruta === b || ruta.startsWith(`${b}/`) || ruta.startsWith(`${b}?`));
  return valida && !bloqueada ? ruta : '/';
};
