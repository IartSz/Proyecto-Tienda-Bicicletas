export interface Categoria {
    idCategoria: number;
    nombre: string;
    descripcion: string | null;
    activa: boolean;
    categoriaPadre: Categoria | null;

    // Frontend
    slug?: string;
    icono?: string;
}

export type CategoriaPayload = Omit<Categoria, 'idCategoria'>;