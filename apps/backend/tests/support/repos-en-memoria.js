// Adaptadores en memoria que cumplen los MISMOS puertos que los de Postgres.
// Sirven para probar dominio, casos de uso y HTTP sin levantar una base.
import { crearTienda } from '../../src/modules/tiendas/domain/tienda.js';

// Usuarios de prueba (mismos ids que infra/keycloak/realm-incubadora.json)
export const ANA = '11111111-1111-1111-1111-111111111111';   // dueña de la tienda 1
export const BETO = '22222222-2222-2222-2222-222222222222';  // comprador
export const CARLA = '33333333-3333-3333-3333-333333333333'; // dueña de la tienda 2

export function crearTiendaRepositoryEnMemoria(tiendas = [
  { id: 1, nombre: 'Tienda A', duenoId: ANA },
  { id: 2, nombre: 'Tienda B', duenoId: CARLA },
]) {
  const datos = tiendas.map(crearTienda);
  return {
    async listar() { return [...datos]; },
    async buscarPorId(id) { return datos.find((t) => t.id === id) ?? null; },
  };
}

export function crearProductoRepositoryEnMemoria(productos = []) {
  const datos = productos.map((p) => ({ ...p }));
  let proximoId = Math.max(0, ...datos.map((p) => p.id)) + 1;

  return {
    datos,   // expuesto solo para que los tests puedan inspeccionar el estado

    async listarPorTienda(tiendaId) {
      return datos.filter((p) => p.tiendaId === tiendaId).map((p) => ({ ...p }));
    },

    async guardar(producto) {
      const nuevo = { id: proximoId++, ...producto };
      datos.push(nuevo);
      return nuevo.id;
    },
  };
}

// N productos de relleno para una tienda.
export function productosDeRelleno(tiendaId, cantidad, desdeId = 1) {
  return Array.from({ length: cantidad }, (_, i) => ({
    id: desdeId + i, tiendaId, nombre: `Producto ${i + 1}`, precio: 100, stock: 1,
  }));
}
