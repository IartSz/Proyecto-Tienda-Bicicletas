import useDatos from './useDatos';
import CategoriaService from '../services/categoria.service';
import type { Categoria } from '../models/Categoria';

interface UseCategoriasState {
  categorias: Categoria[];
  loading: boolean;
  error: Error | null;
  recargar: () => Promise<void>;
}

export const useCategorias = (): UseCategoriasState => {
  const { datos, loading, error, recargar } = useDatos<Categoria[]>(CategoriaService.listar, []);
  return { categorias: datos, loading, error, recargar };
};

export default useCategorias;
