import express from 'express';
import { NoEncontrado, DatosInvalidos, SinPermiso, PasarelaNoDisponible } from '../shared/kernel/errors/errores.js';

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

  // Sin CORS a propósito: al backend solo lo llama el gateway, de servidor a servidor.
  // El CORS para el navegador (front y Swagger UI) lo resuelve el gateway.

  app.get('/health', async (req, res) => {
    await verificarBase();
    res.json({ status: 'ok' });
  });

  for (const router of routers) app.use(router);

  // Traduce los errores de negocio a HTTP. Cualquier otro error sale como 500.
  app.use((err, req, res, next) => {
    if (err instanceof NoEncontrado) return problem(res, 404, err.titulo, err.message, req.originalUrl);
    if (err instanceof DatosInvalidos) return problem(res, 400, err.titulo, err.message, req.originalUrl);
    if (err instanceof SinPermiso) return problem(res, 403, err.titulo, err.message, req.originalUrl);
    if (err instanceof PasarelaNoDisponible) return problem(res, 502, err.titulo, err.message, req.originalUrl);
    // JSON mal formado en el cuerpo: es culpa del cliente (400), no un error interno.
    if (err.type === 'entity.parse.failed') return problem(res, 400, 'JSON inválido', 'El cuerpo del pedido no es JSON válido.', req.originalUrl);
    console.error(err);
    problem(res, 500, 'Error interno', 'Ocurrió un error inesperado.', req.originalUrl);
  });

  return app;
}
