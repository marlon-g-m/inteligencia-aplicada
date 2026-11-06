import { test } from 'node:test'
import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import { createAgenda } from '../src/agenda.ts'
import { loadClinic } from '../src/clinic.ts'
import { createConfirmaciones, isSendTime, type Reminder } from '../src/confirmaciones.ts'
import { openDb } from '../src/db.ts'
import { createScripted } from '../src/scripted.ts'
import { parseWebhook, templatePayload } from '../src/whatsapp.ts'

const clinic = loadClinic(fileURLToPath(new URL('../data/clinica.json', import.meta.url)))
const NOW = '2026-11-09T10:00' // lunes; "mañana" es el martes 10

function setup(opts: { fail?: boolean } = {}) {
  const db = openDb(':memory:')
  const agenda = createAgenda(clinic, db, () => NOW)
  const bot = createScripted({ clinic, agenda, db, now: () => NOW })
  const enviados: Reminder[] = []
  const cupos: string[] = []
  const continuar: string[] = []
  const conf = createConfirmaciones({
    clinic, agenda, db, now: () => NOW,
    send: async (r) => { if (opts.fail) throw new Error('sin conexión'); enviados.push(r) },
    onSlotFreed: (_c, t) => { cupos.push(t) },
    continuar: (contacto, texto) => { continuar.push(texto); return bot.reply(contacto, texto) },
  })
  const book = (inicio: string, contacto = 'wa:56911111111', servicio = 'limpieza', paciente = 'Ana Pérez') =>
    agenda.book({ servicio, profesional: 'soto', inicio, paciente, contacto }).id
  return { db, agenda, conf, enviados, cupos, continuar, book }
}

test('envía la confirmación solo a las horas de mañana, una vez por cita', async () => {
  const { conf, enviados, book } = setup()
  book('2026-11-10T10:00')
  book('2026-11-10T15:00', 'wa:56922222222', 'evaluacion', 'Luis Rojas')
  book('2026-11-11T10:00', 'wa:56933333333') // pasado mañana: todavía no

  const r1 = await conf.enviar()
  assert.equal(r1.dia, '2026-11-10')
  assert.equal(r1.enviadas, 2)
  assert.deepEqual(enviados[0].params, ['Ana', 'Limpieza dental (destartraje y pulido)', 'Dra. Camila Soto', 'martes 10 de noviembre', '10:00'])
  assert.match(enviados[0].text, /¿Nos confirmas tu asistencia\?/)
  assert.deepEqual(enviados[0].options.map((o) => o.title), ['Confirmo', 'No puedo ir'])

  const r2 = await conf.enviar()
  assert.equal(r2.enviadas, 0, 'no duplica mensajes si se llama de nuevo')
  assert.equal(r2.yaEnviadas, 2)
})

test('si falla el envío, no la marca como enviada y se reintenta después', async () => {
  const { conf, db, book } = setup({ fail: true })
  const id = book('2026-11-10T10:00')
  const r = await conf.enviar()
  assert.equal(r.enviadas, 0)
  assert.equal(r.errores.length, 1)
  assert.equal(db.getConfirmation(id), null)
})

test('"Confirmo" deja la hora confirmada', async () => {
  const { conf, db, book } = setup()
  const id = book('2026-11-10T10:00')
  await conf.enviar()
  const r = await conf.responder('wa:56911111111', 'Confirmo', `conf:si:${id}`)
  assert.match(r!.text!, /Gracias por confirmar/)
  assert.equal(db.getConfirmation(id)!.estado, 'confirmada')
})

test('"No puedo ir" → "Solo cancelar" libera la hora y avisa a recepción', async () => {
  const { conf, db, agenda, cupos, book } = setup()
  const id = book('2026-11-10T10:00')
  await conf.enviar()
  const pregunta = await conf.responder('wa:56911111111', 'No puedo ir', `conf:no:${id}`)
  assert.deepEqual(pregunta!.options!.map((o) => o.id), [`conf:otra:${id}`, `conf:cancelar:${id}`, `conf:si:${id}`])
  assert.equal(agenda.mine('wa:56911111111').length, 1, 'todavía no cancela: primero pregunta')

  const r = await conf.responder('wa:56911111111', 'Solo cancelar', `conf:cancelar:${id}`)
  assert.match(r!.text!, /cancelé tu hora/)
  assert.equal(agenda.mine('wa:56911111111').length, 0)
  assert.equal(db.getConfirmation(id)!.estado, 'cancelada')
  assert.match(cupos[0], /Se liberó una hora: martes 10 de noviembre, 10:00 con Dra\. Camila Soto/)
  // El cupo vuelve a estar disponible para otros pacientes
  const libres = agenda.freeSlots({ servicio: 'limpieza', desde: '2026-11-10', hasta: '2026-11-10', max: 15 })
  assert.ok(libres.some((s) => s.inicio === '2026-11-10T10:00' && s.profesional_id === 'soto'))
})

test('"Elegir otra hora" libera la hora y sigue con la agenda del mismo servicio', async () => {
  const { conf, agenda, continuar, book } = setup()
  const id = book('2026-11-10T10:00')
  await conf.enviar()
  const r = await conf.responder('wa:56911111111', 'Elegir otra hora', `conf:otra:${id}`)
  assert.equal(continuar[0], 'Quiero agendar Limpieza dental')
  assert.match(r!.text!, /^Listo, liberé tu hora del martes 10 de noviembre, 10:00\./)
  assert.match(r!.text!, /qué día te acomoda/i)
  assert.ok(r!.options!.some((o) => o.id.startsWith('dia:')))
  assert.equal(agenda.mine('wa:56911111111').length, 0)
})

test('entiende "sí" y "no puedo, quiero otra hora" escritos a mano, justo después del recordatorio', async () => {
  const s1 = setup()
  const a = s1.book('2026-11-10T10:00')
  await s1.conf.enviar()
  await s1.conf.responder('wa:56911111111', 'Sí, ahí estaré')
  assert.equal(s1.db.getConfirmation(a)!.estado, 'confirmada')

  const s2 = setup()
  s2.book('2026-11-10T10:00')
  await s2.conf.enviar()
  const p = await s2.conf.responder('wa:56911111111', 'no puedo ir 😞')
  assert.match(p!.text!, /otra hora o prefieres solo cancelar/)
  const r = await s2.conf.responder('wa:56911111111', 'otra hora por favor')
  assert.match(r!.text!, /liberé tu hora/)
})

test('si la conversación siguió por otro lado, un "sí" ya no confirma la hora antigua', async () => {
  const { conf, db, book } = setup()
  const id = book('2026-11-10T10:00')
  await conf.enviar()
  assert.equal(await conf.responder('wa:56911111111', '¿cuánto sale un blanqueamiento?'), null, 'lo responde el agente de siempre')
  assert.equal(await conf.responder('wa:56911111111', 'sí'), null, 'este "sí" es para el agente de agenda')
  assert.equal(db.getConfirmation(id)!.estado, 'enviada')
  // Los botones del recordatorio siguen funcionando
  await conf.responder('wa:56911111111', 'Confirmo', `conf:si:${id}`)
  assert.equal(db.getConfirmation(id)!.estado, 'confirmada')
})

test('nadie puede confirmar o cancelar la hora de otra persona', async () => {
  const { conf, agenda, book } = setup()
  const id = book('2026-11-10T10:00')
  await conf.enviar()
  const r = await conf.responder('wa:56999999999', 'Solo cancelar', `conf:cancelar:${id}`)
  assert.match(r!.text!, /ya no está vigente/)
  assert.equal(agenda.mine('wa:56911111111').length, 1)
})

test('sin confirmación pendiente, los mensajes siguen de largo al agente', async () => {
  const { conf } = setup()
  assert.equal(await conf.responder('wa:56911111111', 'sí'), null)
  assert.equal(await conf.responder('wa:56911111111', 'Agendar una hora', 'agendar'), null)
})

test('WhatsApp: plantilla con variables y botones, y lectura de la respuesta al botón', () => {
  const p = templatePayload('56911111111', 'confirmacion_hora', 'es', ['Ana', 'Limpieza'], ['conf:si:1', 'conf:no:1'])
  assert.equal(p.type, 'template')
  assert.deepEqual(p.template.language, { code: 'es' })
  assert.deepEqual(p.template.components[0], { type: 'body', parameters: [{ type: 'text', text: 'Ana' }, { type: 'text', text: 'Limpieza' }] })
  assert.deepEqual(p.template.components[2], { type: 'button', sub_type: 'quick_reply', index: '1', parameters: [{ type: 'payload', payload: 'conf:no:1' }] })

  const { texts } = parseWebhook({
    object: 'whatsapp_business_account',
    entry: [{ changes: [{ value: { messages: [{ id: 'm1', from: '56911111111', type: 'button', button: { payload: 'conf:si:1', text: 'Confirmo' } }] } }] }],
  })
  assert.deepEqual(texts[0], { id: 'm1', from: '56911111111', name: undefined, text: 'Confirmo', optionId: 'conf:si:1' })
})

test('hora diaria de envío', () => {
  assert.equal(isSendTime('2026-11-09T09:59', '10:00'), false)
  assert.equal(isSendTime('2026-11-09T10:00', '10:00'), true)
  assert.equal(isSendTime('2026-11-09T18:30', '10:00'), true)
})
