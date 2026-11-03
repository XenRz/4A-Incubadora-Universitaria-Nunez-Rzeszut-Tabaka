-- Corre automáticamente solo la PRIMERA vez que se crea el volumen pgdata.
CREATE TABLE IF NOT EXISTS tiendas (
  id          SERIAL PRIMARY KEY,
  nombre      TEXT        NOT NULL

);

INSERT INTO tiendas (nombre) VALUES
  ("Tienda de mates Unahur"),
  ("Reposteria");

CREATE TABLE IF NOT EXISTS productos (
  id      SERIAL PRIMARY KEY,
  tienda_id INTEGER NOT NULL REFERENCES tiendas(id),
  nombre  TEXT NOT NULL,
  precio  NUMERIC(10,2) NOT NULL CHECK (precio >= 0),
  stock   INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0)

);

INSERT INTO productos (tienda_id, nombre, precio, stock) VALUES
  -- Tienda de mates Unahur (id 1)
  (1, 'Mate de calabaza',            8500.00,  25),
  (1, 'Mate de acero inoxidable',   12000.00,  15),
  (1, 'Bombilla de alpaca',          5500.00,  40),
  (1, 'Yerba mate 1 kg',             6200.00,  60),
  (1, 'Termo 1 litro',              35000.00,  10),
  (1, 'Set matero completo',        48000.00,   6),

  -- Repostería (id 2)
  (2, 'Torta de chocolate',         18000.00,   5),
  (2, 'Cheesecake de frutos rojos', 21000.00,   4),
  (2, 'Docena de medialunas',        7500.00,  20),
  (2, 'Alfajores de maicena x6',     6800.00,  30),
  (2, 'Lemon pie',                  16500.00,   6),
  (2, 'Brownie con nueces',          3200.00,  35);


