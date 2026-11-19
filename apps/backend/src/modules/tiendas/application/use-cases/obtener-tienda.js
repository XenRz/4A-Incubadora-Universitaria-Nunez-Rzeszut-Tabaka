import { NoEncontrado } from '../../../../shared/kernel/errors/errores.js';

/** @param {{ tiendaRepository: import('../ports/tienda-repository.js').TiendaRepository }} deps */
export function obtenerTienda({ tiendaRepository }) {
  return async function (id) {
    const tienda = await tiendaRepository.buscarPorId(id);
    if (!tienda) throw new NoEncontrado('Tienda no encontrada', `No existe una tienda con id ${id}.`);
    return tienda;
  };
}
