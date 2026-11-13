// Uso:
//   node src/auditar.ts https://clinica.cl              → informe HTML + borrador de mensaje
//   node src/auditar.ts https://clinica.cl --psi        → además, velocidad real en celular (Google PageSpeed)
//   node src/auditar.ts --lista prospectos.txt [--psi]  → un informe por sitio + resumen.csv ordenado por oportunidad
//   Con --pdf, además guarda cada informe como PDF de una página (usa el Chrome o Edge instalado).

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { analyze, topOpportunities, type Audit } from './checks.ts'
import { fetchPage } from './fetch.ts'
import { outreachMessage } from './mensaje.ts'
import { findBrowser, htmlToPdf } from './pdf.ts'
import { renderReport } from './reporte.ts'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'reportes')

const args = process.argv.slice(2)
const psi = args.includes('--psi')
const browser = args.includes('--pdf') ? findBrowser() : null
if (args.includes('--pdf') && !browser) console.warn('⚠️  No encontré Chrome ni Edge para crear los PDF. Indica la ruta en AUDIT_NAVEGADOR o imprime el informe a mano.')
const listIdx = args.indexOf('--lista')
const urls =
  listIdx >= 0
    ? readFileSync(args[listIdx + 1] ?? '', 'utf8').split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith('#'))
    : args.filter((a) => !a.startsWith('--'))

if (!urls.length) {
  console.log('Uso: node src/auditar.ts <url> [--psi] [--pdf]   |   node src/auditar.ts --lista archivo.txt [--psi] [--pdf]')
  process.exit(1)
}

const slug = (url: string) => new URL(url).hostname.replace(/^www\./, '').replace(/[^a-z0-9.-]/gi, '_')
const csvCell = (s: string | number) => `"${String(s).replace(/"/g, '""')}"`

async function auditOne(url: string): Promise<Audit | null> {
  try {
    const page = await fetchPage(url, { psi })
    if (page.status >= 400) console.warn(`  ⚠️  ${url} respondió ${page.status}; el informe puede no ser representativo.`)
    if (psi && !page.psi) console.warn('  ⚠️  Google PageSpeed no respondió (sin cupo o sin clave). Se usó el tiempo de respuesta. Ver README: PSI_API_KEY.')
    const audit = analyze(page)
    const base = join(outDir, `${audit.fecha}-${slug(audit.url)}`)
    writeFileSync(`${base}.html`, renderReport(audit))
    writeFileSync(`${base}-mensaje.txt`, outreachMessage(audit, process.env.AUDIT_FIRMA ?? 'Marlon'))
    const faltas = audit.hallazgos.filter((h) => h.nivel === 'falta').map((h) => h.titulo)
    console.log(`✔ ${audit.sitio} — ${audit.puntaje}/100${faltas.length ? ` · falta: ${faltas.join(', ')}` : ''}`)
    console.log(`  ${base}.html`)
    if (browser) {
      try {
        await htmlToPdf(browser, `${base}.html`, `${base}.pdf`)
        console.log(`  ${base}.pdf`)
      } catch (e) {
        console.warn(`  ⚠️  ${(e as Error).message}`)
      }
    }
    return audit
  } catch (e) {
    console.error(`✖ ${url}: ${(e as Error).message}`)
    return null
  }
}

mkdirSync(outDir, { recursive: true })
const results: Audit[] = []
for (const url of urls) {
  const a = await auditOne(url)
  if (a) results.push(a)
  if (urls.length > 1) await new Promise((r) => setTimeout(r, 1500)) // sin apuro: un sitio a la vez
}

if (urls.length > 1 && results.length) {
  // Menor puntaje = más oportunidad = contactar primero
  results.sort((x, y) => x.puntaje - y.puntaje)
  const lines = [
    ['sitio', 'url', 'puntaje', 'oportunidad_1', 'oportunidad_2', 'oportunidad_3', 'informe'].map(csvCell).join(','),
    ...results.map((a) => {
      const o = topOpportunities(a).map((h) => h.titulo)
      return [a.sitio, a.url, a.puntaje, o[0] ?? '', o[1] ?? '', o[2] ?? '', `${a.fecha}-${slug(a.url)}.html`].map(csvCell).join(',')
    }),
  ]
  const csv = join(outDir, `resumen-${new Date().toISOString().slice(0, 10)}.csv`)
  writeFileSync(csv, '﻿' + lines.join('\r\n')) // BOM para que Excel lea bien los acentos
  console.log(`\nResumen ordenado por oportunidad: ${csv}`)
}
