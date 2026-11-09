import { DatosInvalidos } from '../../../../shared/kernel/errors/errores.js';
import { nuevoProducto } from '../../domain/producto.js';

/**
 * @param {{
 *   productoRepository: import('../ports/producto-repository.js').ProductoRepository,
 *   consultaTiendas: import('../ports/consulta-tiendas.js').ConsultaTiendas,
 * }} deps
 */
export function crearProducto({ productoRepository, consultaTiendas }) {
  return async function (datos) {
    const producto = nuevoProducto(datos);

    const tienda = await consultaTiendas.buscarTienda(producto.tiendaId);
    if (!tienda) throw new DatosInvalidos('Datos inválidos', `No existe una tienda con id ${producto.tiendaId}.`);

    const id = await productoRepository.guardar(producto);
    return {
      id, tiendaId: producto.tiendaId, tiendaNombre: tienda.nombre, nombre: producto.nombre, precio: producto.precio, stock: producto.stock,
    };
  };
}
