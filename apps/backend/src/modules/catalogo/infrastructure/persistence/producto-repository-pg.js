// Adaptador: implementa el puerto ProductoRepository con Postgres.
// Solo toca la tabla productos (la de tiendas es de otro módulo).

// NUMERIC llega de pg como texto: se convierte a número
const aProducto = (r) => ({ id: r.id, tiendaId: r.tienda_id, nombre: r.nombre, precio: Number(r.precio), stock: r.stock });

export function crearProductoRepositoryPg(pool) {
  return {
    async listarPorTienda(tiendaId) {
      const { rows } = await pool.query(
        'SELECT id, tienda_id, nombre, precio, stock FROM productos WHERE tienda_id = $1 ORDER BY id',
        [tiendaId],
      );
      return rows.map(aProducto);
    },

    async guardar({ tiendaId, nombre, precio, stock }) {
      const { rows } = await pool.query(
        'INSERT INTO productos (tienda_id, nombre, precio, stock) VALUES ($1, $2, $3, $4) RETURNING id',
        [tiendaId, nombre, precio, stock],
      );
      return rows[0].id;
    },
  };
}
