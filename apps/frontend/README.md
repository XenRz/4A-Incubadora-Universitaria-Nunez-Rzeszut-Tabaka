# Front · `web`

Front propio de la plataforma (ADR-8): una SPA en React 19 + Vite 8 + react-router 7. Se compila a archivos estáticos que sirve nginx en el contenedor `web` (puerto 3000). No tiene lógica de negocio ni secretos: el navegador habla directo con Keycloak para el login y con el gateway para la API.

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
├── app/App.jsx               # botón de login/logout y rutas: / y /tiendas/:id
├── features/
│   ├── autenticacion/        # login con Keycloak (Authorization Code + PKCE, sin librerías)
│   │   ├── pkce.js           #   code_verifier y code_challenge con la Web Crypto API
│   │   ├── login.js          #   redirige a Keycloak
│   │   ├── callback.js       #   canjea el code por el access token
│   │   └── logout.js
│   └── vitrina/              # lo que ve el usuario
│       ├── ListaTiendas.jsx  #   GET /tiendas
│       ├── VistaTienda.jsx   #   GET /tiendas/{id} y /tiendas/{id}/productos
│       └── CargaProducto.jsx #   POST /tiendas/{id}/productos (solo rol dueno)
└── shared/
    ├── api-client/api.js     # fetch al gateway con el Bearer token; errores Problem Details
    └── utils/token.js        # lee el rol del token para mostrar u ocultar la carga
```

## Cómo funciona el login

1. `login.js` genera un `code_verifier` y un `state` al azar, los guarda en `sessionStorage` y redirige a Keycloak con el `code_challenge`.
2. Keycloak vuelve a `http://localhost:3000/?code=...&state=...`.
3. `callback.js` verifica el `state`, canjea el `code` por el access token y lo guarda en `sessionStorage`.
4. `api.js` manda el token como `Authorization: Bearer` en cada llamada al gateway. Si recibe 401, borra el token.

El token vence a los 5 minutos y no se renueva: al vencer, hay que iniciar sesión otra vez.

**Importante:** el front oculta el formulario de carga a quien no tiene el rol `dueno`, pero eso es solo comodidad. La seguridad la deciden el gateway (rol) y la API (dueño de la tienda). Por eso una dueña ve el formulario en una tienda ajena y la API le responde 403.

## Configuración

Hoy las URLs están escritas en el código: Keycloak (`http://localhost:8180/realms/incubadora-universitaria`), el gateway (`http://localhost:8000`) y el redirect URI (`http://localhost:3000/`). Para desplegar en el servidor hay que cambiarlas en `features/autenticacion/*.js` y en `shared/api-client/api.js`. Pendiente: centralizarlas en un `config.js` con variables `VITE_*`.

## Pendientes conocidos

- nginx no tiene fallback a `index.html`: recargar en `/tiendas/1` da 404. Hace falta un `nginx.conf` con `try_files $uri /index.html;`.
- Falta `.dockerignore`: el build copia `node_modules` del host.
- `features/vitrina/vitrina.js` quedó de una versión anterior y no se usa.
