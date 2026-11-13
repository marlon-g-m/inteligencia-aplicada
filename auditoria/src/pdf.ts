// Guarda el informe como PDF con el Chrome o Edge que ya está instalado (sin dependencias).
// Es lo mismo que abrir el informe y usar Imprimir → Guardar como PDF, pero sin hacerlo a mano.

import { execFile } from 'node:child_process'
import { existsSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

function candidates(): string[] {
  const env = process.env
  const win = [env.PROGRAMFILES, env['PROGRAMFILES(X86)'], env.LOCALAPPDATA]
    .filter((d): d is string => Boolean(d))
    .flatMap((d) => [join(d, 'Google', 'Chrome', 'Application', 'chrome.exe'), join(d, 'Microsoft', 'Edge', 'Application', 'msedge.exe')])
  return [
    env.AUDIT_NAVEGADOR ?? '',
    ...win,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/microsoft-edge',
  ].filter(Boolean)
}

/** Ruta del navegador con el que se imprimen los PDF, o null si no hay ninguno instalado. */
export function findBrowser(): string | null {
  return candidates().find((p) => existsSync(p)) ?? null
}

/** Imprime un informe HTML a PDF (A4). Usa un perfil temporal para no tocar el navegador del usuario. */
export function htmlToPdf(browser: string, htmlPath: string, pdfPath: string): Promise<void> {
  const profile = mkdtempSync(join(tmpdir(), 'auditoria-pdf-'))
  const args = ['--headless=new', '--disable-gpu', '--no-pdf-header-footer', `--user-data-dir=${profile}`, `--print-to-pdf=${pdfPath}`, pathToFileURL(htmlPath).href]
  return new Promise((resolve, reject) => {
    execFile(browser, args, { timeout: 60_000 }, (err) => {
      try { rmSync(profile, { recursive: true, force: true, maxRetries: 3 }) } catch { /* el perfil temporal se limpia solo con el sistema */ }
      if (err) reject(new Error(`No se pudo crear el PDF: ${err.message}`))
      else if (!existsSync(pdfPath)) reject(new Error('El navegador no generó el PDF.'))
      else resolve()
    })
  })
}
