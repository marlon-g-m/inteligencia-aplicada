import Anthropic from '@anthropic-ai/sdk'
import type {
  BetaMessage,
  BetaMessageParam,
  BetaTool,
  BetaToolResultBlockParam,
  BetaToolUseBlock,
  MessageCreateParamsNonStreaming,
} from '@anthropic-ai/sdk/resources/beta/messages/messages'
import { AgendaError, type Agenda } from './agenda.ts'
import { buildSystemPrompt, type Clinic } from './clinic.ts'
import type { DB } from './db.ts'
import { describe, isDay, isLocal, nowLocal } from './time.ts'

/** Solo lo que el asistente necesita del cliente de Anthropic (permite pruebas sin red). */
export interface MessagesApi {
  create(params: MessageCreateParamsNonStreaming): Promise<BetaMessage>
}

export interface AssistantOptions {
  clinic: Clinic
  agenda: Agenda
  db: DB
  api: MessagesApi
  model: string
  /** Horas sin actividad tras las cuales la conversación parte de cero. */
  sessionHours?: number
  /** Tope de mensajes por contacto al día (control de costo y abuso). */
  dailyLimit?: number
  now?: () => string
  onHandoff?: (contacto: string, motivo: string) => void | Promise<void>
}

export interface Reply {
  text: string | null // null: la conversación está en manos de una persona y el bot no responde
  handoff: boolean
}

const MAX_TOOL_ROUNDS = 6

const TOOLS: BetaTool[] = [
  {
    name: 'buscar_horarios',
    description:
      'Busca horas disponibles reales en la agenda para un servicio. Úsala siempre antes de ofrecer horas. Devuelve una lista de opciones con fecha, hora y profesional.',
    input_schema: {
      type: 'object',
      properties: {
        servicio: { type: 'string', description: 'id del servicio (por ejemplo "limpieza")' },
        desde: { type: 'string', description: 'Fecha inicial YYYY-MM-DD. Opcional; por defecto hoy.' },
        hasta: { type: 'string', description: 'Fecha final YYYY-MM-DD. Opcional; por defecto 6 días después de "desde".' },
        profesional: { type: 'string', description: 'id del profesional, si el paciente tiene preferencia. Opcional.' },
      },
      required: ['servicio'],
      additionalProperties: false,
    },
  },
  {
    name: 'agendar_hora',
    description:
      'Reserva una hora. Úsala solo después de que el paciente confirme servicio, día, hora, profesional y su nombre. La hora debe venir de buscar_horarios.',
    input_schema: {
      type: 'object',
      properties: {
        servicio: { type: 'string', description: 'id del servicio' },
        profesional: { type: 'string', description: 'id del profesional (profesional_id de buscar_horarios)' },
        inicio: { type: 'string', description: 'Inicio en formato YYYY-MM-DDTHH:mm (hora de Santiago)' },
        paciente: { type: 'string', description: 'Nombre completo del paciente' },
      },
      required: ['servicio', 'profesional', 'inicio', 'paciente'],
      additionalProperties: false,
    },
  },
  {
    name: 'mis_horas',
    description: 'Lista las próximas horas confirmadas de este paciente (identificado por su número).',
    input_schema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'cancelar_hora',
    description: 'Cancela una hora del paciente. Úsala solo después de que confirme cuál quiere cancelar.',
    input_schema: {
      type: 'object',
      properties: { id: { type: 'integer', description: 'id de la hora, obtenido con mis_horas' } },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'derivar_a_humano',
    description:
      'Pasa la conversación a una persona de recepción. Úsala si el paciente lo pide, tiene un reclamo, está molesto o pregunta algo que no puedes resolver.',
    input_schema: {
      type: 'object',
      properties: { motivo: { type: 'string', description: 'Resumen breve para recepción' } },
      required: ['motivo'],
      additionalProperties: false,
    },
  },
]

export function createAssistant(o: AssistantOptions) {
  const now = o.now ?? (() => nowLocal())
  const sessionMs = (o.sessionHours ?? 6) * 3600 * 1000
  const dailyLimit = o.dailyLimit ?? 60
  const system = buildSystemPrompt(o.clinic)

  async function runTool(block: BetaToolUseBlock, contacto: string, state: { handoff: string | null }): Promise<BetaToolResultBlockParam> {
    const input = (block.input ?? {}) as Record<string, unknown>
    const str = (k: string) => (typeof input[k] === 'string' ? (input[k] as string) : undefined)
    try {
      let result: unknown
      switch (block.name) {
        case 'buscar_horarios': {
          const servicio = str('servicio')
          if (!servicio) throw new AgendaError('Falta el servicio.')
          const desde = str('desde'), hasta = str('hasta')
          if (desde && !isDay(desde)) throw new AgendaError('"desde" debe ser YYYY-MM-DD.')
          if (hasta && !isDay(hasta)) throw new AgendaError('"hasta" debe ser YYYY-MM-DD.')
          const horas = o.agenda.freeSlots({ servicio, desde, hasta, profesional: str('profesional') })
          result = horas.length ? { horas } : { horas: [], nota: 'No hay horas en ese rango. Prueba con otras fechas.' }
          break
        }
        case 'agendar_hora': {
          const inicio = str('inicio')
          if (!isLocal(inicio)) throw new AgendaError('"inicio" debe ser YYYY-MM-DDTHH:mm.')
          result = o.agenda.book({
            servicio: str('servicio') ?? '',
            profesional: str('profesional') ?? '',
            inicio,
            paciente: str('paciente') ?? '',
            contacto,
          })
          break
        }
        case 'mis_horas':
          result = { horas: o.agenda.mine(contacto) }
          break
        case 'cancelar_hora': {
          const id = Number(input.id)
          if (!Number.isInteger(id)) throw new AgendaError('Falta el id de la hora.')
          result = o.agenda.cancel(id, contacto)
          break
        }
        case 'derivar_a_humano':
          state.handoff = str('motivo')?.slice(0, 300) || 'El paciente pidió hablar con una persona.'
          result = { ok: true, nota: 'Recepción tomará la conversación. Despídete brevemente y avisa que le responderán.' }
          break
        default:
          throw new AgendaError(`Herramienta desconocida: ${block.name}`)
      }
      return { type: 'tool_result', tool_use_id: block.id, content: JSON.stringify(result) }
    } catch (e) {
      const msg = e instanceof AgendaError ? e.message : 'Error interno al usar la agenda.'
      if (!(e instanceof AgendaError)) console.error('[herramienta]', block.name, e)
      return { type: 'tool_result', tool_use_id: block.id, content: msg, is_error: true }
    }
  }

  async function reply(contacto: string, userText: string): Promise<Reply> {
    const t = Date.now()
    const today = now().slice(0, 10)
    const conv = o.db.getConversation(contacto)

    if (conv?.estado === 'humano') return { text: null, handoff: true }

    const mensajesHoy = conv && conv.dia === today ? conv.mensajes_hoy + 1 : 1
    if (mensajesHoy > dailyLimit) {
      return { text: `Por hoy no puedo seguir respondiendo por aquí. Escríbenos mañana o llama a recepción al ${o.clinic.telefono_recepcion}.`, handoff: false }
    }

    // Conversación nueva si pasó mucho tiempo: se parte de cero en vez de recortar el historial,
    // porque la API exige que el historial solo crezca (no se editan turnos anteriores).
    const fresh = !conv || t - conv.actualizada > sessionMs
    const messages: BetaMessageParam[] = fresh ? [] : (JSON.parse(conv.mensajes) as BetaMessageParam[])

    messages.push({ role: 'user', content: userText.slice(0, 2000) })
    messages.push({
      role: 'system',
      content: `Fecha y hora actual en Santiago: ${describe(now())} (${now()}).`,
    })

    const state = { handoff: null as string | null }
    let text = ''

    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
      const response = await o.api.create({
        model: o.model,
        max_tokens: 16000,
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
        output_config: { effort: 'low' },
        cache_control: { type: 'ephemeral' },
        system,
        tools: TOOLS,
        messages,
      })
      messages.push({ role: 'assistant', content: response.content })

      const said = response.content
        .flatMap((b) => (b.type === 'text' ? [b.text] : []))
        .join('\n')
        .trim()
      if (said) text = said

      if (response.stop_reason === 'refusal') {
        state.handoff = state.handoff ?? 'La IA no pudo responder este mensaje.'
        text = 'Prefiero que esto lo vea una persona de recepción. Te responderán por aquí a la brevedad 🙏'
        break
      }
      if (response.stop_reason === 'pause_turn') continue
      if (response.stop_reason !== 'tool_use') break

      const calls = response.content.filter((b): b is BetaToolUseBlock => b.type === 'tool_use')
      const results = await Promise.all(calls.map((c) => runTool(c, contacto, state)))
      messages.push({ role: 'user', content: results })
    }

    if (!text) text = `Disculpa, tuve un problema para responder. Puedes intentar de nuevo o llamar a recepción al ${o.clinic.telefono_recepcion}.`

    o.db.saveConversation({
      contacto,
      mensajes: JSON.stringify(messages),
      estado: state.handoff ? 'humano' : 'bot',
      motivo_derivacion: state.handoff,
      actualizada: t,
      mensajes_hoy: mensajesHoy,
      dia: today,
    })
    if (state.handoff) await o.onHandoff?.(contacto, state.handoff)

    return { text: text.slice(0, 4000), handoff: Boolean(state.handoff) }
  }

  return { reply }
}

export type Assistant = ReturnType<typeof createAssistant>

/** Cliente real de la API (lee ANTHROPIC_API_KEY del entorno). */
export function anthropicMessagesApi(): MessagesApi {
  const client = new Anthropic()
  return { create: (params) => client.beta.messages.create(params) }
}

/** Mensaje legible para errores de la API, sin exponer detalles al paciente. */
export function describeApiError(e: unknown): string {
  if (e instanceof Anthropic.AuthenticationError) return 'API key de Anthropic inválida o ausente (ANTHROPIC_API_KEY).'
  if (e instanceof Anthropic.RateLimitError) return 'Límite de uso de la API alcanzado; reintentar más tarde.'
  if (e instanceof Anthropic.BadRequestError) return `Solicitud rechazada por la API: ${e.message}`
  if (e instanceof Anthropic.APIError) return `Error de la API (${e.status}): ${e.message}`
  return e instanceof Error ? e.message : String(e)
}
