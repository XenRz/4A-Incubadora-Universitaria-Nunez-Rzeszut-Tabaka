# ADR-9: Front propio como SPA estática; el gateway es la única entrada a la API

- **Estado:** Aceptada
- **Fecha:** 2026-11-03 (revisada el 2026-11-18) (revisada el 2026-11-19: nginx ya tiene fallback a `index.html` y la API pasa a `/v1`)
- **Cambio:** la primera versión ("front propio en lugar de proxy inverso") ponía al contenedor `web` como única puerta de entrada y proxy de la API. Al implementarlo, el gateway (ADR-5) ya cumplía ese rol, y `web` quedó como un servidor de archivos estáticos.

## Contexto

Hay que servir la interfaz de los tres roles y exponer la API de forma segura. El gateway ya es la única entrada a la API, y `backend` y `db` no publican puertos.

## Decisión

Vamos a tener un contenedor `web` propio (nginx) que solo sirve el build estático de React, con vistas por rol en un solo front. El navegador habla directo con Keycloak para el login (Authorization Code + PKCE, cliente público `web-incubadora`) y con el gateway para la API, publicada bajo `/v1` (`http://localhost:8000/v1`). nginx tiene fallback a `index.html`, así una recarga en una ruta del front (por ejemplo `/mi-tienda`) no da 404. El gateway acepta por CORS solo los orígenes de `CORS_ORIGIN` (hoy `web` y Swagger UI).

## Alternativas

- **Que el nginx de `web` haga de proxy inverso** hacia el gateway y Keycloak: un solo origen, sin CORS y un solo puerto publicado, pero una configuración de nginx más que entender y mantener.
- **Servir la interfaz desde la API o desde el gateway:** un contenedor menos, pero mezcla la interfaz con el negocio o con la seguridad, y el gateway deja de ser solo un filtro.
- **Dos fronts separados** (cliente-vendedor y administrador), como el borrador en draw.io: el doble de piezas que construir y desplegar.

## Consecuencias

- `web` no tiene lógica ni secretos: es nginx con archivos estáticos. Cada contenedor hace una sola cosa.
- **Negativas:**
  - Hacia el usuario quedan tres puertos (3000 `web`, 8000 `gateway`, 8180 `keycloak`), más 8080 de Swagger UI, en lugar de uno.
  - Hay que mantener alineados `CORS_ORIGIN` en el gateway y el redirect URI del cliente `web-incubadora` en el realm.
  - Las URLs de Keycloak y del gateway están escritas en el código del front; para desplegar en el servidor hay que pasarlas a variables de build (`VITE_*`).
## NFRs

Favorece NFR-1 (cada contenedor hace una sola cosa) y NFR-4 (la API sigue sin puerto publicado). Perjudica un poco NFR-5, por los orígenes y las URLs que hay que configurar.

## Confirmación

`docker compose -f infra/compose/docker-compose.yml ps` muestra que `backend` y `db` no publican puertos, y que `web` solo publica el 3000. El gateway rechaza con 404 cualquier ruta que no esté en su tabla de reglas.
