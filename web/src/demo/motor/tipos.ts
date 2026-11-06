// Tipos que el motor del demo usa de demo-clinica (assistant.ts, clinic.ts y db.ts), sin sus
// dependencias de Node. Este archivo sí se edita a mano: si cambian allá, actualízalo aquí.

export interface Option { id: string; title: string; description?: string }

export interface Reply {
  text: string | null
  handoff: boolean
  options?: Option[]
}

export interface Service { id: string; nombre: string; corto: string; palabras: string[]; duracion: number; precio: number; nota?: string }
export interface Professional { id: string; nombre: string; especialidad: string; servicios: string[] }
export interface Clinic {
  nombre: string
  asistente: string
  direccion: string
  referencia?: string
  telefono_recepcion: string
  telefono_urgencias: string
  horario_texto: string
  horario: Record<string, [string, string][]>
  feriados: string[]
  intervalo_minutos: number
  anticipacion_minima_horas: number
  dias_maximos_agenda: number
  profesionales: Professional[]
  servicios: Service[]
  pagos: string
  politica_cancelacion: string
  preguntas_frecuentes: { p: string; r: string }[]
}

export interface Appointment {
  id: number
  servicio: string
  profesional: string
  inicio: string
  fin: string
  paciente: string
  contacto: string
  estado: 'confirmada' | 'cancelada'
  creada: string
}

export interface Conversation {
  contacto: string
  mensajes: string
  estado: 'bot' | 'humano'
  motivo_derivacion: string | null
  actualizada: number
  mensajes_hoy: number
  dia: string
}

/** Lo que el modo guiado y la agenda necesitan de la base de datos. */
export interface DB {
  appointmentsBetween(desde: string, hasta: string): Appointment[]
  bookIfFree(a: Omit<Appointment, 'id' | 'estado' | 'creada'>, creada: string): number | null
  upcomingFor(contacto: string, desde: string): Appointment[]
  cancel(id: number, contacto: string): boolean
  getConversation(contacto: string): Conversation | null
  saveConversation(c: Conversation): void
  getScriptState(contacto: string): { estado: unknown; actualizada: number } | null
  saveScriptState(contacto: string, estado: unknown, actualizada?: number): void
}
