# ADR-1: Monolito modular

- **Estado:** Aceptada
- **Fecha:** 2026-11-03

## Contexto

30 tiendas con tráfico bajo, un solo servidor y 2 becarios que rotan cada año. El sistema tiene que entenderse en una semana (NFR-1, estrella) y operar a costo cero (NFR-2, estrella).

## Decisión

Vamos a construir una sola aplicación desplegable (`apps/backend`), dividida en módulos internos por contexto de negocio: `identidad`, `tiendas`, `catalogo`, `pedidos` y `pagos` (las estadísticas del administrador se suman como módulo de solo lectura, ADR-5).

Cada módulo tiene las mismas capas (`domain`, `application`, `infrastructure`, `presentation`, `public-api`) y solo se comunica con otro a través de su `public-api`. `src/main/` es el único lugar que conoce todas las piezas.

## Alternativas

- **Monolito en capas** (datum de la matriz de Pugh): más simple, pero mezcla negocios distintos en las mismas capas.
- **Microservicios** y **event-driven**: −3 en la matriz de Pugh. Más infraestructura, más operación y más curva de aprendizaje; solo ganan en escalabilidad, que es prioridad baja (NFR-8).

## Consecuencias

- Una unidad que entender, desplegar y pagar; cada módulo se lee de forma aislada.
- **Negativas:** se resigna escalar módulos por separado. Los límites entre módulos no los impone el runtime: hay que cuidar que un módulo no lea las tablas ni importe las capas internas de otro.

## NFRs

Favorece NFR-1, NFR-2 y NFR-5. Perjudica NFR-8, que tiene prioridad baja.

## Confirmación

El test de arquitectura `apps/backend/tests/architecture/dependencias.test.js` falla si un módulo importa capas internas de otro sin pasar por su `public-api`, o si se rompen las dependencias entre capas. Corre con `npm test` en `apps/backend`.
