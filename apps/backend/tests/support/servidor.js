// Levanta una app Express en un puerto libre y devuelve un fetch que apunta a ella.
export async function levantar(app) {
  const servidor = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });
  const base = `http://127.0.0.1:${servidor.address().port}`;
  return {
    pedir: (ruta, opciones = {}) => fetch(base + ruta, opciones),
    cerrar: () => new Promise((resolve) => servidor.close(resolve)),
  };
}
