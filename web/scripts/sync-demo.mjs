// Copia el motor del modo guiado desde demo-clinica/ a la web, para que el demo del sitio
// use exactamente la misma agenda y el mismo flujo que el asistente real.
// Uso: npm run sync:demo (desde web/). Los archivos copiados no se editan a mano.
import { copyFileSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const src = (p) => fileURLToPath(new URL(`../../demo-clinica/${p}`, import.meta.url))
const dst = (p) => fileURLToPath(new URL(`../src/demo/motor/${p}`, import.meta.url))
const HEADER = '// GENERADO desde demo-clinica/src con `npm run sync:demo`. No editar aquí.\n\n'

for (const f of ['agenda.ts', 'scripted.ts', 'time.ts']) {
  const code = readFileSync(src(`src/${f}`), 'utf8')
    // Los tipos de los módulos de Node (SQLite, API de Claude) se reemplazan por los del navegador
    .replace(/from '\.\/(assistant|clinic|db)\.ts'/g, "from './tipos.ts'")
  writeFileSync(dst(f), HEADER + code)
}
copyFileSync(src('data/clinica.json'), dst('clinica.json'))
console.log('Motor del demo sincronizado.')
