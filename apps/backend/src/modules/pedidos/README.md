# Módulo `pedidos`

**Estado:** diseñado, sin código todavía. Ver el modelo de dominio (Pedido e Ítem) en el documento de arquitectura.

**Responsabilidad:** carrito, compra y registro de ventas de cada tienda.

**Expone en `public-api/`:** consultar pedidos y ventas de una tienda.

**Regla de dependencia:** `presentation` e `infrastructure` → `application` → `domain`. `domain` no importa nada externo.
Otros módulos solo pueden importar desde `public-api/`; nunca desde sus capas internas.
