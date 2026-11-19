# ADR-3: Despliegue con Docker Compose en un solo servidor

- **Estado:** Aceptada
- **Fecha:** 2026-11-03 (revisada el 2026-11-18: se suma `web`) (revisada el 2026-11-19: se suma `pasarela-mock`)

## Contexto

Un solo servidor de la universidad, sin servicios de nube y con becarios que tienen que desplegar sin ayuda.

## Decisión

Vamos a definir los servicios en Compose y levantarlos con un solo comando, igual en local que en el servidor. Es un solo archivo, `infra/compose/docker-compose.yml`, con 7 servicios: `db`, `backend`, `keycloak`, `gateway`, `web`, `swagger-ui` y `pasarela-mock`. El servicio `backend-tests` solo existe con el perfil `test`.

Las contraseñas de desarrollo están escritas en el compose, para que alcance con clonar y levantar, sin pasos previos.

## Alternativas

- **Instalación manual en el servidor:** difícil de reproducir y de documentar.
- **Kubernetes o servicios de nube:** costo y complejidad injustificados para 30 tiendas.

## Consecuencias

- El entorno local es idéntico al de producción y el onboarding empieza con un comando.
- **Negativas:** se resignan alta disponibilidad y escalado automático; el servidor es un único punto de falla. Las contraseñas de desarrollo están escritas en el compose; para el servidor real hay que pasarlas a un `.env` fuera del repo.

## NFRs

Favorece NFR-1, NFR-2 y NFR-5. Perjudica NFR-7, que tiene prioridad baja.

## Confirmación

`docker compose -f infra/compose/docker-compose.yml up -d --build` levanta los siete servicios en una máquina limpia.
