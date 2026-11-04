import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createHmac } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import type { BetaMessage, MessageCreateParamsNonStreaming } from '@anthropic-ai/sdk/resources/beta/messages/messages'
import { AgendaError, createAgenda } from '../src/agenda.ts'
import { createAssistant, type MessagesApi } from '../src/assistant.ts'
import { loadClinic } from '../src/clinic.ts'
import { openDb } from '../src/db.ts'
import { addMinutes, describe, nowLocal, weekday } from '../src/time.ts'
import { parseWebhook, validSignature, verifyChallenge } from '../src/whatsapp.ts'

const clinic = loadClinic(fileURLToPath(new URL('../data/clinica.json', import.meta.url)))
// Lunes 9 de noviembre de 2026, 08:00 en Santiago
const NOW = '2026-11-09T08:00'
const setup = () => {
  const db = openDb(':memory:')
  return { db, agenda: createAgenda(clinic, db, () => NOW) }
}

/* ---------- fechas ---------- */

test('utilidades de fecha', () => {
  assert.equal(weekday('2026-11-09'), 1)
  assert.equal(weekday('2026-11-15'), 7)
  assert.equal(addMinutes('2026-11-09T23:30', 45), '2026-11-10T00:15')
  assert.equal(describe('2026-11-12T16:00'), 'jueves 12 de noviembre, 16:00')
  assert.match(nowLocal(new Date('2026-11-04T15:00:00Z')), /^2026-11-04T12:00$/) // UTC-3 en verano
})

/* ---------- agenda ---------- */

test('las horas libres respetan horario, anticipación y duración', () => {
  const { agenda } = setup()
  const slots = agenda.freeSlots({ servicio: 'limpieza', desde: '2026-11-09', hasta: '2026-11-15', max: 15 })
  assert.ok(slots.length > 0)
  for (const s of slots) {
    assert.ok(s.inicio >= '2026-11-09T10:00', `respeta 2 h de anticipación: ${s.inicio}`)
    const day = weekday(s.inicio.slice(0, 10))
    assert.notEqual(day, 7, 'domingo cerrado')
    const end = addMinutes(s.inicio, 60).slice(11)
    const blocks = clinic.horario[String(day)]
    assert.ok(blocks.some(([a, b]) => s.inicio.slice(11) >= a && end <= b), `dentro del horario: ${s.inicio}`)
  }
  // Ortodoncia solo con el Dr. Rojas
  const orto = agenda.freeSlots({ servicio: 'control_ortodoncia' })
  assert.ok(orto.every((s) => s.profesional_id === 'rojas'))
})

test('no permite dobles reservas ni horas fuera de regla', () => {
  const { agenda } = setup()
  const base = { servicio: 'limpieza', profesional: 'soto', paciente: 'Ana Pérez', contacto: 'wa:56911111111' }
  const ok = agenda.book({ ...base, inicio: '2026-11-10T10:00' })
  assert.equal(ok.profesional, 'Dra. Camila Soto')
  assert.throws(() => agenda.book({ ...base, inicio: '2026-11-10T10:30', paciente: 'Otro Paciente' }), AgendaError, 'se solapa')
  assert.throws(() => agenda.book({ ...base, inicio: '2026-11-10T12:30' }), AgendaError, 'cruza la hora de almuerzo')
  assert.throws(() => agenda.book({ ...base, inicio: '2026-11-15T10:00' }), AgendaError, 'domingo')
  assert.throws(() => agenda.book({ ...base, inicio: '2026-11-09T08:30' }), AgendaError, 'sin anticipación')
  assert.throws(() => agenda.book({ ...base, profesional: 'rojas', inicio: '2026-11-11T10:00' }), AgendaError, 'profesional no hace limpiezas')
  assert.throws(() => agenda.book({ ...base, inicio: '2026-12-08T10:00' }), AgendaError, 'feriado')
  // La hora ocupada ya no aparece como libre
  const libres = agenda.freeSlots({ servicio: 'limpieza', desde: '2026-11-10', hasta: '2026-11-10', profesional: 'soto', max: 15 })
  assert.ok(!libres.some((s) => s.inicio === '2026-11-10T10:00' || s.inicio === '2026-11-10T09:30'))
})

test('un paciente solo ve y cancela sus propias horas', () => {
  const { agenda } = setup()
  const a = agenda.book({ servicio: 'evaluacion', profesional: 'soto', inicio: '2026-11-11T15:00', paciente: 'Ana Pérez', contacto: 'wa:1' })
  assert.equal(agenda.mine('wa:1').length, 1)
  assert.equal(agenda.mine('wa:2').length, 0)
  assert.throws(() => agenda.cancel(a.id, 'wa:2'), AgendaError)
  agenda.cancel(a.id, 'wa:1')
  assert.equal(agenda.mine('wa:1').length, 0)
})

/* ---------- asistente (IA simulada) ---------- */

type Step = (p: MessageCreateParamsNonStreaming) => Partial<BetaMessage>
function fakeApi(steps: Step[]) {
  const calls: MessageCreateParamsNonStreaming[] = []
  const api: MessagesApi = {
    async create(p) {
      calls.push(structuredClone(p))
      const step = steps.shift()
      if (!step) throw new Error('la IA simulada no tiene más respuestas')
      return { id: 'msg', type: 'message', role: 'assistant', model: p.model, stop_reason: 'end_turn', content: [], ...step(p) } as BetaMessage
    },
  }
  return { api, calls }
}
const toolUse = (id: string, name: string, input: unknown) => ({ type: 'tool_use', id, name, input }) as never
const text = (t: string) => ({ type: 'text', text: t, citations: null }) as never

test('agenda una hora usando las herramientas y guarda la conversación', async () => {
  const { db, agenda } = setup()
  const { api, calls } = fakeApi([
    () => ({ stop_reason: 'tool_use', content: [toolUse('t1', 'buscar_horarios', { servicio: 'limpieza', desde: '2026-11-10', hasta: '2026-11-10' })] }),
    () => ({ content: [text('El martes 10 tengo 10:00 y 11:00 con la Dra. Soto. ¿Cuál prefieres?')] }),
    () => ({ stop_reason: 'tool_use', content: [toolUse('t2', 'agendar_hora', { servicio: 'limpieza', profesional: 'soto', inicio: '2026-11-10T10:00', paciente: 'Ana Pérez' })] }),
    () => ({ content: [text('¡Listo! Quedaste agendada el martes 10 a las 10:00.')] }),
  ])
  const bot = createAssistant({ clinic, agenda, db, api, model: 'claude-opus-5-5', now: () => NOW })

  const r1 = await bot.reply('wa:56911111111', 'Hola, quiero hora para limpieza el martes')
  assert.match(r1.text!, /10:00/)
  // La IA recibió horarios reales en el resultado de la herramienta
  const toolResult = JSON.stringify(calls[1].messages.at(-1))
  assert.match(toolResult, /2026-11-10T10:00/)
  // Parámetros de la solicitud
  assert.equal(calls[0].model, 'claude-opus-5-5')
  assert.equal(calls[0].fallbacks, 'default')
  assert.deepEqual(calls[0].output_config, { effort: 'low' })
  assert.equal(calls[0].messages.at(-1)?.role, 'system', 'la fecha actual va como mensaje de sistema al final')

  const r2 = await bot.reply('wa:56911111111', 'La de las 10, soy Ana Pérez')
  assert.match(r2.text!, /Listo/)
  assert.equal(agenda.mine('wa:56911111111').length, 1)

  // El historial solo crece: el segundo turno empieza con todo el primero intacto
  const firstTurn = calls[1].messages
  assert.deepEqual(calls[2].messages.slice(0, firstTurn.length), firstTurn.slice(0, firstTurn.length))
})

test('los errores de herramienta vuelven a la IA como is_error', async () => {
  const { db, agenda } = setup()
  const { api, calls } = fakeApi([
    () => ({ stop_reason: 'tool_use', content: [toolUse('t1', 'agendar_hora', { servicio: 'limpieza', profesional: 'soto', inicio: '2026-11-15T10:00', paciente: 'Ana Pérez' })] }),
    () => ({ content: [text('Ese día no atendemos, ¿te sirve el lunes?')] }),
  ])
  const bot = createAssistant({ clinic, agenda, db, api, model: 'm', now: () => NOW })
  await bot.reply('web:x', 'domingo 10:00')
  const last = calls[1].messages.at(-1)!
  assert.ok(Array.isArray(last.content))
  assert.equal((last.content[0] as { is_error?: boolean }).is_error, true)
})

test('al derivar, el bot deja de responder hasta que recepción lo devuelve', async () => {
  const { db, agenda } = setup()
  const avisos: string[] = []
  const { api } = fakeApi([
    () => ({ stop_reason: 'tool_use', content: [toolUse('t1', 'derivar_a_humano', { motivo: 'Reclamo por un cobro' })] }),
    () => ({ content: [text('Te comunico con recepción, te responderán pronto.')] }),
    () => ({ content: [text('Hola de nuevo, ¿en qué te ayudo?')] }),
  ])
  const bot = createAssistant({ clinic, agenda, db, api, model: 'm', now: () => NOW, onHandoff: (c, m) => { avisos.push(`${c}|${m}`) } })
  const r = await bot.reply('wa:9', 'Me cobraron de más')
  assert.equal(r.handoff, true)
  assert.deepEqual(avisos, ['wa:9|Reclamo por un cobro'])
  assert.equal((await bot.reply('wa:9', '¿hola?')).text, null, 'mientras está con recepción no responde')
  db.returnToBot('wa:9')
  assert.match((await bot.reply('wa:9', 'hola')).text!, /Hola de nuevo/)
})

test('una negativa de la IA se deriva a recepción', async () => {
  const { db, agenda } = setup()
  const { api } = fakeApi([() => ({ stop_reason: 'refusal', content: [] })])
  const bot = createAssistant({ clinic, agenda, db, api, model: 'm', now: () => NOW })
  const r = await bot.reply('web:y', '...')
  assert.equal(r.handoff, true)
  assert.match(r.text!, /recepción/)
})

test('respeta el tope diario de mensajes sin llamar a la IA', async () => {
  const { db, agenda } = setup()
  const { api, calls } = fakeApi([() => ({ content: [text('ok')] })])
  const bot = createAssistant({ clinic, agenda, db, api, model: 'm', now: () => NOW, dailyLimit: 1 })
  await bot.reply('web:z', 'uno')
  const r = await bot.reply('web:z', 'dos')
  assert.match(r.text!, /Por hoy no puedo/)
  assert.equal(calls.length, 1)
})

/* ---------- WhatsApp ---------- */

test('webhook: firma, verificación y lectura de mensajes', () => {
  const body = Buffer.from(JSON.stringify({ object: 'whatsapp_business_account' }))
  const sig = 'sha256=' + createHmac('sha256', 'secreto').update(body).digest('hex')
  assert.equal(validSignature(body, sig, 'secreto'), true)
  assert.equal(validSignature(body, sig, 'otro'), false)
  assert.equal(validSignature(body, undefined, 'secreto'), false)

  assert.equal(verifyChallenge(new URLSearchParams('hub.mode=subscribe&hub.verify_token=abc&hub.challenge=123'), 'abc'), '123')
  assert.equal(verifyChallenge(new URLSearchParams('hub.mode=subscribe&hub.verify_token=mal&hub.challenge=123'), 'abc'), null)

  const parsed = parseWebhook({
    object: 'whatsapp_business_account',
    entry: [{ changes: [{ value: {
      contacts: [{ wa_id: '56911111111', profile: { name: 'Ana' } }],
      messages: [
        { id: 'm1', from: '56911111111', type: 'text', text: { body: 'Hola' } },
        { id: 'm2', from: '56911111111', type: 'audio' },
      ],
    } }] }],
  })
  assert.deepEqual(parsed.texts, [{ id: 'm1', from: '56911111111', name: 'Ana', text: 'Hola' }])
  assert.deepEqual(parsed.others, [{ id: 'm2', from: '56911111111' }])
})

test('no procesa dos veces el mismo mensaje de WhatsApp', () => {
  const { db } = setup()
  assert.equal(db.firstTimeSeen('wamid.1'), true)
  assert.equal(db.firstTimeSeen('wamid.1'), false)
})
