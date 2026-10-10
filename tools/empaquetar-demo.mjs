import { zipSync, unzipSync } from 'fflate';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { isAbsolute, join, relative, resolve } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const mode = process.argv.includes('--mes') ? 'mes' : 'demo';
const source = join(root, mode === 'mes' ? 'dist' : 'dist-demo-final');
const output = join(root, 'entregas');
if (!existsSync(join(source, 'index.html'))) throw new Error(`Ejecuta npm run ${mode === 'mes' ? 'build' : 'build:demo'} antes de empaquetar.`);
const files = {};
function add(entry) {
  if (typeof entry !== 'string') throw new Error('Ruta inválida en el manifiesto de build.');
  const path = resolve(source, entry);
  const key = relative(source, path);
  if (key.startsWith('..') || isAbsolute(key) || !statSync(path).isFile()) throw new Error('Archivo fuera de la build.');
  files[key.replaceAll('\\', '/')] = new Uint8Array(readFileSync(path));
}
function collectAssets(folder) {
  for (const entry of readdirSync(folder, { withFileTypes: true })) {
    const path = join(folder, entry.name);
    if (entry.isSymbolicLink()) throw new Error('No se admiten enlaces en los assets.');
    if (entry.isDirectory()) collectAssets(path);
    else add(relative(source, path));
  }
}
// Keep only this build's chunks. Windows can lock directories during recursive cleanup,
// so builds overwrite files and their manifest excludes obsolete hashed chunks.
let buildManifest;
try {
  buildManifest = JSON.parse(readFileSync(join(source, '.vite', 'manifest.json'), 'utf8'));
  if (!buildManifest || typeof buildManifest !== 'object' || Array.isArray(buildManifest)) throw new Error('Formato inválido.');
} catch (cause) {
  throw new Error('Falta un manifiesto válido: vuelve a compilar antes de empaquetar.', { cause });
}
for (const item of Object.values(buildManifest)) {
  add(item.file);
  for (const entry of item.css ?? []) add(entry);
  for (const entry of item.assets ?? []) add(entry);
}
for (const entry of ['index.html', 'favicon.svg', 'CREDITOS.txt']) add(entry);
for (const directory of ['img', 'musica', 'sonidos']) collectAssets(join(source, 'assets', directory));
const html = new TextDecoder().decode(files['index.html']);
if (/(?:src|href)=["']\/(?!\/)/.test(html)) throw new Error('La demo tiene rutas absolutas y no está lista para subcarpetas.');
if (Object.keys(files).length > 1000) throw new Error('Demasiados archivos para una demo web.');
const parts = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
}).formatToParts(new Date());
const value = type => parts.find(part => part.type === type)?.value ?? '';
const stamp = `${value('year')}${value('month')}${value('day')}-${value('hour')}${value('minute')}${value('second')}`;
mkdirSync(output, { recursive: true });
const destination = resolve(output, `patata-caliente-casi-${mode}-${stamp}.zip`);
if (!destination.startsWith(resolve(root) + '\\') && !destination.startsWith(resolve(root) + '/')) throw new Error('Destino fuera del juego.');
const data = zipSync(files, { level: 9 });
writeFileSync(destination, data, { flag: 'wx' });
const reopened = unzipSync(new Uint8Array(readFileSync(destination)));
if (!reopened['index.html'] || Object.keys(reopened).length !== Object.keys(files).length) throw new Error('ZIP incompleto.');
const manifest = {
  file: relative(root, destination).replaceAll('\\', '/'),
  created: new Date().toISOString(), timezone: 'America/Bogota', mode,
  bytes: data.byteLength, entries: Object.keys(reopened).length,
  sha256: createHash('sha256').update(data).digest('hex'),
  files: Object.keys(reopened).sort(),
};
writeFileSync(destination + '.json', JSON.stringify(manifest, null, 2), { flag: 'wx' });
console.log(JSON.stringify(manifest, null, 2));
