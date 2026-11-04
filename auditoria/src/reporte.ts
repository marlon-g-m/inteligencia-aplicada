import { topOpportunities, type Audit, type Finding } from './checks.ts'

export interface Agency { nombre: string; whatsapp: string; whatsappTexto: string; email: string; web: string }

export const AGENCIA: Agency = {
  nombre: 'Inteligencia Aplicada',
  whatsapp: '56976630940',
  whatsappTexto: '+56 9 7663 0940',
  email: 'inteligenciaaplicada.cl@gmail.com',
  web: 'https://marlon-g-m.github.io/inteligencia-aplicada/',
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)
const ICON: Record<Finding['nivel'], string> = { ok: '✓', mejorable: '!', falta: '✕' }
const LABEL: Record<Finding['nivel'], string> = { ok: 'Bien', mejorable: 'Mejorable', falta: 'Falta' }

function fechaLarga(iso: string) {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
}

function verdict(p: number) {
  if (p >= 80) return 'Buena base: hay detalles que mejorar para convertir más visitas en pacientes.'
  if (p >= 55) return 'Hay oportunidades claras para atraer y atender mejor a tus pacientes.'
  return 'Tu web está perdiendo pacientes: hay mejoras importantes y rápidas de hacer.'
}

const logo = `<svg viewBox="0 0 144 96" width="34" aria-hidden="true"><g fill="currentColor" stroke="currentColor"><rect width="25" height="96" rx="2"/><path fill-rule="evenodd" d="M72 0H96L144 96H23ZM84 27L118.5 96H49.5Z"/><path d="M61 72H107" stroke-width="5"/></g><circle cx="84" cy="72" r="9.5" fill="#2A44EE"/></svg>`

/** Informe de una página (A4), listo para abrir en el navegador e imprimir como PDF. */
export function renderReport(a: Audit, ag: Agency = AGENCIA): string {
  const top = topOpportunities(a)
  const color = a.puntaje >= 80 ? '#15803D' : a.puntaje >= 55 ? '#B45309' : '#B91C1C'
  const rows = a.hallazgos
    .map((h) => `<tr class="${h.nivel}"><td class="ic" aria-label="${LABEL[h.nivel]}">${ICON[h.nivel]}</td><td><strong>${esc(h.titulo)}</strong><span>${esc(h.detalle)}</span></td></tr>`)
    .join('')
  const opps = top.length
    ? top.map((h, i) => `<li><b>${i + 1}</b><div><strong>${esc(h.titulo)}</strong><span>${esc(h.propuesta!)}</span></div></li>`).join('')
    : '<li><b>✓</b><div><strong>Tu web está muy bien.</strong><span>El siguiente paso es automatizar la atención: un asistente de WhatsApp que agenda solo.</span></div></li>'
  const wa = `https://wa.me/${ag.whatsapp}?text=${encodeURIComponent(`Hola, vi el informe de la web de ${a.sitio} y quiero conversar.`)}`

  return `<!doctype html>
<html lang="es-CL">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Revisión web · ${esc(a.sitio)}</title>
<style>
  @page { size: A4; margin: 14mm; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; color: #0F172A; background: #EEF1F5; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .page { max-width: 820px; margin: 24px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgb(11 31 58 / .12); }
  header { background: #0B1F3A; color: #fff; padding: 24px 32px; display: flex; align-items: center; gap: 14px; }
  header .brand { display: flex; align-items: center; gap: 10px; font-weight: 700; color: #fff; }
  header .brand b { color: #8FB0FF; }
  header .meta { margin-left: auto; text-align: right; font-size: 12px; color: #B4C2D8; }
  .hero { display: grid; grid-template-columns: 1fr auto; gap: 24px; padding: 28px 32px 8px; align-items: center; }
  .hero h1 { margin: 0 0 6px; font-size: 24px; letter-spacing: -.02em; }
  .hero p { margin: 0; color: #475569; font-size: 14px; }
  .hero a { color: #2A44EE; word-break: break-all; }
  .score { width: 118px; height: 118px; border-radius: 999px; display: grid; place-items: center; text-align: center;
           background: conic-gradient(${color} ${a.puntaje * 3.6}deg, #E2E8F0 0); }
  .score div { width: 92px; height: 92px; border-radius: 999px; background: #fff; display: grid; place-content: center; }
  .score strong { font-size: 32px; color: ${color}; line-height: 1; font-variant-numeric: tabular-nums; }
  .score span { font-size: 11px; color: #64748B; }
  section { padding: 16px 32px; }
  h2 { font-size: 13px; text-transform: uppercase; letter-spacing: .08em; color: #2A44EE; margin: 8px 0 12px; }
  ol.opps { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
  ol.opps li { display: flex; gap: 12px; background: #F1F4FF; border-radius: 12px; padding: 12px 14px; }
  ol.opps b { flex: none; width: 26px; height: 26px; border-radius: 999px; background: #2A44EE; color: #fff; display: grid; place-items: center; font-size: 13px; }
  ol.opps strong, td strong { display: block; font-size: 14px; }
  ol.opps span, td span { display: block; font-size: 13px; color: #475569; margin-top: 2px; line-height: 1.45; }
  table { width: 100%; border-collapse: collapse; }
  td { padding: 9px 6px; border-bottom: 1px solid #E2E8F0; vertical-align: top; }
  td.ic { width: 34px; }
  td.ic { font-weight: 800; text-align: center; }
  tr.ok td.ic { color: #15803D; } tr.mejorable td.ic { color: #B45309; } tr.falta td.ic { color: #B91C1C; }
  .note { font-size: 11px; color: #64748B; margin-top: 10px; }
  footer { background: #0B1F3A; color: #fff; padding: 20px 32px; display: flex; gap: 16px; align-items: center; justify-content: space-between; flex-wrap: wrap; }
  footer p { margin: 0; font-size: 14px; }
  footer small { display: block; color: #B4C2D8; font-size: 12px; margin-top: 2px; }
  footer a.cta { background: #fff; color: #0B1F3A; text-decoration: none; font-weight: 700; padding: 10px 18px; border-radius: 999px; font-size: 14px; }
  @media print { body { background: #fff; } .page { margin: 0; box-shadow: none; border-radius: 0; } }
  @media (max-width: 600px) { .hero { grid-template-columns: 1fr; } header .meta { display: none; } }
</style>
</head>
<body>
<main class="page">
  <header>
    <span class="brand">${logo}<span>Inteligencia <b>Aplicada</b></span></span>
    <span class="meta">Revisión web gratuita<br>${esc(fechaLarga(a.fecha))}</span>
  </header>
  <div class="hero">
    <div>
      <h1>${esc(a.sitio)}</h1>
      <p><a href="${esc(a.url)}">${esc(a.url)}</a></p>
      <p style="margin-top:10px">${esc(verdict(a.puntaje))}</p>
    </div>
    <div class="score" role="img" aria-label="Puntaje ${a.puntaje} de 100"><div><strong>${a.puntaje}</strong><span>de 100</span></div></div>
  </div>
  <section>
    <h2>Lo que haríamos primero</h2>
    <ol class="opps">${opps}</ol>
  </section>
  <section>
    <h2>Revisión completa</h2>
    <table>${rows}</table>
    <p class="note">Revisión automática de la página de inicio realizada el ${esc(fechaLarga(a.fecha))}, con información pública del sitio. ${a.renderizadoJs ? 'Este sitio arma su contenido con JavaScript, por lo que algunas revisiones podrían no detectar elementos que sí existen. ' : ''}Es una orientación, no un análisis exhaustivo.</p>
  </section>
  <footer>
    <div>
      <p>¿Conversamos 30 minutos? Sin costo y sin compromiso.</p>
      <small>${esc(ag.whatsappTexto)} · ${esc(ag.email)}</small>
    </div>
    <a class="cta" href="${esc(wa)}">Escríbenos por WhatsApp</a>
  </footer>
</main>
</body>
</html>`
}
