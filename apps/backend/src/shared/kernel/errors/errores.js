// Errores de negocio compartidos por todos los módulos.
// No saben nada de HTTP: main/http.js los traduce a Problem Details (404, 400).

export class NoEncontrado extends Error {
  constructor(titulo, detalle) {
    super(detalle);
    this.titulo = titulo;
  }
}

export class DatosInvalidos extends Error {
  constructor(titulo, detalle) {
    super(detalle);
    this.titulo = titulo;
  }
}
