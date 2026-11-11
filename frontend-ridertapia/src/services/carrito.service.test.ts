import { describe, expect, it } from 'vitest';
import {
  agregar, calcularTotales, cambiarCantidad, cantidadMaximaLinea, contarUnidades, eliminar,
  limitarCantidad, validarStock, validarStockCarrito, vaciar
} from './carrito.service';
import { crearItem, crearProducto } from '../test/fixtures';

describe('HU-12 Agregar productos al carrito', () => {
  it('HU-12 CA1: un producto con stock aparece en el carrito con la cantidad seleccionada', () => {
    const producto = crearProducto({ stockDisponible: 5 });
    expect(validarStock([], producto, 2)).toBeNull();

    const carrito = agregar([], crearItem({ idProducto: 1, cantidad: 2 }));
    expect(carrito).toHaveLength(1);
    expect(carrito[0].cantidad).toBe(2);
  });

  it('HU-12 CA1: el total del carrito se actualiza al agregar', () => {
    const carrito = agregar([], crearItem({ cantidad: 2, precioUnitario: 10000 }));
    expect(calcularTotales(carrito).total).toBe(20000);
  });

  it('HU-12 CA1: si ya está con la misma variante, suma la cantidad en la misma línea', () => {
    const inicial = [crearItem({ cantidad: 1, variante: 'M' })];
    const carrito = agregar(inicial, crearItem({ cantidad: 2, variante: 'M' }));
    expect(carrito).toHaveLength(1);
    expect(carrito[0].cantidad).toBe(3);
  });

  it('HU-12 CA1: una variante distinta crea una línea nueva', () => {
    const carrito = agregar([crearItem({ variante: 'M' })], crearItem({ variante: 'L' }));
    expect(carrito).toHaveLength(2);
  });

  it('HU-12 CA1: agregar no modifica el carrito original', () => {
    const inicial = [crearItem({ cantidad: 1 })];
    agregar(inicial, crearItem({ cantidad: 2 }));
    expect(inicial[0].cantidad).toBe(1);
  });

  it('HU-12 CA2: un producto sin stock no se puede agregar y el sistema informa', () => {
    const producto = crearProducto({ stockDisponible: 0 });
    expect(validarStock([], producto, 1)).toBe('Este producto no tiene stock disponible.');
  });

  it('HU-12 CA2: un producto no publicado se trata como no disponible', () => {
    const producto = crearProducto({ estado: 'OCULTO', stockDisponible: 5 });
    expect(validarStock([], producto, 1)).toBe('Este producto no tiene stock disponible.');
  });
});

describe('HU-13 Actualizar carrito', () => {
  it('HU-13 CA1: al cambiar la cantidad, subtotal y total se recalculan', () => {
    const carrito = [crearItem({ cantidad: 1, precioUnitario: 10000 })];
    const nuevo = cambiarCantidad(carrito, 0, 3);
    expect(nuevo[0].cantidad).toBe(3);
    expect(calcularTotales(nuevo)).toEqual({ subtotal: 30000, envio: 0, total: 30000 });
  });

  it('HU-13 CA1: la cantidad nunca baja de 1', () => {
    expect(cambiarCantidad([crearItem()], 0, 0)[0].cantidad).toBe(1);
    expect(limitarCantidad(-4)).toBe(1);
  });

  it('HU-13 CA1: la cantidad nunca pasa de 10 y los decimales se redondean hacia abajo', () => {
    expect(cambiarCantidad([crearItem()], 0, 99)[0].cantidad).toBe(10);
    expect(limitarCantidad(2.7)).toBe(2);
  });

  it('HU-13 CA2: una cantidad mayor al stock no se permite e indica cuántas quedan', () => {
    const producto = crearProducto({ stockDisponible: 3 });
    expect(validarStock([], producto, 4)).toBe('Solo puedes agregar 3 unidad(es) más.');
  });

  it('HU-13 CA2: descuenta lo que ya hay en el carrito al calcular el máximo', () => {
    const producto = crearProducto({ stockDisponible: 3 });
    const carrito = [crearItem({ cantidad: 2 })];
    expect(validarStock(carrito, producto, 2)).toBe('Solo puedes agregar 1 unidad(es) más.');
  });

  it('HU-13 CA2: si el carrito ya tiene todo el stock, no deja agregar más', () => {
    const producto = crearProducto({ stockDisponible: 2 });
    const carrito = [crearItem({ cantidad: 2 })];
    expect(validarStock(carrito, producto, 1)).toBe('Ya tienes en tu carrito todas las unidades disponibles.');
  });

  it('HU-13 CA2: no deja superar 10 unidades por producto aunque haya stock', () => {
    const producto = crearProducto({ stockDisponible: 50 });
    const carrito = [crearItem({ cantidad: 8 })];
    expect(validarStock(carrito, producto, 3)).toBe('Puedes llevar hasta 10 unidades por producto.');
  });

  it('HU-13 CA2: el máximo de una línea descuenta las otras variantes del mismo producto', () => {
    const producto = crearProducto({ stockDisponible: 5 });
    const carrito = [crearItem({ cantidad: 1, variante: 'M' }), crearItem({ cantidad: 2, variante: 'L' })];
    expect(cantidadMaximaLinea(carrito, 0, producto)).toBe(3);
  });

  it('HU-13 CA2: la revisión del carrito detecta stock insuficiente', () => {
    const producto = crearProducto({ nombre: 'Casco Trail Pro', stockDisponible: 2 });
    const carrito = [crearItem({ cantidad: 4 })];
    expect(validarStockCarrito(carrito, [producto])).toBe('Solo quedan 2 unidades de "Casco Trail Pro".');
  });

  it('HU-13 CA2: la revisión del carrito detecta un producto que ya no está publicado', () => {
    const producto = crearProducto({ estado: 'OCULTO' });
    expect(validarStockCarrito([crearItem()], [producto])).toBe('Un producto de tu carrito ya no está disponible.');
  });

  it('HU-13 CA2: un carrito con stock suficiente pasa la revisión', () => {
    const producto = crearProducto({ stockDisponible: 5 });
    expect(validarStockCarrito([crearItem({ cantidad: 3 })], [producto])).toBeNull();
  });

  it('HU-13 CA3: eliminar un producto lo quita del carrito y el total se recalcula', () => {
    const carrito = [
      crearItem({ idProducto: 1, cantidad: 1, precioUnitario: 10000 }),
      crearItem({ idProducto: 2, cantidad: 2, precioUnitario: 5000 })
    ];
    const nuevo = eliminar(carrito, 0);
    expect(nuevo).toHaveLength(1);
    expect(nuevo[0].idProducto).toBe(2);
    expect(calcularTotales(nuevo).total).toBe(10000);
  });
});

describe('HU-14 Ver detalle del carrito', () => {
  it('HU-14 CA1: el total general suma el subtotal de cada producto', () => {
    const carrito = [
      crearItem({ idProducto: 1, cantidad: 2, precioUnitario: 10000 }),
      crearItem({ idProducto: 2, cantidad: 1, precioUnitario: 4990 })
    ];
    expect(calcularTotales(carrito)).toEqual({ subtotal: 24990, envio: 0, total: 24990 });
  });

  it('HU-14 CA1: cuenta las unidades de todas las líneas', () => {
    const carrito = [crearItem({ cantidad: 2 }), crearItem({ idProducto: 2, cantidad: 3 })];
    expect(contarUnidades(carrito)).toBe(5);
  });

  it('HU-14 CA2: un carrito vacío tiene total 0 y no tiene unidades', () => {
    expect(calcularTotales([])).toEqual({ subtotal: 0, envio: 0, total: 0 });
    expect(contarUnidades([])).toBe(0);
  });

  it('HU-14 CA2: vaciar deja el carrito sin productos', () => {
    expect(vaciar()).toEqual([]);
  });
});
