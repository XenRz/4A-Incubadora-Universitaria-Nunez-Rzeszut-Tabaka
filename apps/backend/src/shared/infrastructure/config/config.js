// Toda la configuración llega por variables de entorno (las define infra/compose/docker-compose.yml).
export const config = {
  port: Number(process.env.PORT ?? 3000),
  db: {
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    database: process.env.DB_NAME ?? 'tiendas',
    user: process.env.DB_USER ?? 'tiendas',
    password: process.env.DB_PASSWORD ?? 'tiendas123',
  },
};
