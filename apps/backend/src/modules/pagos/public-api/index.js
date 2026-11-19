// API publica del pagos: lo unico que otros modulos pueden usar.


/**
 * @typedef {Object} PagosPublicApi
 * @property {(cobro: { monto: number, referencia: string }) => Promise<import('../application/ports/pasarela-pagos.js').ResultadoCobro>} cobrar
 */

/**
 * @param {{ pasarela: import('../application/ports/pasarela-pagos.js').PasarelaPagos }} deps
 * @returns {PagosPublicApi}
 */
export function crearPagosPublicApi({ pasarela }) {
  return {
    cobrar: (cobro) => pasarela.cobrar(cobro),
  };
}