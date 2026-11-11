import { describe, expect, it } from 'vitest';
import {
  calcularDV, errorCvv, errorEmail, errorNombre, errorRut, errorTarjeta, errorTelefono, errorVencimiento,
  formatearCvv, formatearRut, formatearTarjeta, formatearVencimiento, limpiarNombre, limpiarRut, validarRut
} from './validaciones';

describe('HU-1 Registro de cliente (datos del formulario)', () => {
  it('HU-1 CA1: nombre, apellido, RUT y correo válidos no generan errores', () => {
    expect(errorNombre('Camila', 'nombre')).toBe('');
    expect(errorNombre('Rojas Pérez', 'apellido')).toBe('');
    expect(errorRut('12.345.678-5')).toBe('');
    expect(errorEmail('camila@correo.cl')).toBe('');
  });

  it('HU-1 CA3: un nombre vacío se informa como campo faltante', () => {
    expect(errorNombre('', 'nombre')).toBe('Ingresa tu nombre.');
    expect(errorNombre('   ', 'apellido')).toBe('Ingresa tu apellido.');
  });

  it('HU-1 CA3: un RUT vacío se informa como campo faltante', () => {
    expect(errorRut('')).toBe('Ingresa tu RUT.');
  });

  it('HU-1 CA3: un correo vacío se informa como campo faltante', () => {
    expect(errorEmail('')).toBe('Ingresa tu correo.');
  });

  it('HU-1 CA1: el nombre con números o símbolos se rechaza', () => {
    expect(errorNombre('Juan3', 'nombre')).toBe('El nombre solo puede tener letras.');
  });

  it('HU-1 CA1: el nombre de una sola letra se rechaza', () => {
    expect(errorNombre('A', 'nombre')).toBe('El nombre debe tener al menos 2 letras.');
  });

  it('HU-1 CA1: limpiarNombre quita números y símbolos mientras se escribe', () => {
    expect(limpiarNombre('Ana9 -María')).toBe('Ana María');
  });
});

describe('HU-1 Registro de cliente (RUT)', () => {
  it('HU-1 CA1: calcula el dígito verificador con módulo 11', () => {
    expect(calcularDV('12345678')).toBe('5');
    expect(calcularDV('11111111')).toBe('1');
  });

  it('HU-1 CA1: acepta un RUT con puntos, guion o sin ellos', () => {
    expect(validarRut('12.345.678-5')).toBe(true);
    expect(validarRut('12345678-5')).toBe(true);
    expect(validarRut('123456785')).toBe(true);
  });

  it('HU-1 CA3: rechaza un RUT con dígito verificador incorrecto', () => {
    expect(validarRut('12.345.678-9')).toBe(false);
    expect(errorRut('12.345.678-9')).toBe('El dígito verificador no corresponde a ese RUT.');
  });

  it('HU-1 CA3: rechaza un RUT con formato inválido', () => {
    expect(errorRut('123')).toBe('Formato inválido. Ej: 12.345.678-5');
    expect(errorRut('12')).toBe('Formato inválido. Ej: 12.345.678-5');
  });

  it('HU-1 CA1: limpia y da formato al RUT mientras se escribe', () => {
    expect(limpiarRut('12.345.678-5')).toBe('123456785');
    expect(formatearRut('123456785')).toBe('12.345.678-5');
  });

  it('HU-1 CA1: la K solo se acepta como dígito verificador final', () => {
    expect(limpiarRut('12.345.67k-5')).toBe('12345675');
    expect(limpiarRut('1234567k')).toBe('1234567K');
  });
});

describe('HU-2 Registro de visitante (medio de contacto)', () => {
  it('HU-2 CA1: un correo válido sirve como medio de contacto', () => {
    expect(errorEmail('visita@correo.cl')).toBe('');
  });

  it('HU-2 CA1: un teléfono chileno válido sirve como medio de contacto', () => {
    expect(errorTelefono('+56 9 1234 5678')).toBe('');
    expect(errorTelefono('912345678')).toBe('');
    expect(errorTelefono('+56912345678')).toBe('');
  });

  it('HU-2 CA2: sin correo ni teléfono, ambos campos informan el error', () => {
    expect(errorEmail('')).not.toBe('');
    expect(errorTelefono('')).toBe('Ingresa tu teléfono.');
  });
});

describe('HU-3 Actualizar perfil (formato inválido)', () => {
  it('HU-3 CA2: un correo sin arroba o sin dominio muestra error', () => {
    expect(errorEmail('correo-invalido')).toBe('Ingresa un correo válido.');
    expect(errorEmail('a@b')).toBe('Ingresa un correo válido.');
    expect(errorEmail('con espacio@correo.cl')).toBe('Ingresa un correo válido.');
  });

  it('HU-3 CA2: un teléfono con formato inválido muestra error', () => {
    expect(errorTelefono('12345')).toBe('Formato: +56 9 1234 5678');
    expect(errorTelefono('+56 2 1234 5678')).toBe('Formato: +56 9 1234 5678');
  });

  it('HU-3 CA1: un correo y teléfono válidos no generan errores', () => {
    expect(errorEmail('  camila@correo.cl  ')).toBe('');
    expect(errorTelefono('+56 9 8765 4321')).toBe('');
  });
});

describe('HU-19 Realizar pago en línea (datos de tarjeta)', () => {
  it('HU-19 CA1: datos de tarjeta válidos no generan errores', () => {
    expect(errorTarjeta('4111 1111 1111 1111')).toBe('');
    expect(errorVencimiento('12/28')).toBe('');
    expect(errorCvv('123')).toBe('');
  });

  it('HU-19 CA2: una tarjeta incompleta, un vencimiento inválido o un CVV corto se rechazan', () => {
    expect(errorTarjeta('4111 1111')).toBe('Ingresa los 16 dígitos.');
    expect(errorVencimiento('13/28')).toBe('Formato MM/AA.');
    expect(errorVencimiento('1228')).toBe('Formato MM/AA.');
    expect(errorCvv('12')).toBe('3 dígitos.');
  });

  it('HU-19 CA1: da formato a número, vencimiento y CVV mientras se escribe', () => {
    expect(formatearTarjeta('4111111111111111')).toBe('4111 1111 1111 1111');
    expect(formatearTarjeta('4111-1111abc')).toBe('4111 1111');
    expect(formatearVencimiento('1228')).toBe('12/28');
    expect(formatearCvv('12a34')).toBe('123');
  });
});
