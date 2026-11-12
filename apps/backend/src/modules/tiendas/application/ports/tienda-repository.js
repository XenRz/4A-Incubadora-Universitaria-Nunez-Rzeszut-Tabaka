// Puerto: lo que los casos de uso necesitan para leer tiendas.
// Lo implementa infrastructure/persistence/tienda-repository-pg.js.
// (JavaScript no tiene interfaces: el contrato queda documentado acá.)

/**
 * @typedef {{ id: number, nombre: string, duenoId: string | null }} Tienda
 *
 * @typedef {Object} TiendaRepository
 * @property {() => Promise<Tienda[]>} listar
 * @property {(id: number) => Promise<Tienda | null>} buscarPorId  null si no existe
 */

export {};
