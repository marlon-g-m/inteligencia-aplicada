// Base de datos en memoria para el demo del sitio: vive solo en la pestaña del visitante y
// no envía nada a ningún servidor. Imita lo que hace SQLite en demo-clinica/src/db.ts.

import type { Appointment, Conversation, DB } from './motor/tipos.ts'

/** `ocupadas`: horas ya tomadas por otros pacientes ficticios, para que la agenda no se vea vacía. */
export function memoryDb(ocupadas: { inicio: string; fin: string; profesional: string }[] = []): DB {
  let nextId = 1
  const citas: Appointment[] = ocupadas.map((o) => ({ ...o, id: 0, servicio: 'evaluacion', paciente: 'Paciente', contacto: 'otro', estado: 'confirmada', creada: o.inicio }))
  const convs = new Map<string, Conversation>()
  const guion = new Map<string, { estado: unknown; actualizada: number }>()
  const activas = () => citas.filter((c) => c.estado === 'confirmada')

  return {
    appointmentsBetween: (desde, hasta) => activas().filter((c) => c.inicio >= desde && c.inicio < hasta),
    bookIfFree(a, creada) {
      if (activas().some((c) => c.profesional === a.profesional && c.inicio < a.fin && c.fin > a.inicio)) return null
      const id = nextId++
      citas.push({ ...a, id, estado: 'confirmada', creada })
      return id
    },
    upcomingFor: (contacto, desde) =>
      activas().filter((c) => c.contacto === contacto && c.inicio >= desde).sort((x, y) => x.inicio.localeCompare(y.inicio)),
    cancel(id, contacto) {
      const c = citas.find((x) => x.id === id && x.contacto === contacto && x.estado === 'confirmada')
      if (c) c.estado = 'cancelada'
      return !!c
    },
    getConversation: (contacto) => convs.get(contacto) ?? null,
    saveConversation: (c) => void convs.set(c.contacto, c),
    getScriptState: (contacto) => {
      const s = guion.get(contacto)
      return s ? { estado: structuredClone(s.estado), actualizada: s.actualizada } : null
    },
    saveScriptState: (contacto, estado, actualizada = Date.now()) => void guion.set(contacto, { estado: structuredClone(estado), actualizada }),
  }
}

/** Elige al azar, con semilla fija, cuáles bloques aparecen ocupados. */
export function pickBusy<T>(bloques: T[], share = 0.45): T[] {
  let seed = 20261105
  const rand = () => (seed = (seed * 1103515245 + 12345) % 2 ** 31) / 2 ** 31
  return bloques.filter(() => rand() < share)
}
