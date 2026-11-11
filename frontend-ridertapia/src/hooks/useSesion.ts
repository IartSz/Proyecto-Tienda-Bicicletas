import { createContext, useContext } from 'react';
import type { RegistroPayload, Rol, Sesion } from '../models/Usuario';
import type { CambiosPerfil, ResultadoAuth } from '../services/auth.service';

export interface SesionContextValue {
  sesion: Sesion | null;
  esAdmin: boolean;
  // Sin rol, entra cualquier cuenta (el rol lo define la cuenta); con rol, se exige ese rol
  iniciarSesion: (correo: string, password: string, rol?: Rol) => Promise<ResultadoAuth>;
  registrar: (datos: RegistroPayload) => Promise<ResultadoAuth>;
  cerrarSesion: () => void;
  actualizarPerfil: (cambios: CambiosPerfil) => Promise<ResultadoAuth>;
  cambiarPassword: (actual: string, nueva: string) => Promise<ResultadoAuth>;
}

export const SesionContext = createContext<SesionContextValue | null>(null);

export const useSesion = (): SesionContextValue => {
  const contexto = useContext(SesionContext);
  if (!contexto) throw new Error('useSesion debe usarse dentro de SesionProvider');
  return contexto;
};

export default useSesion;
