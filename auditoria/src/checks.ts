// Revisiones de la página de inicio de un prospecto. Funciones puras sobre el HTML ya descargado,
// para poder probarlas sin red. Las heurísticas buscan señales públicas y visibles; no son un
// análisis exhaustivo y el informe lo dice.

export interface PageData {
  url: string // la URL que se pidió revisar
  finalUrl: string // después de redirecciones
  status: number
  html: string
  ms: number // tiempo hasta recibir el HTML completo
  bytes: number
  /** ¿http:// redirige a https://? null si no se pudo comprobar. */
  httpToHttps: boolean | null
  /** Resultado de Google PageSpeed Insights (móvil), si se pidió. */
  psi?: { score: number; lcpMs?: number } | null
  /** Código JavaScript del propio sitio, solo cuando la página se arma con JS (para no perder enlaces). */
  scripts?: string
}

export type Level = 'ok' | 'mejorable' | 'falta'

export interface Finding {
  id: string
  titulo: string
  nivel: Level
  detalle: string
  /** Qué haríamos, en lenguaje del cliente. Solo cuando hay algo que mejorar. */
  propuesta?: string
  /** Servicio de la agencia relacionado. */
  servicio?: 'asistente' | 'web' | 'automatizacion' | 'datos'
  peso: number
}

export interface Audit {
  url: string
  sitio: string
  fecha: string
  puntaje: number // 0 a 100
  hallazgos: Finding[]
  /** El sitio arma su contenido con JavaScript: algunas revisiones pueden dar falsos negativos. */
  renderizadoJs: boolean
}

const lower = (s: string) => s.toLowerCase()
const decode = (s: string) =>
  s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()

function tag(html: string, re: RegExp): string | null {
  const m = html.match(re)
  return m ? decode(m[1]) : null
}

function meta(html: string, name: string): string | null {
  const esc = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return (
    tag(html, new RegExp(`<meta[^>]+(?:name|property)=["']${esc}["'][^>]*content=["']([^"']*)["']`, 'i')) ??
    tag(html, new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*(?:name|property)=["']${esc}["']`, 'i'))
  )
}

function links(html: string): string[] {
  return [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["']/gi)].map((m) => decode(m[1]))
}

/** Texto visible aproximado (sin scripts, estilos ni etiquetas). */
export function visibleText(html: string): string {
  return decode(html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' '))
}

const BOOKING = [
  'doctoralia', 'agendapro', 'reservo.cl', 'medilink', 'dentalink', 'calendly', 'cal.com', 'encuadrado', 'simplybook',
  'setmore', 'booksy', 'fresha', 'appointlet', 'youcanbook', 'acuityscheduling', 'reservaenlinea', 'agenda.', 'turnos',
]
const BOOKING_TEXT = /reserva(r)?\s+(tu\s+|una\s+)?(hora|cita)|agenda(r)?\s+(tu\s+|una\s+)?(hora|cita)|pide\s+tu\s+hora|reserva\s+online|agenda\s+online|agendar\s+en\s+l[ií]nea/i

export function analyze(p: PageData, fecha = new Date().toISOString().slice(0, 10)): Audit {
  const html = p.html
  const h = lower(html)
  const text = visibleText(html)
  const renderizadoJs = isJsRendered(html)
  // En sitios armados con JS, los enlaces viven en el código: se suman como texto plano para buscarlos
  const js = lower(p.scripts ?? '')
  const jsHrefs = [...js.matchAll(/(https?:\/\/(?:wa\.me|api\.whatsapp\.com)[^"'`\s)]*|tel:[+\d][^"'`\s)]*|\/[a-z-]*privacidad[a-z-]*)/g)].map((m) => m[1])
  const hrefs = [...links(html), ...jsHrefs]
  const hl = hrefs.map(lower)
  const f: Finding[] = []

  /* 1. HTTPS */
  const https = p.finalUrl.startsWith('https://')
  f.push(
    https
      ? { id: 'https', titulo: 'Conexión segura (HTTPS)', nivel: p.httpToHttps === false ? 'mejorable' : 'ok', peso: 15,
          detalle: p.httpToHttps === false ? 'El sitio tiene HTTPS, pero la versión http:// no redirige a la segura.' : 'El sitio usa conexión segura.',
          ...(p.httpToHttps === false ? { propuesta: 'Redirigir siempre a la versión segura para que el navegador no muestre "No seguro".', servicio: 'web' as const } : {}) }
      : { id: 'https', titulo: 'Conexión segura (HTTPS)', nivel: 'falta', peso: 15, servicio: 'web',
          detalle: 'El sitio no usa HTTPS: los navegadores lo marcan como "No seguro", lo que espanta pacientes y baja en Google.',
          propuesta: 'Activar un certificado gratuito y forzar HTTPS.' },
  )

  /* 2. Celular */
  const viewport = /<meta[^>]+name=["']viewport["'][^>]*width=device-width/i.test(html) || /<meta[^>]+width=device-width[^>]*name=["']viewport["']/i.test(html)
  f.push(
    viewport
      ? { id: 'movil', titulo: 'Adaptado a celular', nivel: 'ok', peso: 15, detalle: 'La página declara diseño adaptable a celular.' }
      : { id: 'movil', titulo: 'Adaptado a celular', nivel: 'falta', peso: 15, servicio: 'web',
          detalle: 'La página no está preparada para celular: se ve en miniatura y hay que hacer zoom. La mayoría de los pacientes llega desde el teléfono.',
          propuesta: 'Rediseñar la web para que se lea y se use bien en el celular.' },
  )

  /* 3. Velocidad */
  if (p.psi) {
    const s = p.psi.score
    const lcp = p.psi.lcpMs ? ` El contenido principal tarda ${(p.psi.lcpMs / 1000).toFixed(1)} s en aparecer en un celular.` : ''
    f.push({
      id: 'velocidad', titulo: 'Velocidad en celular (Google PageSpeed)', peso: 15,
      nivel: s >= 80 ? 'ok' : s >= 50 ? 'mejorable' : 'falta',
      detalle: `Puntaje de Google: ${s}/100.${lcp}`,
      ...(s < 80 ? { propuesta: 'Optimizar imágenes y carga para que la web abra en menos de 2 segundos.', servicio: 'web' as const } : {}),
    })
  } else {
    const kb = Math.round(p.bytes / 1024)
    const slow = p.ms > 2500, heavy = kb > 600
    f.push({
      id: 'velocidad', titulo: 'Velocidad de respuesta', peso: 15,
      nivel: slow ? 'falta' : p.ms > 1200 || heavy ? 'mejorable' : 'ok',
      // El texto explica el motivo real: un servidor rápido con una página muy pesada también es un problema
      detalle:
        slow || p.ms > 1200
          ? `El servidor tardó ${(p.ms / 1000).toFixed(1)} s en responder, antes de cargar imágenes. Lo recomendable es menos de 1 s.`
          : heavy
            ? `El servidor responde rápido, pero la página pesa ${kb} KB solo en código, varias veces lo recomendable. En un celular con mala señal tarda en abrir.`
            : `El servidor entregó la página en ${(p.ms / 1000).toFixed(1)} s (${kb} KB de HTML).`,
      ...(slow || p.ms > 1200 || heavy ? { propuesta: 'Mejorar el hosting y la carga para que la web abra rápido.', servicio: 'web' as const } : {}),
    })
  }

  /* 4. WhatsApp */
  const wa = hl.some((x) => /wa\.me\/|api\.whatsapp\.com|web\.whatsapp\.com|whatsapp:\/\//.test(x)) || /wa\.me\/\d|api\.whatsapp\.com\/send/.test(h)
  f.push(
    wa
      ? { id: 'whatsapp', titulo: 'Contacto por WhatsApp', nivel: 'ok', peso: 15, servicio: 'asistente',
          detalle: 'Tiene un botón o enlace a WhatsApp.',
          propuesta: 'Un asistente con IA puede responder ese WhatsApp las 24 horas y agendar solo.' }
      : { id: 'whatsapp', titulo: 'Contacto por WhatsApp', nivel: 'falta', peso: 15, servicio: 'asistente',
          detalle: 'No encontramos un botón de WhatsApp: el paciente tiene que copiar el número a mano.',
          propuesta: 'Agregar un botón de WhatsApp conectado a un asistente que responde y agenda las 24 horas.' },
  )

  /* 5. Reserva en línea */
  const booking = hl.some((x) => BOOKING.some((b) => x.includes(b))) || BOOKING.slice(0, 15).some((b) => h.includes(b) || js.includes(b)) || BOOKING_TEXT.test(text) || BOOKING_TEXT.test(js)
  f.push(
    booking
      ? { id: 'reserva', titulo: 'Reserva de horas en línea', nivel: 'ok', peso: 10, detalle: 'Ofrece reservar hora por internet.' }
      : { id: 'reserva', titulo: 'Reserva de horas en línea', nivel: 'falta', peso: 10, servicio: 'asistente',
          detalle: 'No encontramos una forma de reservar hora en línea: fuera del horario de atención, el paciente no puede agendar.',
          propuesta: 'Permitir agendar por WhatsApp o desde la web a cualquier hora, conectado a la agenda de la clínica.' },
  )

  /* 6. Teléfono clickeable */
  const tel = hl.some((x) => x.startsWith('tel:'))
  f.push(
    tel
      ? { id: 'telefono', titulo: 'Teléfono que se marca con un toque', nivel: 'ok', peso: 5, detalle: 'El teléfono se puede llamar directamente desde el celular.' }
      : { id: 'telefono', titulo: 'Teléfono que se marca con un toque', nivel: 'mejorable', peso: 5, servicio: 'web',
          detalle: 'El teléfono no es un enlace "tel:": desde el celular hay que copiarlo para llamar.',
          propuesta: 'Convertir el teléfono en un botón de llamada.' },
  )

  /* 7. Formulario */
  const form = /<form\b/i.test(html) || /formspree|wpcf7|gform|hsforms|typeform|jotform|forms\.gle|docs\.google\.com\/forms/.test(h) || /createelement\(\s*["']form["']|jsxs?\(\s*["']form["']/.test(js)
  f.push(
    form
      ? { id: 'formulario', titulo: 'Formulario de contacto', nivel: 'ok', peso: 5, detalle: 'Tiene un formulario de contacto.',
          servicio: 'automatizacion', propuesta: 'Conectar el formulario para que cada consulta llegue ordenada y con respuesta automática.' }
      : { id: 'formulario', titulo: 'Formulario de contacto', nivel: 'mejorable', peso: 5, servicio: 'automatizacion',
          detalle: 'No encontramos un formulario de contacto en la página de inicio.',
          propuesta: 'Agregar un formulario simple cuyas consultas lleguen ordenadas y con respuesta automática.' },
  )

  /* 8. Google: título y descripción */
  const title = tag(html, /<title[^>]*>([^<]*)<\/title>/i)
  const desc = meta(html, 'description')
  const seoOk = Boolean(title && title.length >= 10 && desc && desc.length >= 50)
  f.push({
    id: 'seo', titulo: 'Título y descripción para Google', peso: 5,
    nivel: seoOk ? 'ok' : title || desc ? 'mejorable' : 'falta',
    detalle: seoOk
      ? `Título: "${clip(title!, 70)}".`
      : `${title ? `Título: "${clip(title, 70)}".` : 'Sin título.'} ${desc ? 'La descripción es muy corta.' : 'Sin descripción: Google muestra un texto al azar en los resultados.'}`,
    ...(seoOk ? {} : { propuesta: 'Escribir un título y una descripción que hagan clic en Google ("Dentista en Providencia · Agenda hoy").', servicio: 'web' as const }),
  })

  /* 9. Ficha de negocio local (schema.org) */
  const schema = /"@type"\s*:\s*"(LocalBusiness|Dentist|MedicalClinic|MedicalBusiness|Physician|Hospital|Organization|VeterinaryCare|RealEstateAgent|Store|ProfessionalService)"/i.test(html)
  f.push(
    schema
      ? { id: 'schema', titulo: 'Datos de negocio para Google', nivel: 'ok', peso: 5, detalle: 'Incluye datos estructurados del negocio (dirección, horario, tipo).' }
      : { id: 'schema', titulo: 'Datos de negocio para Google', nivel: 'mejorable', peso: 5, servicio: 'web',
          detalle: 'No incluye datos estructurados: Google entiende peor la dirección, el horario y el rubro.',
          propuesta: 'Agregar la ficha de negocio local para aparecer mejor en búsquedas y en Maps.' },
  )

  /* 10. Vista previa al compartir */
  const og = Boolean(meta(html, 'og:title') && meta(html, 'og:image'))
  f.push(
    og
      ? { id: 'og', titulo: 'Vista previa al compartir', nivel: 'ok', peso: 5, detalle: 'Al compartir el enlace por WhatsApp o redes se ve con imagen y título.' }
      : { id: 'og', titulo: 'Vista previa al compartir', nivel: 'mejorable', peso: 5, servicio: 'web',
          detalle: 'Al compartir el enlace por WhatsApp o redes no aparece una imagen ni un título cuidado.',
          propuesta: 'Configurar la vista previa con logo, título y descripción.' },
  )

  /* 11. Privacidad (Ley 21.719) */
  const privacy = hl.some((x) => /privacidad|privacy|proteccion-de-datos|datos-personales/.test(x)) || /pol[ií]tica de privacidad|aviso de privacidad/i.test(text + ' ' + js)
  f.push(
    privacy
      ? { id: 'privacidad', titulo: 'Política de privacidad', nivel: 'ok', peso: 5, detalle: 'Publica una política de privacidad.' }
      : { id: 'privacidad', titulo: 'Política de privacidad', nivel: 'falta', peso: 5, servicio: 'datos',
          detalle: 'No encontramos una política de privacidad. Con la Ley 21.719 de datos personales es obligatorio informar cómo se tratan los datos, y en salud son datos sensibles.',
          propuesta: 'Publicar la política de privacidad y ordenar cómo se guardan los datos de pacientes.' },
  )

  const total = f.reduce((a, x) => a + x.peso, 0)
  const got = f.reduce((a, x) => a + (x.nivel === 'ok' ? x.peso : x.nivel === 'mejorable' ? x.peso / 2 : 0), 0)

  return {
    url: p.finalUrl || p.url,
    sitio: siteName(html, p.finalUrl || p.url),
    fecha,
    puntaje: Math.round((got / total) * 100),
    hallazgos: f,
    renderizadoJs,
  }
}

export function isJsRendered(html: string): boolean {
  return visibleText(html).length < 400 && /<div[^>]+id=["'](root|app|__next|___gatsby)["']/i.test(html)
}

/** Las 3 oportunidades más importantes (las que faltan primero, por peso). */
export function topOpportunities(a: Audit, n = 3): Finding[] {
  const rank = (x: Finding) => (x.nivel === 'falta' ? 2 : x.nivel === 'mejorable' ? 1 : 0) * 100 + x.peso
  return a.hallazgos.filter((x) => x.nivel !== 'ok' && x.propuesta).sort((x, y) => rank(y) - rank(x)).slice(0, n)
}

export function siteName(html: string, url: string): string {
  const og = meta(html, 'og:site_name')
  if (og) return clip(og, 60)
  const title = tag(html, /<title[^>]*>([^<]*)<\/title>/i)
  if (title) return clip(title.split(/\s[|\-–·:]\s/)[0].trim(), 60)
  try { return new URL(url).hostname.replace(/^www\./, '') } catch { return url }
}

const clip = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + '…' : s)
