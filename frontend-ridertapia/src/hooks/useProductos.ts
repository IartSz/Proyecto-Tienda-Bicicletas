import { useCallback, useEffect, useState } from 'react';
import ProductoService from '../services/producto.service';
import type { Producto } from '../models/Producto';

interface UseProductosState {
  productos: Producto[];
  loading: boolean;
  error: Error | null;
  recargar: () => Promise<void>;
}

export const useProductos = (): UseProductosState => {
  const [productos, setProductos] = useState<Producto[]>([]);
  // Parte en true para no mostrar la lista vacia antes de cargar
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  // Cambia cada vez que se pide recargar
  const [version, setVersion] = useState<number>(0);

  useEffect(() => {
    let activo = true;
    ProductoService.listar()
      .then((data) => {
        if (!activo) return;
        setProductos(data);
        setError(null);
      })
      .catch((err: unknown) => {
        if (activo) setError(err instanceof Error ? err : new Error('Error desconocido al cargar productos'));
      })
      .finally(() => {
        if (activo) setLoading(false);
      });
    // Evita actualizar si el componente ya no esta
    return () => {
      activo = false;
    };
  }, [version]);

  const recargar = useCallback(async () => {
    setVersion((v) => v + 1);
  }, []);

  return { productos, loading, error, recargar };
};

export default useProductos;
