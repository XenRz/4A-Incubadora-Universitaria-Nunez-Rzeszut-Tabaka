# 4A-Incubadora-Universitaria-Nunez-Rzeszut-Tabaka
Trabajo practico - Arquitectura de Software I

## Arquitectura

Monolito modular: un solo despliegue y una base Postgres con aislamiento por tienda.
Autenticación con Keycloak (OIDC) detrás de un gateway; no hay sesión propia.

```
docs/architecture/{adr,c4,openapi}        decisiones, diagramas C4 y contratos HTTP
infra/{compose,gateway,keycloak,database/init}
apps/backend/
  src/main/                               composition root (conecta puertos con adaptadores)
  src/modules/{identidad,tiendas,catalogo,pedidos,pagos}/
    domain/                               reglas puras, sin imports externos
    application/{use-cases,ports}/
    infrastructure/{persistence/migrations,external}/
    presentation/http/
    public-api/                           lo único que otros módulos pueden importar
  src/shared/kernel/{tenancy,errors}/     contexto de tienda y errores base
  src/shared/infrastructure/{database,config,logging}/
  tests/{architecture,integration,unit}/
apps/frontend/src/
  app/
  features/{autenticacion,vitrina,admin-tienda,admin-plataforma}/
  shared/{api-client,components,utils}/
```

### Reglas

1. **Dependencias hacia adentro:** `presentation` / `infrastructure` → `application` → `domain`. `domain` no importa nada externo (solo `shared/kernel`).
2. **Comunicación solo por `public-api`:** un módulo nunca importa capas internas de otro. La excepción es `src/main/`, el composition root: es el único que conoce todas las piezas y las conecta.
3. **Aislamiento por tienda:** toda operación de negocio lleva el contexto de tienda (`shared/kernel/tenancy`); ninguna tienda ve datos de otra.

## Cómo levantarlo

Desde la raíz del repo:

```bash
docker compose -f infra/compose/docker-compose.yml up -d --build
```

| URL | Qué es |
|---|---|
| http://localhost:8000 | Gateway: la única entrada a la API |
| http://localhost:8080 | Swagger UI (contrato en `docs/architecture/openapi/openapi.yaml`) |
| http://localhost:8180 | Keycloak (consola de administración: admin / admin) |

### Usuarios de prueba

Los importa Keycloak desde `infra/keycloak/realm-incubadora.json` (las contraseñas están en ese archivo; son de desarrollo). Las tiendas y sus productos de ejemplo los carga `infra/database/init/datos-ejemplo.sql`.

| Usuario | Rol | Tienda | Para probar |
|---|---|---|---|
| ana | dueno | Tienda de mates Unahur (id 1) | Carga de producto en su tienda |
| carla | dueno | Repostería (id 2) | Que no puede cargar productos en la tienda de ana |
| beto | comprador | — | Catálogo de cualquier tienda; 403 si intenta crear un producto |

Falta un usuario con rol `admin`.

## Tests

```bash
# Backend: unitarios, HTTP, arquitectura (el de Postgres se saltea sin base)
cd apps/backend && npm ci && npm test

# Gateway: 401 y 403 con tokens firmados por el propio test
cd infra/gateway && npm ci && npm test

# Backend contra la base real, desde la raíz del repo
docker compose -f infra/compose/docker-compose.yml --profile test run --rm --build backend-tests
```

El esquema de la base lo crean las migraciones de cada módulo (`modules/*/infrastructure/persistence/migrations`) y los datos de ejemplo están en `infra/database/init`. Corren solo la primera vez: para empezar de cero, `docker compose -f infra/compose/docker-compose.yml down -v`.
