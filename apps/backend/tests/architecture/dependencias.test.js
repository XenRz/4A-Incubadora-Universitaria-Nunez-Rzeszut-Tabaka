// Fitness function (Clase 13): las reglas del README escritas como tests.
// Lee los imports de cada archivo de src/ y falla si alguno rompe una regla.
// Sin dependencias externas: un becario lo lee de punta a punta.
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join, dirname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const SRC = resolve(dirname(fileURLToPath(import.meta.url)), '../../src');

// ---------- 1. Leer los imports ----------

// Captura: import x from '...', export ... from '...', import '...' e import('...') (incluye los de JSDoc).
const PATRON_IMPORT = /(?:import|export)\s[^'"]*?from\s*['"]([^'"]+)['"]|import\s*['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/g;

export function leerImports(codigo) {
  return [...codigo.matchAll(PATRON_IMPORT)].map((m) => m[1] ?? m[2] ?? m[3]);
}

function archivosJs(carpeta) {
  return readdirSync(carpeta, { withFileTypes: true }).flatMap((e) => {
    const ruta = join(carpeta, e.name);
    if (e.isDirectory()) return archivosJs(ruta);
    return e.name.endsWith('.js') ? [ruta] : [];
  });
}

// Ruta relativa a src/ con "/" (igual en Windows y Linux).
const aRelativa = (ruta) => relative(SRC, ruta).split(sep).join('/');

// ---------- 2. Clasificar cada archivo ----------
// Devuelve { zona: 'modulo' | 'kernel' | 'shared-infra' | 'main', modulo, capa }.
export function clasificar(rutaRelativa) {
  const partes = rutaRelativa.split('/');
  if (partes[0] === 'modules') return { zona: 'modulo', modulo: partes[1], capa: partes[2] };
  if (partes[0] === 'shared' && partes[1] === 'kernel') return { zona: 'kernel' };
  if (partes[0] === 'shared') return { zona: 'shared-infra' };
  return { zona: partes[0] };
}

// ---------- 3. Las reglas ----------
// Recibe el archivo origen y a qué apunta el import; devuelve el texto del error o null.
export function violacion(origen, destino, esPaquete) {
  const o = clasificar(origen);

  if (o.zona === 'main') return null;   // el composition root conoce todo (regla 2 del README)

  // Dominio y aplicación no dependen de frameworks ni drivers (express, pg...).
  if (esPaquete) {
    if (o.zona === 'kernel' || (o.zona === 'modulo' && ['domain', 'application'].includes(o.capa))) {
      return `${origen}: ${o.capa ?? o.zona} no puede importar el paquete "${destino}"`;
    }
    return null;
  }

  const d = clasificar(destino);

  if (d.zona === 'main') return `${origen}: nadie fuera de main/ puede importar main/`;

  if (o.zona === 'kernel' && d.zona !== 'kernel') return `${origen}: shared/kernel solo puede importar shared/kernel`;

  if (o.zona === 'modulo') {
    // Regla 2: otro módulo solo por su public-api.
    if (d.zona === 'modulo' && d.modulo !== o.modulo && d.capa !== 'public-api') {
      return `${origen}: importa ${destino}; a otro módulo solo se entra por su public-api`;
    }
    // Regla 1: dependencias hacia adentro.
    if (o.capa === 'domain' && !(d.zona === 'kernel' || (d.modulo === o.modulo && d.capa === 'domain'))) {
      return `${origen}: domain solo puede importar su propio domain y shared/kernel`;
    }
    if (o.capa === 'application' && (['infrastructure', 'presentation'].includes(d.capa) || d.zona === 'shared-infra')) {
      return `${origen}: application no puede importar ${d.capa ?? 'shared/infrastructure'}`;
    }
  }
  return null;
}

function analizarSrc() {
  const errores = [];
  const archivos = archivosJs(SRC);
  for (const archivo of archivos) {
    const origen = aRelativa(archivo);
    for (const spec of leerImports(readFileSync(archivo, 'utf8'))) {
      if (spec.startsWith('node:')) continue;                 // librería estándar: siempre permitida
      const esPaquete = !spec.startsWith('.');
      const destino = esPaquete ? spec : aRelativa(resolve(dirname(archivo), spec));
      const error = violacion(origen, destino, esPaquete);
      if (error) errores.push(error);
    }
  }
  return { archivos, errores };
}

// ---------- 4. Los tests ----------

describe('Reglas de arquitectura del monolito modular', () => {
  test('el código de src/ cumple todas las reglas', () => {
    const { archivos, errores } = analizarSrc();
    assert.ok(archivos.length > 10, 'no se encontraron archivos: revisar la ruta de src/');
    assert.deepEqual(errores, [], `\n${errores.join('\n')}`);
  });
});

// Si el detector no detecta nada, el test de arriba pasaría siempre: estos casos lo prueban.
describe('El detector encuentra violaciones a propósito', () => {
  test('lee los distintos tipos de import', () => {
    const codigo = `import a from './a.js';\nimport { b } from "../b.js";\nexport { c } from './c.js';\nimport './d.js';\n/** @type {import('./e.js').E} */`;
    assert.deepEqual(leerImports(codigo), ['./a.js', '../b.js', './c.js', './d.js', './e.js']);
  });

  const casos = [
    ['catalogo entra a la capa domain de tiendas', 'modules/catalogo/application/use-cases/x.js', 'modules/tiendas/domain/tienda.js', false],
    ['catalogo entra a la infraestructura de tiendas', 'modules/catalogo/infrastructure/persistence/x.js', 'modules/tiendas/infrastructure/persistence/y.js', false],
    ['domain importa express', 'modules/catalogo/domain/producto.js', 'express', true],
    ['application importa pg', 'modules/catalogo/application/use-cases/x.js', 'pg', true],
    ['domain importa application', 'modules/catalogo/domain/producto.js', 'modules/catalogo/application/ports/x.js', false],
    ['application importa infrastructure', 'modules/catalogo/application/use-cases/x.js', 'modules/catalogo/infrastructure/persistence/y.js', false],
    ['application importa shared/infrastructure', 'modules/catalogo/application/use-cases/x.js', 'shared/infrastructure/database/pool.js', false],
    ['un módulo importa main', 'modules/catalogo/presentation/http/x.js', 'main/app.js', false],
    ['kernel importa un módulo', 'shared/kernel/errors/errores.js', 'modules/tiendas/domain/tienda.js', false],
  ];
  for (const [caso, origen, destino, esPaquete] of casos) {
    test(`detecta: ${caso}`, () => assert.ok(violacion(origen, destino, esPaquete)));
  }

  const permitidos = [
    ['catalogo usa la public-api de tiendas', 'modules/catalogo/application/use-cases/x.js', 'modules/tiendas/public-api/index.js', false],
    ['domain usa shared/kernel', 'modules/catalogo/domain/producto.js', 'shared/kernel/errors/errores.js', false],
    ['infrastructure usa pg', 'modules/catalogo/infrastructure/persistence/x.js', 'pg', true],
    ['presentation usa express', 'modules/catalogo/presentation/http/x.js', 'express', true],
    ['main importa cualquier cosa', 'main/app.js', 'modules/tiendas/infrastructure/persistence/y.js', false],
  ];
  for (const [caso, origen, destino, esPaquete] of permitidos) {
    test(`permite: ${caso}`, () => assert.equal(violacion(origen, destino, esPaquete), null));
  }
});
