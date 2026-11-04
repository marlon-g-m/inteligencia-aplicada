import type { Clinic } from './clinic.ts'
import type { DB } from './db.ts'
import { addDays, addMinutes, describe, isDay, isLocal, nowLocal, weekday } from './time.ts'

export interface Slot { inicio: string; profesional_id: string; profesional: string; texto: string }

export class AgendaError extends Error {}

export function createAgenda(clinic: Clinic, db: DB, now: () => string = () => nowLocal()) {
  const service = (id: string) => clinic.servicios.find((s) => s.id === id)
  const professional = (id: string) => clinic.profesionales.find((p) => p.id === id)

  /** Primer instante reservable, respetando la anticipación mínima. */
  const earliest = () => addMinutes(now(), clinic.anticipacion_minima_horas * 60)

  /** ¿El bloque [inicio, inicio+duración) cae completo dentro del horario de atención? */
  function withinHours(inicio: string, duracion: number): boolean {
    const day = inicio.slice(0, 10)
    if (clinic.feriados.includes(day)) return false
    const fin = addMinutes(inicio, duracion)
    if (fin.slice(0, 10) !== day) return false
    const t0 = inicio.slice(11), t1 = fin.slice(11)
    return (clinic.horario[String(weekday(day))] ?? []).some(([a, b]) => t0 >= a && t1 <= b)
  }

  function freeSlots(opts: { servicio: string; desde?: string; hasta?: string; profesional?: string; max?: number }): Slot[] {
    const s = service(opts.servicio)
    if (!s) throw new AgendaError(`Servicio desconocido: ${opts.servicio}. Usa uno de: ${clinic.servicios.map((x) => x.id).join(', ')}`)
    const pros = clinic.profesionales.filter((p) => p.servicios.includes(s.id) && (!opts.profesional || p.id === opts.profesional))
    if (pros.length === 0) throw new AgendaError('Ningún profesional realiza ese servicio con los filtros indicados.')

    const today = now().slice(0, 10)
    const limit = addDays(today, clinic.dias_maximos_agenda)
    const from = isDay(opts.desde) && opts.desde > today ? opts.desde : today
    let to = isDay(opts.hasta) ? opts.hasta : addDays(from, 6)
    if (to > limit) to = limit
    const max = Math.min(opts.max ?? 8, 15)
    const minStart = earliest()

    const out: Slot[] = []
    for (let day = from; day <= to && out.length < 400; day = addDays(day, 1)) {
      if (clinic.feriados.includes(day)) continue
      const busy = db.appointmentsBetween(`${day}T00:00`, `${addDays(day, 1)}T00:00`)
      for (const [a, b] of clinic.horario[String(weekday(day))] ?? []) {
        for (let t = `${day}T${a}`; addMinutes(t, s.duracion) <= `${day}T${b}`; t = addMinutes(t, clinic.intervalo_minutos)) {
          if (t < minStart) continue
          const end = addMinutes(t, s.duracion)
          for (const p of pros) {
            const clash = busy.some((c) => c.profesional === p.id && c.inicio < end && c.fin > t)
            if (!clash) out.push({ inicio: t, profesional_id: p.id, profesional: p.nombre, texto: describe(t) })
          }
        }
      }
    }
    // Repartir las opciones a lo largo de los días en vez de entregar solo la mañana del primero
    return spread(out, max)
  }

  function book(input: { servicio: string; profesional: string; inicio: string; paciente: string; contacto: string }) {
    const s = service(input.servicio)
    const p = professional(input.profesional)
    if (!s) throw new AgendaError('Servicio desconocido.')
    if (!p) throw new AgendaError('Profesional desconocido.')
    if (!p.servicios.includes(s.id)) throw new AgendaError(`${p.nombre} no realiza ${s.nombre}.`)
    if (!isLocal(input.inicio)) throw new AgendaError('La hora debe tener el formato YYYY-MM-DDTHH:mm.')
    const nombre = input.paciente.trim()
    if (nombre.length < 3 || nombre.length > 80) throw new AgendaError('Falta el nombre completo del paciente.')
    if (input.inicio < earliest()) throw new AgendaError(`Solo se puede agendar con ${clinic.anticipacion_minima_horas} horas de anticipación.`)
    if (input.inicio > addDays(now().slice(0, 10), clinic.dias_maximos_agenda) + 'T23:59') throw new AgendaError('Esa fecha está fuera del rango de la agenda.')
    if (!withinHours(input.inicio, s.duracion)) throw new AgendaError('Esa hora está fuera del horario de atención.')
    const fin = addMinutes(input.inicio, s.duracion)
    const id = db.bookIfFree({ servicio: s.id, profesional: p.id, inicio: input.inicio, fin, paciente: nombre, contacto: input.contacto }, now())
    if (id === null) throw new AgendaError('Esa hora se acaba de ocupar. Busca otra con buscar_horarios.')
    return { id, servicio: s.nombre, profesional: p.nombre, inicio: input.inicio, texto: describe(input.inicio), direccion: clinic.direccion }
  }

  function mine(contacto: string) {
    return db.upcomingFor(contacto, now()).map((c) => ({
      id: c.id,
      servicio: service(c.servicio)?.nombre ?? c.servicio,
      profesional: professional(c.profesional)?.nombre ?? c.profesional,
      inicio: c.inicio,
      texto: describe(c.inicio),
    }))
  }

  function cancel(id: number, contacto: string) {
    if (!db.cancel(id, contacto)) throw new AgendaError('No encontré esa hora a nombre de este contacto.')
    return { ok: true, id }
  }

  return { freeSlots, book, mine, cancel }
}

export type Agenda = ReturnType<typeof createAgenda>

function spread<T>(items: T[], max: number): T[] {
  if (items.length <= max) return items
  const step = items.length / max
  return Array.from({ length: max }, (_, i) => items[Math.floor(i * step)])
}
