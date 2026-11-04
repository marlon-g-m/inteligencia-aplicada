import { createHmac, timingSafeEqual } from 'node:crypto'

// Integración con la WhatsApp Business Platform (Cloud API oficial de Meta).
// Docs: https://developers.facebook.com/docs/whatsapp/cloud-api

export interface WhatsAppConfig {
  token: string // token de acceso (de un usuario del sistema en Meta Business)
  phoneNumberId: string
  appSecret: string // para validar la firma X-Hub-Signature-256
  verifyToken: string // texto que inventas tú y pegas en la configuración del webhook
  graphVersion: string
}

export interface IncomingText {
  id: string
  from: string // número en formato internacional sin "+", p. ej. 56912345678
  name?: string
  text: string
}

/** Valida que el webhook venga de Meta (HMAC-SHA256 del cuerpo crudo con el App Secret). */
export function validSignature(rawBody: Buffer, header: string | undefined, appSecret: string): boolean {
  if (!header?.startsWith('sha256=')) return false
  const expected = createHmac('sha256', appSecret).update(rawBody).digest()
  const given = Buffer.from(header.slice(7), 'hex')
  return given.length === expected.length && timingSafeEqual(given, expected)
}

/** Respuesta a la verificación inicial del webhook (GET). Devuelve el challenge o null. */
export function verifyChallenge(params: URLSearchParams, verifyToken: string): string | null {
  return params.get('hub.mode') === 'subscribe' && params.get('hub.verify_token') === verifyToken
    ? params.get('hub.challenge')
    : null
}

interface WebhookBody {
  object?: string
  entry?: {
    changes?: {
      value?: {
        contacts?: { wa_id?: string; profile?: { name?: string } }[]
        messages?: { id: string; from: string; type: string; text?: { body?: string } }[]
      }
    }[]
  }[]
}

/** Extrae los mensajes entrantes. Los que no son texto se devuelven aparte para responder con un aviso. */
export function parseWebhook(body: WebhookBody): { texts: IncomingText[]; others: { id: string; from: string }[] } {
  const texts: IncomingText[] = []
  const others: { id: string; from: string }[] = []
  if (body.object !== 'whatsapp_business_account') return { texts, others }
  for (const entry of body.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const v = change.value
      const names = new Map((v?.contacts ?? []).map((c) => [c.wa_id, c.profile?.name]))
      for (const m of v?.messages ?? []) {
        if (m.type === 'text' && m.text?.body) texts.push({ id: m.id, from: m.from, name: names.get(m.from), text: m.text.body })
        else others.push({ id: m.id, from: m.from })
      }
    }
  }
  return { texts, others }
}

export function createWhatsApp(cfg: WhatsAppConfig) {
  const url = `https://graph.facebook.com/${cfg.graphVersion}/${cfg.phoneNumberId}/messages`
  async function post(payload: unknown) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${cfg.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error(`WhatsApp API ${res.status}: ${await res.text()}`)
  }
  return {
    sendText: (to: string, body: string) =>
      post({ messaging_product: 'whatsapp', recipient_type: 'individual', to, type: 'text', text: { preview_url: false, body } }),
    markRead: (messageId: string) => post({ messaging_product: 'whatsapp', status: 'read', message_id: messageId }),
  }
}
