import { useCallback, useEffect, useState } from 'react';

export interface DatosState<T> {
  datos: T;
  loading: boolean;
  error: Error | null;
  recargar: () => Promise<void>;
}

// Carga datos de un servicio (mismo patron que useProductos).
// "cargar" debe ser una funcion estable (un metodo de un servicio).
// Con "evento", vuelve a cargar cuando el servicio avisa de un cambio.
export const useDatos = <T,>(cargar: () => Promise<T>, inicial: T, evento?: string): DatosState<T> => {
  const [datos, setDatos] = useState<T>(inicial);
  // Parte en true para no mostrar la lista vacia antes de cargar
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  // Cambia cada vez que se pide recargar
  const [version, setVersion] = useState<number>(0);

  useEffect(() => {
    let activo = true;
    cargar()
      .then((data) => {
        if (!activo) return;
        setDatos(data);
        setError(null);
      })
      .catch((err: unknown) => {
        if (activo) setError(err instanceof Error ? err : new Error('Error desconocido al cargar los datos'));
      })
      .finally(() => {
        if (activo) setLoading(false);
      });
    // Evita actualizar si el componente ya no esta
    return () => {
      activo = false;
    };
  }, [cargar, version]);

  useEffect(() => {
    if (!evento) return;
    const alCambiar = () => setVersion((v) => v + 1);
    window.addEventListener(evento, alCambiar);
    return () => window.removeEventListener(evento, alCambiar);
  }, [evento]);

  const recargar = useCallback(async () => {
    setVersion((v) => v + 1);
  }, []);

  return { datos, loading, error, recargar };
};

export default useDatos;
