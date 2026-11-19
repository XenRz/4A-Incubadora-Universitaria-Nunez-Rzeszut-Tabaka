# Diagramas C4

Exportados del documento de arquitectura el 18/11/2026. Antes de cada tag se revisa que el diagrama de contenedores coincida con `infra/compose/docker-compose.yml` (ADR-6).

## Nivel 1 · Contexto

Tres roles (administrador, dueño de tienda y comprador) y un único sistema externo: la pasarela de pagos, simulada.

![C4 nivel 1: contexto](c4-nivel-1-contexto.png)

## Nivel 2 · Contenedores

Siete contenedores en un servidor: `web`, `gateway`, `keycloak`, `swagger-ui`, `backend`, `db` y `pasarela-mock` (WireMock que simula la pasarela; está levantado pero todavía ningún caso de uso lo llama). Solo el gateway abre la API; `backend`, `db` y `pasarela-mock` no publican puertos.

![C4 nivel 2: contenedores](c4-nivel-2-contenedores.png)
