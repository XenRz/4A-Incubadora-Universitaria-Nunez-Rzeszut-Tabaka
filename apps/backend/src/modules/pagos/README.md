# Módulo `pagos`

**Responsabilidad:** procesar pagos. Define el puerto de pago en `application/ports`; la pasarela simulada es un adaptador en `infrastructure/external`.

**Expone en `public-api/`:** iniciar un pago y consultar su estado (lo usa `pedidos`).

**Regla de dependencia:** `presentation` e `infrastructure` → `application` → `domain`. `domain` no importa nada externo.
Otros módulos solo pueden importar desde `public-api/`; nunca desde sus capas internas.
