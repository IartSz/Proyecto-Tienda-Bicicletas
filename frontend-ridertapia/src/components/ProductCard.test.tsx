import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import ProductCard from './ProductCard';
import { crearProducto } from '../test/fixtures';
import type { Producto } from '../models/Producto';

// El componente usa <Link>, por eso se renderiza dentro de un router
const mostrar = (producto: Producto, onAgregar?: (p: Producto) => void) =>
  render(
    <MemoryRouter>
      <ProductCard producto={producto} onAgregar={onAgregar} />
    </MemoryRouter>
  );

describe('HU-28 Ver ficha de producto (tarjeta del catálogo)', () => {
  it('HU-28 CA1: muestra nombre, marca y precio en pesos chilenos', () => {
    mostrar(crearProducto({ nombre: 'Casco Trail Pro', precioNormal: 15990 }));
    expect(screen.getByRole('heading', { name: 'Casco Trail Pro' })).toBeInTheDocument();
    expect(screen.getByText(/Fox/)).toBeInTheDocument();
    expect(screen.getByText('$15.990')).toBeInTheDocument();
  });

  it('HU-28 CA1: la tarjeta enlaza a la ficha del producto', () => {
    mostrar(crearProducto({ idProducto: 7 }));
    expect(screen.getByRole('link')).toHaveAttribute('href', '/producto/7');
  });

  it('HU-28 CA1: muestra la imagen del producto', () => {
    mostrar(crearProducto({ imagenPrincipal: '/img/casco.png' }));
    expect(screen.getByAltText('Casco Trail Pro')).toHaveAttribute('src', '/img/casco.png');
  });

  it('HU-28 CA1: si la imagen falla, muestra el ícono de la categoría', () => {
    mostrar(crearProducto({ imagenPrincipal: '/img/rota.png' }));
    fireEvent.error(screen.getByAltText('Casco Trail Pro'));
    expect(screen.queryByAltText('Casco Trail Pro')).not.toBeInTheDocument();
  });

  it('HU-28 CA2: un producto en oferta muestra el precio rebajado y el original tachado', () => {
    mostrar(crearProducto({ precioNormal: 20000, precioOferta: 15000 }));
    expect(screen.getByText('$20.000')).toHaveClass('price-old');
    expect(screen.getByText('$15.000')).toHaveClass('price-new');
  });

  it('HU-28 CA2: un producto sin oferta no muestra precio tachado', () => {
    mostrar(crearProducto({ precioNormal: 20000 }));
    expect(screen.getByText('$20.000')).toHaveClass('price-new');
    expect(document.querySelector('.price-old')).toBeNull();
  });
});

describe('HU-29 Ver ofertas y promociones (insignia)', () => {
  it('HU-29 CA1: un producto en oferta muestra la insignia OFERTA', () => {
    mostrar(crearProducto({ precioOferta: 10000 }));
    expect(screen.getByText('OFERTA')).toBeInTheDocument();
  });

  it('HU-29 CA1: un producto sin oferta no muestra la insignia', () => {
    mostrar(crearProducto());
    expect(screen.queryByText('OFERTA')).not.toBeInTheDocument();
  });
});

describe('HU-12 Agregar productos al carrito (botón de la tarjeta)', () => {
  it('HU-12 CA1: al presionar Agregar se entrega el producto a quien lo pidió', async () => {
    const onAgregar = vi.fn();
    const producto = crearProducto({ stockDisponible: 5 });
    mostrar(producto, onAgregar);

    await userEvent.click(screen.getByRole('button', { name: /Agregar/ }));
    expect(onAgregar).toHaveBeenCalledTimes(1);
    expect(onAgregar).toHaveBeenCalledWith(producto);
  });

  it('HU-12 CA2: un producto sin stock muestra AGOTADO y no se puede agregar', async () => {
    const onAgregar = vi.fn();
    mostrar(crearProducto({ stockDisponible: 0 }), onAgregar);

    expect(screen.getByText('AGOTADO')).toBeInTheDocument();
    const boton = screen.getByRole('button', { name: /Agregar/ });
    expect(boton).toBeDisabled();

    await userEvent.click(boton);
    expect(onAgregar).not.toHaveBeenCalled();
  });

  it('HU-12 CA1: sin la función onAgregar no se muestra el botón', () => {
    mostrar(crearProducto());
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
