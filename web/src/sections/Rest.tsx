import { useEffect, useRef, useState } from 'react'
import { CalendarDays, Mail, MapPin, MessageCircle, Phone, Plus } from 'lucide-react'
import { EASE, EMAIL, LogoMark, SectionBadge, WHATSAPP, RollText } from '../components/ui'
import { ArrowRight } from 'lucide-react'

/* ---------------- Rubros: pestañas que avanzan solas ---------------- */

const SECTORS = [
  { id: 'salud', tab: 'Salud', title: 'Clínicas y centros de salud', items: ['Agenda y confirmación de horas por WhatsApp', 'Recordatorios automáticos que bajan las inasistencias', 'Fichas y datos de pacientes protegidos según la ley'] },
  { id: 'inmo', tab: 'Inmobiliarias', title: 'Inmobiliarias y corredoras', items: ['Asistente que responde consultas y agenda visitas', 'Publicación automática en portales', 'Seguimiento de interesados sin perder ninguno'] },
  { id: 'conta', tab: 'Contabilidad', title: 'Estudios contables', items: ['Recepción y orden automático de documentos', 'Recordatorios de vencimientos a clientes', 'Reportes mensuales generados solos'] },
  { id: 'comercio', tab: 'Comercio', title: 'Comercio y distribución', items: ['Cotizaciones automáticas desde tu lista de precios', 'Inventario conectado entre bodega, web y ventas', 'Seguimiento de pedidos para tus clientes'] },
]
const AUTOPLAY_MS = 7000

export function Sectors() {
  const [current, setCurrent] = useState(0)
  const [progress, setProgress] = useState(0)
  const [stopped, setStopped] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const paused = useRef(false)
  const visible = useRef(false)
  const root = useRef<HTMLDivElement>(null)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { visible.current = e.isIntersecting })
    if (root.current) io.observe(root.current)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (stopped) return
    let raf = 0, last = performance.now(), elapsed = 0
    const loop = (now: number) => {
      const dt = now - last
      last = now
      if (!paused.current && visible.current && !document.hidden) {
        elapsed += dt
        if (elapsed >= AUTOPLAY_MS) {
          elapsed = 0
          setCurrent((c) => (c + 1) % SECTORS.length)
        }
        setProgress(elapsed / AUTOPLAY_MS)
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [stopped, current])

  const select = (i: number, focus = false) => {
    setStopped(true)
    setCurrent(i)
    setProgress(0)
    if (focus) tabs.current[i]?.focus()
  }

  return (
    <section id="rubros" className="bg-white pb-16 pt-16 sm:pb-20 sm:pt-20 lg:pb-28 lg:pt-28">
      <div className="mx-auto max-w-[1440px]">
        <SectionBadge n={3} label="Casos de uso por rubro" />
        <h2 className="mb-10 px-5 text-[clamp(1.75rem,7vw,4.2rem)] font-medium leading-[1.08] tracking-[-0.03em] text-gray-900 sm:mb-14 sm:px-8 sm:text-[clamp(2.5rem,5vw,4.2rem)] lg:mb-16 lg:px-12">
          Lo que hacemos por tu rubro
        </h2>

        <div
          ref={root}
          className="grid gap-5 px-5 sm:px-8 lg:grid-cols-[320px_1fr] lg:gap-7 lg:px-12"
          onPointerEnter={() => (paused.current = true)}
          onPointerLeave={() => (paused.current = false)}
          onFocus={() => (paused.current = true)}
          onBlur={() => (paused.current = false)}
        >
          <div role="tablist" aria-label="Rubros" className="grid grid-cols-2 gap-2 lg:grid-cols-1 lg:content-start">
            {SECTORS.map((s, i) => {
              const on = i === current
              return (
                <button
                  key={s.id}
                  ref={(el) => (tabs.current[i] = el)}
                  role="tab"
                  id={`tab-${s.id}`}
                  aria-controls={`panel-${s.id}`}
                  aria-selected={on}
                  tabIndex={on ? 0 : -1}
                  onClick={() => select(i)}
                  onKeyDown={(e) => {
                    const d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key]
                    if (d) { e.preventDefault(); select((current + d + SECTORS.length) % SECTORS.length, true) }
                  }}
                  className={`relative overflow-hidden rounded-2xl px-5 py-4 text-left text-[15px] font-medium transition-colors duration-300 sm:text-[16px] ${on ? 'bg-gray-900 text-white' : 'bg-[#F5F5F5] text-gray-600 hover:text-gray-900'}`}
                >
                  {s.tab}
                  {on && !stopped && (
                    <span className="absolute bottom-0 left-0 h-[3px] w-full origin-left bg-[#7AA2FF]" style={{ transform: `scaleX(${progress})` }} aria-hidden="true" />
                  )}
                </button>
              )
            })}
          </div>

          {SECTORS.map((s, i) => (
            <div
              key={s.id}
              role="tabpanel"
              id={`panel-${s.id}`}
              aria-labelledby={`tab-${s.id}`}
              hidden={i !== current}
              className="rounded-2xl bg-[#F5F5F5] p-7 sm:p-10 lg:p-12"
            >
              <h3 className="bubble text-[clamp(1.4rem,2.4vw,2.2rem)] font-medium tracking-[-0.02em] text-gray-900">{s.title}</h3>
              <ul className="mt-6 grid gap-4 sm:mt-8">
                {s.items.map((it, j) => (
                  <li key={it} className="bubble flex items-baseline gap-3 text-[15px] text-gray-700 sm:text-[17px]" style={{ animationDelay: `${120 + j * 80}ms` }}>
                    <span className="h-2 w-2 shrink-0 -translate-y-0.5 rounded-full bg-[#2A44EE]" aria-hidden="true" />
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------- Proceso ---------------- */

const STEPS = [
  { t: 'Diagnóstico', d: '30 minutos para entender tu operación y detectar dónde se pierde tiempo o plata. Sin costo.' },
  { t: 'Propuesta cerrada', d: 'Alcance, plazos y precio fijo en UF. Sin letra chica.' },
  { t: 'Construcción por etapas', d: 'Avances cada semana para que pruebes y opines. Tu operación sigue funcionando.' },
  { t: 'Acompañamiento', d: 'Capacitamos a tu equipo y nos hacemos cargo del soporte y las mejoras.' },
]

export function Process() {
  return (
    <section id="proceso" className="bg-[#F5F5F5] pb-16 pt-16 sm:pb-20 sm:pt-20 lg:pb-28 lg:pt-28">
      <div className="mx-auto max-w-[1440px]">
        <SectionBadge n={4} label="Cómo trabajamos" border="border-gray-300" />
        <h2 className="mb-10 px-5 text-[clamp(1.75rem,7vw,4.2rem)] font-medium leading-[1.08] tracking-[-0.03em] text-gray-900 sm:mb-14 sm:px-8 sm:text-[clamp(2.5rem,5vw,4.2rem)] lg:mb-16 lg:px-12">
          Cuatro pasos, sin sorpresas
        </h2>
        <ol className="grid grid-cols-1 gap-5 px-5 sm:grid-cols-2 sm:gap-6 sm:px-8 lg:grid-cols-4 lg:gap-7 lg:px-12">
          {STEPS.map((s, i) => (
            <li key={s.t} className="flex flex-col rounded-2xl bg-white p-6 sm:p-7">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-900 text-[12px] font-semibold text-white tabular-nums">{i + 1}</span>
              <h3 className="mt-10 text-[17px] font-semibold text-gray-900 sm:mt-14">{s.t}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-gray-600">{s.d}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

/* ---------------- Preguntas frecuentes ---------------- */

const FAQS = [
  { q: '¿Tengo que cambiar el sistema que ya uso?', a: 'No necesariamente. Primero vemos qué funciona bien y lo conectamos o lo mejoramos. Solo proponemos reemplazar algo cuando ya no da para más, y en ese caso migramos por etapas.' },
  { q: '¿Cuánto cuesta?', a: 'Depende del alcance, pero siempre trabajamos con precio cerrado y en UF. Después del diagnóstico recibes una propuesta con el valor exacto antes de comprometerte.' },
  { q: '¿Cuánto se demora un proyecto?', a: 'Un asistente de WhatsApp o una automatización suelen estar funcionando en 2 a 4 semanas. Una modernización o migración completa se planifica por etapas, con entregas cada semana.' },
  { q: '¿Qué pasa con los datos de mis clientes?', a: 'Se quedan protegidos y bajo tu control. Usamos proveedores con estándares de seguridad reconocidos y diseñamos cada solución pensando en la Ley 21.719.' },
  { q: '¿Y si después necesito cambios?', a: 'Ofrecemos planes de soporte mensual con mantención, ajustes y mejoras. No te dejamos solo con el sistema.' },
]

export function Faq() {
  return (
    <section id="faq" className="bg-white pb-16 pt-16 sm:pb-20 sm:pt-20 lg:pb-28 lg:pt-28">
      <div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-[40%_1fr]">
        <div>
          <SectionBadge n={5} label="Preguntas frecuentes" />
          <h2 className="px-5 text-[clamp(1.5rem,4vw,3.2rem)] font-medium leading-[1.12] tracking-[-0.02em] text-gray-900 sm:px-8 lg:px-12">
            Lo que más<br className="hidden sm:block" /><span className="sm:hidden"> </span>nos preguntan
          </h2>
        </div>
        <div className="divide-y divide-gray-200 border-y border-gray-200 px-5 sm:mx-8 sm:px-0 lg:mx-12 lg:mt-14">
          {FAQS.map((f) => (
            <details key={f.q} className="group py-5 sm:py-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-[15px] font-medium text-gray-900 sm:text-[17px] [&::-webkit-details-marker]:hidden">
                {f.q}
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F5F5F5]">
                  <Plus size={16} className={`transition-transform duration-500 ${EASE} group-open:rotate-45`} aria-hidden="true" />
                </span>
              </summary>
              <p className="mt-3 max-w-[60ch] pr-12 text-[14px] leading-relaxed text-gray-600 sm:text-[15px]">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------- Contacto ---------------- */

export function Contact() {
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const empresa = data.get('empresa') ? ` de ${data.get('empresa')}` : ''
    const dia = String(data.get('dia') ?? '')
    const diaTexto = dia ? new Date(`${dia}T12:00:00`).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' }) : ''
    const agenda = dia ? ` Me gustaría agendar el diagnóstico el ${diaTexto}, en la ${data.get('bloque')}.` : ''
    const mensaje = String(data.get('mensaje') ?? '').trim().replace(/([^.!?])$/, '$1.')
    const text = `Hola, soy ${data.get('nombre')}${empresa}. ${mensaje}${agenda}`
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`, '_blank', 'noopener')
  }
  const today = new Date()
  const minDay = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
  const field = 'w-full rounded-xl border border-gray-200 bg-[#F5F5F5] px-4 py-3 text-[15px] text-gray-900 outline-none transition-colors duration-300 placeholder:text-gray-500 focus:border-[#2A44EE] focus:bg-white'

  return (
    <section id="contacto" className="bg-[#0B1F3A] pb-16 pt-16 text-white sm:pb-20 sm:pt-20 lg:pb-28 lg:pt-28">
      <div className="mx-auto grid max-w-[1440px] gap-12 lg:grid-cols-2">
        <div>
          <SectionBadge n={6} label="Contacto" dark />
          <h2 className="px-5 text-[clamp(1.75rem,7vw,4.2rem)] font-medium leading-[1.08] tracking-[-0.03em] sm:px-8 sm:text-[clamp(2.5rem,5vw,4.2rem)] lg:px-12">
            Conversemos<br className="hidden sm:block" /><span className="sm:hidden"> </span>30 minutos
          </h2>
          <p className="mt-6 max-w-[34ch] px-5 text-[15px] leading-[1.6] text-white/70 sm:px-8 sm:text-[17px] lg:px-12">
            Cuéntanos qué te quita tiempo hoy y te decimos cómo lo resolveríamos. Sin costo y sin compromiso.
          </p>
          <ul className="mt-10 grid gap-4 px-5 text-[14px] sm:px-8 sm:text-[15px] lg:px-12">
            <li className="flex items-center gap-3"><MessageCircle size={18} className="text-[#7AA2FF]" aria-hidden="true" /><a className="hover:underline" href={`https://wa.me/${WHATSAPP}`} rel="noopener">WhatsApp +56 9 7663 0940</a></li>
            <li className="flex items-center gap-3"><Phone size={18} className="text-[#7AA2FF]" aria-hidden="true" /><a className="hover:underline" href={`tel:+${WHATSAPP}`}>Llámanos: +56 9 7663 0940</a></li>
            <li className="flex items-center gap-3"><Mail size={18} className="text-[#7AA2FF]" aria-hidden="true" /><a className="hover:underline" href={`mailto:${EMAIL}`}>{EMAIL}</a></li>
            <li className="flex items-center gap-3 text-white/70"><MapPin size={18} className="text-[#7AA2FF]" aria-hidden="true" />Santiago, Chile · Atendemos en todo el país</li>
          </ul>
        </div>

        <form onSubmit={onSubmit} className="mx-5 grid gap-4 rounded-2xl bg-white p-6 text-gray-900 sm:mx-8 sm:p-8 lg:mx-12 lg:self-end" aria-labelledby="agenda-titulo">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2A44EE]/10 text-[#2A44EE]"><CalendarDays size={18} aria-hidden="true" /></span>
            <div>
              <h3 id="agenda-titulo" className="text-[16px] font-semibold">Agenda tu cita de diagnóstico en línea</h3>
              <p className="text-[13px] text-gray-500">30 minutos por videollamada, sin costo. Te confirmamos por WhatsApp.</p>
            </div>
          </div>
          <label className="grid gap-2 text-[13px] font-medium">Nombre<input name="nombre" autoComplete="name" required className={field} /></label>
          <label className="grid gap-2 text-[13px] font-medium">Empresa<input name="empresa" autoComplete="organization" className={field} /></label>
          <label className="grid gap-2 text-[13px] font-medium">
            ¿Qué te gustaría mejorar?
            <textarea name="mensaje" rows={4} required placeholder="Ej.: respondemos todo por WhatsApp a mano y se nos pierden clientes." className={`${field} resize-y`} />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-[13px] font-medium">Día preferido<input type="date" name="dia" min={minDay} required className={field} /></label>
            <label className="grid gap-2 text-[13px] font-medium">
              Horario
              <select name="bloque" required className={field} defaultValue="mañana (9:00 a 13:00)">
                <option>mañana (9:00 a 13:00)</option>
                <option>tarde (14:00 a 19:00)</option>
              </select>
            </label>
          </div>
          <button type="submit" className="group mt-2 flex w-fit items-center gap-3 rounded-full bg-[#2A44EE] py-2 pl-6 pr-2 text-[14px] font-medium text-white transition-colors duration-300 hover:bg-[#1F35C9]">
            <RollText>Solicitar mi cita</RollText>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
              <ArrowRight size={15} className={`text-[#2A44EE] transition-transform duration-500 ${EASE} group-hover:-rotate-45`} />
            </span>
          </button>
          <p className="text-[12px] text-gray-500">
            Al enviar se abre WhatsApp con tu solicitud lista. Este sitio no guarda tus datos. Más detalles en nuestra{' '}
            <a href="./politica-de-privacidad.html" className="underline hover:text-gray-900">política de privacidad</a>.
          </p>
        </form>
      </div>
    </section>
  )
}

/* ---------------- Pie ---------------- */

export function Footer() {
  return (
    <footer className="bg-[#06101F] py-10 text-white">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
        <a href="#" className="flex items-center gap-3" aria-label="Inteligencia Aplicada, inicio">
          <LogoMark className="w-9 text-white" dot="#4F6BFF" />
          <span className="text-[15px] font-semibold">Inteligencia <span className="text-[#7AA2FF]">Aplicada</span></span>
        </a>
        <div className="flex flex-col gap-2 text-[13px] text-white/60 sm:items-end">
          <a href="./politica-de-privacidad.html" className="hover:text-white hover:underline">Política de privacidad</a>
          <p>© {new Date().getFullYear()} Inteligencia Aplicada · Santiago, Chile</p>
        </div>
      </div>
    </footer>
  )
}
