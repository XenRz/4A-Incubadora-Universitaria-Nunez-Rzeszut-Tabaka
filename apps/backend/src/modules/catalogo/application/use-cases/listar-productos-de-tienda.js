import { NoEncontrado } from '../../../../shared/kernel/errors/errores.js';

/**
 * @param {{
 *   productoRepository: import('../ports/producto-repository.js').ProductoRepository,
 *   consultaTiendas: import('../ports/consulta-tiendas.js').ConsultaTiendas,
 * }} deps
 */
export function listarProductosDeTienda({ productoRepository, consultaTiendas }) {
  return async function (tiendaId) {
    const tienda = await consultaTiendas.buscarTienda(tiendaId);
    if (!tienda) throw new NoEncontrado('Tienda no encontrada', `No existe una tienda con id ${tiendaId}.`);

    const productos = await productoRepository.listarPorTienda(tiendaId);
    return productos.map((p) => ({
      id: p.id, tiendaId: p.tiendaId, tiendaNombre: tienda.nombre, nombre: p.nombre, precio: p.precio, stock: p.stock,
    }));
  };
}
