import { useEffect, useRef, useState } from 'react'
import { Check, FileText, Hammer, LifeBuoy, Search } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { PrimaryButton, Reveal, SectionBadge } from '../components/ui'

const STEPS: { icon: LucideIcon; t: string; time: string; d: string; out: string }[] = [
  { icon: Search, t: 'Diagnóstico', time: '30 min · gratis', d: 'Una videollamada para entender tu operación y detectar dónde se pierde tiempo o plata.', out: 'Oportunidades priorizadas' },
  { icon: FileText, t: 'Propuesta cerrada', time: '2 a 3 días', d: 'Te enviamos alcance, plazos y precio fijo en UF. Sin letra chica.', out: 'Propuesta y plan de trabajo' },
  { icon: Hammer, t: 'Construcción por etapas', time: 'Entregas semanales', d: 'Cada semana ves avances funcionando para probar y opinar. Tu operación no se detiene.', out: 'Software listo y probado' },
  { icon: LifeBuoy, t: 'Acompañamiento', time: 'Plan mensual', d: 'Capacitamos a tu equipo y nos hacemos cargo del soporte, los respaldos y las mejoras.', out: 'Tu equipo usándolo' },
]
const STEP_MS = 3200

export default function Process() {
  const [active, setActive] = useState(0)
  const [reduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const paused = useRef(false)
  const root = useRef<HTMLOListElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.35 })
    if (root.current) io.observe(root.current)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (reduced || !inView) return
    const id = window.setInterval(() => {
      if (!paused.current && !document.hidden) setActive((a) => (a + 1) % STEPS.length)
    }, STEP_MS)
    return () => window.clearInterval(id)
  }, [reduced, inView])

  const shown = reduced ? STEPS.length - 1 : active

  return (
    <section id="proceso" className="overflow-hidden bg-[#F5F5F5] pb-16 pt-16 sm:pb-20 sm:pt-20 lg:pb-28 lg:pt-28">
      <div className="mx-auto max-w-[1440px]">
        <SectionBadge n={4} label="Cómo trabajamos" border="border-gray-300" />
        <Reveal>
          <h2 className="mb-4 px-5 text-[clamp(1.75rem,7vw,4.2rem)] font-medium leading-[1.08] tracking-[-0.03em] text-gray-900 sm:px-8 sm:text-[clamp(2.5rem,5vw,4.2rem)] lg:px-12">
            Cuatro pasos, sin sorpresas
          </h2>
          <p className="mb-10 max-w-[640px] px-5 text-[15px] leading-relaxed text-gray-600 sm:mb-14 sm:px-8 sm:text-[17px] lg:mb-20 lg:px-12">
            Del primer mensaje a tu sistema funcionando. Siempre sabes en qué paso estamos y qué recibes en cada uno.
          </p>
        </Reveal>

        <div className="px-5 sm:px-8 lg:px-12">
          <ol ref={root} className="grid gap-5 lg:grid-cols-4 lg:gap-7">
            {STEPS.map((s, i) => {
              const done = i < shown
              const on = i === shown
              const last = i === STEPS.length - 1
              return (
                <li
                  key={s.t}
                  className="relative grid grid-cols-[56px_1fr] gap-4 sm:gap-5 lg:grid-cols-1 lg:grid-rows-[56px_1fr] lg:gap-6"
                  onPointerEnter={() => { paused.current = true; if (!reduced) setActive(i) }}
                  onPointerLeave={() => { paused.current = false }}
                >
                  {!last && (
                    <span
                      className="absolute left-[26.5px] top-[60px] h-[calc(100%-44px)] w-[3px] overflow-hidden rounded-full bg-gray-200 lg:left-[calc(50%+34px)] lg:top-[26.5px] lg:h-[3px] lg:w-[calc(100%-40px)]"
                      aria-hidden="true"
                    >
                      <span className={`absolute inset-0 origin-top bg-[#2A44EE] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] lg:origin-left ${done ? 'scale-100' : 'scale-y-0 lg:scale-x-0 lg:scale-y-100'}`} />
                      {on && !reduced && inView && <span className="flow-travel absolute rounded-full bg-[#2A44EE]" />}
                    </span>
                  )}
                  <div className="flex justify-center">
                    <span
                      className={`relative z-10 flex h-14 w-14 items-center justify-center rounded-full border-[3px] text-[15px] font-semibold tabular-nums transition-all duration-500 ${
                        on ? 'scale-110 border-[#2A44EE] bg-[#2A44EE] text-white shadow-[0_8px_24px_rgba(42,68,238,0.35)]'
                          : done ? 'border-[#2A44EE] bg-white text-[#2A44EE]'
                          : 'border-gray-200 bg-white text-gray-400'
                      }`}
                    >
                      {done ? <Check size={20} strokeWidth={3} aria-hidden="true" /> : i + 1}
                      {on && !reduced && <span className="absolute inset-0 animate-ping rounded-full bg-[#2A44EE]/25" aria-hidden="true" />}
                    </span>
                  </div>

                  <Reveal delay={i * 110} className="h-full">
                    <div
                      className={`flex h-full flex-col rounded-2xl bg-white p-6 transition-all duration-500 sm:p-7 ${
                        on ? '-translate-y-1 shadow-[0_16px_40px_rgba(11,31,58,0.10)] ring-2 ring-[#2A44EE]' : 'ring-1 ring-black/[0.04]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors duration-500 ${on || done ? 'bg-[#2A44EE]/10 text-[#2A44EE]' : 'bg-gray-100 text-gray-500'}`}>
                          <s.icon size={19} aria-hidden="true" />
                        </span>
                        <span className="rounded-full bg-[#F1F4FF] px-2.5 py-1 text-[12px] font-medium text-[#2A44EE]">{s.time}</span>
                      </div>
                      <p className="mt-6 text-[12px] font-medium uppercase tracking-wider text-gray-400">Paso {i + 1}</p>
                      <h3 className="mt-1 text-[18px] font-semibold text-gray-900">{s.t}</h3>
                      <p className="mt-2 flex-1 text-[14px] leading-relaxed text-gray-600">{s.d}</p>
                      <p className="mt-5 flex items-center gap-2 border-t border-gray-100 pt-4 text-[13px] font-medium text-gray-900">
                        <Check size={15} className={on || done ? 'text-emerald-600' : 'text-gray-300'} aria-hidden="true" />
                        Recibes: {s.out}
                      </p>
                    </div>
                  </Reveal>
                </li>
              )
            })}
          </ol>
        </div>

        <div className="mt-10 px-5 sm:px-8 lg:mt-14 lg:px-12">
          <PrimaryButton href="#contacto">Empezar con el paso 1</PrimaryButton>
        </div>
      </div>
    </section>
  )
}
