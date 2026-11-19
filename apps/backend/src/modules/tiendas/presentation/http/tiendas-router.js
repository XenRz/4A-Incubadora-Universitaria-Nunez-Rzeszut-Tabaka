import { Router } from 'express';
import { DatosInvalidos } from '../../../../shared/kernel/errors/errores.js';

function leerId(valor) {
  const id = Number(valor);
  if (!Number.isInteger(id)) throw new DatosInvalidos('Id inválido', 'El id debe ser un número entero.');
  return id;
}

// Lo que se muestra de una tienda según el contrato (el dueño no se expone).
const aRespuesta = (tienda) => ({ id: tienda.id, nombre: tienda.nombre });

export function crearTiendasRouter({ listarTiendas, obtenerTienda }) {
  const router = Router();

  router.get('/tiendas', async (req, res) => {
    res.json((await listarTiendas()).map(aRespuesta));
  });

  router.get('/tiendas/:id', async (req, res) => {
    res.json(aRespuesta(await obtenerTienda(leerId(req.params.id))));
  });

  return router;
}
