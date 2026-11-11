import { beforeEach, describe, expect, it } from 'vitest';
import CategoriaService, { slugLibre } from './categoria.service';
import ProductoService from './producto.service';
import type { Categoria } from '../models/Categoria';
import { crearProducto } from '../test/fixtures';

const cat = (idCategoria: number, nombre: string, slug: string): Categoria =>
  ({ idCategoria, nombre, descripcion: null, activa: true, categoriaPadre: null, slug });

const CASCOS = cat(1, 'Cascos', 'cascos');
const ROPA = cat(2, 'Ropa', 'ropa');

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('categorias', JSON.stringify([CASCOS, ROPA]));
  localStorage.setItem('productos', JSON.stringify([
    crearProducto({ idProducto: 1, categoria: CASCOS }),
    crearProducto({ idProducto: 2, categoria: CASCOS })
  ]));
});

describe('HU-31 Gestión de categorías: crear y editar', () => {
  it('HU-31 CA1: una categoría nueva recibe el siguiente id y aparece en la lista', async () => {
    const nueva = await CategoriaService.crear({ nombre: 'Guantes', descripcion: null, activa: true, categoriaPadre: null, slug: 'guantes' });
    expect(nueva.idCategoria).toBe(3);
    expect((await CategoriaService.listar()).map((c) => c.nombre)).toContain('Guantes');
  });

  it('HU-31 CA1: el slug de la página nunca se repite ("cascos" pasa a "cascos-2")', () => {
    expect(slugLibre('guantes', [CASCOS, ROPA])).toBe('guantes');
    expect(slugLibre('cascos', [CASCOS, ROPA])).toBe('cascos-2');
    expect(slugLibre('cascos', [CASCOS, { ...ROPA, slug: 'cascos-2' }])).toBe('cascos-3');
    expect(slugLibre('cascos', [CASCOS], 1)).toBe('cascos');
  });

  it('HU-31 CA1: al renombrar, los productos de la categoría muestran el nombre nuevo', async () => {
    await CategoriaService.actualizar(1, { ...CASCOS, nombre: 'Cascos y protecciones' });
    expect((await CategoriaService.obtener(1)).nombre).toBe('Cascos y protecciones');
    expect((await ProductoService.obtener(1)).categoria.nombre).toBe('Cascos y protecciones');
  });

  it('HU-31 CA1: editar o consultar una categoría que no existe informa el error', async () => {
    await expect(CategoriaService.obtener(99)).rejects.toThrow('Categoría no encontrada.');
    await expect(CategoriaService.actualizar(99, ROPA)).rejects.toThrow('Categoría no encontrada.');
  });
});

describe('HU-31 Gestión de categorías: eliminar', () => {
  it('HU-31 CA2: una categoría con productos no se elimina sin indicar a dónde pasan', async () => {
    await expect(CategoriaService.eliminar(1)).rejects.toThrow('Elige la categoría a la que pasarán los productos.');
    expect(await CategoriaService.listar()).toHaveLength(2);
  });

  it('HU-31 CA2: no se puede reasignar a la misma categoría que se elimina', async () => {
    await expect(CategoriaService.eliminar(1, 1)).rejects.toThrow('Elige la categoría a la que pasarán los productos.');
  });

  it('HU-31 CA2: con destino, los productos se reasignan y la categoría se elimina', async () => {
    await CategoriaService.eliminar(1, 2);
    expect((await CategoriaService.listar()).map((c) => c.idCategoria)).toEqual([2]);
    expect((await ProductoService.obtener(1)).categoria.nombre).toBe('Ropa');
    expect((await ProductoService.obtener(2)).categoria.idCategoria).toBe(2);
  });

  it('HU-31 CA1: una categoría sin productos se elimina directamente', async () => {
    await CategoriaService.eliminar(2);
    expect((await CategoriaService.listar()).map((c) => c.idCategoria)).toEqual([1]);
  });
});
