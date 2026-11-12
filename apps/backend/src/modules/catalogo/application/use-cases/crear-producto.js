import { NoEncontrado, SinPermiso } from '../../../../shared/kernel/errors/errores.js';
import { nuevoProducto } from '../../domain/producto.js';

/**
 * @param {{
 *   productoRepository: import('../ports/producto-repository.js').ProductoRepository,
 *   consultaTiendas: import('../ports/consulta-tiendas.js').ConsultaTiendas,
 * }} deps
 */
export function crearProducto({ productoRepository, consultaTiendas }) {
  // tiendaId viene de la URL, usuarioId del token (lo reenvía el gateway) y los datos del cuerpo del pedido.
  return async function (tiendaId, usuarioId, datos) {
    const tienda = await consultaTiendas.buscarTienda(tiendaId);
    if (!tienda) throw new NoEncontrado('Tienda no encontrada', `No existe una tienda con id ${tiendaId}.`);

    // Invariante: un dueño no puede crear productos en la tienda de otro dueño.
    if (!(await consultaTiendas.esDuenoDeTienda(tiendaId, usuarioId))) {
      throw new SinPermiso('Sin permiso', `No sos el dueño de la tienda ${tiendaId}.`);
    }

    const producto = nuevoProducto({ tiendaId, nombre: datos.nombre, precio: datos.precio, stock: datos.stock });

    const id = await productoRepository.guardar(producto);
    return {
      id, tiendaId: producto.tiendaId, tiendaNombre: tienda.nombre, nombre: producto.nombre, precio: producto.precio, stock: producto.stock,
    };
  };
}
