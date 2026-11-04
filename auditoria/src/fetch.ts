import { isJsRendered, type PageData } from './checks.ts'

// Descarga solo la página de inicio (un pedido, más uno para comprobar la redirección http→https).
// No recorre el sitio ni guarda datos personales.

const UA = 'Mozilla/5.0 (compatible; InteligenciaAplicada-Auditoria/1.0; +https://marlon-g-m.github.io/inteligencia-aplicada/)'
const MAX_BYTES = 3 * 1024 * 1024

export function normalizeUrl(input: string): string {
  const s = input.trim()
  const withScheme = /^https?:\/\//i.test(s) ? s : `https://${s}`
  const u = new URL(withScheme)
  if (!['http:', 'https:'].includes(u.protocol)) throw new Error('Solo se aceptan direcciones http o https.')
  if (/^(localhost|127\.|10\.|192\.168\.|169\.254\.|0\.0\.0\.0|\[?::1\]?)/i.test(u.hostname) && !process.env.AUDIT_ALLOW_LOCAL) {
    throw new Error('Direcciones locales o privadas no permitidas.')
  }
  return u.toString()
}

async function timed(url: string, init: RequestInit, timeoutMs: number) {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    return await fetch(url, { ...init, signal: ctrl.signal, headers: { 'User-Agent': UA, Accept: 'text/html,*/*;q=0.8', 'Accept-Language': 'es-CL,es;q=0.9' } })
  } finally {
    clearTimeout(t)
  }
}

async function readLimited(res: Response): Promise<{ text: string; bytes: number }> {
  const reader = res.body?.getReader()
  if (!reader) return { text: '', bytes: 0 }
  const chunks: Uint8Array[] = []
  let bytes = 0
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    bytes += value.length
    if (bytes > MAX_BYTES) { await reader.cancel(); break }
    chunks.push(value)
  }
  return { text: new TextDecoder('utf-8', { fatal: false }).decode(Buffer.concat(chunks)), bytes }
}

async function checkHttpRedirect(url: string): Promise<boolean | null> {
  const u = new URL(url)
  if (u.protocol !== 'https:') return null
  u.protocol = 'http:'
  try {
    const res = await timed(u.toString(), { redirect: 'manual' }, 8000)
    const loc = res.headers.get('location') ?? ''
    return res.status >= 300 && res.status < 400 && loc.startsWith('https://')
  } catch {
    return null // http cerrado o sin respuesta: no se puede afirmar nada
  }
}

/** Google PageSpeed Insights (gratis; con PSI_API_KEY tiene más cupo). */
export async function pageSpeed(url: string): Promise<{ score: number; lcpMs?: number } | null> {
  const api = new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed')
  api.searchParams.set('url', url)
  api.searchParams.set('strategy', 'mobile')
  api.searchParams.set('category', 'performance')
  if (process.env.PSI_API_KEY) api.searchParams.set('key', process.env.PSI_API_KEY)
  try {
    const res = await timed(api.toString(), {}, 90_000)
    if (!res.ok) return null
    const d = (await res.json()) as {
      lighthouseResult?: { categories?: { performance?: { score?: number } }; audits?: Record<string, { numericValue?: number }> }
    }
    const score = d.lighthouseResult?.categories?.performance?.score
    if (typeof score !== 'number') return null
    return { score: Math.round(score * 100), lcpMs: d.lighthouseResult?.audits?.['largest-contentful-paint']?.numericValue }
  } catch {
    return null
  }
}

export async function fetchPage(input: string, opts: { psi?: boolean } = {}): Promise<PageData> {
  const url = normalizeUrl(input)
  const t0 = performance.now()
  let res: Response
  try {
    res = await timed(url, { redirect: 'follow' }, 20_000)
  } catch (e) {
    // Si https falla, probar http (sitios sin certificado)
    if (url.startsWith('https://')) {
      const httpUrl = 'http://' + url.slice(8)
      res = await timed(httpUrl, { redirect: 'follow' }, 20_000).catch(() => { throw new Error(`No se pudo abrir ${url}: ${(e as Error).message}`) })
    } else throw new Error(`No se pudo abrir ${url}: ${(e as Error).message}`)
  }
  const { text, bytes } = await readLimited(res)
  const ms = Math.round(performance.now() - t0)
  const finalUrl = res.url || url
  const [httpToHttps, psi, scripts] = await Promise.all([
    checkHttpRedirect(finalUrl),
    opts.psi ? pageSpeed(finalUrl) : Promise.resolve(null),
    isJsRendered(text) ? ownScripts(text, finalUrl) : Promise.resolve(undefined),
  ])
  return { url, finalUrl, status: res.status, html: text, ms, bytes, httpToHttps, psi, scripts }
}

/** Hasta 3 scripts del mismo dominio (los de terceros no dicen nada del sitio). */
async function ownScripts(html: string, base: string): Promise<string> {
  const origin = new URL(base).origin
  const srcs = [...html.matchAll(/<script\b[^>]*src=["']([^"']+)["']/gi)]
    .map((m) => {
      try { return new URL(m[1], base).toString() } catch { return '' }
    })
    .filter((u) => u.startsWith(origin))
    .slice(0, 3)
  const parts = await Promise.all(
    srcs.map(async (u) => {
      try { return (await readLimited(await timed(u, {}, 15_000))).text } catch { return '' }
    }),
  )
  return parts.join('\n')
}
