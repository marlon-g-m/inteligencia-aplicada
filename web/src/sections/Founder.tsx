import { ArrowUpRight, Briefcase, GraduationCap, MapPin, Rocket } from 'lucide-react'
import { Reveal, SectionBadge } from '../components/ui'

/**
 * Foto del fundador. Cuando esté, guárdala en public/img/marlon.webp (cuadrada, unos 800 px)
 * y cambia esto a './img/marlon.webp'. Mientras sea null se muestran las iniciales.
 */
const FOTO: string | null = null

const LINKEDIN = 'https://www.linkedin.com/in/marlon-gonzalez-meza'
const PORTAFOLIO = 'https://portafolio-marlon-g.vercel.app'

const DATOS = [
  { icon: GraduationCap, t: 'Ingeniero en Computación e Informática', d: 'Universidad Andrés Bello' },
  { icon: Briefcase, t: '5 años en sistemas para Copec', d: 'Plataformas que usan a diario sus equipos de operación, transporte y mantenimiento' },
  { icon: Rocket, t: 'Fundador de Flotify', d: 'Plataforma para gestionar empresas de transporte, en desarrollo' },
  { icon: MapPin, t: 'Rengo, Región de O’Higgins', d: 'Trabajo con empresas de todo Chile, a distancia o en persona' },
]

export default function Founder() {
  return (
    <section id="quien" className="bg-[#0B1F3A] pb-16 pt-16 text-white sm:pb-20 sm:pt-20 lg:pb-28 lg:pt-28">
      <div className="mx-auto max-w-[1440px]">
        <SectionBadge n={6} label="Quién está detrás" dark />

        <div className="grid gap-10 px-5 sm:px-8 lg:grid-cols-[minmax(0,420px)_1fr] lg:gap-16 lg:px-12">
          <Reveal>
            <div className="relative mx-auto aspect-square w-full max-w-[420px] overflow-hidden rounded-[28px] bg-gradient-to-br from-[#2A44EE] to-[#14286B]">
              {FOTO ? (
                <img src={FOTO} alt="Marlon González Meza, fundador de Inteligencia Aplicada" width={800} height={800} loading="lazy" decoding="async" className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-[clamp(5rem,22vw,9rem)] font-medium tracking-[-0.04em] text-white/90" aria-hidden="true">
                  MG
                </span>
              )}
              <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-white/95 px-5 py-4 text-gray-900 backdrop-blur">
                <p className="text-[16px] font-semibold">Marlon González Meza</p>
                <p className="text-[13px] text-gray-600">Fundador e ingeniero a cargo de cada proyecto</p>
              </div>
            </div>
          </Reveal>

          <div>
            <Reveal>
              <h2 className="mb-6 text-[clamp(1.75rem,7vw,4.2rem)] font-medium leading-[1.08] tracking-[-0.03em] sm:text-[clamp(2.5rem,5vw,4.2rem)]">
                Hablas directo con el ingeniero que lo construye
              </h2>
              <div className="max-w-[640px] space-y-4 text-[15px] leading-relaxed text-white/75 sm:text-[17px]">
                <p>
                  Soy Marlon. Durante 5 años desarrollé sistemas para Copec que sus equipos usan todos los días: liquidación de fletes, avisos de mantenimiento y monitoreo de operaciones. Ahí vi de cerca cuánto tiempo se pierde en tareas que un sistema puede hacer solo.
                </p>
                <p>
                  Fundé Inteligencia Aplicada para que una pyme tenga esa misma tecnología, a un precio que pueda pagar y con alguien que responde. No hay intermediarios ni ejecutivos de cuenta: conversas conmigo desde el diagnóstico hasta que tu sistema funciona.
                </p>
              </div>
            </Reveal>

            <ul className="mt-10 grid gap-4 sm:grid-cols-2">
              {DATOS.map(({ icon: Icon, t, d }, i) => (
                <li key={t}>
                  <Reveal delay={i * 80} className="flex h-full gap-4 rounded-2xl bg-white/[0.06] p-5">
                    <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-white/10 text-[#7AA2FF]">
                      <Icon size={18} aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-[15px] font-medium">{t}</p>
                      <p className="mt-0.5 text-[13px] leading-relaxed text-white/60">{d}</p>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap gap-3">
              {[{ href: LINKEDIN, label: 'Mi LinkedIn' }, { href: PORTAFOLIO, label: 'Mi portafolio' }].map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  target="_blank"
                  rel="noopener"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-[14px] font-medium transition-colors hover:bg-white/10"
                >
                  {l.label} <ArrowUpRight size={15} aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
