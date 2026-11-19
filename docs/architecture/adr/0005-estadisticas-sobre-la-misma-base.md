# ADR-5: Estadísticas con consultas sobre la misma base

- **Estado:** Aceptada (diseñada, sin código todavía)
- **Fecha:** 2026-11-03

## Contexto

El administrador necesita estadísticas agregadas de todas las tiendas, sobre un volumen muy chico.

## Decisión

Vamos a calcular las estadísticas con consultas SQL de agregación sobre la base principal, en un módulo de solo lectura accesible únicamente para el rol `admin` (`GET /estadisticas`).

## Alternativas

- **Almacén de datos o proceso de analítica aparte:** otra pieza que operar, injustificada para alrededor de 1.500 productos.

## Consecuencias

- Cero infraestructura extra.
- **Negativas:** es el único módulo que consulta sin filtrar por tienda, así que es el lugar donde una fuga entre tiendas sería más fácil. Necesita sus propios tests de autorización.

## NFRs

Favorece NFR-2. Exige cuidado en NFR-3.

## Confirmación

Prevista para cuando se implemente: un test de autorización en el que solo el rol `admin` accede a `GET /estadisticas`, y `dueno` y `comprador` reciben 403.
