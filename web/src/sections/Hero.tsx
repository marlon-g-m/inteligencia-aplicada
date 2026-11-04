import { lazy, Suspense, useEffect, useState } from 'react'
import { ArrowRight, Clock, Menu, X } from 'lucide-react'
import { EASE, LogoMark, PrimaryButton, RollText } from '../components/ui'
import { useSantiagoTime } from '../components/useSantiagoTime'

const HeroShaderLayers = lazy(() => import('./HeroShaderLayers'))

const LINKS = [
  { label: 'Servicios', href: '#servicios' },
  { label: 'Rubros', href: '#rubros' },
  { label: 'Proceso', href: '#proceso' },
  { label: 'Contacto', href: '#contacto' },
]

const AVAILABILITY = 'Agenda abierta para proyectos Q1 2027'

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const on = () => setReduced(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return reduced
}

/** Fondo animado de la portada. Si el navegador no soporta WebGPU o se pide menos movimiento, queda el degradado CSS. */
function HeroShader() {
  const reduced = usePrefersReducedMotion()
  const [available, setAvailable] = useState(true)
  if (reduced || !available) return null
  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      <Suspense fallback={null}>
        <HeroShaderLayers onUnavailable={() => setAvailable(false)} />
      </Suspense>
    </div>
  )
}

function Nav({ onOpenMenu, menuOpen }: { onOpenMenu: () => void; menuOpen: boolean }) {
  const time = useSantiagoTime()
  return (
    <div className="relative z-20 mx-auto w-full max-w-[1440px] p-2 sm:p-3">
      <nav aria-label="Principal" className="flex items-center justify-between rounded-full bg-white p-[5px]">
        <div className="flex items-center gap-6">
          <a href="#" aria-label="Inteligencia Aplicada, inicio" className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 sm:h-10 sm:w-10">
            <LogoMark className="w-[22px] text-white sm:w-6" dot="#4F6BFF" />
          </a>
          <ul className="hidden items-center gap-6 md:flex">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="text-[14px] text-gray-900 transition-colors duration-300 hover:text-gray-500">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="hidden items-center gap-5 md:flex">
          <span className="hidden text-[13px] text-gray-600 lg:inline">{AVAILABILITY}</span>
          <span className="flex items-center gap-1.5 text-[13px] text-gray-600">
            <Clock size={14} aria-hidden="true" />
            <span className="tabular-nums">{time}</span> en Santiago
          </span>
          <a href="#contacto" className="group flex items-center gap-3 rounded-full bg-gray-900 py-2 pl-5 pr-2 text-[13px] font-medium text-white">
            <RollText>Agenda un diagnóstico</RollText>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white">
              <ArrowRight size={13} className={`text-gray-900 transition-transform duration-500 ${EASE} group-hover:-rotate-45`} />
            </span>
          </a>
        </div>

        <button
          type="button"
          onClick={onOpenMenu}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          className="flex items-center gap-2 rounded-full bg-gray-900 py-2 pl-4 pr-3 text-[13px] font-medium text-white md:hidden"
        >
          {menuOpen ? 'Cerrar' : 'Menú'}
          {menuOpen ? <X size={16} aria-hidden="true" /> : <Menu size={16} aria-hidden="true" />}
        </button>
      </nav>
    </div>
  )
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const time = useSantiagoTime()
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  return (
    <div
      id="mobile-menu"
      className={`fixed inset-0 z-50 md:hidden ${open ? '' : 'pointer-events-none'}`}
      aria-hidden={!open}
      style={{ visibility: open ? 'visible' : 'hidden', transition: `visibility 0s linear ${open ? '0s' : '500ms'}` }}
    >
      <div onClick={onClose} className={`absolute inset-0 bg-black/60 transition-opacity duration-500 ${open ? 'opacity-100' : 'opacity-0'}`} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menú"
        className={`absolute inset-x-0 bottom-0 mx-3 mb-3 rounded-2xl bg-white p-6 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${open ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-[13px] text-gray-600">
            <Clock size={14} aria-hidden="true" />
            <span className="tabular-nums">{time}</span> en Santiago
          </span>
          <button type="button" onClick={onClose} className="flex items-center gap-2 rounded-full bg-gray-900 py-2 pl-4 pr-3 text-[13px] font-medium text-white">
            Cerrar <X size={16} aria-hidden="true" />
          </button>
        </div>
        <ul className="mt-8 grid gap-2">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} onClick={onClose} className="block text-[28px] font-medium leading-tight tracking-tight text-gray-900 sm:text-[32px]">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-[13px] text-gray-600">{AVAILABILITY}</p>
        <div className="mt-4" onClick={onClose}>
          <PrimaryButton href="#contacto">Empieza tu proyecto</PrimaryButton>
        </div>
      </div>
    </div>
  )
}

export default function Hero() {
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <section
      className="relative flex min-h-[100svh] flex-col overflow-hidden"
      style={{ background: 'radial-gradient(120% 90% at 75% 10%, #1B3A7A 0%, #0B1F3A 45%, #06101F 100%)' }}
    >
      <HeroShader />
      <Nav onOpenMenu={() => setMenuOpen((v) => !v)} menuOpen={menuOpen} />
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="flex-1" />

      <div className="relative z-20 mx-auto w-full max-w-[1440px] px-5 pb-14 sm:px-8 sm:pb-16 lg:px-12 lg:pb-20">
        <p className="mb-5 text-[13px] tracking-wide text-white/80 sm:mb-8 sm:text-[14px]">Inteligencia Aplicada</p>
        <h1 className="text-[clamp(1.75rem,7vw,4.2rem)] font-medium leading-[1.08] tracking-[-0.03em] text-white sm:text-[clamp(2.5rem,5vw,4.2rem)]">
          Modernizamos lo que ya funciona<br className="hidden sm:block" />
          <span className="sm:hidden"> </span>en tu empresa con IA,<br className="hidden sm:block" />
          <span className="sm:hidden"> </span>automatización y nube.
        </h1>
        <div className="mt-8 flex flex-col gap-4 sm:mt-12 sm:flex-row sm:items-center sm:gap-5">
          <PrimaryButton href="#contacto">Agenda un diagnóstico gratis</PrimaryButton>
          <a
            href="#proceso"
            className="flex w-fit items-center gap-2.5 rounded-[4px] bg-white px-3 py-2 shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-shadow duration-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)]"
          >
            <LogoMark className="w-6 text-gray-900 sm:w-7" />
            <span className="text-[13px] font-medium text-gray-900 sm:text-[14px]">Ingeniería hecha en Chile</span>
            <span className="rounded bg-gray-900 px-1.5 py-0.5 text-[10px] font-medium text-white sm:px-2 sm:text-[11px]">30 min gratis</span>
          </a>
        </div>
      </div>
    </section>
  )
}
