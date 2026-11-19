# Front · `web`

Front propio de la plataforma (ADR-9): una SPA en React 19 + Vite 8 + react-router 7. Se compila a archivos estáticos que sirve nginx en el contenedor `web` (puerto 3000). No tiene lógica de negocio ni secretos: el navegador habla directo con Keycloak para el login y con el gateway para la API.

## Cómo levantarlo

Con todo el sistema (lo normal), desde la raíz del repo:

```bash
docker compose -f infra/compose/docker-compose.yml up -d --build
```

y abrir http://localhost:3000.

Para desarrollar con recarga en caliente, con el resto del sistema levantado por compose:

```bash
docker compose -f infra/compose/docker-compose.yml stop web   # libera el puerto 3000
cd apps/frontend
npm ci
npm run dev                                                    # http://localhost:3000
```

El puerto tiene que ser 3000: es el redirect URI del cliente `web-incubadora` en Keycloak y uno de los orígenes que acepta el gateway (`CORS_ORIGIN`).

## Estructura

```
src/
├── main.jsx                  # monta React con el router
├── app/App.jsx               # login/logout, enlace "Editar mi tienda" y rutas: /, /tiendas/:id y /mi-tienda
├── features/
│   ├── autenticacion/        # login con Keycloak (Authorization Code + PKCE, sin librerías)
│   │   ├── pkce.js           #   code_verifier y code_challenge con la Web Crypto API
│   │   ├── login.js          #   redirige a Keycloak
│   │   ├── callback.js       #   canjea el code por el access token
│   │   └── logout.js
│   └── vitrina/              # lo que ve el usuario
│       ├── ListaTiendas.jsx  #   GET /tiendas
│       ├── FilaTienda.jsx    #   una tienda de la lista, con enlace a /tiendas/:id
│       ├── VistaTienda.jsx   #   GET /tiendas/{id} y /tiendas/{id}/productos (vista pública, con carrito)
│       ├── FilaProducto.jsx  #   un producto: nombre, stock, precio y el carrito (maqueta)
│       ├── TiendaEditable.jsx#   /mi-tienda: GET /mi-tienda y sus productos (solo rol dueno)
│       └── CargaProducto.jsx #   POST /tiendas/{id}/productos, usado desde /mi-tienda
└── shared/
    ├── api-client/api.js     # fetch al gateway (http://localhost:8000/v1) con el Bearer token; errores Problem Details
    └── utils/token.js        # lee el rol del token para mostrar u ocultar "Editar mi tienda"
```

## Cómo funciona el login

1. `login.js` genera un `code_verifier` y un `state` al azar, los guarda en `sessionStorage` y redirige a Keycloak con el `code_challenge`.
2. Keycloak vuelve a `http://localhost:3000/?code=...&state=...`.
3. `callback.js` verifica el `state`, canjea el `code` por el access token y lo guarda en `sessionStorage`.
4. `api.js` manda el token como `Authorization: Bearer` en cada llamada al gateway. Si recibe 401, borra el token.

El token vence a los 5 minutos y no se renueva: al vencer, hay que iniciar sesión otra vez.

**Importante:** el front muestra "Editar mi tienda" (`/mi-tienda`, `TiendaEditable.jsx`) solo a quien tiene el rol `dueno`, y ahí solo se cargan productos en la tienda propia. Eso es comodidad, no seguridad: la deciden el gateway (rol) y la API (dueño de la tienda). Por eso el 403 entre tiendas se demuestra desde Swagger UI (`POST /v1/tiendas/1/productos` logueado como `carla`).

**Carrito:** es una maqueta. "Agregar al carrito" en `FilaProducto.jsx` solo muestra el aviso "Carrito en preparación: el checkout está diseñado, pero todavía no está implementado." No llama a la API.

## Configuración

Hoy las URLs están escritas en el código: Keycloak (`http://localhost:8180/realms/incubadora-universitaria`), el gateway (`http://localhost:8000/v1`) y el redirect URI (`http://localhost:3000/`). Para desplegar en el servidor hay que cambiarlas en `features/autenticacion/*.js` y en `shared/api-client/api.js`. Pendiente: centralizarlas en un `config.js` con variables `VITE_*`.

## Pendientes conocidos

- El carrito y el checkout: hoy son maqueta (ver arriba).
- `features/vitrina/vitrina.js` quedó de una versión anterior y no se usa.
