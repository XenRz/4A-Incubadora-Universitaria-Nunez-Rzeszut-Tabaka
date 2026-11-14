// Punto de arranque: crea los adaptadores reales (Postgres), arma el backend y abre el puerto.
// Cómo se conectan los módulos entre sí está en main/app.js.
import { config } from '../shared/infrastructure/config/config.js';
import { crearPool } from '../shared/infrastructure/database/pool.js';
import { crearTiendaRepositoryPg } from '../modules/tiendas/infrastructure/persistence/tienda-repository-pg.js';
import { crearProductoRepositoryPg } from '../modules/catalogo/infrastructure/persistence/producto-repository-pg.js';
import { crearBackend } from './app.js';

const pool = crearPool(config.db);

const app = crearBackend({
  tiendaRepository: crearTiendaRepositoryPg(pool),
  productoRepository: crearProductoRepositoryPg(pool),
  verificarBase: () => pool.query('SELECT 1'),
});

app.listen(config.port, () => console.log(`Backend escuchando en el puerto ${config.port} (DB en ${config.db.host})`));
