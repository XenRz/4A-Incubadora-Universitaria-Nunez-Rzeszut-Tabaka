# ADR-3: Autenticación propia con sesión en el servidor

- **Estado:** Reemplazada por [ADR-11](0011-keycloak-y-gateway.md). Se conserva como registro de la decisión original.
- **Fecha:** 2026-11-03

## Contexto

Tres roles, sin presupuesto, en un servidor propio. La cátedra presentó proveedores de identidad con OIDC como opción.

## Decisión

Autenticar con usuario y contraseña propios (hash adaptativo bcrypt o argon2) y mantener la sesión en el servidor, con una cookie `HttpOnly`, `Secure` y `SameSite`, y expiración por inactividad.

## Alternativas

- **Proveedor de identidad externo con OIDC:** más seguro de base, pero suma una pieza más para operar y entender.
- **JWT sin estado:** complica la revocación de sesiones y no aporta nada con un solo servidor.

## Consecuencias

- Sin costo ni dependencia externa; el flujo completo se lee en un solo módulo.
- **Negativas:** se resignan SSO y MFA; el hashing, la expiración y la protección CSRF quedan a cargo de becarios que rotan.

## NFRs

Favorecía NFR-1 y NFR-2. Exigía cuidado extra para cumplir NFR-4.

## Por qué se reemplazó

En la Clase 11 el equipo adoptó Keycloak con un gateway delante de la API. Delegar contraseñas, vencimientos y firma de tokens en un producto mantenido por terceros pesó más que tener una pieza menos (ver ADR-11).
