import { test } from 'node:test'
import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import { createAgenda } from '../src/agenda.ts'
import { loadClinic } from '../src/clinic.ts'
import { openDb } from '../src/db.ts'
import { createScripted } from '../src/scripted.ts'
import { interactivePayload, parseWebhook } from '../src/whatsapp.ts'

const clinic = loadClinic(fileURLToPath(new URL('../data/clinica.json', import.meta.url)))
const NOW = '2026-11-09T08:00' // lunes

function setup() {
  const db = openDb(':memory:')
  const agenda = createAgenda(clinic, db, () => NOW)
  const avisos: string[] = []
  const bot = createScripted({ clinic, agenda, db, now: () => NOW, onHandoff: (c, m) => { avisos.push(`${c}|${m}`) } })
  return { db, agenda, bot, avisos }
}

test('saludo: presenta a la asistente y muestra el menú', async () => {
  const { bot } = setup()
  const r = await bot.reply('wa:1', 'hola')
  assert.match(r.text!, /Sofía/)
  assert.deepEqual(r.options!.map((o) => o.id), ['agendar', 'precios', 'mis_horas', 'info', 'humano'])
})

test('agenda una hora tocando opciones, de punta a punta', async () => {
  const { bot, agenda } = setup()
  await bot.reply('wa:1', 'hola')
  const servicios = await bot.reply('wa:1', 'Agendar una hora', 'agendar')
  assert.ok(servicios.options!.some((o) => o.id === 'srv:limpieza'))

  const dias = await bot.reply('wa:1', 'Limpieza dental', 'srv:limpieza')
  assert.match(dias.text!, /qué día/i)
  const dia = dias.options!.find((o) => o.id.startsWith('dia:'))!
  assert.equal(dia.id, 'dia:2026-11-09', 'hoy todavía hay horas (desde las 10:00)')

  const horas = await bot.reply('wa:1', dia.title, dia.id)
  const hora = horas.options!.find((o) => o.id.startsWith('hora:'))!
  assert.ok(horas.options!.length <= 10, 'cabe en una lista de WhatsApp')
  assert.equal(hora.title, '10:00')

  const nombre = await bot.reply('wa:1', hora.title, hora.id)
  assert.match(nombre.text!, /nombre y apellido/)
  const invalido = await bot.reply('wa:1', 'Ana')
  assert.match(invalido.text!, /nombre y apellido/)

  const confirmar = await bot.reply('wa:1', 'ana pérez')
  assert.match(confirmar.text!, /Ana Pérez/)
  assert.match(confirmar.text!, /Dra\. Camila Soto/)

  const listo = await bot.reply('wa:1', 'sí')
  assert.match(listo.text!, /Listo/)
  assert.equal(agenda.mine('wa:1').length, 1)
})

test('entiende texto libre: servicio, urgencia, precios, dirección y números', async () => {
  const { bot } = setup()
  const r1 = await bot.reply('wa:2', 'quiero hora para un blanqueamiento')
  assert.match(r1.text!, /Blanqueamiento/)
  assert.ok(r1.options!.some((o) => o.id.startsWith('dia:')))

  const r2 = await bot.reply('wa:3', 'me duele mucho una muela')
  assert.match(r2.text!, /urgencia/i)
  assert.match(r2.text!, /131/)

  const r3 = await bot.reply('wa:4', '¿cuánto cuesta la limpieza?')
  assert.match(r3.text!, /\$35\.000/)

  const r4 = await bot.reply('wa:5', 'donde están ubicados')
  assert.match(r4.text!, /Providencia/)

  await bot.reply('wa:6', 'hola')
  const r5 = await bot.reply('wa:6', '2') // segunda opción del menú
  assert.match(r5.text!, /valores/)
})

test('si no entiende, repite las opciones del paso actual', async () => {
  const { bot } = setup()
  await bot.reply('wa:7', 'hola')
  await bot.reply('wa:7', 'x', 'agendar')
  const r = await bot.reply('wa:7', 'asdfgh')
  assert.match(r.text!, /No te entendí/)
  assert.ok(r.options!.some((o) => o.id === 'srv:limpieza'))
})

test('muestra y cancela horas del paciente', async () => {
  const { bot, agenda } = setup()
  agenda.book({ servicio: 'evaluacion', profesional: 'soto', inicio: '2026-11-10T15:00', paciente: 'Ana Pérez', contacto: 'wa:8' })
  const lista = await bot.reply('wa:8', 'quiero cancelar mi hora')
  const cancelar = lista.options!.find((o) => o.id.startsWith('cancelar:'))!
  const confirmar = await bot.reply('wa:8', cancelar.title, cancelar.id)
  assert.match(confirmar.text!, /Seguro/)
  const r = await bot.reply('wa:8', 'Sí, cancelar', 'si_cancelar')
  assert.match(r.text!, /cancelada/)
  assert.equal(agenda.mine('wa:8').length, 0)
})

test('deriva a recepción y no responde hasta que la devuelvan', async () => {
  const { bot, db, avisos } = setup()
  const r = await bot.reply('wa:9', 'quiero hablar con una persona')
  assert.equal(r.handoff, true)
  assert.equal(avisos.length, 1)
  assert.equal((await bot.reply('wa:9', 'hola?')).text, null)
  assert.equal(db.handoffs().length, 1)
  db.returnToBot('wa:9')
  assert.ok((await bot.reply('wa:9', 'hola')).text)
})

test('WhatsApp: botones hasta 3, lista hasta 10 y títulos dentro del límite', () => {
  const botones = interactivePayload('569', 'texto', [{ id: 'a', title: 'Una opción con un título demasiado largo' }, { id: 'b', title: 'B' }])
  assert.equal(botones.interactive.type, 'button')
  const btn = (botones.interactive as { action: { buttons: { reply: { title: string } }[] } }).action.buttons[0]
  assert.ok(btn.reply.title.length <= 20)

  const muchas = Array.from({ length: 12 }, (_, i) => ({ id: `o${i}`, title: `Opción número ${i} con texto largo`, description: 'x'.repeat(100) }))
  const lista = interactivePayload('569', 'texto', muchas)
  assert.equal(lista.interactive.type, 'list')
  const rows = (lista.interactive as { action: { sections: { rows: { title: string; description?: string }[] }[] } }).action.sections[0].rows
  assert.equal(rows.length, 10)
  assert.ok(rows.every((r) => r.title.length <= 24 && (r.description ?? '').length <= 72))
})

test('WhatsApp: lee la opción tocada por el paciente', () => {
  const { texts } = parseWebhook({
    object: 'whatsapp_business_account',
    entry: [{ changes: [{ value: { messages: [
      { id: 'm1', from: '569', type: 'interactive', interactive: { type: 'list_reply', list_reply: { id: 'srv:limpieza', title: 'Limpieza dental' } } },
      { id: 'm2', from: '569', type: 'interactive', interactive: { type: 'button_reply', button_reply: { id: 'si', title: 'Sí, agendar' } } },
    ] } }] }],
  })
  assert.deepEqual(texts.map((t) => [t.text, t.optionId]), [['Limpieza dental', 'srv:limpieza'], ['Sí, agendar', 'si']])
})
