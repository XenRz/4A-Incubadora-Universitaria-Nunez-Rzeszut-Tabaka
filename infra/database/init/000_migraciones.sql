-- Corre las migraciones de cada módulo, en orden. Postgres ejecuta esta carpeta solo la
-- PRIMERA vez que se crea el volumen pgdata, en orden alfabético: este archivo y después datos-ejemplo.sql.
-- Las carpetas /migraciones/<modulo> las monta infra/compose/docker-compose.yml.
-- Al agregar una migración en un módulo, sumala acá.
\i /migraciones/tiendas/001_tiendas.sql
\i /migraciones/catalogo/002_productos.sql
