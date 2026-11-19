// API pública del módulo tiendas: lo ÚNICO que otros módulos pueden usar.
import { esDueno } from '../domain/tienda.js';

/**
 * @typedef {Object} TiendasPublicApi
 * @property {(id: number) => Promise<{ id: number, nombre: string } | null>} buscarTienda  null si no existe
 * @property {(tiendaId: number, usuarioId: string | null) => Promise<boolean>} esDuenoDeTienda
 */

/** @returns {TiendasPublicApi} */
export function crearTiendasPublicApi({ tiendaRepository }) {
  return {
    async buscarTienda(id) {
      const tienda = await tiendaRepository.buscarPorId(id);
      return tienda ? { id: tienda.id, nombre: tienda.nombre } : null;   // el dueño no sale del módulo
    },

    async esDuenoDeTienda(tiendaId, usuarioId) {
      const tienda = await tiendaRepository.buscarPorId(tiendaId);
      return tienda ? esDueno(tienda, usuarioId) : false;
    },
  };
}
