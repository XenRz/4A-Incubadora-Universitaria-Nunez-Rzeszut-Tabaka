/** @param {{ tiendaRepository: import('../ports/tienda-repository.js').TiendaRepository }} deps */
export function listarTiendas({ tiendaRepository }) {
  return async function () {
    return tiendaRepository.listar();
  };
}
