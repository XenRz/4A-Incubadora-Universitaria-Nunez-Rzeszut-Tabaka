# Módulo `identidad`

**Estado:** sin código propio todavía. Hoy el login lo resuelve Keycloak y el gateway valida el token y le pasa a la API el usuario en `X-Usuario-Id` (ADR-11). El vínculo dueño → tienda vive en `tiendas.dueno_id`.

**Responsabilidad:** obtener la identidad del usuario a partir del token OIDC emitido por Keycloak (el login lo hace Keycloak, no este módulo), vincularla con el usuario interno y mapear los roles (administrador, dueño de tienda, comprador).

**Expone en `public-api/`:** consultar el usuario actual y sus roles.

**Regla de dependencia:** `presentation` e `infrastructure` → `application` → `domain`. `domain` no importa nada externo.
Otros módulos solo pueden importar desde `public-api/`; nunca desde sus capas internas.
