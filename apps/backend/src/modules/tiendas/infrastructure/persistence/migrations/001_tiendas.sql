-- Módulo tiendas. Corre solo la PRIMERA vez que se crea el volumen pgdata (ver infra/database/init/000_migraciones.sql).
CREATE TABLE IF NOT EXISTS tiendas (
  id        SERIAL PRIMARY KEY,
  nombre    TEXT NOT NULL,
  dueno_id  TEXT          -- id ("sub") del dueño en Keycloak; NULL si todavía no tiene dueño asignado
);
