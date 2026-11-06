// Agente de confirmaciones: el día anterior a cada cita le pide al paciente que confirme su
// asistencia por WhatsApp. Si no puede ir, le ofrece reagendar o liberar la hora, y avisa a
// recepción del cupo que quedó libre. Así bajan las inasistencias.
//
// Meta solo deja que el negocio inicie una conversación con una plantilla aprobada (y la cobra
// por mensaje). La plantilla se crea en Meta Business con el texto de README.md y sus dos
// botones de respuesta rápida; aquí se envía con los datos de cada cita.

import { AgendaError, type Agenda } from './agenda.ts'
import type { Option, Reply } from './assistant.ts'
import type { Clinic } from './clinic.ts'
import type { Appointment, DB } from './db.ts'
import { addDays, describe, nowLocal } from './time.ts'

/** Lo que se envía al paciente: los parámetros de la plantilla y el mismo texto ya armado (para el simulador). */
export interface Reminder {
  cita: Appointment
  to: string // contacto, p. ej. "wa:56912345678"
  params: [string, string, string, string, string] // nombre, servicio, profesional, día, hora
  text: string
  options: Option[]
}

export interface ConfirmacionesOptions {
  clinic: Clinic
  agenda: Agenda
  db: DB
  now?: () => string
  /** Envía el recordatorio (por WhatsApp con plantilla, o al simulador). Si lanza un error, no se marca como enviado. */
  send: (r: Reminder) => Promise<void>
  /** Aviso a recepción cuando un paciente libera su hora. */
  onSlotFreed?: (cita: Appointment, texto: string) => void | Promise<void>
  /** Continúa con el agente de agenda para ofrecer otra hora (por ejemplo, el modo guiado o el de IA). */
  continuar?: (contacto: string, texto: string) => Promise<Reply>
}

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim()
const SI = ['si', 'confirmo', 'confirmado', 'ahi estare', 'ahi voy', 'voy', 'asistire', 'ok', 'dale', 'perfecto', 'listo']
const NO = ['no puedo', 'no podre', 'no voy', 'no ire', 'no alcanzo', 'cancelar', 'cancelo', 'anular', 'cambiar', 'reagendar', 'otra hora', 'otro dia']
const firstName = (s: string) => s.trim().split(/\s+/)[0] ?? s

export function createConfirmaciones(o: ConfirmacionesOptions) {
  const now = o.now ?? (() => nowLocal())
  const c = o.clinic
  const servicio = (id: string) => c.servicios.find((s) => s.id === id)
  const profesional = (id: string) => c.profesionales.find((p) => p.id === id)
  /** Contactos a los que se les acaba de preguntar (para entender un "sí" o "no puedo" escrito a mano). */
  const esperando = new Map<string, number>()
  /** Contactos a los que ya se les preguntó "¿otra hora o solo cancelar?". */
  const preguntado = new Set<string>()

  function reminder(cita: Appointment): Reminder {
    const s = servicio(cita.servicio)?.nombre ?? cita.servicio
    const p = profesional(cita.profesional)?.nombre ?? cita.profesional
    const [dia, hora] = describe(cita.inicio).split(', ')
    const nombre = firstName(cita.paciente)
    return {
      cita,
      to: cita.contacto,
      params: [nombre, s, p, dia, hora],
      // Mismo texto que la plantilla de Meta (ver README.md)
      text: `Hola ${nombre} 👋 Te recordamos tu hora en ${c.nombre}: ${s} con ${p}, el ${dia} a las ${hora}. ¿Nos confirmas tu asistencia?`,
      options: [
        { id: `conf:si:${cita.id}`, title: 'Confirmo' },
        { id: `conf:no:${cita.id}`, title: 'No puedo ir' },
      ],
    }
  }

  /**
   * Envía las confirmaciones de las citas de un día (por defecto, mañana). No repite las ya enviadas,
   * así que se puede llamar varias veces sin duplicar mensajes.
   */
  async function enviar(dia = addDays(now().slice(0, 10), 1)) {
    const citas = o.db.appointmentsBetween(`${dia}T00:00`, `${addDays(dia, 1)}T00:00`)
    const resumen = { dia, enviadas: 0, yaEnviadas: 0, errores: [] as { cita: number; error: string }[] }
    for (const cita of citas) {
      if (o.db.getConfirmation(cita.id)) { resumen.yaEnviadas++; continue }
      try {
        await o.send(reminder(cita))
        o.db.saveConfirmation({ cita_id: cita.id, contacto: cita.contacto, estado: 'enviada', enviada: now(), respondida: null })
        esperando.set(cita.contacto, cita.id)
        resumen.enviadas++
      } catch (e) {
        resumen.errores.push({ cita: cita.id, error: e instanceof Error ? e.message : String(e) })
      }
    }
    return resumen
  }

  /** Envía la confirmación de una cita puntual (para el simulador y para reenviar a mano desde el panel). */
  async function enviarUna(citaId: number) {
    const cita = o.db.appointment(citaId)
    if (!cita || cita.estado !== 'confirmada') throw new AgendaError('No encontré esa hora vigente.')
    const r = reminder(cita)
    await o.send(r)
    o.db.saveConfirmation({ cita_id: cita.id, contacto: cita.contacto, estado: 'enviada', enviada: now(), respondida: null })
    esperando.set(cita.contacto, cita.id)
    return r
  }

  function marcar(citaId: number, contacto: string, estado: 'confirmada' | 'cancelada') {
    const prev = o.db.getConfirmation(citaId)
    o.db.saveConfirmation({ cita_id: citaId, contacto, estado, enviada: prev?.enviada ?? now(), respondida: now() })
  }

  async function liberar(cita: Appointment) {
    o.agenda.cancel(cita.id, cita.contacto)
    marcar(cita.id, cita.contacto, 'cancelada')
    const s = servicio(cita.servicio)?.nombre ?? cita.servicio
    const p = profesional(cita.profesional)?.nombre ?? cita.profesional
    await o.onSlotFreed?.(cita, `Se liberó una hora: ${describe(cita.inicio)} con ${p} (${s}). ${cita.paciente} avisó que no puede ir.`)
  }

  /**
   * Interpreta la respuesta del paciente a una confirmación. Devuelve null si el mensaje no tiene que ver
   * con una confirmación pendiente, para que lo responda el agente de siempre.
   */
  async function responder(contacto: string, text: string, optionId?: string): Promise<Reply | null> {
    // 1. Botones: traen el id de la cita, así que no hay dudas de cuál es
    const m = optionId?.match(/^conf:(si|no|otra|cancelar):(\d+)$/)
    let accion = m?.[1]
    let cita = m ? o.db.appointment(Number(m[2])) : null
    if (cita && cita.contacto !== contacto) cita = null

    // 2. Texto libre: solo justo después del recordatorio. Si la conversación siguió por otro lado,
    //    un "sí" es para el agente de agenda (por ejemplo, confirmar una hora nueva), no para esto.
    if (!m) {
      const citaId = esperando.get(contacto)
      if (!citaId) return null
      const t = norm(text)
      const tras = o.db.getConfirmation(citaId)?.estado === 'enviada' && preguntado.has(contacto)
      if (tras && /otra|reagend|cambi/.test(t)) accion = 'otra'
      else if (tras && /cancel|anul|solo/.test(t)) accion = 'cancelar'
      else if (t === 'no' || NO.some((w) => t.includes(w))) accion = 'no'
      else if (SI.some((w) => t === w || t.startsWith(`${w} `))) accion = 'si'
      else { esperando.delete(contacto); preguntado.delete(contacto); return null }
      cita = o.db.appointment(citaId)
    }
    esperando.delete(contacto)
    preguntado.delete(contacto)

    if (!cita || cita.estado !== 'confirmada') {
      return { text: 'Esa hora ya no está vigente. ¿Te ayudo con algo más?', handoff: false, options: [{ id: 'agendar', title: 'Agendar una hora' }, { id: 'menu', title: 'Ver el menú' }] }
    }
    const cuando = describe(cita.inicio)

    switch (accion) {
      case 'si':
        marcar(cita.id, contacto, 'confirmada')
        return { text: `¡Gracias por confirmar! ✅ Te esperamos el ${cuando} en ${c.direccion}.`, handoff: false }
      case 'no':
        esperando.set(contacto, cita.id) // para entender "otra hora" o "solo cancelar" escrito a mano
        preguntado.add(contacto)
        return {
          text: `Gracias por avisar 🙏 ¿Quieres que te busque otra hora o prefieres solo cancelar la del ${cuando}?`,
          handoff: false,
          options: [
            { id: `conf:otra:${cita.id}`, title: 'Elegir otra hora' },
            { id: `conf:cancelar:${cita.id}`, title: 'Solo cancelar' },
            { id: `conf:si:${cita.id}`, title: 'Sí voy a ir' },
          ],
        }
      case 'cancelar':
        await liberar(cita)
        return { text: `Listo, cancelé tu hora del ${cuando}. Cuando quieras volver a agendar, escríbeme por aquí.`, handoff: false }
      case 'otra': {
        await liberar(cita)
        const nombreServicio = servicio(cita.servicio)?.corto ?? 'una hora'
        const intro = `Listo, liberé tu hora del ${cuando}.`
        if (!o.continuar) return { text: `${intro} Escríbeme "quiero hora" y te muestro las disponibles.`, handoff: false }
        const r = await o.continuar(contacto, `Quiero agendar ${nombreServicio}`)
        return { ...r, text: r.text ? `${intro}\n\n${r.text}` : intro }
      }
    }
    return null
  }

  return { enviar, enviarUna, responder, reminder }
}

export type Confirmaciones = ReturnType<typeof createConfirmaciones>

/** ¿Ya pasó la hora diaria de envío? "HH:mm" en hora de la clínica. */
export const isSendTime = (local: string, hora: string) => local.slice(11) >= hora
