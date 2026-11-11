import { useCallback } from 'react';
import { Modal } from 'bootstrap';

interface UseModalState {
  mostrar: () => void;
  ocultar: () => void;
}

// Abre y cierra un modal de Bootstrap desde el codigo.
// Se indica el id del div.modal; el elemento se busca solo al abrir o cerrar
// (dentro de un evento, nunca durante el render).
export const useModal = (id: string): UseModalState => {
  const mostrar = useCallback(() => {
    const elemento = document.getElementById(id);
    if (elemento) Modal.getOrCreateInstance(elemento).show();
  }, [id]);

  const ocultar = useCallback(() => {
    const elemento = document.getElementById(id);
    if (elemento) Modal.getOrCreateInstance(elemento).hide();
  }, [id]);

  return { mostrar, ocultar };
};

export default useModal;
