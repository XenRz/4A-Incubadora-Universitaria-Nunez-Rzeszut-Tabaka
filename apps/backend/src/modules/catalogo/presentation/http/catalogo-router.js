import { Router } from 'express';
import { DatosInvalidos } from '../../../../shared/kernel/errors/errores.js';

function leerId(valor) {
  const id = Number(valor);
  if (!Number.isInteger(id)) throw new DatosInvalidos('Id inválido', 'El id debe ser un número entero.');
  return id;
}

export function crearCatalogoRouter({ listarProductosDeTienda, crearProducto }) {
  const router = Router();

  // Las URLs empiezan con /tiendas, pero trabajan con productos: por eso viven en catalogo.
  // La tienda siempre viaja en la URL.
  router.get('/tiendas/:id/productos', async (req, res) => {
    res.json(await listarProductosDeTienda(leerId(req.params.id)));
  });

  router.post('/tiendas/:id/productos', async (req, res) => {
    // X-Usuario-Id lo pone el gateway con el id del token ya validado (el backend no es accesible desde afuera).
    const usuarioId = req.get('X-Usuario-Id') ?? null;
    const producto = await crearProducto(leerId(req.params.id), usuarioId, req.body ?? {});
    res.status(201).location(`/tiendas/${producto.tiendaId}/productos/${producto.id}`).json(producto);
  });

  return router;
}
