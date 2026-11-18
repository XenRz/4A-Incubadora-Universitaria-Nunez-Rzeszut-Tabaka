# ADR-6: Documentación viva en el repositorio

- **Estado:** Aceptada
- **Fecha:** 2026-11-03

## Contexto

El conocimiento se pierde cada vez que egresan los becarios (restricción del escenario 4A).

## Decisión

Vamos a guardar el C4, los ADRs y el contrato OpenAPI en `docs/architecture/`, dentro del mismo repositorio que el código, y a actualizarlos en el mismo commit que cambia la arquitectura.

## Alternativas

- **Wiki o documentos aparte:** más cómodos de editar, pero se desactualizan porque no cambian junto con el código.

## Consecuencias

- Un solo lugar donde buscar, versionado con el código.
- **Negativas:** requiere la disciplina de tocar `docs/` en cada cambio relevante; nada lo fuerza automáticamente.

## NFRs

Favorece NFR-1 y NFR-5.

## Confirmación

Antes de cada tag se revisa que los servicios del C4 de contenedores coincidan con `infra/compose/docker-compose.yml`. Swagger UI publica directamente `docs/architecture/openapi/openapi.yaml`, así que lo que se prueba es el contrato versionado.
