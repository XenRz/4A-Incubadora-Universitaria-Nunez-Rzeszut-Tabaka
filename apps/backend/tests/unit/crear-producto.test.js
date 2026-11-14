// Caso de uso crear-producto con adaptadores en memoria: orden de las reglas y aislamiento.
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { crearProducto } from '../../src/modules/catalogo/application/use-cases/crear-producto.js';
import { crearTiendasPublicApi } from '../../src/modules/tiendas/public-api/index.js';
import { NoEncontrado, SinPermiso, DatosInvalidos } from '../../src/shared/kernel/errors/errores.js';
import {
  ANA, CARLA, crearTiendaRepositoryEnMemoria, crearProductoRepositoryEnMemoria,
} from '../support/repos-en-memoria.js';

const datos = { nombre: 'Mate', precio: 1500, stock: 3 };

function armar() {
  const productoRepository = crearProductoRepositoryEnMemoria();
  const consultaTiendas = crearTiendasPublicApi({ tiendaRepository: crearTiendaRepositoryEnMemoria() });
  return { productoRepository, ejecutar: crearProducto({ productoRepository, consultaTiendas }) };
}

describe('crearProducto', () => {
  test('el dueño crea un producto en su tienda', async () => {
    const { productoRepository, ejecutar } = armar();
    const creado = await ejecutar(1, ANA, datos);
    assert.equal(creado.tiendaId, 1);
    assert.equal(creado.tiendaNombre, 'Tienda A');
    assert.equal(productoRepository.datos.length, 1);
  });

  test('tienda inexistente → NoEncontrado', async () => {
    const { ejecutar } = armar();
    await assert.rejects(ejecutar(99, ANA, datos), NoEncontrado);
  });

  test('AISLAMIENTO: la dueña de la tienda B no puede crear en la tienda A y no se guarda nada', async () => {
    const { productoRepository, ejecutar } = armar();
    await assert.rejects(ejecutar(1, CARLA, datos), SinPermiso);
    assert.equal(productoRepository.datos.length, 0);
  });

  test('sin usuario (token sin sub) → SinPermiso', async () => {
    const { ejecutar } = armar();
    await assert.rejects(ejecutar(1, null, datos), SinPermiso);
  });

  test('el permiso se revisa antes que los datos (no se filtra qué campos espera una tienda ajena)', async () => {
    const { ejecutar } = armar();
    await assert.rejects(ejecutar(1, CARLA, {}), SinPermiso);
  });

  test('datos inválidos → DatosInvalidos', async () => {
    const { ejecutar } = armar();
    await assert.rejects(ejecutar(1, ANA, { ...datos, precio: 0 }), DatosInvalidos);
  });
});
