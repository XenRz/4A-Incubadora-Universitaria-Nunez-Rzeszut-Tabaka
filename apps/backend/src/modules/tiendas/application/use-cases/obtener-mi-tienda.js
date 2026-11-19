import { NoEncontrado } from '../../../../shared/kernel/errors/errores.js';

/** @param {{ tiendaRepository: import('../ports/tienda-repository.js').TiendaRepository }} deps */
export function obtenerMiTienda({ tiendaRepository }) {
  return async function (usuarioId) {
    const tienda = usuarioId ? await tiendaRepository.buscarPorDueno(usuarioId) : null;
    if (!tienda) throw new NoEncontrado('Tienda no encontrada', 'No tenés una tienda asignada.');
    return tienda;
  };
}