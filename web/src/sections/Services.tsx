import { ArrowRight, Bot, Cloud, Code2, Globe, Plug, ShieldCheck, Smartphone, Workflow, Wrench } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Reveal, SectionBadge } from '../components/ui'
import { ChatVisual, FlowVisual, MigrationVisual } from '../components/visuals'
import { BrowserVisual, DashboardVisual, PhoneVisual } from '../components/visuals-apps'

const SERVICES: { icon: LucideIcon; title: string; text: string; visual: ReactNode; bg: string; wide?: boolean }[] = [
  {
    icon: Code2,
    title: 'Software a medida',
    text: 'Sistemas de gestión, ERP, CRM, portales de clientes y paneles hechos para cómo trabaja tu empresa, no al revés.',
    visual: <DashboardVisual />,
    bg: 'bg-[#E3E8F1]',
    wide: true,
  },
  {
    icon: Smartphone,
    title: 'Aplicaciones móviles',
    text: 'Apps para iPhone y Android: pedidos, reservas, terreno y fidelización, publicadas en las tiendas.',
    visual: <PhoneVisual />,
    bg: 'bg-[#0B1F3A]',
  },
  {
    icon: Globe,
    title: 'Páginas web y tiendas online',
    text: 'Sitios rápidos que aparecen en Google y tiendas con pago en línea conectadas a tu inventario.',
    visual: <BrowserVisual />,
    bg: 'bg-[#DDE4FF]',
  },
  {
    icon: Bot,
    title: 'Agentes de IA',
    text: 'Agentes que atienden tu WhatsApp, agendan, confirman horas y cobran por su cuenta, conectados a tus sistemas. Lo delicado siempre lo revisa una persona de tu equipo.',
    visual: <ChatVisual dark />,
    bg: 'bg-[#0B1F3A]',
  },
  {
    icon: Workflow,
    title: 'Automatización de procesos',
    text: 'Para lo que siempre se hace igual: cotizaciones, reportes y facturación funcionando solos, conectando las herramientas que ya usas.',
    visual: <FlowVisual />,
    bg: 'bg-[#0B1F3A]',
  },
  {
    icon: Cloud,
    title: 'Modernización y nube',
    text: 'Actualizamos el sistema que ya usas y lo llevamos a AWS, Google Cloud o Azure, por etapas y sin detener tu operación.',
    visual: <MigrationVisual />,
    bg: 'bg-[#E3E8F1]',
  },
]

const MORE: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Plug, title: 'Integraciones y APIs', text: 'Conectamos tu sistema con el SII, bancos, Transbank, Mercado Pago, marketplaces y más.' },
  { icon: ShieldCheck, title: 'Datos y Ley 21.719', text: 'Diagnóstico y adecuación a la nueva ley de protección de datos personales.' },
  { icon: Wrench, title: 'Soporte y mejora continua', text: 'Mantención, respaldos y nuevas funciones con un plan mensual claro.' },
]

export default function Services() {
  return (
    <section id="servicios" className="bg-[#F5F5F5] pb-16 pt-16 sm:pb-20 sm:pt-20 lg:pb-28 lg:pt-28">
      <div className="mx-auto max-w-[1440px]">
        <SectionBadge n={2} label="Lo que hacemos" border="border-gray-300" />
        <Reveal>
          <h2 className="mb-4 px-5 text-[clamp(1.75rem,7vw,4.2rem)] font-medium leading-[1.08] tracking-[-0.03em] text-gray-900 sm:px-8 sm:text-[clamp(2.5rem,5vw,4.2rem)] lg:px-12">
            Nuestros servicios
          </h2>
          <p className="mb-10 max-w-[640px] px-5 text-[15px] leading-relaxed text-gray-600 sm:mb-14 sm:px-8 sm:text-[17px] lg:mb-16 lg:px-12">
            Diseñamos y desarrollamos el software que tu empresa necesita, desde una página web hasta un sistema completo, y lo potenciamos con agentes de IA y automatización.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 gap-5 px-5 sm:gap-6 sm:px-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-7 lg:px-12">
          {SERVICES.map((s, i) => (
            <Reveal key={s.title} delay={(i % 3) * 90} className={s.wide ? 'lg:col-span-2' : ''}>
              <article className="h-full">
                <a
                  href="#contacto"
                  className={`group relative block aspect-[4/3] overflow-hidden rounded-2xl ${s.bg} ${s.wide ? 'lg:aspect-[8/3]' : ''}`}
                  aria-label={`${s.title}: conversemos`}
                >
                  <div className="h-full w-full transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.02]">{s.visual}</div>
                  <span className="absolute right-4 top-4 flex h-9 w-9 flex-row-reverse items-center justify-center gap-2 overflow-hidden rounded-full bg-white text-gray-900 shadow-[0_2px_10px_rgba(0,0,0,0.12)] transition-all duration-300 ease-in-out group-hover:w-[148px]">
                    <span className="max-w-0 whitespace-nowrap text-[13px] font-medium opacity-0 transition-all delay-100 duration-300 group-hover:max-w-[100px] group-hover:opacity-100">Conversemos</span>
                    <ArrowRight size={14} className="shrink-0 -rotate-45 transition-transform duration-300 group-hover:rotate-0" aria-hidden="true" />
                  </span>
                </a>
                <h3 className="mt-4 flex items-center gap-2 text-[15px] font-semibold text-gray-900 sm:text-[16px]">
                  <s.icon size={17} className="text-[#2A44EE]" aria-hidden="true" /> {s.title}
                </h3>
                <p className="mt-1 max-w-[560px] text-[14px] leading-relaxed text-gray-600">{s.text}</p>
              </article>
            </Reveal>
          ))}
        </div>

        <ul className="mt-10 grid grid-cols-1 gap-5 px-5 sm:grid-cols-3 sm:gap-6 sm:px-8 lg:mt-14 lg:gap-7 lg:px-12">
          {MORE.map(({ icon: Icon, title, text }, i) => (
            <li key={title}>
              <Reveal delay={i * 90} className="h-full rounded-2xl bg-white p-6 transition-shadow duration-300 hover:shadow-[0_8px_30px_rgba(11,31,58,0.08)] sm:p-7">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2A44EE]/10 text-[#2A44EE]">
                  <Icon size={18} aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-[15px] font-semibold text-gray-900">{title}</h3>
                <p className="mt-1 text-[14px] leading-relaxed text-gray-600">{text}</p>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
