import express from 'express';
import { NoEncontrado, DatosInvalidos } from '../shared/kernel/errors/errores.js';

// Errores con Problem Details (RFC 9457)
function problem(res, status, title, detail, instance) {
  res.status(status).type('application/problem+json').json({
    type: 'about:blank', title, status, detail, instance,
  });
}

// Arma la aplicación Express con los routers que le pasa main/index.js.
export function crearApp({ routers, verificarBase }) {
  const app = express();
  app.use(express.json());

  // CORS: Swagger UI corre en otro origen (localhost:8080)
  app.use((req, res, next) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
  });

  app.get('/health', async (req, res) => {
    await verificarBase();
    res.json({ status: 'ok' });
  });

  for (const router of routers) app.use(router);

  // Traduce los errores de negocio a HTTP. Cualquier otro error sale como 500.
  app.use((err, req, res, next) => {
    if (err instanceof NoEncontrado) return problem(res, 404, err.titulo, err.message, req.originalUrl);
    if (err instanceof DatosInvalidos) return problem(res, 400, err.titulo, err.message, req.originalUrl);
    console.error(err);
    problem(res, 500, 'Error interno', 'Ocurrió un error inesperado.', req.originalUrl);
  });

  return app;
}
