# Decisiones de arquitectura (ADRs)

Cada decisión que cambia la estructura del sistema queda en un archivo propio, con el formato de la cátedra: contexto, decisión, alternativas, consecuencias (incluidas las negativas), NFRs afectados y una línea de **confirmación** que dice cómo se comprueba en el repositorio.

Un ADR aceptado no se borra: si la decisión cambia, se escribe uno nuevo que lo reemplaza y el viejo pasa a "Reemplazada".

| ADR | Decisión | Estado | Confirmación |
|---|---|---|---|
| [ADR-1](0001-monolito-modular.md) | Monolito modular | Aceptada | Test de arquitectura |
| [ADR-2](0002-base-relacional-aislamiento-por-tienda.md) | Una base relacional con aislamiento por tienda | Aceptada | Tests de acceso cruzado (HTTP y PostgreSQL) |
| [ADR-3](0003-autenticacion-propia-con-sesion.md) | Autenticación propia con sesión en el servidor | Reemplazada por ADR-11 | — |
| [ADR-4](0004-pasarela-de-pagos-detras-de-un-puerto.md) | Pasarela de pagos detrás de un puerto, con mock | Aceptada; puerto, adaptador y mock implementados, sin caso de uso | Cobro aprobado y rechazado contra el mock (`pasarela-mock`) |
| [ADR-5](0005-estadisticas-sobre-la-misma-base.md) | Estadísticas con consultas sobre la misma base | Aceptada, sin código | Prevista: test de autorización solo admin |
| [ADR-6](0006-documentacion-viva-en-el-repositorio.md) | Documentación viva en el repositorio | Aceptada | Revisión del C4 contra el compose antes de cada tag |
| [ADR-7](0007-stack-tecnologico.md) | Stack: Node.js 22, Express 5, pg, PostgreSQL 16, React 19 | Aceptada | `package.json` y Dockerfiles |
| [ADR-8](0008-front-spa-estatica.md) | Front propio como SPA estática; el gateway es la única entrada a la API | Aceptada | `docker compose ps` |
| [ADR-9](0009-monorepo.md) | Monorepo con front y back | Aceptada | Un clon levanta todo y corre todos los tests |
| [ADR-10](0010-docker-compose-en-un-servidor.md) | Despliegue con Docker Compose en un solo servidor | Aceptada | `docker compose up` en una máquina limpia |
| [ADR-11](0011-keycloak-y-gateway.md) | Identidad con Keycloak y gateway como única entrada | Aceptada | Tests 401/403 del gateway |

## Plantilla para un ADR nuevo

```markdown
# ADR-N: <decisión en pocas palabras>

- **Estado:** Propuesta | Aceptada | Reemplazada por ADR-M
- **Fecha:** AAAA-MM-DD

## Contexto
Qué fuerza la decisión: el NFR o la restricción que pesa.

## Decisión
"Vamos a ..."

## Alternativas
Las opciones reales que se descartaron, y por qué.

## Consecuencias
Lo que se gana y, sobre todo, lo que se resigna.

## NFRs
Cuáles favorece y cuáles perjudica.

## Confirmación
Cómo se comprueba en el repositorio: un test, un comando o una revisión.
```
