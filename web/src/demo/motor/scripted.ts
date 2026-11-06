// GENERADO desde demo-clinica/src con `npm run sync:demo`. No editar aquí.

// Modo demo sin IA: un flujo guiado con opciones (botones y listas de WhatsApp) que usa la
// misma agenda real. No tiene costo de API. Entiende frases típicas por palabras clave y,
// si no entiende, vuelve a ofrecer las opciones. Sirve para mostrar el producto; la versión
// con IA (assistant.ts) es la que se vende.

import { AgendaError, type Agenda } from './agenda.ts'
import type { Option, Reply } from './tipos.ts'
import type { Clinic, Service } from './tipos.ts'
import type { DB } from './tipos.ts'
import { addDays, describe, nowLocal } from './time.ts'

type Step = 'menu' | 'servicio' | 'dia' | 'hora' | 'nombre' | 'confirmar' | 'mis_horas' | 'confirmar_cancelar'

interface State {
  paso: Step
  servicio?: string
  dia?: string
  inicio?: string
  profesional?: string
  nombre?: string
  cancelarId?: number
  ofrecidas: Option[]
}

export interface ScriptedOptions {
  clinic: Clinic
  agenda: Agenda
  db: DB
  now?: () => string
  sessionHours?: number
  dailyLimit?: number
  onHandoff?: (contacto: string, motivo: string) => void | Promise<void>
}

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w\s#:]/g, ' ').replace(/\s+/g, ' ').trim()
const has = (t: string, words: string[]) => words.some((w) => t.includes(norm(w)))
const clp = (n: number) => `$${n.toLocaleString('es-CL')}`

const W = {
  menu: ['menu', 'inicio', 'volver', 'opciones', 'empezar'],
  humano: ['persona', 'humano', 'recepcion', 'recepcionista', 'reclamo', 'hablar con alguien', 'ejecutiv', 'llamar'],
  cancelar: ['cancelar', 'anular', 'mis horas', 'mi hora', 'tengo hora', 'cambiar mi hora', 'reagendar'],
  precios: ['precio', 'cuanto', 'valor', 'cuesta', 'sale', 'tarifa', 'servicios', 'tratamientos'],
  info: ['donde', 'direccion', 'ubicacion', 'ubicados', 'horario', 'abren', 'atienden', 'estacionamiento', 'metro', 'pago', 'isapre', 'fonasa'],
  agendar: ['hora', 'agendar', 'agenda', 'reservar', 'reserva', 'cita', 'atencion', 'turno'],
  si: ['si', 'sí', 'confirmo', 'confirmar', 'ok', 'dale', 'correcto', 'perfecto', 'listo'],
  no: ['no', 'cambiar', 'otra', 'otro'],
}

export function createScripted(o: ScriptedOptions) {
  const now = o.now ?? (() => nowLocal())
  const sessionMs = (o.sessionHours ?? 6) * 3600 * 1000
  const dailyLimit = o.dailyLimit ?? 80
  const counts = new Map<string, { dia: string; n: number }>()
  const c = o.clinic
  const service = (id?: string) => c.servicios.find((s) => s.id === id)
  const detectService = (t: string): Service | undefined => c.servicios.find((s) => has(t, s.palabras))

  const menuOptions: Option[] = [
    { id: 'agendar', title: 'Agendar una hora' },
    { id: 'precios', title: 'Precios y servicios' },
    { id: 'mis_horas', title: 'Mis horas' },
    { id: 'info', title: 'Dirección y horario' },
    { id: 'humano', title: 'Hablar con recepción' },
  ]
  const back: Option = { id: 'menu', title: 'Volver al menú' }

  /* ---------- pantallas ---------- */

  function menu(st: State, greet: boolean): Reply {
    st.paso = 'menu'
    const text = greet
      ? `¡Hola! 👋 Soy ${c.asistente}, la asistente virtual de ${c.nombre}. ¿En qué te ayudo?`
      : '¿En qué más te ayudo?'
    return offer(st, text, menuOptions)
  }

  function askService(st: State): Reply {
    st.paso = 'servicio'
    return offer(
      st,
      '¿Qué necesitas agendar? Si no sabes, elige *Evaluación* y la doctora te orienta.',
      c.servicios.map((s) => ({ id: `srv:${s.id}`, title: s.corto, description: `${s.duracion} min · ${clp(s.precio)}` })),
    )
  }

  function askDay(st: State, intro = ''): Reply {
    st.paso = 'dia'
    const s = service(st.servicio)!
    const today = now().slice(0, 10)
    const days: Option[] = []
    for (let i = 0; i <= c.dias_maximos_agenda && days.length < 6; i++) {
      const day = addDays(today, i)
      const slots = o.agenda.freeSlots({ servicio: s.id, desde: day, hasta: day, max: 15 })
      if (slots.length) {
        const d = describe(day)
        days.push({ id: `dia:${day}`, title: shortDay(cap(d)), description: slots.length >= 15 ? 'Más de 15 horas disponibles' : `${slots.length} ${slots.length === 1 ? 'hora disponible' : 'horas disponibles'}` })
      }
    }
    if (!days.length) {
      return offer(st, `${intro}No encontré horas disponibles para ${s.corto.toLowerCase()} en las próximas semanas. Recepción puede ayudarte.`, [
        { id: 'humano', title: 'Hablar con recepción' },
        back,
      ])
    }
    return offer(st, `${intro}${s.corto} (${s.duracion} min, ${clp(s.precio)}). ¿Qué día te acomoda?`, [...days, back])
  }

  function askTime(st: State, intro = ''): Reply {
    st.paso = 'hora'
    const slots = o.agenda.freeSlots({ servicio: st.servicio!, desde: st.dia, hasta: st.dia, max: 9 })
    if (!slots.length) return askDay(st, 'Ese día ya no tiene horas. ')
    return offer(st, `${intro}Estas son las horas del ${describe(st.dia!)}:`, [
      ...slots.map((x) => ({ id: `hora:${x.inicio}|${x.profesional_id}`, title: x.inicio.slice(11), description: x.profesional })),
      { id: 'otro_dia', title: 'Otro día' },
    ])
  }

  function askName(st: State): Reply {
    st.paso = 'nombre'
    st.ofrecidas = []
    return { text: '¿A nombre de quién agendo? Escribe nombre y apellido.', handoff: false }
  }

  function askConfirm(st: State): Reply {
    st.paso = 'confirmar'
    const s = service(st.servicio)!
    const p = c.profesionales.find((x) => x.id === st.profesional)!
    return offer(
      st,
      `Confirmemos:\n• ${s.corto} con ${p.nombre}\n• ${cap(describe(st.inicio!))}\n• A nombre de ${st.nombre}\n\n¿Agendo?`,
      [{ id: 'si', title: 'Sí, agendar' }, { id: 'no', title: 'Cambiar hora' }, back],
    )
  }

  function book(st: State, contacto: string): Reply {
    try {
      const r = o.agenda.book({ servicio: st.servicio!, profesional: st.profesional!, inicio: st.inicio!, paciente: st.nombre!, contacto })
      st.paso = 'menu'
      return offer(
        st,
        `¡Listo! ✅ Quedaste agendado/a:\n• ${r.servicio}\n• ${cap(r.texto)} con ${r.profesional}\n• ${c.direccion}\n\n${c.politica_cancelacion}`,
        [{ id: 'mis_horas', title: 'Ver mis horas' }, back],
      )
    } catch (e) {
      if (e instanceof AgendaError) return askTime(st, 'Uy, esa hora se acaba de ocupar. ')
      throw e
    }
  }

  function myAppointments(st: State, contacto: string, intro = ''): Reply {
    const list = o.agenda.mine(contacto)
    if (!list.length) {
      st.paso = 'menu'
      return offer(st, `${intro}No tienes horas agendadas desde este número.`, [{ id: 'agendar', title: 'Agendar una hora' }, back])
    }
    st.paso = 'mis_horas'
    const lines = list.map((x) => `• #${x.id} ${x.servicio}: ${cap(x.texto)} con ${x.profesional}`).join('\n')
    return offer(st, `${intro}Tus próximas horas:\n${lines}\n\n¿Quieres cancelar alguna?`, [
      ...list.slice(0, 8).map((x) => ({ id: `cancelar:${x.id}`, title: `Cancelar #${x.id}`, description: `${x.servicio}, ${x.texto}`.slice(0, 72) })),
      back,
    ])
  }

  function prices(st: State): Reply {
    st.paso = 'menu'
    const lines = c.servicios.map((s) => `• ${s.corto}: ${clp(s.precio)}${s.nota ? ` (${s.nota.replace(/\.$/, '')})` : ''}`).join('\n')
    return offer(st, `Nuestros valores:\n${lines}\n\n${c.pagos}`, [{ id: 'agendar', title: 'Agendar una hora' }, back])
  }

  function info(st: State): Reply {
    st.paso = 'menu'
    const faq = c.preguntas_frecuentes.map((f) => `• ${f.p} ${f.r}`).join('\n')
    return offer(
      st,
      `📍 ${c.direccion}${c.referencia ? ` (${c.referencia})` : ''}\n🕘 ${c.horario_texto}\n📞 ${c.telefono_recepcion}\n\n${faq}`,
      [{ id: 'agendar', title: 'Agendar una hora' }, back],
    )
  }

  async function handoff(st: State, contacto: string, motivo: string): Promise<Reply> {
    st.paso = 'menu'
    st.ofrecidas = []
    o.db.saveConversation({ contacto, mensajes: '[]', estado: 'humano', motivo_derivacion: motivo, actualizada: Date.now(), mensajes_hoy: 0, dia: now().slice(0, 10) })
    await o.onHandoff?.(contacto, motivo)
    return { text: `Listo, le aviso a recepción y te responderán por aquí a la brevedad 🙏 Si es urgente, llama al ${c.telefono_recepcion}.`, handoff: true }
  }

  function startBooking(st: State, s?: Service, intro = ''): Reply {
    st.servicio = s?.id
    st.dia = st.inicio = st.profesional = undefined
    if (!s) return askService(st)
    return askDay(st, intro)
  }

  /* ---------- lógica ---------- */

  function offer(st: State, text: string, options: Option[]): Reply {
    st.ofrecidas = options
    return { text, handoff: false, options }
  }

  /** Interpreta lo que respondió el paciente respecto de las opciones ofrecidas: id, número o texto del título. */
  function pick(st: State, t: string, optionId?: string): Option | undefined {
    if (optionId) return st.ofrecidas.find((x) => x.id === optionId)
    const n = Number(t)
    if (Number.isInteger(n) && n >= 1 && n <= st.ofrecidas.length) return st.ofrecidas[n - 1]
    return st.ofrecidas.find((x) => norm(x.title) === t) ?? st.ofrecidas.find((x) => t.length >= 4 && norm(x.title).includes(t))
  }

  async function handle(st: State, contacto: string, raw: string, optionId: string | undefined, fresh: boolean): Promise<Reply> {
    const t = norm(raw)
    const opt = pick(st, t, optionId)
    const id = opt?.id

    // Opciones que funcionan en cualquier paso
    if (id === 'menu') return menu(st, false)
    if (id === 'humano') return handoff(st, contacto, 'El paciente pidió hablar con recepción.')
    if (id === 'agendar') return startBooking(st)
    if (id === 'precios') return prices(st)
    if (id === 'info') return info(st)
    if (id === 'mis_horas') return myAppointments(st, contacto)

    switch (st.paso) {
      case 'servicio':
        if (id?.startsWith('srv:')) return startBooking(st, service(id.slice(4)))
        break
      case 'dia':
        if (id?.startsWith('dia:')) { st.dia = id.slice(4); return askTime(st) }
        break
      case 'hora':
        if (id === 'otro_dia') return askDay(st)
        if (id?.startsWith('hora:')) {
          const [inicio, prof] = id.slice(5).split('|')
          st.inicio = inicio
          st.profesional = prof
          return st.nombre ? askConfirm(st) : askName(st)
        }
        break
      case 'nombre': {
        if (has(t, W.menu)) return menu(st, false)
        const name = raw.trim().replace(/\s+/g, ' ')
        if (/^[\p{L}][\p{L}'. -]{2,79}$/u.test(name) && name.includes(' ')) {
          st.nombre = name
            .toLocaleLowerCase('es-CL')
            .split(/([ -])/)
            .map((w) => w.charAt(0).toLocaleUpperCase('es-CL') + w.slice(1))
            .join('')
          return askConfirm(st)
        }
        return { text: 'Para agendar necesito tu nombre y apellido (por ejemplo: Ana Pérez).', handoff: false }
      }
      case 'confirmar':
        if (id === 'si' || (!opt && has(t, W.si) && !has(t, W.no))) return book(st, contacto)
        if (id === 'no') return askTime(st)
        break
      case 'mis_horas':
        if (id?.startsWith('cancelar:')) {
          st.cancelarId = Number(id.slice(9))
          st.paso = 'confirmar_cancelar'
          return offer(st, `¿Seguro que quieres cancelar la hora #${st.cancelarId}?`, [
            { id: 'si_cancelar', title: 'Sí, cancelar' },
            { id: 'no_cancelar', title: 'No, mantenerla' },
          ])
        }
        break
      case 'confirmar_cancelar':
        if (id === 'si_cancelar' || (!opt && t === 'si')) {
          try {
            o.agenda.cancel(st.cancelarId!, contacto)
            return myAppointments(st, contacto, 'Hora cancelada ✅\n\n')
          } catch (e) {
            if (e instanceof AgendaError) return myAppointments(st, contacto, 'No encontré esa hora. ')
            throw e
          }
        }
        if (id === 'no_cancelar') return menu(st, false)
        break
    }

    // Texto libre: palabras clave
    if (has(t, W.menu)) return menu(st, false)
    if (has(t, W.humano)) return handoff(st, contacto, `Pidió hablar con recepción: "${raw.slice(0, 200)}"`)
    const s = detectService(t)
    if (s?.id === 'urgencia') {
      return startBooking(st, s, `Lamento que estés con molestias 😟 Te ofrezco la hora de urgencia más cercana. Si el dolor es muy fuerte, hay hinchazón o sangrado que no para, llama ahora al ${c.telefono_urgencias}. Ante una emergencia grave, llama al 131 (SAMU).\n\n`)
    }
    if (has(t, W.cancelar)) return myAppointments(st, contacto)
    if (s && (has(t, W.agendar) || st.paso === 'menu' || st.paso === 'servicio')) {
      return has(t, W.precios) && !has(t, W.agendar)
        ? offer(st, `${s.corto}: ${clp(s.precio)} (${s.duracion} min).${s.nota ? ` ${s.nota}` : ''}`, [{ id: 'agendar', title: 'Agendar una hora' }, back])
        : startBooking(st, s)
    }
    if (has(t, W.precios)) return prices(st)
    if (has(t, W.info)) return info(st)
    if (has(t, W.agendar)) return startBooking(st)

    if (fresh || st.paso === 'menu') return menu(st, true)
    // No entendí: repetir las opciones del paso actual
    return {
      text: 'No te entendí bien 🙈 Elige una de las opciones o escribe *menú* para volver al inicio.',
      handoff: false,
      options: st.ofrecidas.length ? st.ofrecidas : menuOptions,
    }
  }

  async function reply(contacto: string, text: string, optionId?: string): Promise<Reply> {
    if (o.db.getConversation(contacto)?.estado === 'humano') return { text: null, handoff: true }

    const today = now().slice(0, 10)
    const cnt = counts.get(contacto)
    const n = cnt && cnt.dia === today ? cnt.n + 1 : 1
    counts.set(contacto, { dia: today, n })
    if (n > dailyLimit) return { text: `Por hoy no puedo seguir respondiendo por aquí. Llama a recepción al ${c.telefono_recepcion}.`, handoff: false }

    const saved = o.db.getScriptState(contacto)
    const fresh = !saved || Date.now() - saved.actualizada > sessionMs
    const st: State = fresh ? { paso: 'menu', ofrecidas: [] } : (saved.estado as State)
    const r = await handle(st, contacto, text.slice(0, 500), optionId, fresh)
    o.db.saveScriptState(contacto, st)
    return r
  }

  return { reply }
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** Las filas de las listas de WhatsApp admiten 24 caracteres: "Miércoles 11 de noviembre" → "Miércoles 11 de nov.". */
const shortDay = (s: string) => (s.length <= 24 ? s : s.replace(/ de (\p{L}{3})\p{L}+$/u, ' de $1.')).slice(0, 24)
