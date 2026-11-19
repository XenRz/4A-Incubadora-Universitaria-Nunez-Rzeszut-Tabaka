// NFR-4 · 401 y 403 en el gateway, sin Keycloak: el test genera su propio par de claves,
// firma tokens como lo haría Keycloak y verifica qué deja pasar el gateway.
// El "backend" es un servidor falso que devuelve lo que recibió (método, ruta y headers).
import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { generateKeyPair, exportJWK, createLocalJWKSet, SignJWT } from 'jose';
import { crearGateway } from '../src/app.js';

const ISSUER = 'http://localhost:8180/realms/incubadora-universitaria';
const AUDIENCE = 'api-incubadora';
const ANA = '11111111-1111-1111-1111-111111111111';   // dueña
const BETO = '22222222-2222-2222-2222-222222222222';  // comprador

let clavePrivada;      // la "de Keycloak"
let otraClave;         // la de un atacante
let gateway;
let backend;
let base;

// Firma un token como Keycloak; cada test cambia solo lo que quiere romper.
async function token({ sub = ANA, roles = ['dueno'], iss = ISSUER, aud = AUDIENCE, vence = '5m', clave = clavePrivada } = {}) {
  return new SignJWT({ realm_access: { roles }, preferred_username: sub === ANA ? 'ana' : 'beto' })
    .setProtectedHeader({ alg: 'RS256', kid: 'clave-test' })
    .setSubject(sub).setIssuer(iss).setAudience(aud).setIssuedAt()
    .setExpirationTime(vence)
    .sign(clave);
}

const escuchar = (app) => new Promise((resolve) => { const s = app.listen(0, '127.0.0.1', () => resolve(s)); });
const pedir = (ruta, { metodo = 'GET', tok, headers = {}, cuerpo } = {}) => fetch(base + ruta, {
  method: metodo,
  headers: { 'Content-Type': 'application/json', ...(tok ? { Authorization: `Bearer ${tok}` } : {}), ...headers },
  body: cuerpo ? JSON.stringify(cuerpo) : undefined,
});
const crearProducto = (opciones = {}) => pedir('/tiendas/1/productos', { metodo: 'POST', cuerpo: { nombre: 'Mate', precio: 1, stock: 1 }, ...opciones });

before(async () => {
  // Par de claves "de Keycloak" y una clave de un atacante con el mismo kid.
  const keycloak = await generateKeyPair('RS256', { extractable: true });
  clavePrivada = keycloak.privateKey;
  ({ privateKey: otraClave } = await generateKeyPair('RS256'));

  // JWKS con la clave pública (lo mismo que publica Keycloak en /protocol/openid-connect/certs).
  const jwk = { ...(await exportJWK(keycloak.publicKey)), kid: 'clave-test', alg: 'RS256', use: 'sig' };

  // Backend falso: responde con lo que le llegó.
  backend = createServer((req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ metodo: req.method, ruta: req.url, usuarioId: req.headers['x-usuario-id'] ?? null }));
  });
  await new Promise((resolve) => backend.listen(0, '127.0.0.1', resolve));

  gateway = await escuchar(crearGateway({
    apiUrl: `http://127.0.0.1:${backend.address().port}`,
    jwks: createLocalJWKSet({ keys: [jwk] }),
    issuer: ISSUER,
    audience: AUDIENCE,
    corsOrigin: 'http://localhost:8080',
  }));
  base = `http://127.0.0.1:${gateway.address().port}`;
});

after(async () => {
  await new Promise((r) => gateway.close(r));
  await new Promise((r) => backend.close(r));
});

describe('401: no sé quién sos', () => {
  const casos = [
    ['sin header Authorization', async () => undefined],
    ['firmado con otra clave', () => token({ clave: otraClave })],
    ['emisor (iss) distinto', () => token({ iss: 'http://atacante/realms/x' })],
    ['audiencia (aud) de otra API', () => token({ aud: 'otra-api' })],
    ['vencido (exp)', () => token({ vence: Math.floor(Date.now() / 1000) - 60 })],
    ['no es un JWT', async () => 'esto-no-es-un-token'],
  ];
  for (const [caso, crearToken] of casos) {
    test(caso, async () => {
      const resp = await crearProducto({ tok: await crearToken() });
      assert.equal(resp.status, 401);
      assert.match(resp.headers.get('content-type'), /application\/problem\+json/);
      assert.match(resp.headers.get('www-authenticate'), /^Bearer /);
    });
  }
});

describe('403: sé quién sos, pero tu rol no alcanza', () => {
  test('comprador intenta crear un producto', async () => {
    const resp = await crearProducto({ tok: await token({ sub: BETO, roles: ['comprador'] }) });
    assert.equal(resp.status, 403);
    const problema = await resp.json();
    assert.equal(problema.status, 403);
    assert.match(problema.detail, /requiere uno de \[dueno\]/);
  });

  test('dueño intenta dar de alta una tienda (es del admin)', async () => {
    const resp = await pedir('/tiendas', { metodo: 'POST', tok: await token(), cuerpo: { nombre: 'X' } });
    assert.equal(resp.status, 403);
  });
});

describe('Pasa y llega el usuario correcto al backend', () => {
  test('dueña con token válido: se reenvía con X-Usuario-Id = sub del token', async () => {
    const resp = await crearProducto({ tok: await token() });
    assert.equal(resp.status, 200);   // lo que devuelve el backend falso
    assert.deepEqual(await resp.json(), { metodo: 'POST', ruta: '/tiendas/1/productos', usuarioId: ANA });
  });

  test('un X-Usuario-Id inventado por el cliente se descarta: manda el del token', async () => {
    const resp = await crearProducto({ tok: await token(), headers: { 'X-Usuario-Id': BETO } });
    assert.equal((await resp.json()).usuarioId, ANA);
  });

  test('en una ruta pública el X-Usuario-Id inventado tampoco llega', async () => {
    const resp = await pedir('/tiendas/1/productos', { headers: { 'X-Usuario-Id': ANA } });
    assert.equal(resp.status, 200);
    assert.equal((await resp.json()).usuarioId, null);
  });

  test('el catálogo es público: el comprador lo ve sin token', async () => {
    const resp = await pedir('/tiendas/2/productos');
    assert.equal(resp.status, 200);
  });
});

describe('Rutas no declaradas', () => {
  test('una ruta que no está en REGLAS responde 404 y no llega al backend', async () => {
    const resp = await pedir('/admin/secreto', { tok: await token() });
    assert.equal(resp.status, 404);
  });
});
