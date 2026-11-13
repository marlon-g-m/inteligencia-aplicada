import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { analyze, topOpportunities, visibleText, type PageData } from '../src/checks.ts'
import { normalizeUrl } from '../src/fetch.ts'
import { outreachMessage } from '../src/mensaje.ts'
import { renderReport } from '../src/reporte.ts'

const fixture = (f: string) => readFileSync(new URL(`./fixtures/${f}`, import.meta.url), 'utf8')
const page = (html: string, over: Partial<PageData> = {}): PageData => ({
  url: 'https://ejemplo.cl/', finalUrl: 'https://ejemplo.cl/', status: 200, html, ms: 400, bytes: html.length, httpToHttps: true, ...over,
})
const nivel = (a: ReturnType<typeof analyze>, id: string) => a.hallazgos.find((h) => h.id === id)!.nivel

test('un sitio bien hecho obtiene puntaje alto y todo en orden', () => {
  const a = analyze(page(fixture('buena.html')), '2026-11-04')
  assert.equal(a.sitio, 'Clínica Ejemplo Buena')
  assert.equal(a.puntaje, 100)
  assert.ok(a.hallazgos.every((h) => h.nivel === 'ok'))
  assert.equal(a.renderizadoJs, false)
})

test('una web antigua de clínica muestra las oportunidades correctas', () => {
  const a = analyze(page(fixture('antigua.html'), { url: 'http://antiguo.cl/', finalUrl: 'http://antiguo.cl/', httpToHttps: null, ms: 3200 }), '2026-11-04')
  for (const id of ['https', 'movil', 'whatsapp', 'reserva', 'privacidad', 'velocidad']) assert.equal(nivel(a, id), 'falta', id)
  assert.equal(nivel(a, 'telefono'), 'mejorable')
  assert.ok(a.puntaje < 30, `puntaje bajo: ${a.puntaje}`)
  const top = topOpportunities(a).map((h) => h.id)
  assert.equal(top.length, 3)
  assert.ok(top.every((id) => ['https', 'movil', 'whatsapp', 'velocidad'].includes(id)), top.join(','))
})

test('HTTPS sin redirección desde http queda como mejorable', () => {
  const a = analyze(page(fixture('buena.html'), { httpToHttps: false }))
  assert.equal(nivel(a, 'https'), 'mejorable')
})

test('usa el puntaje de PageSpeed cuando está disponible', () => {
  const a = analyze(page(fixture('buena.html'), { psi: { score: 42, lcpMs: 6100 } }))
  const v = a.hallazgos.find((h) => h.id === 'velocidad')!
  assert.equal(v.nivel, 'falta')
  assert.match(v.detalle, /42\/100/)
  assert.match(v.detalle, /6\.1 s/)
})

test('detecta sitios armados con JavaScript para advertirlo en el informe', () => {
  const a = analyze(page('<html><head><title>App</title></head><body><div id="root"></div><script src="/a.js"></script></body></html>'))
  assert.equal(a.renderizadoJs, true)
  assert.match(renderReport(a), /arma su contenido con JavaScript/)
})

test('el informe escapa el contenido del sitio (no inyecta HTML ajeno)', () => {
  const a = analyze(page('<html><head><title>Clínica <script>alert(1)</script> | X</title></head><body></body></html>'))
  const html = renderReport(a)
  assert.ok(!html.includes('<script>alert(1)</script>'))
  assert.match(html, /wa\.me\/56976630940/)
})

test('el borrador de mensaje es personalizado e incluye cómo dejar de recibirlos', () => {
  const a = analyze(page(fixture('antigua.html'), { finalUrl: 'http://antiguo.cl/', httpToHttps: null }))
  const m = outreachMessage(a)
  assert.match(m, /Bienvenidos/) // nombre tomado del título del sitio
  assert.match(m, /no los contacto más/)
  assert.equal((m.match(/^• /gm) ?? []).length, 2)
})

test('el mensaje y el informe tratan de "ustedes", sin mezclar con "tú"', () => {
  const tuteo = /(tú|tu|tus|te|ti|estás|tienes|prefieres|respóndeme|escríbenos|escríbeme)/i
  const antigua = analyze(page(fixture('antigua.html'), { finalUrl: 'http://antiguo.cl/', httpToHttps: null, ms: 3200 }))
  const buena = analyze(page(fixture('buena.html')))
  for (const a of [antigua, buena]) {
    const m = outreachMessage(a)
    assert.doesNotMatch(m, tuteo, m)
    assert.match(m, /¿cómo están\?/)
    // Del informe se revisa solo el texto propio: el título del sitio auditado puede decir cualquier cosa
    const propio = visibleText(renderReport(a)).replace(a.sitio, '')
    assert.doesNotMatch(propio, tuteo)
  }
})

test('normaliza direcciones y rechaza las privadas', () => {
  assert.equal(normalizeUrl('clinica.cl'), 'https://clinica.cl/')
  assert.throws(() => normalizeUrl('http://192.168.1.10'))
  assert.throws(() => normalizeUrl('localhost:3000'))
})

test('en sitios armados con JS busca los enlaces en el código del propio sitio', () => {
  const html = '<html><head><title>App</title><meta name="viewport" content="width=device-width"></head><body><div id="root"></div></body></html>'
  const sinJs = analyze(page(html))
  assert.equal(nivel(sinJs, 'whatsapp'), 'falta')
  const conJs = analyze(page(html, { scripts: 'x=jsx("a",{href:`https://wa.me/${n}?text=hola`});y="Política de privacidad";z=jsx("form",{})' }))
  assert.equal(nivel(conJs, 'whatsapp'), 'ok')
  assert.equal(nivel(conJs, 'privacidad'), 'ok')
  assert.equal(nivel(conJs, 'formulario'), 'ok')
})
