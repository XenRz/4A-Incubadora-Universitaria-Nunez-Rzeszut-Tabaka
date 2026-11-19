# ADR-2: Monorepo con front y back

- **Estado:** Aceptada
- **Fecha:** 2026-11-03 (revisada el 2026-11-19: se quita el módulo `identidad` de la lista, ver ADR-1)

## Contexto

Primero se separaron front y back en dos repositorios. El equipo cambia cada año y la entrega se hace con un único tag.

## Decisión

Vamos a usar un único repositorio con el front, el back, la infraestructura y la documentación juntos. Los nombres de carpetas van en inglés (`apps/`, `infra/`, `docs/`) y los módulos de negocio en español (`tiendas`, `catalogo`, `pedidos`, `pagos`).

## Alternativas

- **Dos repositorios,** uno para el front y otro para el back: es la opción que se probó primero y se descartó.

## Consecuencias

- Un solo clon, un solo `docker compose up`, un solo tag `v1.0`; los cambios que tocan front y back van en el mismo commit.
- **Negativas:** se resigna versionar y desplegar front y back por separado (no hace falta a esta escala). Cada parte tiene su propio `package.json` y `node_modules`, así que hay que instalar dependencias en tres carpetas.

## NFRs

Favorece NFR-1 y NFR-5.

## Confirmación

Un solo clon del repositorio alcanza para levantar todo y correr todos los tests; el tag `v1.0` cubre código, infraestructura y documentación.
