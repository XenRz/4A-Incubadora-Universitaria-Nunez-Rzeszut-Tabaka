// en este archivo se define la interfaz de la pasarela de pagos, que es un contrato que debe 
// cumplir cualquier implementacion de una pasarela de pagos. 
// La interfaz define un metodo cobrar que recibe un objeto con el monto y la referencia del cobro, 
// y devuelve una promesa que resuelve con un objeto ResultadoCobro que indica si el cobro fue aprobado o rechazado, 
// y en caso de rechazo, el motivo del rechazo.

/**
 * @typedef {{ id: string, estado: 'aprobado' | 'rechazado', motivo: string | null }} ResultadoCobro
 *
 * @typedef {Object} PasarelaPagos
 * @property {(cobro: { monto: number, referencia: string }) => Promise<ResultadoCobro>} cobrar
 * 
 */

export {};