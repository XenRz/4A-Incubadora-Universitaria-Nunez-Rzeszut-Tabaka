-- Módulo catalogo. Corre después de 001_tiendas.sql (ver infra/database/init/000_migraciones.sql).
-- La clave foránea a tiendas es una decisión consciente: un solo despliegue y una sola base,
-- así que se prioriza la integridad de los datos. En el código, catalogo solo usa la public-api de tiendas.
CREATE TABLE IF NOT EXISTS productos (
  id         SERIAL PRIMARY KEY,
  tienda_id  INTEGER NOT NULL REFERENCES tiendas(id),
  nombre     TEXT NOT NULL,
  precio     NUMERIC(10,2) NOT NULL CHECK (precio >= 0),
  stock      INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0)
);
