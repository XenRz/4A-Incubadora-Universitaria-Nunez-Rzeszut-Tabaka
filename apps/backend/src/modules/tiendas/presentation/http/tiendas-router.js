import { Router } from 'express';
import { DatosInvalidos } from '../../../../shared/kernel/errors/errores.js';

function leerId(valor) {
  const id = Number(valor);
  if (!Number.isInteger(id)) throw new DatosInvalidos('Id inválido', 'El id debe ser un número entero.');
  return id;
}

export function crearTiendasRouter({ listarTiendas, obtenerTienda }) {
  const router = Router();

  router.get('/tiendas', async (req, res) => {
    res.json(await listarTiendas());
  });

  router.get('/tiendas/:id', async (req, res) => {
    res.json(await obtenerTienda(leerId(req.params.id)));
  });

  return router;
}
