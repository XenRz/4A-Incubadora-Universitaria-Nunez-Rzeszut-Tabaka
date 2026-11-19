import { PasarelaNoDisponible } from '../../../../shared/kernel/errors/errores.js';
// este es el adaptador que implementa la interfaz de la pasarela de pagos usando HTTP. 
// Se comunica con un servicio externo que expone la pasarela de pagos por HTTP. 
// El resto del sistema no conoce los detalles de la pasarela, solo la interfaz que se define en application/ports/pasarela-pagos.js
// la pasarela es el mock de wiremock

/** @returns {import('../../application/ports/pasarela-pagos.js').PasarelaPagos} */
export function crearPasarelaPagosHttp({ url, timeoutMs = 5000 }) {
  return {
    async cobrar({ monto, referencia }) {
      let resp;
      try {
        resp = await fetch(`${url}/cobros`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ monto, referencia }),
          signal: AbortSignal.timeout(timeoutMs),   // si la pasarela se cuelga, no esperamos para siempre
        });
      } catch {
        throw new PasarelaNoDisponible('Pasarela no disponible', 'No se pudo comunicar con la pasarela de pagos.');
      }

      if (resp.status !== 201) {
        throw new PasarelaNoDisponible('Pasarela no disponible', `La pasarela respondió ${resp.status}.`);
      }

      const datos = await resp.json();
      // Traducimos la respuesta de la pasarela a formato propio: el resto del sistema no conoce el suyo.
      return { id: datos.id, estado: datos.estado === 'aprobado' ? 'aprobado' : 'rechazado', motivo: datos.motivo ?? null };
    },
  };
}