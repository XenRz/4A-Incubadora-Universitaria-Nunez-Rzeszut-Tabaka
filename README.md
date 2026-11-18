# 4A · Incubadora universitaria

Trabajo práctico integrador de Arquitectura de Software I (UNAHUR). Grupo Núñez, Rzeszut, Tabaka.

Plataforma multi-tienda para los emprendedores de una incubadora universitaria. Cada dueño gestiona su tienda y ninguna tienda puede ver ni modificar los datos de otra. Escala: 30 tiendas con catálogos chicos, en un solo servidor de la universidad, mantenida por 2 becarios que cambian cada año. Los NFR estrella son **mantenibilidad** (un becario nuevo entiende todo en una semana) y **costo** (cero adicional).

## Arquitectura en una mirada

- **Monolito modular** (ADR-1): un solo backend dividido en módulos de negocio.
- **Una base PostgreSQL con aislamiento por tienda** (ADR-2): toda tabla de tienda lleva `tienda_id`, y la API verifica que el usuario sea el dueño.
- **Keycloak + gateway** (ADR-11): Keycloak autentica (OIDC) y el gateway es la única entrada a la API. No hay sesión propia.
- **Front propio en React** (ADR-8), servido como archivos estáticos por nginx.
- **Todo en Docker Compose** (ADR-10), con un solo comando.

| Contenedor | Qué es | Puerto en el host |
|---|---|---|
| `web` | Front en React + Vite, servido por nginx | 3000 |
| `gateway` | Valida el token, aplica las reglas por rol y reenvía a la API | 8000 |
| `keycloak` | Proveedor de identidad OIDC (modo desarrollo) | 8180 |
| `swagger-ui` | Documentación y cliente de prueba de la API | 8080 |
| `backend` | Monolito modular (Node.js 22 + Express 5) | — (solo red interna) |
| `db` | PostgreSQL 16 | — (solo red interna) |

Los diagramas C4 están en [`docs/architecture/c4/`](docs/architecture/c4/) y las decisiones en [`docs/architecture/adr/`](docs/architecture/adr/).

## Cómo levantarlo

Requisitos: Docker con Docker Compose. Desde la raíz del repo:

```bash
docker compose -f infra/compose/docker-compose.yml up -d --build
```

Esperá a que `keycloak` figure como `healthy` (tarda alrededor de un minuto la primera vez):

```bash
docker compose -f infra/compose/docker-compose.yml ps
```

| URL | Qué es |
|---|---|
| http://localhost:3000 | **El front.** Tiendas, catálogo y carga de producto |
| http://localhost:8000 | Gateway: la única entrada a la API |
| http://localhost:8080 | Swagger UI (contrato en `docs/architecture/openapi/openapi.yaml`); botón **Authorize** para loguearse |
| http://localhost:8180 | Keycloak (consola de administración: `admin` / `admin`) |

El esquema de la base lo crean las migraciones de cada módulo (`apps/backend/src/modules/*/infrastructure/persistence/migrations`) y los datos de ejemplo están en `infra/database/init`. Corren **solo la primera vez** que se crea el volumen. Para empezar de cero:

```bash
docker compose -f infra/compose/docker-compose.yml down -v
```

### Usuarios de prueba

Los importa Keycloak desde `infra/keycloak/realm-incubadora.json`. Las contraseñas son **solo de desarrollo**. Las tiendas y sus productos de ejemplo los carga `infra/database/init/datos-ejemplo.sql`.

| Usuario | Contraseña | Rol | Tienda | Para probar |
|---|---|---|---|---|
| `admin` | `admin123` | admin | — | Login de administrador (alta de tiendas y estadísticas: diseñadas, sin implementar) |
| `ana` | `ana123` | dueno | Tienda de mates Unahur (id 1) | Carga de producto en su tienda |
| `carla` | `carla123` | dueno | Repostería (id 2) | Que **no** puede cargar productos en la tienda de ana (403) |
| `beto` | `beto123` | comprador | — | Catálogo de cualquier tienda; no ve el formulario de carga |

**Demo del caso de uso mínimo:**

1. Entrar a http://localhost:3000 como `ana`, abrir "Tienda de mates Unahur" y cargar un producto.
2. Abrir "Repostería": el producto no aparece ahí.
3. Cerrar sesión, entrar como `carla`, abrir la tienda de ana e intentar cargar un producto: la API responde 403.

## Estructura del repositorio

```
/
├── apps/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── main/                # composition root: el único que conoce todas las piezas
│   │   │   ├── modules/             # identidad, tiendas, catalogo, pedidos, pagos
│   │   │   │   └── <modulo>/        # domain, application, infrastructure, presentation, public-api
│   │   │   └── shared/              # kernel (tenancy, errores) e infraestructura (config, base, logging)
│   │   └── tests/                   # unit, integration, architecture
│   └── frontend/                    # React + Vite, servido por nginx (ver su README)
├── docs/architecture/               # adr/, c4/, openapi/openapi.yaml
├── infra/
│   ├── compose/docker-compose.yml   # todos los servicios
│   ├── database/init/               # corre las migraciones y los datos de ejemplo
│   ├── gateway/                     # src/ y tests/
│   └── keycloak/                    # realm versionado
├── .gitignore
└── README.md
```

De los cinco módulos del backend, `tiendas` y `catalogo` tienen código; `identidad`, `pedidos` y `pagos` tienen la estructura de capas y un README con su responsabilidad.

### Reglas del backend

1. **Dependencias hacia adentro:** `presentation` / `infrastructure` → `application` → `domain`. `domain` no importa nada externo (solo `shared/kernel`).
2. **Comunicación solo por `public-api`:** un módulo nunca importa capas internas de otro. La excepción es `src/main/`, el composition root.
3. **Aislamiento por tienda:** toda operación de negocio lleva la tienda; ninguna tienda ve datos de otra.

El test de arquitectura (`apps/backend/tests/architecture/dependencias.test.js`) hace fallar `npm test` si se rompen las reglas 1 o 2.

### Cómo agregar un campo a Producto (ejemplo de onboarding)

1. Migración nueva en `apps/backend/src/modules/catalogo/infrastructure/persistence/migrations/` y sumarla en `infra/database/init/000_migraciones.sql`.
2. Regla en `modules/catalogo/domain/producto.js` y su test en `tests/unit/`.
3. Columna en `producto-repository-pg.js` y en la respuesta de los casos de uso.
4. Esquema en `docs/architecture/openapi/openapi.yaml`.
5. Campo en `apps/frontend/src/features/vitrina/CargaProducto.jsx` y `VistaTienda.jsx`.
6. `npm test` en `apps/backend` y `docker compose ... down -v && up -d --build`.

## Tests

```bash
# Backend: unitarios, HTTP, arquitectura (el de Postgres se saltea sin base)
cd apps/backend && npm ci && npm test

# Gateway: 401 y 403 con tokens firmados por el propio test, sin Keycloak
cd infra/gateway && npm ci && npm test

# Backend contra la base real, desde la raíz del repo
docker compose -f infra/compose/docker-compose.yml --profile test run --rm --build backend-tests
```

| Suite | Qué verifica | NFR |
|---|---|---|
| `tests/architecture` | Capas y comunicación solo por `public-api` | NFR-1 (ADR-1) |
| `tests/integration` | Una dueña no escribe en otra tienda; cada catálogo muestra solo lo suyo (en memoria y en PostgreSQL) | NFR-3 (ADR-2) |
| `tests/unit` | Reglas del producto y orden de validaciones del alta | NFR-3 |
| `infra/gateway/tests` | 401 sin token, con firma ajena, emisor o audiencia equivocados o vencido; 403 por rol; `X-Usuario-Id` inventado se descarta | NFR-4 (ADR-11) |

## Dependencias y licencias (NFR-2: costo cero)

Todo es software libre y corre en el servidor de la universidad, sin servicios pagos.

| Pieza | Dónde | Licencia |
|---|---|---|
| Node.js 22 | backend, gateway, build del front | MIT |
| Express 5 | backend, gateway | MIT |
| pg | backend | MIT |
| jose | gateway | MIT |
| React 19, react-dom, react-router 7 | front | MIT |
| Vite 8 | build del front | MIT |
| nginx | contenedor `web` | BSD-2-Clause |
| PostgreSQL 16 | `db` | PostgreSQL License |
| Keycloak 26 | `keycloak` | Apache 2.0 |
| Swagger UI 5 | `swagger-ui` | Apache 2.0 |

## Operación

- **Logs:** `docker compose -f infra/compose/docker-compose.yml logs -f <servicio>`.
- **Backup de la base:**

  ```bash
  docker compose -f infra/compose/docker-compose.yml exec -T db pg_dump -U tiendas -d tiendas > backup-$(date +%F).sql
  ```

- **Restauración** sobre una base vacía:

  ```bash
  docker compose -f infra/compose/docker-compose.yml down -v
  docker compose -f infra/compose/docker-compose.yml up -d db
  docker compose -f infra/compose/docker-compose.yml exec -T db psql -U tiendas -d tiendas -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
  docker compose -f infra/compose/docker-compose.yml exec -T db psql -U tiendas -d tiendas < backup-AAAA-MM-DD.sql
  docker compose -f infra/compose/docker-compose.yml up -d
  ```

  El `DROP SCHEMA` borra las tablas y los datos de ejemplo que se crean al levantar el volumen nuevo, para que el backup entre limpio.

- **En el servidor** el backup se programa diario (cron) y se guardan los últimos 7 (NFR-7).

## Documentación

- Documento de arquitectura: NFRs, matriz de Pugh, C4, dominio, API, evaluación y verificación de NFRs.
- [`docs/architecture/adr/`](docs/architecture/adr/): un archivo por decisión, con su índice.
- [`docs/architecture/c4/`](docs/architecture/c4/): diagramas de contexto y de contenedores.
- [`docs/architecture/openapi/openapi.yaml`](docs/architecture/openapi/openapi.yaml): contrato de la API, publicado en Swagger UI.

## Pendientes conocidos

- Contraseñas de `db` y de la consola de Keycloak escritas en el compose: pasarlas a `.env` y versionar un `.env.example`.
- Tienda ajena: el diseño dice 404, el código responde 403. Falta decidir.
- Keycloak corre en modo desarrollo (sin HTTPS ni base propia); en el servidor hace falta `start` con HTTPS.
- Funcionalidades del administrador, pedidos y pasarela de pagos: diseñadas (ADR-4 y ADR-5), sin implementar.
