import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { RegistroPayload, Rol, Sesion } from '../models/Usuario';
import AuthService, { CLAVE_SESION, leerSesion, type CambiosPerfil, type ResultadoAuth } from '../services/auth.service';
import { SesionContext, type SesionContextValue } from '../hooks/useSesion';

interface SesionProviderProps {
  children: ReactNode;
}

export const SesionProvider = ({ children }: SesionProviderProps) => {
  const [sesion, setSesion] = useState<Sesion | null>(leerSesion);

  // Si se inicia o cierra sesion en otra pestana
  useEffect(() => {
    const alCambiar = (event: StorageEvent) => {
      if (event.key === CLAVE_SESION) setSesion(leerSesion());
    };
    window.addEventListener('storage', alCambiar);
    return () => window.removeEventListener('storage', alCambiar);
  }, []);

  const iniciarSesion = useCallback(async (correo: string, password: string, rol?: Rol): Promise<ResultadoAuth> => {
    const resultado = await AuthService.iniciarSesion(correo, password, rol);
    if (resultado.ok) setSesion(resultado.sesion);
    return resultado;
  }, []);

  const registrar = useCallback(async (datos: RegistroPayload): Promise<ResultadoAuth> => {
    const resultado = await AuthService.registrar(datos);
    if (resultado.ok) setSesion(resultado.sesion);
    return resultado;
  }, []);

  const cerrarSesion = useCallback(() => {
    setSesion(null);
    void AuthService.cerrarSesion();
  }, []);

  const actualizarPerfil = useCallback(async (cambios: CambiosPerfil): Promise<ResultadoAuth> => {
    if (!sesion) return { ok: false, error: 'No hay una sesión iniciada.', campo: 'emailCliente' };
    const resultado = await AuthService.actualizarPerfil(sesion.emailCliente, cambios);
    if (resultado.ok) setSesion(resultado.sesion);
    return resultado;
  }, [sesion]);

  const cambiarPassword = useCallback(async (actual: string, nueva: string): Promise<ResultadoAuth> => {
    if (!sesion) return { ok: false, error: 'No hay una sesión iniciada.', campo: 'emailCliente' };
    return AuthService.cambiarPassword(sesion.emailCliente, actual, nueva);
  }, [sesion]);

  const valor = useMemo<SesionContextValue>(() => ({
    sesion,
    esAdmin: sesion?.rol === 'ADMIN',
    iniciarSesion,
    registrar,
    cerrarSesion,
    actualizarPerfil,
    cambiarPassword
  }), [sesion, iniciarSesion, registrar, cerrarSesion, actualizarPerfil, cambiarPassword]);

  return <SesionContext.Provider value={valor}>{children}</SesionContext.Provider>;
};

export default SesionProvider;
