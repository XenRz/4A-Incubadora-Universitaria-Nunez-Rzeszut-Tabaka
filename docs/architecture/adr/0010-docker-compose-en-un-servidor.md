# ADR-10: Despliegue con Docker Compose en un solo servidor

- **Estado:** Aceptada
- **Fecha:** 2026-11-03 (revisada el 2026-11-18: se suma `web`)

## Contexto

Un solo servidor de la universidad, sin servicios de nube y con becarios que tienen que desplegar sin ayuda.

## Decisión

Vamos a definir los servicios en Compose y levantarlos con un solo comando, igual en local que en el servidor. Es un solo archivo, `infra/compose/docker-compose.yml`, con `db`, `backend`, `keycloak`, `gateway`, `web` y `swagger-ui`. El servicio `backend-tests` solo existe con el perfil `test`.

## Alternativas

- **Instalación manual en el servidor:** difícil de reproducir y de documentar.
- **Kubernetes o servicios de nube:** costo y complejidad injustificados para 30 tiendas.

## Consecuencias

- El entorno local es idéntico al de producción y el onboarding empieza con un comando.
- **Negativas:** se resignan alta disponibilidad y escalado automático; el servidor es un único punto de falla. Hoy algunas contraseñas de desarrollo están escritas en el compose y hay que pasarlas a `.env`.

## NFRs

Favorece NFR-1, NFR-2 y NFR-5. Perjudica NFR-7, que tiene prioridad baja.

## Confirmación

`docker compose -f infra/compose/docker-compose.yml up -d --build` levanta los seis servicios en una máquina limpia; es el primer paso de la prueba de onboarding (NFR-1).
