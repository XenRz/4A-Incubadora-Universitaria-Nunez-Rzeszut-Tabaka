// NFR-3 · Caso de uso mínimo por HTTP: la dueña de la tienda A carga un producto,
// el catálogo de la tienda B no lo muestra y la dueña de B no puede escribir en A.
// Usa el MISMO composition root que producción (main/app.js) con adaptadores en memoria.
import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { crearBackend } from '../../src/main/app.js';
import { levantar } from '../support/servidor.js';
import {
  ANA, BETO, CARLA, crearTiendaRepositoryEnMemoria, crearProductoRepositoryEnMemoria, productosDeRelleno,
} from '../support/repos-en-memoria.js';

// El gateway es el que pone X-Usuario-Id con el "sub" del token ya validado.
const comoUsuario = (usuarioId, cuerpo) => ({
  method: 'POST',
  headers: { 'Content-Type': 'application/json', ...(usuarioId ? { 'X-Usuario-Id': usuarioId } : {}) },
  body: typeof cuerpo === 'string' ? cuerpo : JSON.stringify(cuerpo),
});

describe('Aislamiento entre tiendas (HTTP)', () => {
  let api;

  before(async () => {
    api = await levantar(crearBackend({
      tiendaRepository: crearTiendaRepositoryEnMemoria(),
      productoRepository: crearProductoRepositoryEnMemoria(productosDeRelleno(2, 3, 100)),
      verificarBase: async () => {},
    }));
  });
  after(() => api.cerrar());

  test('la dueña de A crea un producto en A → 201 con Location', async () => {
    const resp = await api.pedir('/tiendas/1/productos', comoUsuario(ANA, { nombre: 'Mate exclusivo de A', precio: 9000, stock: 2 }));
    assert.equal(resp.status, 201);
    const producto = await resp.json();
    assert.equal(producto.tiendaId, 1);
    assert.equal(resp.headers.get('location'), `/tiendas/1/productos/${producto.id}`);
  });

  test('el catálogo de A lo muestra', async () => {
    const productos = await (await api.pedir('/tiendas/1/productos')).json();
    assert.ok(productos.some((p) => p.nombre === 'Mate exclusivo de A'));
    assert.ok(productos.every((p) => p.tiendaId === 1));
  });

  test('el catálogo de B NO lo muestra y solo trae productos de B', async () => {
    const productos = await (await api.pedir('/tiendas/2/productos')).json();
    assert.equal(productos.length, 3);
    assert.ok(productos.every((p) => p.tiendaId === 2));
    assert.ok(!productos.some((p) => p.nombre === 'Mate exclusivo de A'));
  });

  test('la dueña de B intenta crear en A → 403 Problem Details y el catálogo de A no cambia', async () => {
    const antes = (await (await api.pedir('/tiendas/1/productos')).json()).length;
    const resp = await api.pedir('/tiendas/1/productos', comoUsuario(CARLA, { nombre: 'Intruso', precio: 1, stock: 1 }));
    assert.equal(resp.status, 403);
    assert.match(resp.headers.get('content-type'), /application\/problem\+json/);
    const problema = await resp.json();
    assert.equal(problema.status, 403);
    assert.equal(problema.instance, '/tiendas/1/productos');
    const despues = (await (await api.pedir('/tiendas/1/productos')).json()).length;
    assert.equal(despues, antes);
  });

  test('un comprador con id válido tampoco puede crear → 403', async () => {
    const resp = await api.pedir('/tiendas/1/productos', comoUsuario(BETO, { nombre: 'X', precio: 1, stock: 1 }));
    assert.equal(resp.status, 403);
  });

  test('sin X-Usuario-Id → 403 (nunca se crea un producto anónimo)', async () => {
    const resp = await api.pedir('/tiendas/1/productos', comoUsuario(null, { nombre: 'X', precio: 1, stock: 1 }));
    assert.equal(resp.status, 403);
  });

  test('tienda inexistente → 404', async () => {
    const resp = await api.pedir('/tiendas/99/productos');
    assert.equal(resp.status, 404);
  });

  test('id no numérico → 400', async () => {
    const resp = await api.pedir('/tiendas/abc/productos');
    assert.equal(resp.status, 400);
  });

  test('JSON mal formado → 400 (no 500)', async () => {
    const resp = await api.pedir('/tiendas/1/productos', comoUsuario(ANA, '{"nombre": '));
    assert.equal(resp.status, 400);
    assert.match(resp.headers.get('content-type'), /application\/problem\+json/);
  });

  test('datos inválidos → 400', async () => {
    const resp = await api.pedir('/tiendas/1/productos', comoUsuario(ANA, { nombre: 'X', precio: -5, stock: 1 }));
    assert.equal(resp.status, 400);
  });
});
