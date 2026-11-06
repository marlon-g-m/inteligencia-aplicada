import { ArrowRight, Bot, Check, Globe, ShieldCheck, Workflow } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { EASE, Reveal, SectionBadge, WHATSAPP } from '../components/ui'

/** Valor de referencia para mostrar los precios en pesos. Actualízalo de vez en cuando (sii.cl). */
const UF_REF = 41270
const UF_REF_MES = 'noviembre de 2026'

interface Plan {
  icon: LucideIcon
  name: string
  uf: number
  unit?: string
  monthly?: number
  monthlyNote?: string
  items: string[]
  extra: string
  featured?: boolean
}

// Fuente y criterio de estos valores: ventas/precios.md
const PLANS: Plan[] = [
  {
    icon: Bot,
    name: 'Asistente de WhatsApp con IA',
    uf: 10,
    monthly: 4,
    monthlyNote: 'Servidor, IA (hasta 500 conversaciones al mes) y soporte',
    items: ['Conectado al WhatsApp oficial de tu negocio', 'Agenda, confirma y cancela horas', 'Panel para tu equipo y derivación a una persona', 'Capacitación y 30 días de ajustes'],
    extra: 'Integración con tu software de agenda, más de 3 profesionales o recordatorios automáticos: se cotiza aparte.',
    featured: true,
  },
  {
    icon: Workflow,
    name: 'Automatización de procesos',
    uf: 5,
    unit: 'por flujo',
    monthly: 1,
    monthlyNote: 'Servidor, respaldos y monitoreo (hasta 5 flujos)',
    items: ['Un flujo simple: formulario → planilla → aviso por correo o WhatsApp', 'Conecta las herramientas que ya usas', 'Flujos con IA (leer documentos, clasificar, responder) desde 10 UF'],
    extra: 'El precio depende de la complejidad: cuántos pasos tiene el flujo y cuántas herramientas conecta. En el diagnóstico gratis te decimos cuál conviene automatizar primero y cuánto cuesta.',
  },
  {
    icon: Globe,
    name: 'Página web',
    uf: 7,
    monthly: 1,
    monthlyNote: 'Hosting, dominio y 1 hora de cambios al mes',
    items: ['Sitio a medida de hasta 5 secciones', 'Rápido, pensado para celular y con botón de WhatsApp', 'SEO básico y política de privacidad', 'Landing de una página con formulario de contacto: desde 4 UF'],
    extra: 'El precio depende de lo que tenga tu página: cuántas secciones, si lleva blog, reservas, pagos en línea o tienda (tienda online desde 20 UF).',
  },
  {
    icon: ShieldCheck,
    name: 'Diagnóstico Ley 21.719',
    uf: 0,
    items: ['Qué datos personales manejas y dónde están', 'Revisión de tu web, formularios y proveedores', 'Lista de lo que te falta para cumplir, con prioridades'],
    extra: 'La ley entra en plena vigencia el 1 de diciembre de 2026. Es un diagnóstico técnico; la adecuación se cotiza según lo que encontremos, y la parte legal la ve un abogado aliado.',
  },
]

const fmtUf = (n: number) => n.toLocaleString('es-CL', { maximumFractionDigits: 1 })
/** Pesos aproximados, redondeados a miles. */
const clp = (uf: number) => `$${(Math.round((uf * UF_REF) / 1000) * 1000).toLocaleString('es-CL')}`
const quote = (p: Plan) =>
  `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(p.uf ? `Hola, quiero cotizar el paquete "${p.name}".` : `Hola, quiero agendar el ${p.name.toLowerCase()} gratis.`)}`

export default function Pricing() {
  return (
    <section id="precios" className="bg-white pb-16 pt-16 sm:pb-20 sm:pt-20 lg:pb-28 lg:pt-28">
      <div className="mx-auto max-w-[1440px]">
        <SectionBadge n={6} label="Precios" />
        <Reveal>
          <h2 className="mb-4 px-5 text-[clamp(1.75rem,7vw,4.2rem)] font-medium leading-[1.08] tracking-[-0.03em] text-gray-900 sm:px-8 sm:text-[clamp(2.5rem,5vw,4.2rem)] lg:px-12">
            Precios claros desde el principio
          </h2>
          <p className="mb-10 max-w-[680px] px-5 text-[15px] leading-relaxed text-gray-600 sm:mb-14 sm:px-8 sm:text-[17px] lg:mb-16 lg:px-12">
            Estos son los valores de partida. Después del diagnóstico te enviamos una propuesta con el precio cerrado para tu caso, y ese es el que pagas.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 gap-5 px-5 sm:gap-6 sm:px-8 md:grid-cols-2 lg:px-12 xl:grid-cols-4 xl:gap-5">
          {PLANS.map((p, i) => (
            <Reveal key={p.name} delay={(i % 4) * 90} className="h-full">
              <article
                className={`flex h-full flex-col rounded-2xl p-6 sm:p-7 ${
                  p.featured ? 'bg-[#0B1F3A] text-white' : 'bg-[#F5F5F5] text-gray-900'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-full ${p.featured ? 'bg-white/10 text-[#7AA2FF]' : 'bg-[#2A44EE]/10 text-[#2A44EE]'}`}>
                    <p.icon size={18} aria-hidden="true" />
                  </span>
                  {p.featured && (
                    <a href="#demo" className="rounded-full bg-white/10 px-3 py-1 text-[12px] font-medium text-white transition-colors hover:bg-white/20">
                      Pruébalo arriba
                    </a>
                  )}
                </div>
                <h3 className="mt-5 text-[16px] font-semibold">{p.name}</h3>

                <p className={`mt-4 text-[13px] ${p.featured ? 'text-white/60' : 'text-gray-500'}`}>{p.uf ? 'Desde' : 'Valor'}</p>
                <p className="flex flex-wrap items-baseline gap-x-2">
                  <span className="text-[40px] font-medium leading-none tracking-[-0.03em]">{p.uf ? `${fmtUf(p.uf)} UF` : 'Gratis'}</span>
                  <span className={`text-[13px] ${p.featured ? 'text-white/60' : 'text-gray-500'}`}>{p.uf ? (p.unit ?? 'implementación') : ''}</span>
                </p>
                <p className={`mt-1 text-[13px] ${p.featured ? 'text-white/60' : 'text-gray-500'}`}>{p.uf ? `≈ ${clp(p.uf)} + IVA` : 'Sin compromiso'}</p>

                {p.monthly ? (
                  <div className={`mt-4 rounded-xl px-4 py-3 ${p.featured ? 'bg-white/10' : 'bg-white'}`}>
                    <p className="text-[15px] font-medium">+ {fmtUf(p.monthly)} UF al mes</p>
                    <p className={`text-[12px] ${p.featured ? 'text-white/60' : 'text-gray-500'}`}>{p.monthlyNote}</p>
                  </div>
                ) : (
                  <div className={`mt-4 rounded-xl px-4 py-3 ${p.featured ? 'bg-white/10' : 'bg-white'}`}>
                    <p className="text-[15px] font-medium">Sin mensualidad</p>
                    <p className={`text-[12px] ${p.featured ? 'text-white/60' : 'text-gray-500'}`}>Va incluido en el diagnóstico de 30 minutos</p>
                  </div>
                )}

                <ul className="mt-5 grid gap-2.5">
                  {p.items.map((it) => (
                    <li key={it} className="flex gap-2.5 text-[14px] leading-snug">
                      <Check size={16} className={`mt-0.5 flex-none ${p.featured ? 'text-[#7AA2FF]' : 'text-[#2A44EE]'}`} aria-hidden="true" />
                      <span className={p.featured ? 'text-white/85' : 'text-gray-700'}>{it}</span>
                    </li>
                  ))}
                </ul>
                <p className={`mt-5 text-[12px] leading-relaxed ${p.featured ? 'text-white/55' : 'text-gray-500'}`}>{p.extra}</p>

                <div className="min-h-6 flex-1" />
                <a
                  href={quote(p)}
                  rel="noopener"
                  className={`group inline-flex items-center justify-between gap-3 rounded-full py-2 pl-5 pr-2 text-[14px] font-medium transition-colors duration-300 ${
                    p.featured ? 'bg-[#2A44EE] text-white hover:bg-[#1F35C9]' : 'bg-gray-900 text-white hover:bg-gray-700'
                  }`}
                >
                  {p.uf ? 'Cotizar este paquete' : 'Agendar gratis'}
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
                    <ArrowRight size={15} className={`text-gray-900 transition-transform duration-500 ${EASE} group-hover:-rotate-45`} aria-hidden="true" />
                  </span>
                </a>
              </article>
            </Reveal>
          ))}
        </div>

        <div className="mt-8 grid gap-4 px-5 sm:px-8 lg:mt-10 lg:grid-cols-2 lg:px-12">
          <div className="rounded-2xl border border-[#2A44EE]/20 bg-[#EEF1FF] p-5 sm:p-6">
            <p className="text-[15px] font-semibold text-gray-900">Buscamos 2 clientes piloto</p>
            <p className="mt-1 text-[14px] leading-relaxed text-gray-600">
              40 % de descuento en la implementación, a cambio de contar tu caso (con tu permiso), una reseña en Google y una conversación de feedback al mes de uso.
            </p>
          </div>
          <div className="rounded-2xl bg-[#F5F5F5] p-5 sm:p-6">
            <p className="text-[15px] font-semibold text-gray-900">Garantía de 30 días</p>
            <p className="mt-1 text-[14px] leading-relaxed text-gray-600">
              Si en los primeros 30 días no funciona como lo acordamos y no logramos corregirlo, te devolvemos lo que pagaste por la implementación.
            </p>
          </div>
        </div>

        <p className="mt-6 px-5 text-[12px] leading-relaxed text-gray-500 sm:px-8 lg:px-12">
          Valores en UF más IVA. Los montos en pesos son aproximados, con la UF de {UF_REF_MES}; se factura con la UF del día. Sin permanencia mínima: la mensualidad se termina avisando con 30 días. Los costos de Meta por mensajes que inicia tu negocio se cobran al costo.
        </p>
      </div>
    </section>
  )
}
