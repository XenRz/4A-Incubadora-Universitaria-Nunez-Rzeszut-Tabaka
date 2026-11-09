# Módulo `tiendas`

**Responsabilidad:** alta y baja de tiendas y asignación de dueños. Lo opera el administrador de la plataforma.

**Expone en `public-api/`:** consultar una tienda y verificar si un usuario es dueño de ella.

**Regla de dependencia:** `presentation` e `infrastructure` → `application` → `domain`. `domain` no importa nada externo.
Otros módulos solo pueden importar desde `public-api/`; nunca desde sus capas internas.
