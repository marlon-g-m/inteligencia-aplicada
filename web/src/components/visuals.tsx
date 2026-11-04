import { useEffect, useRef, useState } from 'react'

/** Activa la animación solo cuando el elemento entra en pantalla. */
export function useInView<T extends Element>() {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setInView(true), { threshold: 0.3 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return [ref, inView] as const
}

/** Conversación de ejemplo de un asistente de WhatsApp para una clínica. */
export function ChatVisual({ dark = false, className = '', bodyClass = '' }: { dark?: boolean; className?: string; bodyClass?: string }) {
  const [ref, inView] = useInView<HTMLDivElement>()
  const msgs = [
    { me: false, t: 'Hola, ¿tienen hora para limpieza el jueves?' },
    { me: true, t: '¡Hola! El jueves tengo 10:30 y 16:00 con la Dra. Soto. ¿Cuál te acomoda?' },
    { me: false, t: '16:00 porfa' },
    { me: true, t: 'Listo ✅ Quedaste agendado el jueves a las 16:00. Te recuerdo el miércoles.' },
  ]
  return (
    <div
      ref={ref}
      role="img"
      aria-label="Ejemplo ilustrativo: un paciente pide hora por WhatsApp y el asistente con IA lo agenda."
      className={`flex h-full w-full flex-col ${dark ? 'bg-[#0B1F3A]' : 'bg-[#EEF1F5]'} ${className}`}
    >
      <div className={`flex items-center gap-3 border-b px-4 py-3 ${dark ? 'border-white/10' : 'border-black/5 bg-white'}`}>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0B1F3A] text-[11px] font-semibold text-white ring-1 ring-white/20">CS</span>
        <div className="leading-tight">
          <p className={`text-[13px] font-semibold ${dark ? 'text-white' : 'text-gray-900'}`}>Clínica Dental Sur</p>
          <p className={`text-[11px] ${dark ? 'text-white/60' : 'text-gray-500'}`}>Asistente con IA · en línea</p>
        </div>
      </div>
      <div className={`flex flex-1 flex-col justify-end gap-2 overflow-hidden p-4 ${bodyClass}`}>
        {inView &&
          msgs.map((m, i) => (
            <p
              key={i}
              className={`bubble max-w-[82%] rounded-2xl px-3 py-2 text-[12px] leading-snug sm:text-[13px] ${
                m.me
                  ? 'self-end rounded-br-md bg-[#2A44EE] text-white'
                  : `self-start rounded-bl-md ${dark ? 'bg-white/10 text-white' : 'bg-white text-gray-900'}`
              }`}
              style={{ animationDelay: `${300 + i * 700}ms` }}
            >
              {m.t}
            </p>
          ))}
      </div>
    </div>
  )
}

/** Diagrama de un flujo automatizado: WhatsApp → Asistente IA → Agenda/CRM → Reporte. */
export function FlowVisual({ className = '' }: { className?: string }) {
  const nodes = [
    { x: 70, y: 150, label: 'WhatsApp', sub: 'Mensaje entrante' },
    { x: 250, y: 150, label: 'Asistente IA', sub: 'Entiende y responde', accent: true },
    { x: 430, y: 80, label: 'Agenda', sub: 'Hora reservada' },
    { x: 430, y: 220, label: 'CRM', sub: 'Cliente registrado' },
    { x: 610, y: 150, label: 'Reporte', sub: 'Lunes 08:00' },
  ]
  const edges = [
    [0, 1], [1, 2], [1, 3], [2, 4], [3, 4],
  ]
  const w = 130, h = 56
  return (
    <svg
      viewBox="0 0 680 300"
      role="img"
      aria-label="Diagrama: un mensaje de WhatsApp pasa por el asistente con IA, se guarda en la agenda y el CRM, y termina en un reporte automático."
      className={`h-full w-full bg-[#0B1F3A] ${className}`}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="rgba(255,255,255,0.08)" />
        </pattern>
      </defs>
      <rect width="680" height="300" fill="url(#grid)" />
      {edges.map(([a, b], i) => {
        const A = nodes[a], B = nodes[b]
        const x1 = A.x + w / 2, x2 = B.x - w / 2
        const mx = (x1 + x2) / 2
        const d = `M${x1} ${A.y} C${mx} ${A.y}, ${mx} ${B.y}, ${x2} ${B.y}`
        return (
          <g key={i}>
            <path d={d} fill="none" stroke="rgba(143,176,255,0.25)" strokeWidth="2" />
            <path d={d} fill="none" stroke="#7AA2FF" strokeWidth="2" className="flow-line" />
          </g>
        )
      })}
      {nodes.map((n) => (
        <g key={n.label} transform={`translate(${n.x - w / 2} ${n.y - h / 2})`}>
          <rect width={w} height={h} rx="14" fill={n.accent ? '#2A44EE' : '#13294B'} stroke={n.accent ? '#7AA2FF' : 'rgba(255,255,255,0.12)'} />
          <text x="14" y="24" fill="#FFFFFF" fontSize="14" fontWeight="600" fontFamily="system-ui, sans-serif">{n.label}</text>
          <text x="14" y="42" fill={n.accent ? 'rgba(255,255,255,0.8)' : 'rgba(180,194,216,0.9)'} fontSize="11" fontFamily="system-ui, sans-serif">{n.sub}</text>
        </g>
      ))}
    </svg>
  )
}

/** Migración de un sistema antiguo a la nube, por etapas. */
export function MigrationVisual({ className = '' }: { className?: string }) {
  const rows = [
    { label: 'Base de datos', d: '0s' },
    { label: 'Archivos y respaldos', d: '0.4s' },
    { label: 'Sistema de ventas', d: '0.8s' },
    { label: 'Usuarios y accesos', d: '1.2s' },
  ]
  return (
    <div
      role="img"
      aria-label="Ilustración: cuatro componentes de un sistema migrando por etapas a la nube."
      className={`flex h-full w-full flex-col justify-center gap-5 bg-[#E3E8F1] p-6 sm:p-10 ${className}`}
    >
      <div className="flex items-center justify-between text-[12px] font-medium text-gray-600 sm:text-[13px]">
        <span>Servidor actual</span>
        <span className="rounded-full bg-white px-2.5 py-1 text-[#2A44EE]">Nube</span>
      </div>
      {rows.map((r) => (
        <div key={r.label} className="rounded-xl bg-white p-3 shadow-[0_2px_8px_rgba(11,31,58,0.06)] sm:p-4">
          <div className="mb-2 flex justify-between text-[12px] text-gray-900 sm:text-[13px]">
            <span className="font-medium">{r.label}</span>
            <span className="text-gray-500">sin cortes</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
            <div className="migrate-bar h-full rounded-full bg-[#2A44EE]" style={{ animationDelay: r.d }} />
          </div>
        </div>
      ))}
    </div>
  )
}
