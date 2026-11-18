# ADR-2: Una base relacional con aislamiento por tienda

- **Estado:** Aceptada
- **Fecha:** 2026-11-03 (revisada el 2026-11-13: la tienda viaja en la URL y la API verifica al dueño)

## Contexto

La regla central del dominio es el aislamiento total entre tiendas (NFR-3). Con 30 tiendas y catálogos chicos (alrededor de 1.500 productos), el volumen cabe en una sola base.

## Decisión

Vamos a usar una única base PostgreSQL con tablas compartidas: cada tabla que pertenece a una tienda lleva `tienda_id NOT NULL`.

- La tienda viaja en la URL (`/tiendas/{id}/...`).
- En las escrituras, la API verifica que el usuario del token (`X-Usuario-Id`, que arma el gateway, ADR-11) sea el dueño de esa tienda, a través de la `public-api` del módulo `tiendas`.
- El filtro por tienda se aplica en la capa de repositorios: no existe un método "listar todos" fuera del módulo de estadísticas del administrador (ADR-5).

## Alternativas

- **Una base por tienda** o **un esquema por tienda:** aislamiento fuerte por infraestructura, pero implican 30 migraciones, 30 backups y 30 conjuntos de conexiones, sin beneficio a esta escala.

## Consecuencias

- Una migración y un backup.
- **Negativas:** el aislamiento depende de la disciplina del código, no de la base. Un endpoint nuevo que olvide verificar al dueño o filtrar por `tienda_id` expone datos de otra tienda. Se mitiga con repositorios que exigen la tienda y con tests de acceso cruzado. Row-Level Security de PostgreSQL queda como segunda barrera futura, todavía sin implementar.

## NFRs

Favorece NFR-1, NFR-2 y NFR-3 (con sus tests). Exige cuidado en NFR-3 en cada caso de uso nuevo.

## Confirmación

Los tests de acceso cruzado en `apps/backend/tests/integration/`: la dueña de la tienda B no puede crear productos en la A y el catálogo de B no muestra productos de A. La misma prueba corre contra PostgreSQL real con el perfil `test` del compose.

## Respuesta ante una tienda ajena

Un dueño que intenta escribir en una tienda ajena recibe **403** con Problem Details (NFR-3). El diseño original proponía 404 para no revelar que la tienda existe, pero las tiendas son públicas (la lista y los catálogos se leen sin login), así que un 404 no ocultaría nada y confundiría al dueño.
