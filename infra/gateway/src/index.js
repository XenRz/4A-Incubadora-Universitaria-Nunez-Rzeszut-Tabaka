// Arranque del gateway: lee la configuración, prepara las claves de Keycloak y abre el puerto.
// Las reglas y la validación del token están en src/app.js.
import { createRemoteJWKSet } from 'jose';
import { crearGateway } from './app.js';

const PORT = Number(process.env.PORT ?? 8000);
const API_URL = process.env.API_URL ?? 'http://localhost:3000';
// Las claves PÚBLICAS de Keycloak se buscan por la red interna (service discovery: "keycloak")...
const JWKS_URL = process.env.JWKS_URL ?? 'http://localhost:8180/realms/incubadora-universitaria/protocol/openid-connect/certs';
// ...pero el emisor (iss) del token es la URL que vio el NAVEGADOR al loguearse.
const ISSUER = process.env.ISSUER ?? 'http://localhost:8180/realms/incubadora-universitaria';
const AUDIENCE = process.env.AUDIENCE ?? 'api-incubadora';
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? 'http://localhost:8080';

// Se descarga la primera vez que se valida un token y queda en caché.
// Por eso el gateway puede arrancar antes de que Keycloak esté listo.
const jwks = createRemoteJWKSet(new URL(JWKS_URL));

const app = crearGateway({ apiUrl: API_URL, jwks, issuer: ISSUER, audience: AUDIENCE, corsOrigin: CORS_ORIGIN });

app.listen(PORT, () => console.log(`Gateway en ${PORT} → API ${API_URL} · emisor esperado ${ISSUER}`));
