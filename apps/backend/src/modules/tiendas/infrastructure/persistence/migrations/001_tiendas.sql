-- Módulo tiendas. Corre solo la PRIMERA vez que se crea el volumen pgdata (ver infra/database/init/000_migraciones.sql).
CREATE TABLE IF NOT EXISTS tiendas (
  id      SERIAL PRIMARY KEY,
  nombre  TEXT NOT NULL
);
