import { afterEach, describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import RestaurarScroll from './RestaurarScroll';

const bloquear = () => {
  document.body.classList.add('modal-open');
  document.body.style.overflow = 'hidden';
  document.body.style.paddingRight = '15px';
};

afterEach(() => {
  document.body.className = '';
  document.body.removeAttribute('style');
  document.body.innerHTML = '';
});

describe('RestaurarScroll (la rueda del mouse no debe quedar bloqueada)', () => {
  it('libera el scroll si quedó bloqueado y no hay ningún menú ni modal abierto', () => {
    bloquear();
    render(<MemoryRouter><RestaurarScroll /></MemoryRouter>);
    expect(document.body.style.overflow).toBe('');
    expect(document.body.style.paddingRight).toBe('');
    expect(document.body.classList.contains('modal-open')).toBe(false);
  });

  it('quita los fondos oscuros que hayan quedado sueltos', () => {
    document.body.insertAdjacentHTML('beforeend', '<div class="offcanvas-backdrop fade show"></div>');
    render(<MemoryRouter><RestaurarScroll /></MemoryRouter>);
    expect(document.querySelector('.offcanvas-backdrop')).toBeNull();
  });

  it('no toca nada si hay un modal realmente abierto', () => {
    bloquear();
    document.body.insertAdjacentHTML('beforeend', '<div class="modal show"></div>');
    render(<MemoryRouter><RestaurarScroll /></MemoryRouter>);
    expect(document.body.style.overflow).toBe('hidden');
    expect(document.body.classList.contains('modal-open')).toBe(true);
  });
});
