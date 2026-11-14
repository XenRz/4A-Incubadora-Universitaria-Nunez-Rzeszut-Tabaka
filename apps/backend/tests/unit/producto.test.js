// Reglas puras del dominio catálogo: sin base, sin HTTP.
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { nuevoProducto } from '../../src/modules/catalogo/domain/producto.js';
import { DatosInvalidos } from '../../src/shared/kernel/errors/errores.js';

const valido = { tiendaId: 1, nombre: 'Mate', precio: 1500.5, stock: 10 };

describe('nuevoProducto', () => {
  test('crea un producto válido y recorta espacios del nombre', () => {
    assert.deepEqual(nuevoProducto({ ...valido, nombre: '  Mate  ' }), { ...valido, nombre: 'Mate' });
  });

  test('acepta stock 0', () => {
    assert.equal(nuevoProducto({ ...valido, stock: 0 }).stock, 0);
  });

  const invalidos = [
    ['sin tienda', { tiendaId: undefined }],
    ['nombre vacío', { nombre: '   ' }],
    ['nombre que no es texto', { nombre: 123 }],
    ['precio 0', { precio: 0 }],
    ['precio negativo', { precio: -1 }],
    ['precio como texto', { precio: '100' }],
    ['precio infinito', { precio: Infinity }],
    ['stock negativo', { stock: -1 }],
    ['stock decimal', { stock: 1.5 }],
  ];
  for (const [caso, cambio] of invalidos) {
    test(`rechaza ${caso}`, () => {
      assert.throws(() => nuevoProducto({ ...valido, ...cambio }), DatosInvalidos);
    });
  }
});
