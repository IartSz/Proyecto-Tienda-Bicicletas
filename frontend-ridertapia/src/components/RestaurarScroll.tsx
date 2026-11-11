import { useEffect } from 'react';
import { useLocation } from 'react-router';

// Si se navega mientras un menu o modal de Bootstrap se esta cerrando, el componente se desmonta
// antes de que termine la animacion y la pagina queda con el scroll bloqueado (la rueda no funciona).
// Al cambiar de ruta se revisa y, si no queda nada abierto, se libera el scroll.
const liberarScroll = (): void => {
  if (document.querySelector('.modal.show, .offcanvas.show')) return;
  document.querySelectorAll('.modal-backdrop, .offcanvas-backdrop').forEach((el) => el.remove());
  document.body.classList.remove('modal-open');
  document.body.style.removeProperty('overflow');
  document.body.style.removeProperty('padding-right');
};

const RestaurarScroll = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    liberarScroll();
    // Una vez mas cuando terminan las animaciones de Bootstrap (~300 ms)
    const id = window.setTimeout(liberarScroll, 500);
    return () => window.clearTimeout(id);
  }, [pathname]);

  return null;
};

export default RestaurarScroll;
