import { useEffect, useState } from 'react'
import { useInView } from './visuals'

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Repite la animación cada `ms` mientras el elemento está en pantalla (no repite si se pide menos movimiento). */
function useLoop(inView: boolean, ms: number) {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    if (!inView || reducedMotion()) return
    const id = window.setInterval(() => { if (!document.hidden) setTick((t) => t + 1) }, ms)
    return () => window.clearInterval(id)
  }, [inView, ms])
  return tick
}

/** Número que sube desde cero al entrar en pantalla. */
function CountUp({ to, run, prefix = '', suffix = '' }: { to: number; run: boolean; prefix?: string; suffix?: string }) {
  const [v, setV] = useState(0)
  useEffect(() => {
    if (!run) return
    if (reducedMotion()) { setV(to); return }
    let raf = 0
    const t0 = performance.now()
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / 1400)
      setV(Math.round(to * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [to, run])
  return <span className="tabular-nums">{prefix}{v.toLocaleString('es-CL')}{suffix}</span>
}

/** Panel de un sistema a medida: módulos, indicadores que suben y un gráfico que crece. */
export function DashboardVisual({ className = '' }: { className?: string }) {
  const [ref, inView] = useInView<HTMLDivElement>()
  const tick = useLoop(inView, 7000)
  const modules = ['Ventas', 'Inventario', 'Clientes', 'Facturas', 'Reportes']
  const bars = [38, 52, 45, 64, 58, 76, 70, 88]
  const kpis = [
    { l: 'Ventas del mes', to: 18450000, p: '$' },
    { l: 'Pedidos', to: 1043 },
    { l: 'Horas ahorradas', to: 62, s: ' h' },
  ]
  return (
    <div
      ref={ref}
      role="img"
      aria-label="Ilustración: panel de un sistema a medida con módulos de ventas, inventario y clientes, indicadores y un gráfico de ventas."
      className={`flex h-full w-full items-center justify-center bg-[#E3E8F1] p-4 sm:p-6 ${className}`}
    >
      <div className="flex h-full max-h-[340px] w-full max-w-[580px] overflow-hidden rounded-xl bg-white shadow-[0_12px_40px_rgba(11,31,58,0.12)]">
        <div className="hidden w-[30%] flex-col gap-1 bg-[#0B1F3A] p-3 min-[420px]:flex">
          <p className="mb-2 px-2 text-[11px] font-semibold text-white/90">Tu empresa</p>
          {modules.map((m, i) => (
            <span key={m} className={`rounded-md px-2 py-1.5 text-[11px] transition-colors duration-500 ${i === tick % modules.length ? 'bg-[#2A44EE] text-white' : 'text-white/60'}`}>{m}</span>
          ))}
        </div>
        <div className="flex flex-1 flex-col gap-3 p-3 sm:p-4">
          <div className="grid grid-cols-3 gap-2">
            {kpis.map((k) => (
              <div key={k.l} className="rounded-lg bg-[#F5F7FB] p-2">
                <p className="truncate text-[9px] text-gray-500 sm:text-[10px]">{k.l}</p>
                <p className="truncate text-[11px] font-semibold text-gray-900 sm:text-[13px]">
                  <CountUp key={tick} to={k.to} run={inView} prefix={k.p} suffix={k.s} />
                </p>
              </div>
            ))}
          </div>
          <div className="relative flex flex-1 items-end gap-1.5 rounded-lg bg-[#F5F7FB] p-3 sm:gap-2">
            {inView && bars.map((b, i) => (
              <span
                key={`${tick}-${i}`}
                className="grow-y flex-1 rounded-t-[4px] bg-[#2A44EE]"
                style={{ height: `${b}%`, opacity: 0.45 + i * 0.07, animationDelay: `${i * 70}ms` }}
              />
            ))}
            {inView && (
              <span key={`t${tick}`} className="pop absolute right-2 top-2 rounded-full bg-white px-2.5 py-1 text-[10px] font-medium text-gray-900 shadow-[0_4px_14px_rgba(11,31,58,0.12)]" style={{ animationDelay: '1.4s' }}>
                Nuevo pedido #{1044 + tick} ✓
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/** App móvil de pedidos: tarjetas que llegan y una notificación de entrega. */
export function PhoneVisual({ className = '' }: { className?: string }) {
  const [ref, inView] = useInView<HTMLDivElement>()
  const tick = useLoop(inView, 6500)
  const orders = [
    { n: 'Pedido #208', d: 'Av. Providencia 1234', s: 'En camino', c: 'bg-amber-100 text-amber-800' },
    { n: 'Pedido #209', d: 'Los Leones 450', s: 'Preparando', c: 'bg-blue-100 text-blue-800' },
    { n: 'Pedido #207', d: 'Irarrázaval 3100', s: 'Entregado', c: 'bg-emerald-100 text-emerald-800' },
  ]
  return (
    <div
      ref={ref}
      role="img"
      aria-label="Ilustración: aplicación móvil de pedidos con estados y una notificación de entrega."
      className={`relative flex h-full w-full items-start justify-center overflow-hidden pt-[16%] bg-[radial-gradient(80%_70%_at_50%_0%,#1B3A7A,#0B1F3A)] ${className}`}
    >
      <div className="relative aspect-[9/17] w-[46%] max-w-[210px] shrink-0 rounded-[28px] border-[5px] border-[#0a0f1c] bg-[#F5F7FB] shadow-[0_20px_50px_rgba(0,0,0,0.45)]">
        <span className="absolute left-1/2 top-1.5 h-1.5 w-12 -translate-x-1/2 rounded-full bg-[#0a0f1c]" />
        <div className="flex h-full flex-col gap-2 p-3 pt-5">
          <p className="text-[12px] font-semibold text-gray-900">Mis pedidos</p>
          {inView && orders.map((o, i) => (
            <div key={`${tick}-${i}`} className="bubble rounded-xl bg-white p-2 shadow-[0_2px_8px_rgba(11,31,58,0.06)]" style={{ animationDelay: `${200 + i * 350}ms` }}>
              <div className="flex items-center justify-between gap-1">
                <span className="whitespace-nowrap text-[10px] font-semibold text-gray-900">{o.n}</span>
                <span className={`whitespace-nowrap rounded-full px-1.5 py-0.5 text-[8px] font-medium ${o.c}`}>{o.s}</span>
              </div>
              <p className="mt-0.5 truncate text-[9px] text-gray-500">{o.d}</p>
            </div>
          ))}
          <div className="mt-auto flex justify-around rounded-xl bg-white py-1.5 text-[8px] text-gray-500">
            <span className="font-semibold text-[#2A44EE]">Pedidos</span><span>Mapa</span><span>Perfil</span>
          </div>
        </div>
      </div>
      {inView && (
        <div key={`n${tick}`} className="drop-in absolute left-1/2 top-[5%] w-[min(66%,240px)] rounded-2xl bg-white/95 px-3 py-2 shadow-[0_10px_30px_rgba(0,0,0,0.3)]" style={{ animationDelay: '1.8s' }}>
          <p className="text-[11px] font-semibold text-gray-900">Tu pedido #208 llegó ✅</p>
          <p className="text-[10px] text-gray-500">Ahora · App de tu empresa</p>
        </div>
      )}
    </div>
  )
}

/** Editor de código que se escribe solo y termina en una publicación exitosa. */
export function CodeVisual({ className = '' }: { className?: string }) {
  const [ref, inView] = useInView<HTMLDivElement>()
  const tick = useLoop(inView, 8000)
  const lines: [string, string][] = [
    ['text-[#7AA2FF]', 'export async function agendar(cita) {'],
    ['text-white/80', '  const hora = await agenda.buscarLibre(cita)'],
    ['text-white/80', '  await whatsapp.confirmar(cita.cliente, hora)'],
    ['text-white/80', '  await crm.registrar(cita)'],
    ['text-emerald-300', '  return { ok: true, hora }'],
    ['text-[#7AA2FF]', '}'],
  ]
  return (
    <div
      ref={ref}
      role="img"
      aria-label="Ilustración: código que agenda una cita, la confirma por WhatsApp y la registra en el CRM, y luego se publica."
      className={`flex h-full w-full flex-col bg-[#06101F] font-mono ${className}`}
    >
      <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-2.5">
        <i className="h-2 w-2 rounded-full bg-white/20" /><i className="h-2 w-2 rounded-full bg-white/20" /><i className="h-2 w-2 rounded-full bg-white/20" />
        <span className="ml-2 text-[10px] text-white/50">agenda.ts</span>
      </div>
      <div key={tick} className="flex flex-1 flex-col gap-1 overflow-hidden p-4 text-[10px] leading-relaxed sm:text-[12px]">
        {inView && lines.map(([c, t], i) => (
          <p key={i} className={`bubble whitespace-pre ${c}`} style={{ animationDelay: `${150 + i * 260}ms` }}>
            <span className="mr-3 select-none text-white/25">{i + 1}</span>{t}
          </p>
        ))}
        {inView && (
          <p className="pop mt-auto w-fit rounded-full bg-emerald-400/15 px-2.5 py-1 font-sans text-[11px] font-medium text-emerald-300" style={{ animationDelay: '2.1s' }}>
            ✓ Pruebas aprobadas · publicado
          </p>
        )}
      </div>
    </div>
  )
}

/** Sitio web / tienda online que se arma: portada, productos y carrito. */
export function BrowserVisual({ className = '' }: { className?: string }) {
  const [ref, inView] = useInView<HTMLDivElement>()
  const tick = useLoop(inView, 7000)
  const products = [
    { n: 'Café de grano', p: '$8.990', c: 'from-amber-200 to-orange-300' },
    { n: 'Taza artesanal', p: '$6.490', c: 'from-sky-200 to-indigo-300' },
    { n: 'Kit regalo', p: '$19.990', c: 'from-rose-200 to-fuchsia-300' },
  ]
  return (
    <div
      ref={ref}
      role="img"
      aria-label="Ilustración: una tienda online con portada, productos y carrito de compras."
      className={`flex h-full w-full items-center justify-center bg-[#DDE4FF] p-4 sm:p-6 ${className}`}
    >
      <div className="flex h-full max-h-[340px] w-full max-w-[580px] flex-col overflow-hidden rounded-xl bg-white shadow-[0_12px_40px_rgba(11,31,58,0.14)]">
        <div className="flex items-center gap-2 border-b border-gray-100 py-2 pl-3 pr-12">
          <span className="flex gap-1"><i className="h-2 w-2 rounded-full bg-red-300" /><i className="h-2 w-2 rounded-full bg-amber-300" /><i className="h-2 w-2 rounded-full bg-emerald-300" /></span>
          <span className="flex-1 truncate rounded-md bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500">tu-empresa.cl</span>
          <span className="relative text-[12px]">
            🛒
            {inView && <span key={tick} className="pop absolute -right-2 -top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#2A44EE] text-[8px] font-semibold text-white" style={{ animationDelay: '2.2s' }}>1</span>}
          </span>
        </div>
        {inView && (
          <div key={tick} className="flex flex-1 flex-col gap-2.5 p-3 sm:p-4">
            <div className="bubble rounded-lg bg-[#0B1F3A] p-3">
              <p className="text-[12px] font-semibold text-white sm:text-[14px]">Tostado esta semana</p>
              <p className="text-[9px] text-white/70 sm:text-[10px]">Despacho en Santiago en 24 horas</p>
              <span className="mt-2 inline-block rounded-full bg-[#2A44EE] px-2 py-0.5 text-[9px] text-white">Comprar ahora</span>
            </div>
            <div className="grid flex-1 grid-cols-3 gap-2">
              {products.map((p, i) => (
                <div key={p.n} className="bubble flex flex-col rounded-lg border border-gray-100 p-1.5" style={{ animationDelay: `${400 + i * 250}ms` }}>
                  <span className={`min-h-[24px] flex-1 rounded-md bg-gradient-to-br ${p.c}`} />
                  <span className="mt-1 truncate text-[9px] text-gray-700">{p.n}</span>
                  <span className="text-[10px] font-semibold text-gray-900">{p.p}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
