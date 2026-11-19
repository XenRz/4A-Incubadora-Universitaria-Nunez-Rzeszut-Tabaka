# ADR-6: Pasarela de pagos detrás de un puerto, con implementación simulada

- **Estado:** Aceptada; puerto, adaptador HTTP y mock implementados, sin caso de uso que los use (el checkout de `pedidos` está diseñado, no implementado)
- **Fecha:** 2026-11-03 (revisada el 2026-11-19: el mock pasa a ser un contenedor WireMock y el adaptador habla HTTP)

## Contexto

La pasarela de pagos real no se integra en esta etapa, pero el checkout tiene que quedar diseñado. Es el único sistema externo del escenario.

## Decisión

Vamos a definir un puerto `PasarelaPagos` (método `cobrar`) en `modules/pagos/application/ports/pasarela-pagos.js`, con un adaptador HTTP en `modules/pagos/infrastructure/external/pasarela-pagos-http.js`. El resto del sistema llega al cobro solo por la `public-api` del módulo `pagos`.

El mock es un contenedor WireMock aparte, `pasarela-mock`, en la red `pagos` y sin puertos publicados: solo lo ve `backend`. Tiene dos escenarios versionados en `infra/pasarela-mock/mappings`: cobro aprobado, y rechazado si el monto supera 100000.

El adaptador le pega a `POST /cobros` con un timeout de 5 s. Si la pasarela no responde o contesta algo inesperado, lanza `PasarelaNoDisponible`, que la API traduce a 502. Pasar a un proveedor real es cambiar la URL que recibe el adaptador (y, si su contrato es otro, adaptar solo ese archivo).

## Alternativas

- **Integración directa con un proveedor:** ata el desarrollo y los tests a un tercero, a sus credenciales y a la red.
- **Mock dentro del backend** (una función que aprueba o rechaza): un contenedor menos, pero no ejercita la llamada HTTP, el timeout ni el error de red, que es justo lo que falla con un proveedor real.

## Consecuencias

- Se prueba sin internet ni credenciales, y el adaptador es el mismo que usaría el proveedor real.
- **Negativas:**
  - Un contenedor más que operar.
  - Sin caso de uso, el puerto todavía no está ejercitado por la app: ningún flujo de usuario llama a `cobrar`.
  - Se resigna probar contra el comportamiento real del proveedor (demoras, webhooks, reintentos).

## NFRs

Favorece NFR-1 y NFR-2.

## Confirmación

El cobro aprobado (monto 5000) y el rechazado (monto 150000) se demuestran contra el mock desde el contenedor `backend`:

```bash
docker compose -f infra/compose/docker-compose.yml exec backend node -e "fetch('http://pasarela-mock:8080/cobros',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({monto:5000,referencia:'demo-1'})}).then(r=>r.json()).then(console.log)"
```
