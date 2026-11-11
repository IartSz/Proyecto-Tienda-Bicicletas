import type { Sesion } from '../models/Usuario';

// La sesion vive en el navegador en ambos modos (local y backend)
export const CLAVE_SESION = 'usuario';

export const leerSesion = (): Sesion | null => {
  try {
    const dato: unknown = JSON.parse(localStorage.getItem(CLAVE_SESION) ?? 'null');
    if (dato && typeof dato === 'object' && typeof (dato as Sesion).emailCliente === 'string') return dato as Sesion;
    return null;
  } catch {
    return null;
  }
};

export const guardarSesion = (sesion: Sesion): void => {
  try {
    localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
  } catch {
    // Sin acceso al almacenamiento
  }
};

export const borrarSesion = (): void => {
  try {
    localStorage.removeItem(CLAVE_SESION);
  } catch {
    // Sin acceso al almacenamiento
  }
};
