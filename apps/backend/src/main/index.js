// Composition root: el ÚNICO lugar que conoce todas las piezas.
// Crea los adaptadores (Postgres), se los pasa a los casos de uso y monta los routers.
// Leyendo este archivo se entiende cómo está armado el backend.
import { config } from '../shared/infrastructure/config/config.js';
import { crearPool } from '../shared/infrastructure/database/pool.js';
import { crearApp } from './http.js';

// Módulo tiendas
import { crearTiendaRepositoryPg } from '../modules/tiendas/infrastructure/persistence/tienda-repository-pg.js';
import { listarTiendas } from '../modules/tiendas/application/use-cases/listar-tiendas.js';
import { obtenerTienda } from '../modules/tiendas/application/use-cases/obtener-tienda.js';
import { crearTiendasRouter } from '../modules/tiendas/presentation/http/tiendas-router.js';
import { crearTiendasPublicApi } from '../modules/tiendas/public-api/index.js';

// Módulo catalogo
import { crearProductoRepositoryPg } from '../modules/catalogo/infrastructure/persistence/producto-repository-pg.js';
import { listarProductosDeTienda } from '../modules/catalogo/application/use-cases/listar-productos-de-tienda.js';
import { crearProducto } from '../modules/catalogo/application/use-cases/crear-producto.js';
import { crearCatalogoRouter } from '../modules/catalogo/presentation/http/catalogo-router.js';

const pool = crearPool(config.db);

// --- tiendas ---
const tiendaRepository = crearTiendaRepositoryPg(pool);
const tiendasRouter = crearTiendasRouter({
  listarTiendas: listarTiendas({ tiendaRepository }),
  obtenerTienda: obtenerTienda({ tiendaRepository }),
});
const tiendasApi = crearTiendasPublicApi({ tiendaRepository });

// --- catalogo: usa a tiendas SOLO a través de su public-api ---
const productoRepository = crearProductoRepositoryPg(pool);
const catalogoRouter = crearCatalogoRouter({
  listarProductosDeTienda: listarProductosDeTienda({ productoRepository, consultaTiendas: tiendasApi }),
  crearProducto: crearProducto({ productoRepository, consultaTiendas: tiendasApi }),
});

const app = crearApp({
  routers: [tiendasRouter, catalogoRouter],
  verificarBase: () => pool.query('SELECT 1'),
});

app.listen(config.port, () => console.log(`Backend escuchando en el puerto ${config.port} (DB en ${config.db.host})`));
