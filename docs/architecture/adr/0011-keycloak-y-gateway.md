# ADR-11: Identidad con Keycloak y gateway como única entrada a la API

- **Estado:** Aceptada. Reemplaza a [ADR-3](0003-autenticacion-propia-con-sesion.md).
- **Fecha:** 2026-11-03 (revisada el 2026-11-18: se suma el cliente del front)

## Contexto

La Clase 11 presentó OIDC con Keycloak y un gateway delante de la API. El equipo lo adoptó en lugar de la autenticación propia del ADR-3. La seguridad general (NFR-4) es prioridad alta, y los becarios que rotan no deberían mantener hashing, vencimientos ni CSRF.

## Decisión

- **Keycloak** es el proveedor de identidad, con el realm `incubadora-universitaria` versionado en `infra/keycloak/` y los roles `admin`, `dueno` y `comprador`. Tiene dos clientes públicos con PKCE: `web-incubadora` (el front) y `swagger-ui`.
- **Un gateway propio** (`infra/gateway/`) es la única puerta a la API:
  - verifica la firma, el emisor, la audiencia (`api-incubadora`) y el vencimiento del access token;
  - aplica una tabla de reglas método + ruta → roles;
  - le pasa a la API el usuario (`sub`) en `X-Usuario-Id`, un header que arma desde cero para que el cliente no pueda inventarlo.
- La API no publica puertos.
- El front guarda el access token en `sessionStorage` y lo manda como `Authorization: Bearer`.

## Alternativas

- **Autenticación propia con sesión en el servidor** (ADR-3): una pieza menos, pero el hashing, la expiración, CSRF y la revocación quedan a cargo de becarios que rotan.
- **Validar el token dentro de la API:** ahorra un contenedor, pero mezcla seguridad con negocio.
- **Guardar el token solo en memoria** en el front: más resistente a XSS, pero se pierde con cada recarga de página.

## Consecuencias

- Login, contraseñas y vencimientos quedan en un producto libre (Apache 2.0) mantenido por terceros; un token adulterado falla la verificación de firma.
- **Negativas:**
  - Se suman dos contenedores y un concepto nuevo (OIDC) al onboarding.
  - El token vale hasta su vencimiento de 5 minutos, sin revocación inmediata, y el front no lo renueva: al vencer, hay que volver a iniciar sesión.
  - En `sessionStorage`, un XSS podría leer el token. Se acepta porque vence a los 5 minutos y React escapa el contenido que muestra.
  - Keycloak corre en modo desarrollo, sin HTTPS ni base persistente; en el servidor hace falta `start` con HTTPS y su propia base.
  - La API confía en `X-Usuario-Id` porque solo la alcanza el gateway por la red interna: si alguien publica el puerto del backend, cualquiera puede hacerse pasar por otro usuario.

## NFRs

Favorece NFR-4 y mantiene NFR-2 en costo cero. Perjudica NFR-1 y NFR-5 por las piezas extra. NFR-3 se cubre con la verificación de dueño en la API y sus tests.

## Confirmación

Los tests del gateway (`infra/gateway/tests/autorizacion.test.js`) firman tokens con una clave propia y verifican:

- 401 con un token de firma ajena, con emisor o audiencia equivocados, o vencido;
- 403 con un rol insuficiente;
- que un `X-Usuario-Id` inventado por el cliente se descarte.
