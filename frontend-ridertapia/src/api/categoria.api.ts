import type { Categoria, CategoriaPayload } from '../models/Categoria';
import ProductoService from '../services/producto.service';
import apiClient from './cliente';
import { obtenerLista } from './hal';
import { aCategoria } from './producto.mapper';
import type { CategoriaApi } from './tipos';

// CategoriaService contra ms-productos. Los productos apuntan a la categoria por id,
// asi que renombrar no obliga a tocarlos

const cuerpo = (c: CategoriaPayload) => ({
  nombre: c.nombre,
  descripcion: c.descripcion,
  activa: c.activa,
  categoriaPadre: c.categoriaPadre ? { idCategoria: c.categoriaPadre.idCategoria } : null
});

export const CategoriaApiService = {
  async listar(): Promise<Categoria[]> {
    return (await obtenerLista<CategoriaApi>('/categorias')).map(aCategoria);
  },

  async obtener(id: number): Promise<Categoria> {
    const { data } = await apiClient.get<CategoriaApi>(`/categorias/${id}`);
    return aCategoria(data);
  },

  async crear(categoria: CategoriaPayload): Promise<Categoria> {
    const { data } = await apiClient.post<CategoriaApi>('/categorias', cuerpo(categoria));
    return aCategoria(data);
  },

  async actualizar(id: number, categoria: CategoriaPayload): Promise<Categoria> {
    const { data } = await apiClient.put<CategoriaApi>(`/categorias/${id}`, cuerpo(categoria));
    return aCategoria(data);
  },

  // Si tiene productos, pasan primero a la categoria destino
  async eliminar(id: number, idDestino?: number): Promise<void> {
    const productos = (await ProductoService.listar()).filter((p) => p.categoria.idCategoria === id);
    if (productos.length > 0) {
      if (!idDestino || idDestino === id) throw new Error('Elige la categoría a la que pasarán los productos.');
      const destino = await CategoriaApiService.obtener(idDestino);
      for (const p of productos) await ProductoService.actualizar(p.idProducto, { ...p, categoria: destino });
    }
    await apiClient.delete(`/categorias/${id}`);
  }
};

export default CategoriaApiService;
