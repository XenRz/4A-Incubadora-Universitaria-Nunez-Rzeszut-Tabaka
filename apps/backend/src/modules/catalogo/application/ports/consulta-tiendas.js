// Puerto: lo que catalogo necesita saber de las tiendas.
// main/index.js lo cumple con la public-api del módulo tiendas;
// catalogo nunca importa nada de tiendas directamente.

/**
 * @typedef {Object} ConsultaTiendas
 * @property {(id: number) => Promise<{ id: number, nombre: string } | null>} buscarTienda  null si no existe
 */

export {};
