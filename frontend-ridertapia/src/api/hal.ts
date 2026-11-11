import apiClient from './cliente';

// Lista con HATEOAS
export interface ColeccionHal<T> {
    _embedded?: Record<string, T[]>;
}

// Sacar la lista sin importar el nombre
export const extraerLista = <T>(respuesta: ColeccionHal<T>): T[] => {
  if (!respuesta._embedded) return [];
  return Object.values(respuesta._embedded)[0] ?? [];
};

// GET de una lista ya desempaquetada
export const obtenerLista = async <T>(ruta: string): Promise<T[]> => {
  const { data } = await apiClient.get<ColeccionHal<T>>(ruta);
  return extraerLista(data);
};