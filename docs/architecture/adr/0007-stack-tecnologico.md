# ADR-7: Stack tecnológico

- **Estado:** Aceptada
- **Fecha:** 2026-11-13 (revisada el 2026-11-18: se suma el front)

## Contexto

Sin Laravel ni frameworks similares. Tiene que ser un lenguaje que un becario promedio ya conozca o aprenda rápido, con librerías chicas (NFR-1) y todo libre (NFR-2). El repositorio arrancó sobre la base de la Clase 10. El front necesita login OIDC, listas y un formulario.

## Decisión

- **Back-end y gateway:** Node.js 22 con Express 5 como router mínimo. El backend usa el driver `pg` con SQL parametrizado escrito a mano; el gateway suma `jose` para validar JWT.
- **Base:** PostgreSQL 16, que permite Row-Level Security como refuerzo del ADR-2.
- **Front:** React 19 con Vite 8 y react-router 7, compilado a archivos estáticos que sirve nginx. El login con PKCE se escribe a mano con la Web Crypto API del navegador, sin librería OIDC.
- **Imágenes:** `node:22-alpine`, `postgres:16-alpine` y `nginx:alpine`.

## Alternativas

- **Python con un micro-framework o Go con la librería estándar:** igual de livianos, pero el material de la cátedra y el código inicial ya están en JavaScript.
- **Un ORM:** no se usa, así el filtro por tienda queda a la vista en cada consulta.
- **Front en JavaScript sin librería** (HTML + `fetch`): menos dependencias, pero el estado de cada vista (login, carga, errores) queda a mano en cada página.
- **Next.js u otro framework sobre React:** suma un servidor y convenciones propias, justo lo que la restricción "sin frameworks" quiere evitar.

## Consecuencias

- Un solo lenguaje en front, gateway y API.
- El backend y el gateway tienen dos dependencias directas cada uno; el front, tres de ejecución. Todas son MIT, y nginx es BSD-2-Clause.
- React es una librería de interfaz, no un framework de aplicación como Laravel: no decide la estructura del backend ni el acceso a datos.
- **Negativas:** el front suma React, Vite, react-router y un paso de build a lo que un becario tiene que aprender. Se resigna el tipado estático. La validación de entrada queda a mano, y las reglas del producto están duplicadas en el formulario y en el dominio.

## NFRs

Favorece NFR-2. En NFR-1 es mixto: un solo lenguaje lo favorece; React y el build lo perjudican.

## Confirmación

`apps/backend/package.json` (express, pg), `infra/gateway/package.json` (express, jose) y `apps/frontend/package.json` (react, react-dom, react-router-dom). Los Dockerfiles fijan `node:22-alpine`, y el del front, `nginx:alpine`.
