import { DatosInvalidos } from '../../../shared/kernel/errors/errores.js';

// Reglas de un producto nuevo: siempre pertenece a una tienda,
// tiene nombre, precio mayor a 0 y stock mayor o igual a 0.
export function nuevoProducto({ tiendaId, nombre, precio, stock }) {
  const valido = Number.isInteger(tiendaId)
    && typeof nombre === 'string' && nombre.trim() !== ''
    && typeof precio === 'number' && precio > 0
    && Number.isInteger(stock) && stock >= 0;
  if (!valido) {
    throw new DatosInvalidos('Datos inválidos',
      'Se requiere "tiendaId" (entero), "nombre" (texto), "precio" (número mayor a 0) y "stock" (entero mayor o igual a 0).');
  }
  return { tiendaId, nombre: nombre.trim(), precio, stock };
}
