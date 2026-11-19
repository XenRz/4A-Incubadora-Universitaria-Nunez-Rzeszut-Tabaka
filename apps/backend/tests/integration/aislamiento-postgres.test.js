// NFR-3 contra Postgres REAL: el filtro por tienda del SQL y el control de dueño.
// Necesita una base con las migraciones aplicadas. Se saltea si no hay DB_HOST definido:
//   docker compose -f infra/compose/docker-compose.yml --profile test run --rm backend-tests
// Crea sus propias tiendas y las borra al terminar: no toca los datos de ejemplo.
import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { config } from '../../src/shared/infrastructure/config/config.js';
import { crearPool } from '../../src/shared/infrastructure/database/pool.js';
import { crearProductoRepositoryPg } from '../../src/modules/catalogo/infrastructure/persistence/producto-repository-pg.js';
import { crearTiendaRepositoryPg } from '../../src/modules/tiendas/infrastructure/persistence/tienda-repository-pg.js';
import { crearTiendasPublicApi } from '../../src/modules/tiendas/public-api/index.js';
import { crearProducto } from '../../src/modules/catalogo/application/use-cases/crear-producto.js';
import { SinPermiso } from '../../src/shared/kernel/errors/errores.js';

const sinBase = process.env.DB_HOST ? false : 'sin DB_HOST: correlo con el perfil "test" del compose';

describe('Aislamiento contra Postgres', { skip: sinBase }, () => {
  let pool;
  let productoRepository;
  let ejecutarCrear;
  const duenoA = randomUUID();
  const duenoB = randomUUID();
  let tiendaA;
  let tiendaB;

  before(async () => {
    pool = crearPool(config.db);
    productoRepository = crearProductoRepositoryPg(pool);
    const consultaTiendas = crearTiendasPublicApi({ tiendaRepository: crearTiendaRepositoryPg(pool) });
    ejecutarCrear = crearProducto({ productoRepository, consultaTiendas });

    // Tiendas propias del test (la tabla tiendas es del módulo tiendas; acá se usa SQL directo solo para preparar datos).
    const { rows } = await pool.query(
      'INSERT INTO tiendas (nombre, dueno_id) VALUES ($1, $2), ($3, $4) RETURNING id',
      ['Test aislamiento A', duenoA, 'Test aislamiento B', duenoB],
    );
    [tiendaA, tiendaB] = rows.map((r) => r.id);
  });

  after(async () => {
    if (!pool) return;
    await pool.query('DELETE FROM productos WHERE tienda_id = ANY($1)', [[tiendaA, tiendaB]]);
    await pool.query('DELETE FROM tiendas WHERE id = ANY($1)', [[tiendaA, tiendaB]]);
    await pool.end();
  });

  test('un producto de A no aparece en el listado de B', async () => {
    await ejecutarCrear(tiendaA, duenoA, { nombre: 'Solo de A', precio: 10, stock: 1 });
    await ejecutarCrear(tiendaB, duenoB, { nombre: 'Solo de B', precio: 10, stock: 1 });

    const deA = await productoRepository.listarPorTienda(tiendaA);
    const deB = await productoRepository.listarPorTienda(tiendaB);
    assert.deepEqual(deA.map((p) => p.nombre), ['Solo de A']);
    assert.deepEqual(deB.map((p) => p.nombre), ['Solo de B']);
  });

  test('el dueño de B no puede crear en A y no queda nada guardado', async () => {
    await assert.rejects(ejecutarCrear(tiendaA, duenoB, { nombre: 'Intruso', precio: 10, stock: 1 }), SinPermiso);
    const deA = await productoRepository.listarPorTienda(tiendaA);
    assert.ok(!deA.some((p) => p.nombre === 'Intruso'));
  });
});
