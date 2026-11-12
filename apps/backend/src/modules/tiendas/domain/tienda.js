// Una tienda de la plataforma: tiene un nombre y, como mucho, un dueño asignado.
export function crearTienda({ id, nombre, duenoId = null }) {
  return { id, nombre, duenoId };
}

// Invariante: solo el dueño asignado puede administrar la tienda (ej: crear productos).
export function esDueno(tienda, usuarioId) {
  return Boolean(usuarioId) && tienda.duenoId === usuarioId;
}
