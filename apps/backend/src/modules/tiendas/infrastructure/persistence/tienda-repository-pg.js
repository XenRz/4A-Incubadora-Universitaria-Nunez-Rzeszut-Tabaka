import { crearTienda } from '../../domain/tienda.js';

// Adaptador: implementa el puerto TiendaRepository con Postgres.
const aTienda = (r) => crearTienda({ id: r.id, nombre: r.nombre, duenoId: r.dueno_id });

export function crearTiendaRepositoryPg(pool) {
  return {
    async listar() {
      const { rows } = await pool.query('SELECT id, nombre, dueno_id FROM tiendas ORDER BY id');
      return rows.map(aTienda);
    },

    async buscarPorId(id) {
      const { rows } = await pool.query('SELECT id, nombre, dueno_id FROM tiendas WHERE id = $1', [id]);
      return rows.length ? aTienda(rows[0]) : null;
    },
  };
}
