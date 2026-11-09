import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { readFileSync } from 'node:fs'
import { timingSafeEqual } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createAgenda } from './agenda.ts'
import { anthropicMessagesApi, createAssistant, describeApiError, type Reply } from './assistant.ts'
import { createScripted } from './scripted.ts'
import { createConfirmaciones, isSendTime } from './confirmaciones.ts'
import { loadClinic } from './clinic.ts'
import { openDb } from './db.ts'
import { addDays, nowLocal } from './time.ts'
import { createWhatsApp, parseWebhook, validSignature, verifyChallenge } from './whatsapp.ts'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const env = process.env

const PORT = Number(env.PORT ?? 3000)
const clinic = loadClinic(env.CLINIC_FILE ?? join(root, 'data', 'clinica.json'))
const db = openDb(env.DB_FILE ?? join(root, 'data', 'demo.db'))
const agenda = createAgenda(clinic, db)

const waEnabled = Boolean(env.WHATSAPP_TOKEN && env.WHATSAPP_PHONE_NUMBER_ID && env.WHATSAPP_APP_SECRET && env.WHATSAPP_VERIFY_TOKEN)
const wa = waEnabled
  ? createWhatsApp({
      token: env.WHATSAPP_TOKEN!,
      phoneNumberId: env.WHATSAPP_PHONE_NUMBER_ID!,
      appSecret: env.WHATSAPP_APP_SECRET!,
      verifyToken: env.WHATSAPP_VERIFY_TOKEN!,
      graphVersion: env.WHATSAPP_GRAPH_VERSION ?? 'v23.0',
    })
  : null

// Modo: "ia" usa la API de Claude; "guion" es el flujo guiado sin costo. Por defecto, IA solo si hay API key.
const MODE: 'ia' | 'guion' = env.ASSISTANT_MODE === 'ia' || env.ASSISTANT_MODE === 'guion' ? env.ASSISTANT_MODE : env.ANTHROPIC_API_KEY ? 'ia' : 'guion'

const onHandoff = async (contacto: string, motivo: string) => {
    console.log(`[derivación] ${contacto}: ${motivo}`)
    // Aviso a recepción por WhatsApp. Ojo: Meta solo permite texto libre si esa persona escribió
    // al número del bot en las últimas 24 h; si no, hay que usar una plantilla aprobada.
    if (wa && env.STAFF_WHATSAPP) {
      await wa.sendText(env.STAFF_WHATSAPP, `🔔 Conversación derivada (${contacto}): ${motivo}`).catch((e) => console.error('[aviso recepción]', e.message))
    }
}

interface Engine { reply(contacto: string, text: string, optionId?: string): Promise<Reply> }
const assistant: Engine =
  MODE === 'ia'
    ? createAssistant({ clinic, agenda, db, api: anthropicMessagesApi(), model: env.CLAUDE_MODEL ?? 'claude-opus-5-5', onHandoff })
    : createScripted({ clinic, agenda, db, onHandoff })

/* ---------- agente de confirmaciones ---------- */

// Hora diaria (de la clínica) en que se envían las confirmaciones de mañana. "no" lo desactiva.
const CONF_HORA = env.CONFIRMACIONES_HORA ?? '10:00'
const CONF_PLANTILLA = env.WHATSAPP_PLANTILLA_CONFIRMACION ?? 'confirmacion_hora'
const CONF_IDIOMA = env.WHATSAPP_PLANTILLA_IDIOMA ?? 'es'

const confirmaciones = createConfirmaciones({
  clinic,
  agenda,
  db,
  send: async (r) => {
    // Las citas del simulador web no tienen WhatsApp: el simulador muestra el recordatorio él mismo
    if (!r.to.startsWith('wa:')) return
    if (!wa) throw new Error('WhatsApp no está configurado')
    await wa.sendTemplate(r.to.slice(3), CONF_PLANTILLA, CONF_IDIOMA, r.params, r.options.map((x) => x.id))
  },
  onSlotFreed: async (_cita, texto) => {
    console.log(`[cupo liberado] ${texto}`)
    if (wa && env.STAFF_WHATSAPP) await wa.sendText(env.STAFF_WHATSAPP, `🗓️ ${texto}`).catch((e) => console.error('[aviso recepción]', e.message))
  },
  continuar: (contacto, texto) => assistant.reply(contacto, texto),
})

/** Primero se revisa si el mensaje responde a una confirmación; si no, lo atiende el agente de siempre. */
async function responder(contacto: string, texto: string, opcion?: string): Promise<Reply> {
  return (await confirmaciones.responder(contacto, texto, opcion)) ?? (await assistant.reply(contacto, texto, opcion))
}

let ultimoEnvio = ''
async function enviarConfirmacionesSiToca() {
  const ahora = nowLocal()
  const hoy = ahora.slice(0, 10)
  if (CONF_HORA === 'no' || ultimoEnvio === hoy || !isSendTime(ahora, CONF_HORA)) return
  ultimoEnvio = hoy
  const r = await confirmaciones.enviar()
  console.log(`[confirmaciones] ${r.dia}: ${r.enviadas} enviadas, ${r.yaEnviadas} ya enviadas, ${r.errores.length} con error`)
  for (const e of r.errores) console.error(`[confirmaciones] cita #${e.cita}: ${e.error}`)
}

const FALLBACK = `Disculpa, tuve un problema técnico. Intenta de nuevo en unos minutos o llama a recepción al ${clinic.telefono_recepcion}.`
const page = (f: string) => readFileSync(join(root, 'public', f))

/* ---------- utilidades HTTP ---------- */

function readBody(req: IncomingMessage, limit = 256 * 1024): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    let size = 0
    req.on('data', (c: Buffer) => {
      size += c.length
      if (size > limit) { reject(new Error('cuerpo demasiado grande')); req.destroy() } else chunks.push(c)
    })
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

function send(res: ServerResponse, status: number, body: string | Buffer, type = 'text/plain; charset=utf-8') {
  res.writeHead(status, {
    'Content-Type': type,
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
  })
  res.end(body)
}
const json = (res: ServerResponse, status: number, data: unknown) => send(res, status, JSON.stringify(data), 'application/json; charset=utf-8')

/** El panel de recepción muestra datos de pacientes: exige usuario/clave si PANEL_PASSWORD está definido. */
function panelAuthorized(req: IncomingMessage): boolean {
  const pass = env.PANEL_PASSWORD
  if (!pass) return isLocalRequest(req)
  const h = req.headers.authorization ?? ''
  if (!h.startsWith('Basic ')) return false
  const [, given = ''] = Buffer.from(h.slice(6), 'base64').toString().split(':')
  const a = Buffer.from(given), b = Buffer.from(pass)
  return a.length === b.length && timingSafeEqual(a, b)
}
const isLocalRequest = (req: IncomingMessage) => ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(req.socket.remoteAddress ?? '')

/* ---------- simulador web: límite simple por IP ---------- */

const hits = new Map<string, { n: number; t: number }>()
function rateLimited(ip: string, max = 30, windowMs = 10 * 60 * 1000): boolean {
  const now = Date.now()
  const h = hits.get(ip)
  if (!h || now - h.t > windowMs) { hits.set(ip, { n: 1, t: now }); return false }
  h.n++
  return h.n > max
}

/* ---------- WhatsApp ---------- */

async function handleWhatsApp(raw: Buffer) {
  const { texts, others } = parseWebhook(JSON.parse(raw.toString('utf8')))
  for (const m of others) {
    if (!db.firstTimeSeen(m.id)) continue
    await wa!.sendText(m.from, 'Por ahora solo puedo leer mensajes de texto ✍️ ¿Me cuentas por escrito en qué te ayudo?').catch((e) => console.error('[whatsapp]', e.message))
  }
  for (const m of texts) {
    if (!db.firstTimeSeen(m.id)) continue // Meta puede reenviar el mismo webhook
    wa!.markRead(m.id).catch(() => {})
    let r: Reply
    try {
      r = await responder(`wa:${m.from}`, m.text, m.optionId)
    } catch (e) {
      console.error('[asistente]', describeApiError(e))
      r = { text: FALLBACK, handoff: false }
    }
    if (!r.text) continue
    const out = r.options?.length ? wa!.sendOptions(m.from, r.text, r.options) : wa!.sendText(m.from, r.text)
    await out.catch((e) => console.error('[whatsapp]', e.message))
  }
}

/* ---------- rutas ---------- */

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost')
  try {
    if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/demo')) return send(res, 200, page('demo.html'), 'text/html; charset=utf-8')

    if (req.method === 'GET' && url.pathname === '/salud') return json(res, 200, { ok: true, modo: MODE, whatsapp: waEnabled, hora: nowLocal() })

    if (req.method === 'POST' && url.pathname === '/api/chat') {
      const ip = req.socket.remoteAddress ?? '?'
      if (rateLimited(ip)) return json(res, 429, { error: 'Demasiados mensajes. Espera unos minutos.' })
      const body = JSON.parse((await readBody(req, 16 * 1024)).toString('utf8')) as { sesion?: string; texto?: string; opcion?: string }
      const sesion = String(body.sesion ?? '').replace(/[^a-zA-Z0-9-]/g, '').slice(0, 40)
      const texto = String(body.texto ?? '').trim()
      if (!sesion || !texto) return json(res, 400, { error: 'Falta la sesión o el texto.' })
      try {
        const opcion = typeof body.opcion === 'string' ? body.opcion.slice(0, 200) : undefined
        const r = await responder(`web:${sesion}`, texto, opcion)
        return json(res, 200, { texto: r.text ?? 'Recepción tomará esta conversación.', derivada: r.handoff, opciones: r.options ?? [] })
      } catch (e) {
        console.error('[asistente]', describeApiError(e))
        return json(res, 502, { error: FALLBACK, detalle: isLocalRequest(req) ? describeApiError(e) : undefined })
      }
    }

    // Simulador: muestra el recordatorio que recibiría el paciente para su próxima hora
    if (req.method === 'POST' && url.pathname === '/api/simular-confirmacion') {
      const ip = req.socket.remoteAddress ?? '?'
      if (rateLimited(ip)) return json(res, 429, { error: 'Demasiados mensajes. Espera unos minutos.' })
      const body = JSON.parse((await readBody(req, 4096)).toString('utf8')) as { sesion?: string }
      const sesion = String(body.sesion ?? '').replace(/[^a-zA-Z0-9-]/g, '').slice(0, 40)
      const proxima = sesion ? agenda.mine(`web:${sesion}`)[0] : undefined
      if (!proxima) return json(res, 400, { error: 'Primero agenda una hora en el chat; después te muestro la confirmación que te llegaría el día anterior.' })
      const r = await confirmaciones.enviarUna(proxima.id)
      return json(res, 200, { texto: r.text, opciones: r.options })
    }

    if (url.pathname === '/webhook' && wa) {
      if (req.method === 'GET') {
        const challenge = verifyChallenge(url.searchParams, env.WHATSAPP_VERIFY_TOKEN!)
        return challenge ? send(res, 200, challenge) : send(res, 403, 'forbidden')
      }
      if (req.method === 'POST') {
        const raw = await readBody(req)
        if (!validSignature(raw, req.headers['x-hub-signature-256'] as string | undefined, env.WHATSAPP_APP_SECRET!)) return send(res, 401, 'firma inválida')
        send(res, 200, 'ok') // Meta espera un 200 rápido; se procesa después
        handleWhatsApp(raw).catch((e) => console.error('[webhook]', e))
        return
      }
    }

    if (url.pathname.startsWith('/panel') || url.pathname.startsWith('/api/panel')) {
      if (!panelAuthorized(req)) {
        res.setHeader('WWW-Authenticate', 'Basic realm="Panel de recepción"')
        return send(res, 401, 'Se requiere usuario y clave')
      }
      if (req.method === 'GET' && url.pathname === '/panel') return send(res, 200, page('panel.html'), 'text/html; charset=utf-8')
      if (req.method === 'GET' && url.pathname === '/api/panel') {
        const pro = new Map(clinic.profesionales.map((p) => [p.id, p.nombre]))
        const srv = new Map(clinic.servicios.map((s) => [s.id, s.nombre]))
        return json(res, 200, {
          clinica: clinic.nombre,
          citas: db.upcoming(nowLocal().slice(0, 10) + 'T00:00').map((c) => ({ ...c, profesional: pro.get(c.profesional) ?? c.profesional, servicio: srv.get(c.servicio) ?? c.servicio })),
          derivadas: db.handoffs(),
          confirmaciones: {
            dia: addDays(nowLocal().slice(0, 10), 1),
            hora: CONF_HORA,
            citas: db
              .confirmationsBetween(`${addDays(nowLocal().slice(0, 10), 1)}T00:00`, `${addDays(nowLocal().slice(0, 10), 2)}T00:00`)
              .map((c) => ({ id: c.id, inicio: c.inicio, paciente: c.paciente, contacto: c.contacto, profesional: pro.get(c.profesional) ?? c.profesional, servicio: srv.get(c.servicio) ?? c.servicio, confirmacion: c.confirmacion })),
          },
        })
      }
      if (req.method === 'POST' && url.pathname === '/api/panel/confirmaciones') {
        return json(res, 200, await confirmaciones.enviar())
      }
      if (req.method === 'POST' && url.pathname === '/api/panel/devolver') {
        const { contacto } = JSON.parse((await readBody(req, 4096)).toString('utf8')) as { contacto?: string }
        if (contacto) db.returnToBot(contacto)
        return json(res, 200, { ok: true })
      }
    }

    send(res, 404, 'No encontrado')
  } catch (e) {
    console.error('[servidor]', e)
    if (!res.headersSent) send(res, 500, 'Error interno')
  }
})

setInterval(() => enviarConfirmacionesSiToca().catch((e) => console.error('[confirmaciones]', e)), 60_000).unref()

server.listen(PORT, () => {
  console.log(`Asistente de ${clinic.nombre} en http://localhost:${PORT}`)
  console.log(`  Simulador: http://localhost:${PORT}/demo · Panel: http://localhost:${PORT}/panel`)
  console.log(`  WhatsApp: ${waEnabled ? 'conectado (webhook en /webhook)' : 'no configurado (solo simulador)'}`)
  console.log(`  Confirmaciones: ${CONF_HORA === 'no' ? 'desactivadas' : `cada día a las ${CONF_HORA}, para las horas de mañana (plantilla "${CONF_PLANTILLA}")`}`)
  console.log(`  Modo: ${MODE === 'ia' ? `IA (${env.CLAUDE_MODEL ?? 'claude-opus-5-5'})` : 'guion sin IA (sin costo de API)'}`)
  if (MODE === 'ia' && !env.ANTHROPIC_API_KEY) console.warn('  ⚠️  Modo IA sin ANTHROPIC_API_KEY: el asistente no podrá responder.')
})
