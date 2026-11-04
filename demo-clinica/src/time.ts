// Fechas y horas en la zona de la clínica (America/Santiago).
// Todo se maneja como texto local "YYYY-MM-DD" y "YYYY-MM-DDTHH:mm": la clínica tiene una sola
// zona horaria, así que comparar strings es suficiente y evita errores de cambio de hora.

export const TZ = 'America/Santiago'

const partsFmt = new Intl.DateTimeFormat('en-CA', {
  timeZone: TZ,
  year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', hour12: false,
})

/** Fecha y hora actuales en Santiago como "YYYY-MM-DDTHH:mm". */
export function nowLocal(date = new Date()): string {
  const p = Object.fromEntries(partsFmt.formatToParts(date).map((x) => [x.type, x.value]))
  const hour = p.hour === '24' ? '00' : p.hour
  return `${p.year}-${p.month}-${p.day}T${hour}:${p.minute}`
}

/** Suma minutos a un "YYYY-MM-DDTHH:mm" (aritmética de calendario, sin zona horaria). */
export function addMinutes(local: string, minutes: number): string {
  const d = new Date(`${local}:00Z`)
  d.setUTCMinutes(d.getUTCMinutes() + minutes)
  return d.toISOString().slice(0, 16)
}

export function addDays(day: string, days: number): string {
  return addMinutes(`${day}T00:00`, days * 24 * 60).slice(0, 10)
}

/** Día de la semana ISO: 1 = lunes … 7 = domingo. */
export function weekday(day: string): number {
  const w = new Date(`${day}T00:00:00Z`).getUTCDay()
  return w === 0 ? 7 : w
}

const DIAS = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo']
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

/** "2026-11-05T16:00" → "jueves 5 de noviembre, 16:00" */
export function describe(local: string): string {
  const [day, time] = local.split('T')
  const [, m, d] = day.split('-').map(Number)
  const base = `${DIAS[weekday(day) - 1]} ${d} de ${MESES[m - 1]}`
  return time ? `${base}, ${time}` : base
}

export const isDay = (s: unknown): s is string => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s)
export const isLocal = (s: unknown): s is string => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(s)
