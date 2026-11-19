# Módulo `pagos`

**Estado:** puerto, adaptador HTTP (`pasarela-pagos-http.js`) y public-api implementados; el mock es el contenedor `pasarela-mock` (WireMock). Todavía no hay caso de uso ni ruta que llamen a `cobrar`: lo va a usar el checkout de `pedidos` (ADR-6).

**Responsabilidad:** procesar pagos. Define el puerto `PasarelaPagos` en `application/ports/pasarela-pagos.js`; el adaptador HTTP en `infrastructure/external/pasarela-pagos-http.js` habla con la pasarela (hoy el mock), con timeout de 5 s y error `PasarelaNoDisponible` (502) si no responde.

**Expone en `public-api/`:** `cobrar({ monto, referencia })`, que devuelve `{ id, estado: 'aprobado' | 'rechazado', motivo }`.

**Regla de dependencia:** `presentation` e `infrastructure` → `application` → `domain`. `domain` no importa nada externo.
Otros módulos solo pueden importar desde `public-api/`; nunca desde sus capas internas.
