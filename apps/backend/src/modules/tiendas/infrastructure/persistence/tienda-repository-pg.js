import { crearTienda } from '../../domain/tienda.js';

// Adaptador: implementa el puerto TiendaRepository con Postgres.
export function crearTiendaRepositoryPg(pool) {
  return {
    async listar() {
      const { rows } = await pool.query('SELECT id, nombre FROM tiendas ORDER BY id');
      return rows.map(crearTienda);
    },

    async buscarPorId(id) {
      const { rows } = await pool.query('SELECT id, nombre FROM tiendas WHERE id = $1', [id]);
      return rows.length ? crearTienda(rows[0]) : null;
    },
  };
}
