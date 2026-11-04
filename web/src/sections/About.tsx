import { PrimaryButton, Reveal, SectionBadge } from '../components/ui'
import { CodeVisual } from '../components/visuals-apps'

const TECH = ['React', 'Next.js', 'Flutter', 'Node.js', 'Python', 'TypeScript', 'PostgreSQL', 'AWS', 'Google Cloud', 'Azure', 'WhatsApp Business', 'IA generativa', 'Transbank', 'Mercado Pago', 'Firebase', 'Docker']

function Photo({ className = '' }: { className?: string }) {
  return (
    <img
      src="./img/software.webp"
      alt="Dos personas revisando código en monitores en una oficina luminosa"
      width={1200}
      height={800}
      loading="lazy"
      decoding="async"
      className={`h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.04] ${className}`}
    />
  )
}

function TechMarquee() {
  return (
    <div className="marquee-wrap mt-16 overflow-hidden border-y border-gray-100 py-5 sm:mt-20 lg:mt-28" aria-label="Tecnologías con las que trabajamos">
      <ul className="marquee flex w-max gap-10 pr-10 text-[15px] font-medium text-gray-400 sm:gap-14 sm:pr-14 sm:text-[17px]">
        {[...TECH, ...TECH].map((t, i) => (
          <li key={i} aria-hidden={i >= TECH.length} className="flex items-center gap-10 whitespace-nowrap sm:gap-14">
            {t}
            <span className="h-1.5 w-1.5 rounded-full bg-[#2A44EE]/40" aria-hidden="true" />
          </li>
        ))}
      </ul>
    </div>
  )
}

const TEXT = 'Desarrollamos software a medida, aplicaciones y páginas web, y les sumamos IA y automatización para que tu empresa venda más y trabaje menos. Sin botar lo que ya funciona.'

export default function About() {
  return (
    <section className="overflow-hidden bg-white pb-0 pt-16 sm:pt-20 lg:pt-32">
      <div className="mx-auto max-w-[1440px]">
        <SectionBadge n={1} label="Presentamos Inteligencia Aplicada" />

        <Reveal>
          <h2 className="mb-12 px-5 text-[clamp(1.5rem,4vw,3.2rem)] font-medium leading-[1.12] tracking-[-0.02em] text-gray-900 sm:mb-16 sm:px-8 lg:mb-28 lg:px-12">
            Ingeniería con criterio, que entrega<br className="hidden sm:block" />
            <span className="sm:hidden"> </span>resultados en tu operación diaria.
          </h2>
        </Reveal>

        {/* Móvil y tablet */}
        <div className="px-5 sm:px-8 lg:hidden">
          <Reveal>
            <p className="text-[15px] font-medium leading-[1.6] text-gray-900 sm:text-[17px]">{TEXT}</p>
            <PrimaryButton href="#servicios" className="mt-6">Ver servicios</PrimaryButton>
          </Reveal>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:gap-5">
            <Reveal className="aspect-[4/3] overflow-hidden rounded-xl sm:aspect-[438/346] sm:w-[45%] sm:rounded-2xl">
              <Photo />
            </Reveal>
            <Reveal delay={120} className="aspect-[3/2] overflow-hidden rounded-xl sm:w-[55%] sm:rounded-2xl">
              <CodeVisual />
            </Reveal>
          </div>
        </div>

        {/* Escritorio */}
        <div className="hidden grid-cols-[26%_1fr_48%] items-end gap-6 px-12 lg:grid xl:gap-8">
          <Reveal className="aspect-[438/346] self-end overflow-hidden rounded-2xl">
            <Photo />
          </Reveal>
          <Reveal delay={100} className="flex justify-end self-start">
            <div className="max-w-[420px]">
              <p className="text-[16px] font-medium leading-[1.65] text-gray-900 xl:text-[18px]">{TEXT}</p>
              <PrimaryButton href="#servicios" className="mt-6">Ver servicios</PrimaryButton>
            </div>
          </Reveal>
          <Reveal delay={200} className="aspect-[3/2] self-end overflow-hidden rounded-2xl">
            <CodeVisual />
          </Reveal>
        </div>

        <TechMarquee />
      </div>
    </section>
  )
}
