// Gateway de autenticación y autorización (Clase 11).
// Se para DELANTE de la API: valida el token que emitió Keycloak y decide, según el rol,
// si el pedido pasa. Este archivo solo ARMA la app; src/index.js le pasa la configuración y abre el puerto.
// Así los tests pueden armarla con una clave propia sin depender de Keycloak.
import express from 'express';
import { jwtVerify } from 'jose';

// ---------- Reglas de autorización (RBAC) ----------
// Quién puede hacer qué. Está en UN solo lugar y se lee como una tabla.
export const REGLAS = [
  { metodo: 'GET',    ruta: /^\/health$/,         roles: null },                     // público
  { metodo: 'GET',    ruta: /^\/tiendas(\/[^/]+)?$/, roles: null },
  { metodo: 'GET',    ruta: /^\/tiendas\/[^/]+\/productos$/, roles: null },
  { metodo: 'POST',   ruta: /^\/tiendas$/,         roles: ['admin'] },
  { metodo: 'DELETE', ruta: /^\/tiendas\/[^/]+$/,  roles: ['admin'] },
  { metodo: 'GET', ruta: /^\/productos$/, roles: null },
  { metodo: 'POST',   ruta: /^\/tiendas\/[^/]+\/productos$/, roles: ['dueno'] },
];

function problem(res, status, title, detail, instance, headers = {}) {
  res.set(headers).status(status).type('application/problem+json').json({
    type: 'about:blank', title, status, detail, instance,
  });
}

const rolesDe = (usuario) => usuario?.realm_access?.roles ?? [];

/**
 * @param {{
 *   apiUrl: string,       // a dónde se reenvía (http://backend:3000)
 *   jwks: Parameters<typeof jwtVerify>[1],   // claves públicas para verificar la firma
 *   issuer: string,       // "iss" esperado
 *   audience: string,     // "aud" esperado
 *   corsOrigin: string,
 * }} opciones
 */
export function crearGateway({ apiUrl, jwks, issuer, audience, corsOrigin }) {
  const app = express();
  app.use(express.json());

  // CORS: Swagger UI (localhost:8080) llama al gateway (localhost:8000) y manda el header Authorization
  app.use((req, res, next) => {
    res.set('Access-Control-Allow-Origin', corsOrigin);
    res.set('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.set('Access-Control-Expose-Headers', 'Location, WWW-Authenticate');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
  });

  // ---------- Autenticación: ¿quién sos? ----------
  async function autenticar(req) {
    const auth = req.get('Authorization') ?? '';
    const [esquema, token] = auth.split(' ');
    if (esquema !== 'Bearer' || !token) return { error: 'Falta el header "Authorization: Bearer <token>".' };
    try {
      // Verifica la FIRMA con la clave pública de Keycloak, el emisor, la audiencia y el vencimiento.
      const { payload } = await jwtVerify(token, jwks, { issuer, audience });
      return { usuario: payload };
    } catch (err) {
      return { error: `Token inválido: ${err.code ?? ''} ${err.message}`.trim() };
    }
  }

  // ---------- /yo: muestra qué dice tu token (para aprender; no lo copies a sitios externos) ----------
  app.get('/yo', async (req, res) => {
    const { usuario, error } = await autenticar(req);
    if (error) return problem(res, 401, 'No autenticado', error, req.originalUrl, { 'WWW-Authenticate': 'Bearer realm="incubadora-universitaria"' });
    res.json({
      usuario: usuario.preferred_username ?? `(cliente) ${usuario.azp}`,
      roles: rolesDe(usuario),
      emisor: usuario.iss,
      audiencia: usuario.aud,
      cliente: usuario.azp,
      venceEn: new Date(usuario.exp * 1000).toISOString(),
      tokenCompleto: usuario,
    });
  });

  // ---------- Todo lo demás: autenticar, autorizar y reenviar a la API ----------
  app.use(async (req, res) => {
    const regla = REGLAS.find((r) => r.metodo === req.method && r.ruta.test(req.path));
    if (!regla) return problem(res, 404, 'No encontrado', `No hay ruta ${req.method} ${req.path} en el gateway.`, req.originalUrl);

    // Headers que se reenvían al backend. Se arman desde cero: nada de lo que mande el cliente pasa directo,
    // así nadie puede inventarse un X-Usuario-Id desde afuera.
    const headers = { 'Content-Type': 'application/json' };

    if (regla.roles) {
      const { usuario, error } = await autenticar(req);
      // 401: no sé quién sos
      if (error) return problem(res, 401, 'No autenticado', error, req.originalUrl, { 'WWW-Authenticate': 'Bearer realm="incubadora-universitaria"' });
      // 403: sé quién sos, pero tu rol no alcanza
      const roles = rolesDe(usuario);
      if (!regla.roles.some((r) => roles.includes(r))) {
        return problem(res, 403, 'Sin permiso',
          `${usuario.preferred_username ?? usuario.azp} tiene los roles [${roles.join(', ')}] y esta operación requiere uno de [${regla.roles.join(', ')}].`,
          req.originalUrl);
      }
      // El backend decide las reglas de negocio (ej: ¿sos dueño de ESTA tienda?) con el id del token ya validado.
      headers['X-Usuario-Id'] = usuario.sub;
    }

    try {
      const resp = await fetch(apiUrl + req.originalUrl, {
        method: req.method,
        headers,
        body: ['POST', 'PUT', 'PATCH'].includes(req.method) ? JSON.stringify(req.body ?? {}) : undefined,
      });
      // Solo copiamos los headers que importan (el CORS lo maneja el gateway, no la API)
      for (const h of ['content-type', 'location']) if (resp.headers.get(h)) res.set(h, resp.headers.get(h));
      res.status(resp.status).send(Buffer.from(await resp.arrayBuffer()));
    } catch (err) {
      console.error(err.message);
      problem(res, 502, 'API no disponible', `El gateway no pudo comunicarse con ${apiUrl}.`, req.originalUrl);
    }
  });

  return app;
}
