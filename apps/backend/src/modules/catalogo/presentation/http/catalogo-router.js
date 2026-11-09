import { Router } from 'express';
import { DatosInvalidos } from '../../../../shared/kernel/errors/errores.js';

function leerId(valor) {
  const id = Number(valor);
  if (!Number.isInteger(id)) throw new DatosInvalidos('Id inválido', 'El id debe ser un número entero.');
  return id;
}

export function crearCatalogoRouter({ listarProductosDeTienda, crearProducto }) {
  const router = Router();

  // La URL empieza con /tiendas, pero devuelve productos: por eso vive en catalogo.
  router.get('/tiendas/:id/productos', async (req, res) => {
    res.json(await listarProductosDeTienda(leerId(req.params.id)));
  });

  router.post('/productos', async (req, res) => {
    const producto = await crearProducto(req.body ?? {});
    res.status(201).location(`/productos/${producto.id}`).json(producto);
  });

  return router;
}
