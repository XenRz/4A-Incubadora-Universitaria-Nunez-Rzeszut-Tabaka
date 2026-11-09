# Módulo `catalogo`

**Responsabilidad:** productos y stock, siempre acotados a una tienda (toda operación recibe el contexto de tienda).

**Expone en `public-api/`:** consultar productos y precios, y reservar o descontar stock (lo usa `pedidos`).

**Regla de dependencia:** `presentation` e `infrastructure` → `application` → `domain`. `domain` no importa nada externo.
Otros módulos solo pueden importar desde `public-api/`; nunca desde sus capas internas.
