import type { Categoria, CategoriaPayload } from '../models/Categoria';
import { categorias as categoriasIniciales } from '../data/categorias';
import ProductoService from './producto.service';

// Por ahora en localStorage; luego se cambia por la API
const CLAVE = 'categorias';

const leer = (): Categoria[] => {
  try {
    const guardadas = localStorage.getItem(CLAVE);
    return guardadas ? (JSON.parse(guardadas) as Categoria[]) : [...categoriasIniciales];
  } catch {
    return [...categoriasIniciales];
  }
};

const guardar = (lista: Categoria[]): void => {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(lista));
  } catch {
    throw new Error('No se pudo guardar: el almacenamiento del navegador está lleno.');
  }
};

// Slug libre a partir del nombre ("Cascos" -> "cascos", y "cascos-2" si ya existe)
export const slugLibre = (base: string, lista: Categoria[], excepto?: number): string => {
  let slug = base;
  let n = 2;
  while (lista.some((c) => c.slug === slug && c.idCategoria !== excepto)) slug = `${base}-${n++}`;
  return slug;
};

export const CategoriaService = {
  async listar(): Promise<Categoria[]> {
    return leer();
  },

  async obtener(id: number): Promise<Categoria> {
    const categoria = leer().find((c) => c.idCategoria === id);
    if (!categoria) throw new Error('Categoría no encontrada.');
    return categoria;
  },

  async crear(categoria: CategoriaPayload): Promise<Categoria> {
    const lista = leer();
    const idCategoria = Math.max(0, ...lista.map((c) => c.idCategoria)) + 1;
    const nueva: Categoria = { ...categoria, idCategoria };
    guardar([...lista, nueva]);
    return nueva;
  },

  // Al renombrar, los productos y subcategorias guardan una copia: se actualizan tambien
  async actualizar(id: number, categoria: CategoriaPayload): Promise<Categoria> {
    const lista = leer();
    const indice = lista.findIndex((c) => c.idCategoria === id);
    if (indice === -1) throw new Error('Categoría no encontrada.');
    const actualizada: Categoria = { ...categoria, idCategoria: id };
    const nueva = lista.map((c) => {
      if (c.idCategoria === id) return actualizada;
      return c.categoriaPadre?.idCategoria === id ? { ...c, categoriaPadre: actualizada } : c;
    });
    guardar(nueva);

    const productos = await ProductoService.listar();
    for (const p of productos) {
      if (p.categoria.idCategoria === id) {
        await ProductoService.actualizar(p.idProducto, { ...p, categoria: actualizada });
      } else if (p.categoria.categoriaPadre?.idCategoria === id) {
        await ProductoService.actualizar(p.idProducto, { ...p, categoria: { ...p.categoria, categoriaPadre: actualizada } });
      }
    }
    return actualizada;
  },

  // Si tiene productos hay que indicar a que categoria pasan (idDestino)
  async eliminar(id: number, idDestino?: number): Promise<void> {
    const lista = leer();
    const productos = (await ProductoService.listar()).filter((p) => p.categoria.idCategoria === id);
    if (productos.length > 0) {
      const destino = lista.find((c) => c.idCategoria === idDestino && c.idCategoria !== id);
      if (!destino) throw new Error('Elige la categoría a la que pasarán los productos.');
      for (const p of productos) {
        await ProductoService.actualizar(p.idProducto, { ...p, categoria: destino });
      }
    }
    guardar(lista.filter((c) => c.idCategoria !== id));
  }
};

export default CategoriaService;
