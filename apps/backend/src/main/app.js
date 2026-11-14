// Composition root: el ÚNICO lugar que conoce todas las piezas.
// Recibe los adaptadores ya creados (Postgres en producción, en memoria en los tests),
// se los pasa a los casos de uso y monta los routers. No abre conexiones ni puertos.
import { crearApp } from './http.js';

// Módulo tiendas
import { listarTiendas } from '../modules/tiendas/application/use-cases/listar-tiendas.js';
import { obtenerTienda } from '../modules/tiendas/application/use-cases/obtener-tienda.js';
import { crearTiendasRouter } from '../modules/tiendas/presentation/http/tiendas-router.js';
import { crearTiendasPublicApi } from '../modules/tiendas/public-api/index.js';

// Módulo catalogo
import { listarProductosDeTienda } from '../modules/catalogo/application/use-cases/listar-productos-de-tienda.js';
import { crearProducto } from '../modules/catalogo/application/use-cases/crear-producto.js';
import { crearCatalogoRouter } from '../modules/catalogo/presentation/http/catalogo-router.js';

/**
 * @param {{
 *   tiendaRepository: import('../modules/tiendas/application/ports/tienda-repository.js').TiendaRepository,
 *   productoRepository: import('../modules/catalogo/application/ports/producto-repository.js').ProductoRepository,
 *   verificarBase: () => Promise<unknown>,
 * }} adaptadores
 */
export function crearBackend({ tiendaRepository, productoRepository, verificarBase }) {
  // --- tiendas ---
  const tiendasRouter = crearTiendasRouter({
    listarTiendas: listarTiendas({ tiendaRepository }),
    obtenerTienda: obtenerTienda({ tiendaRepository }),
  });
  const tiendasApi = crearTiendasPublicApi({ tiendaRepository });

  // --- catalogo: usa a tiendas SOLO a través de su public-api ---
  const catalogoRouter = crearCatalogoRouter({
    listarProductosDeTienda: listarProductosDeTienda({ productoRepository, consultaTiendas: tiendasApi }),
    crearProducto: crearProducto({ productoRepository, consultaTiendas: tiendasApi }),
  });

  return crearApp({ routers: [tiendasRouter, catalogoRouter], verificarBase });
}
