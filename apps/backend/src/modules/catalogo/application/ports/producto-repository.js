// Puerto: lo que los casos de uso necesitan para leer y guardar productos.
// Lo implementa infrastructure/persistence/producto-repository-pg.js.

/**
 * @typedef {{ id: number, tiendaId: number, nombre: string, precio: number, stock: number }} Producto
 *
 * @typedef {Object} ProductoRepository
 * @property {(tiendaId: number) => Promise<Producto[]>} listarPorTienda
 * @property {(producto: Omit<Producto, 'id'>) => Promise<number>} guardar  devuelve el id nuevo
 */

export {};
