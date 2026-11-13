import { topOpportunities, type Audit } from './checks.ts'
import { AGENCIA } from './reporte.ts'

const lowerFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1)

/**
 * Borrador del primer mensaje (correo o LinkedIn) para acompañar el informe.
 * Siempre se revisa y personaliza antes de enviarlo; nunca se envía en masa.
 * Va dirigido a la clínica, así que todo el texto trata de "ustedes" (nunca de "tú").
 */
export function outreachMessage(a: Audit, firma = 'Marlon'): string {
  const top = topOpportunities(a, 2)
  const puntos = top.length
    ? top.map((h) => `• ${h.titulo}: ${lowerFirst(h.detalle)}`).join('\n')
    : '• Su web está bien armada; la oportunidad está en automatizar la atención por WhatsApp.'
  return `Asunto: Revisé la web de ${a.sitio} (informe gratis)

Hola, ¿cómo están?

Soy ${firma}, ingeniero y fundador de ${AGENCIA.nombre}. Ayudamos a clínicas y pymes en Chile a atender y agendar mejor con automatización e IA.

Revisé la página de ${a.sitio} y encontré un par de cosas que les pueden estar costando pacientes:
${puntos}

Les adjunto un informe de una página con el detalle. Si les sirve, lo conversamos en 30 minutos, sin costo ni compromiso.

Saludos,
${firma}
${AGENCIA.nombre} · ${AGENCIA.whatsappTexto}
${AGENCIA.web}

Si prefieren que no les vuelva a escribir, respondan "no, gracias" y no los contacto más.`
}
