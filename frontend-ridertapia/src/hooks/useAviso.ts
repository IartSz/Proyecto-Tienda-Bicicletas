import { useEffect, useState } from 'react';

export interface Aviso {
  texto: string;
  tipo: 'success' | 'warning' | 'danger';
}

// Mensaje corto que se oculta solo a los 3,5 segundos
export const useAviso = (): { aviso: Aviso | null; mostrar: (aviso: Aviso) => void } => {
  const [aviso, setAviso] = useState<Aviso | null>(null);

  useEffect(() => {
    if (!aviso) return;
    const timer = window.setTimeout(() => setAviso(null), 3500);
    return () => window.clearTimeout(timer);
  }, [aviso]);

  return { aviso, mostrar: setAviso };
};

export default useAviso;
