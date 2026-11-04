import { ArrowRight } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

export const EASE = 'ease-[cubic-bezier(0.25,0.1,0.25,1)]'

/** Texto que "rueda" hacia arriba al pasar el mouse (se duplica dentro de un contenedor con overflow oculto). */
export function RollText({ children, height = 'h-[20px]' }: { children: ReactNode; height?: string }) {
  return (
    <span className={`relative block overflow-hidden ${height}`}>
      <span className={`flex flex-col transition-transform duration-500 ${EASE} group-hover:-translate-y-1/2`}>
        <span className={`flex items-center ${height}`}>{children}</span>
        <span className={`flex items-center ${height}`} aria-hidden="true">{children}</span>
      </span>
    </span>
  )
}

/** Botón principal azul con texto que rueda y flecha que gira. */
export function PrimaryButton({ href, children, className = '' }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a
      href={href}
      className={`group inline-flex w-fit items-center gap-3 rounded-full bg-[#2A44EE] py-2 pl-5 pr-2 text-[13px] font-medium text-white transition-colors duration-300 hover:bg-[#1F35C9] sm:pl-6 sm:text-[14px] ${className}`}
    >
      <RollText>{children}</RollText>
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white sm:h-8 sm:w-8">
        <ArrowRight size={15} className={`text-[#2A44EE] transition-transform duration-500 ${EASE} group-hover:-rotate-45`} />
      </span>
    </a>
  )
}

/** Fila de insignia numerada + etiqueta en cápsula. */
export function SectionBadge({ n, label, dark = false, border = 'border-gray-200' }: { n: number; label: string; dark?: boolean; border?: string }) {
  return (
    <div className="mb-6 flex items-center gap-3 px-5 sm:mb-8 sm:px-8 lg:px-12">
      <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold sm:h-7 sm:w-7 sm:text-[12px] ${dark ? 'bg-white text-gray-900' : 'bg-gray-900 text-white'}`}>
        {n}
      </span>
      <span className={`rounded-full border px-3 py-1 text-[12px] font-medium sm:px-4 sm:py-1.5 sm:text-[13px] ${dark ? 'border-white/20 text-white' : `${border} text-gray-900`}`}>
        {label}
      </span>
    </div>
  )
}

/** Isotipo IA (I + A con punto azul como travesaño). Usa currentColor para la tinta. */
export function LogoMark({ className = '', dot = '#2A44EE' }: { className?: string; dot?: string }) {
  return (
    <svg viewBox="0 0 144 96" className={className} aria-hidden="true">
      <g fill="currentColor" stroke="currentColor">
        <rect width="25" height="96" rx="2" />
        <path fillRule="evenodd" d="M72 0H96L144 96H23ZM84 27L118.5 96H49.5Z" />
        <path d="M61 72H107" strokeWidth="5" />
      </g>
      <circle cx="84" cy="72" r="9.5" fill={dot} />
    </svg>
  )
}

/** Hace aparecer su contenido con un desplazamiento suave cuando entra en pantalla. */
export function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); io.disconnect() }
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <div ref={ref} className={`reveal ${inView ? 'is-in' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}

export const WHATSAPP = '56976630940'
export const EMAIL = 'inteligenciaaplicada.cl@gmail.com'
