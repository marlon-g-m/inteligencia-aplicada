import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { CalendarCheck, Clock, Headset, RotateCcw, SendHorizontal, Sparkles } from 'lucide-react'
import { PrimaryButton, SectionBadge, WHATSAPP } from '../components/ui'
import { clinica, crearAsistente } from '../demo/crear'
import type { Option, Reply } from '../demo/motor/tipos'

type Item =
  | { kind: 'msg'; id: number; from: 'bot' | 'me'; text: string; time: string; options?: Option[] }
  | { kind: 'note'; id: number; text: string; reset?: boolean }

type NewItem = Item extends infer T ? (T extends Item ? Omit<T, 'id'> : never) : never

const SUGERENCIAS = ['Me duele mucho una muela', '¿Cuánto sale un blanqueamiento?', 'Quiero hora para una limpieza']
const PUNTOS = [
  { icon: CalendarCheck, t: 'Agenda, revisa y cancela horas', d: 'Con la agenda real de la clínica: respeta horarios, colación, feriados y evita dobles reservas.' },
  { icon: Clock, t: 'Atiende a cualquier hora', d: 'Responde precios, dirección y preguntas frecuentes en segundos, también de noche y el fin de semana.' },
  { icon: Headset, t: 'Deriva a recepción', d: 'Si el paciente pide una persona o tiene un reclamo, avisa al equipo y se hace a un lado.' },
]
const CTA = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent('Hola, probé el asistente de la web y quiero uno para mi clínica.')}`

const hhmm = () => new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Santiago' })
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** *negrita* como en WhatsApp, sin interpretar HTML. */
function Rich({ text }: { text: string }) {
  return <>{text.split(/\*([^*\n]+)\*/).map((part, i) => (i % 2 ? <strong key={i}>{part}</strong> : part))}</>
}

export default function Demo() {
  const bot = useRef<ReturnType<typeof crearAsistente> | null>(null)
  const contacto = useRef(1)
  const nextId = useRef(0)
  const log = useRef<HTMLDivElement>(null)
  const [items, setItems] = useState<Item[]>([])
  const [typing, setTyping] = useState(false)
  const [text, setText] = useState('')
  const [started, setStarted] = useState(false)

  const push = (...more: NewItem[]) =>
    setItems((xs) => [...xs, ...more.map((m) => ({ ...m, id: nextId.current++ }) as Item)])

  const show = (r: Reply) => {
    if (r.text) push({ kind: 'msg', from: 'bot', text: r.text, time: hhmm(), options: r.options })
    if (r.handoff) {
      push({ kind: 'note', text: 'En el servicio real, aquí te responde una persona de recepción y el asistente deja de contestar.', reset: true })
    }
  }

  const reset = async () => {
    bot.current ??= crearAsistente()
    const run = ++contacto.current
    setItems([])
    setTyping(false)
    setStarted(false)
    const r = await bot.current.reply(`web:${run}`, 'hola')
    if (run === contacto.current) show(r)
  }

  // Saludo inicial con el menú, como cuando un paciente escribe "hola"
  useEffect(() => { void reset() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Bajar dentro del chat (no la página) cuando llega un mensaje
  useEffect(() => {
    const el = log.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: reduced() ? 'auto' : 'smooth' })
  }, [items, typing])

  async function send(value: string, optionId?: string) {
    const v = value.trim()
    if (!v || typing || !bot.current) return
    setStarted(true)
    setText('')
    push({ kind: 'msg', from: 'me', text: v, time: hhmm() })
    setTyping(true)
    const run = contacto.current
    const [r] = await Promise.all([
      bot.current.reply(`web:${contacto.current}`, v, optionId),
      new Promise((ok) => setTimeout(ok, reduced() ? 150 : 650)),
    ])
    if (run !== contacto.current) return
    setTyping(false)
    if (r.text === null) push({ kind: 'note', text: 'La conversación está con recepción. Toca "Reiniciar" para volver a probar.' })
    else show(r)
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    void send(text)
  }

  const lastBot = [...items].reverse().find((x) => x.kind === 'msg' && x.from === 'bot')?.id

  return (
    <section id="demo" className="bg-[#EEF1FF] pb-16 pt-16 sm:pb-20 sm:pt-20 lg:pb-28 lg:pt-28">
      <div className="mx-auto max-w-[1440px]">
        <SectionBadge n={4} label="Pruébalo ahora" border="border-[#2A44EE]/20" />

        <div className="grid items-start gap-10 px-5 sm:px-8 lg:grid-cols-[1fr_440px] lg:gap-16 lg:px-12 xl:grid-cols-[1fr_460px]">
          <div className="lg:pt-4">
            <h2 className="mb-5 text-[clamp(1.75rem,7vw,4.2rem)] font-medium leading-[1.08] tracking-[-0.03em] text-gray-900 sm:text-[clamp(2.5rem,5vw,4.2rem)]">
              Conversa con un asistente de WhatsApp
            </h2>
            <p className="mb-8 max-w-[560px] text-[15px] leading-relaxed text-gray-600 sm:text-[17px]">
              Haz de cuenta que eres paciente de {clinica.nombre}, una clínica dental de ejemplo. Pide una hora, pregunta un precio o cancela: así atiende el asistente que instalamos en el WhatsApp de tu negocio.
            </p>
            <ul className="mb-8 grid max-w-[560px] gap-5">
              {PUNTOS.map(({ icon: Icon, t, d }) => (
                <li key={t} className="flex gap-4">
                  <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-white text-[#2A44EE] shadow-sm">
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-[15px] font-medium text-gray-900 sm:text-[16px]">{t}</p>
                    <p className="text-[14px] leading-relaxed text-gray-600 sm:text-[15px]">{d}</p>
                  </div>
                </li>
              ))}
            </ul>
            <PrimaryButton href={CTA}>Quiero uno para mi negocio</PrimaryButton>
            <p className="mt-6 flex max-w-[560px] gap-2 text-[13px] leading-relaxed text-gray-500">
              <Sparkles size={15} className="mt-0.5 flex-none text-[#2A44EE]" aria-hidden="true" />
              <span>
                Este demo usa el modo guiado, con botones. La versión con inteligencia artificial entiende conversaciones libres y usa la misma agenda. Todo queda en tu navegador: no se guarda ni se envía nada.
              </span>
            </p>
          </div>

          {/* Teléfono */}
          <div className="mx-auto flex h-[620px] w-full max-w-[440px] flex-col overflow-hidden rounded-[28px] bg-[#EFEAE2] shadow-[0_24px_60px_rgb(11_31_58/0.16)] ring-1 ring-black/5 sm:h-[680px] xl:max-w-[460px]">
            <div className="flex items-center gap-3 bg-[#0B1F3A] px-4 py-3.5 text-white">
              <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-white text-[13px] font-bold text-[#0B1F3A]" aria-hidden="true">SS</span>
              <div className="min-w-0">
                <p className="truncate text-[15px] font-medium">{clinica.nombre}</p>
                <p className="text-[12px] text-white/70">{typing ? 'escribiendo…' : `${clinica.asistente}, asistente virtual · en línea`}</p>
              </div>
              <button
                type="button"
                onClick={() => void reset()}
                className="ml-auto flex flex-none items-center gap-1.5 rounded-full bg-white/10 px-3 py-2 text-[12px] font-medium transition-colors hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
              >
                <RotateCcw size={13} aria-hidden="true" /> Reiniciar
              </button>
            </div>

            <div ref={log} role="log" aria-live="polite" aria-label="Conversación con el asistente" className="flex flex-1 flex-col gap-1.5 overflow-y-auto overscroll-contain px-3 py-4">
              <p className="mx-auto mb-2 max-w-[90%] rounded-lg bg-[#FFF3C4] px-3 py-1.5 text-center text-[12px] text-[#54430B]">
                Clínica ficticia. No escribas datos reales.
              </p>
              {items.map((it) =>
                it.kind === 'note' ? (
                  <div key={it.id} className="bubble mx-auto my-1 max-w-[90%] rounded-lg bg-[#FFF3C4] px-3 py-2 text-center text-[13px] text-[#54430B]">
                    {it.text}
                    {it.reset && (
                      <button type="button" onClick={() => void reset()} className="mt-1.5 block w-full font-medium text-[#2A44EE] underline-offset-2 hover:underline">
                        Volver a empezar
                      </button>
                    )}
                  </div>
                ) : (
                  <div key={it.id} className={`bubble flex flex-col gap-1 ${it.from === 'me' ? 'items-end' : 'items-start'}`}>
                    <p
                      className={`max-w-[85%] whitespace-pre-wrap break-words rounded-[10px] px-3 pb-1.5 pt-2 text-[15px] leading-snug text-[#111B21] shadow-[0_1px_1px_rgb(0_0_0/0.08)] ${
                        it.from === 'me' ? 'rounded-tr-sm bg-[#D9FDD3]' : 'rounded-tl-sm bg-white'
                      }`}
                    >
                      <Rich text={it.text} />
                      <time className="mt-0.5 block text-right text-[11px] text-[#667781]">{it.time}</time>
                    </p>
                    {it.options && it.options.length > 0 && (
                      <div className={`grid w-full max-w-[85%] gap-1 ${it.options.length > 4 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                        {it.options.map((o) => (
                          <button
                            key={o.id}
                            type="button"
                            disabled={it.id !== lastBot || typing}
                            onClick={() => void send(o.title, o.id)}
                            className="rounded-[10px] bg-white px-2.5 py-2 text-center text-[14px] leading-tight text-[#027EB5] shadow-[0_1px_1px_rgb(0_0_0/0.08)] transition-colors hover:bg-[#F7F8FA] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2A44EE] disabled:cursor-default disabled:opacity-50 disabled:hover:bg-white"
                          >
                            {o.title}
                            {o.description && <small className="mt-0.5 block text-[12px] text-[#667781]">{o.description}</small>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ),
              )}
              {typing && (
                <div className="typing flex w-fit gap-1 rounded-[10px] rounded-tl-sm bg-white px-3.5 py-3" aria-hidden="true">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#667781]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-[#667781]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-[#667781]" />
                </div>
              )}
            </div>

            {!started && (
              <div className="flex gap-1.5 overflow-x-auto px-3 pb-2 [scrollbar-width:none]">
                {SUGERENCIAS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => void send(s)}
                    className="flex-none rounded-full border border-[#0B1F3A]/15 bg-white px-3 py-1.5 text-[13px] text-[#0B1F3A] transition-colors hover:bg-[#F7F8FA]"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <form onSubmit={onSubmit} className="flex gap-2 bg-[#F0F2F5] p-2.5">
              <label htmlFor="demo-mensaje" className="sr-only">Mensaje</label>
              <input
                id="demo-mensaje"
                value={text}
                onChange={(e) => setText(e.target.value)}
                autoComplete="off"
                maxLength={500}
                placeholder="Escribe un mensaje"
                className="min-w-0 flex-1 rounded-full bg-white px-4 py-3 text-[16px] text-[#111B21] outline-none placeholder:text-[#667781] focus-visible:ring-2 focus-visible:ring-[#2A44EE]"
              />
              <button
                type="submit"
                disabled={!text.trim() || typing}
                aria-label="Enviar"
                className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-[#2A44EE] text-white transition-colors hover:bg-[#1F35C9] disabled:opacity-50"
              >
                <SendHorizontal size={20} aria-hidden="true" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
