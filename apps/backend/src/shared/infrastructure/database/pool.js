import pg from 'pg';

// Un único pool de conexiones a Postgres para todo el monolito.
// Lo crea main/ y se lo pasa a los repositorios de cada módulo.
export function crearPool(dbConfig) {
  return new pg.Pool(dbConfig);
}
