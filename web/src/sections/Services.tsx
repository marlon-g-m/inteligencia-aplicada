import { ArrowRight, Bot, Cloud, Globe, RefreshCw, ShieldCheck, Workflow } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { SectionBadge } from '../components/ui'
import { ChatVisual, MigrationVisual } from '../components/visuals'

function LinkIcon({ className = '' }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  )
}

const MORE: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Workflow, title: 'Automatización de procesos', text: 'Cotizaciones, cobranza, reportes y facturación funcionando solos.' },
  { icon: Globe, title: 'Páginas y aplicaciones web', text: 'Sitios rápidos, bien posicionados en Google, y sistemas a medida.' },
  { icon: ShieldCheck, title: 'Datos y Ley 21.719', text: 'Diagnóstico y adecuación a la nueva ley de protección de datos.' },
]

export default function Services() {
  return (
    <section id="servicios" className="bg-[#F5F5F5] pb-16 pt-16 sm:pb-20 sm:pt-20 lg:pb-28 lg:pt-28">
      <div className="mx-auto max-w-[1440px]">
        <SectionBadge n={2} label="Lo que hacemos" border="border-gray-300" />
        <h2 className="mb-10 px-5 text-[clamp(1.75rem,7vw,4.2rem)] font-medium leading-[1.08] tracking-[-0.03em] text-gray-900 sm:mb-14 sm:px-8 sm:text-[clamp(2.5rem,5vw,4.2rem)] lg:mb-16 lg:px-12">
          Nuestros servicios
        </h2>

        <div className="grid grid-cols-1 gap-5 px-5 sm:gap-6 sm:px-8 md:grid-cols-2 lg:gap-7 lg:px-12">
          {/* Tarjeta 1 */}
          <article>
            <a href="#contacto" className="group relative block aspect-[4/5] cursor-pointer sm:aspect-[329/246] overflow-hidden rounded-2xl bg-[#0B1F3A]" aria-label="Asistentes con IA: conversemos">
              <ChatVisual dark bodyClass="pb-16" />
              <span className="absolute bottom-4 left-4 flex h-9 w-9 items-center justify-center gap-2 overflow-hidden rounded-full bg-white text-gray-900 transition-all duration-300 ease-in-out group-hover:w-[148px]">
                <span className="max-w-0 whitespace-nowrap text-[13px] font-medium opacity-0 transition-all delay-100 duration-300 group-hover:max-w-[100px] group-hover:opacity-100">Conversemos</span>
                <LinkIcon className="shrink-0 -rotate-45 transition-transform duration-300 group-hover:rotate-0" />
              </span>
            </a>
            <p className="mt-4 text-[13px] leading-relaxed text-gray-600 sm:text-[14px]">
              Chatbots para WhatsApp y tu web que responden, agendan y cotizan las 24 horas, y derivan a tu equipo cuando hace falta.
            </p>
            <h3 className="mt-1 flex items-center gap-2 text-[14px] font-semibold text-gray-900 sm:text-[15px]">
              <Bot size={16} aria-hidden="true" /> Asistentes con IA
            </h3>
          </article>

          {/* Tarjeta 2 */}
          <article>
            <a href="#contacto" className="group relative block aspect-square cursor-pointer overflow-hidden rounded-2xl bg-[#E3E8F1] md:aspect-[329/246]" aria-label="Modernización y migración a la nube: ver cómo">
              <MigrationVisual />
              <span className="absolute bottom-4 left-4 flex h-9 w-9 items-center justify-center gap-2 overflow-hidden rounded-full bg-gray-900 text-white transition-all duration-300 ease-in-out group-hover:w-[148px]">
                <span className="max-w-0 whitespace-nowrap text-[13px] font-medium opacity-0 transition-all delay-100 duration-300 group-hover:max-w-[110px] group-hover:opacity-100">Ver cómo</span>
                <ArrowRight size={14} className="shrink-0 -rotate-45 transition-transform duration-300 group-hover:rotate-0" aria-hidden="true" />
              </span>
            </a>
            <p className="mt-4 text-[13px] leading-relaxed text-gray-600 sm:text-[14px]">
              Actualizamos el sistema que ya usas y lo llevamos a AWS, Google Cloud o Azure, por etapas y sin detener tu operación.
            </p>
            <h3 className="mt-1 flex items-center gap-2 text-[14px] font-semibold text-gray-900 sm:text-[15px]">
              <RefreshCw size={16} aria-hidden="true" /> <Cloud size={16} aria-hidden="true" className="-ml-1" /> Modernización y nube
            </h3>
          </article>
        </div>

        <ul className="mt-10 grid grid-cols-1 gap-5 px-5 sm:grid-cols-3 sm:gap-6 sm:px-8 lg:mt-14 lg:gap-7 lg:px-12">
          {MORE.map(({ icon: Icon, title, text }) => (
            <li key={title} className="rounded-2xl bg-white p-6 sm:p-7">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2A44EE]/10 text-[#2A44EE]">
                <Icon size={18} aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-[15px] font-semibold text-gray-900">{title}</h3>
              <p className="mt-1 text-[14px] leading-relaxed text-gray-600">{text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
