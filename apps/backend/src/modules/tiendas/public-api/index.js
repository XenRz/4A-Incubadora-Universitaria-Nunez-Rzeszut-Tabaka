// API pública del módulo tiendas: lo ÚNICO que otros módulos pueden usar.

/**
 * @typedef {Object} TiendasPublicApi
 * @property {(id: number) => Promise<{ id: number, nombre: string } | null>} buscarTienda  null si no existe
 */

/** @returns {TiendasPublicApi} */
export function crearTiendasPublicApi({ tiendaRepository }) {
  return {
    buscarTienda: (id) => tiendaRepository.buscarPorId(id),
  };
}
