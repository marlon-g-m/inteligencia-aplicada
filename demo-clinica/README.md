# Demo: asistente de WhatsApp con IA para clínicas

Producto estrella de Inteligencia Aplicada. Un asistente que atiende pacientes por WhatsApp: responde dudas, **agenda, revisa y cancela horas reales** y deriva a recepción cuando hace falta.

La clínica de esta demo, **Clínica Dental Sonrisa Sur**, es ficticia. Para un cliente real basta con cambiar `data/clinica.json`.

## Dos modos

| Modo | Costo | Cómo conversa | Cuándo usarlo |
|---|---|---|---|
| **guion** (por defecto sin API key) | $0 | Menú con botones y listas de WhatsApp. Entiende frases típicas por palabras clave ("quiero hora para limpieza", "me duele una muela", "cuánto cuesta", "cancelar") y acepta números para elegir. Si no entiende, vuelve a ofrecer las opciones. | Demos con prospectos sin gastar, o clínicas que prefieren un flujo cerrado |
| **ia** (por defecto con API key) | Pago por uso de la API de Claude | Conversación libre y natural, con las mismas herramientas de agenda | El producto que se vende |

Los dos usan la misma agenda, el mismo panel y la misma conexión a WhatsApp. Se elige con `ASSISTANT_MODE` en el `.env`.

## Qué incluye

| Pieza | Dónde | Qué hace |
|---|---|---|
| Asistente con IA | `src/assistant.ts` | Conversa con la API de Claude y usa 5 herramientas: `buscar_horarios`, `agendar_hora`, `mis_horas`, `cancelar_hora` y `derivar_a_humano` |
| Asistente guiado | `src/scripted.ts` | Flujo con opciones, sin IA: menú, agendar, precios, dirección, mis horas, cancelar, urgencias y derivar a recepción |
| Agenda | `src/agenda.ts` | Calcula horas libres según horario, almuerzo, feriados, duración del servicio y anticipación mínima. Evita dobles reservas. |
| WhatsApp | `src/whatsapp.ts` | Webhook oficial de la Cloud API de Meta, con validación de firma y deduplicación de mensajes |
| Simulador | `http://localhost:3000/demo` | Chat estilo WhatsApp en el navegador, para mostrarle la demo a un prospecto sin configurar Meta |
| Panel de recepción | `http://localhost:3000/panel` | Próximas horas y conversaciones derivadas, con un botón para devolverlas al asistente |
| Datos | SQLite incluido en Node (`data/demo.db`) | Sin servidor de base de datos |

## Puesta en marcha local (5 minutos)

Requisitos: Node.js 22.18 o superior (se probó con Node 24).

```bash
cd demo-clinica
```

```bash
npm install
```

```bash
cp .env.example .env
```

Para el modo guiado no necesitas completar nada. Para el modo con IA, pega tu `ANTHROPIC_API_KEY` en `.env`. Luego:

```bash
npm start
```

Abre http://localhost:3000/demo y conversa. Las horas que agendes aparecen en http://localhost:3000/panel.

Para correr las 19 pruebas, que no requieren API key:

```bash
npm test
```

## Conectar WhatsApp (Cloud API oficial)

1. Crea una cuenta en [developers.facebook.com](https://developers.facebook.com) y una app de tipo **Business** con el producto **WhatsApp**.
2. En **WhatsApp > API Setup**, Meta te da un número de prueba gratuito y hasta 5 números destinatarios para probar. Copia el **Phone number ID**.
3. Crea un **usuario del sistema** en Meta Business Suite con permiso `whatsapp_business_messaging` y genera un token permanente. El token temporal de la consola dura 24 horas.
4. Copia el **App Secret** (Configuración de la app > Básica).
5. Inventa un `WHATSAPP_VERIFY_TOKEN` y completa el `.env`.
6. El servidor tiene que ser accesible por HTTPS. Para probar desde tu PC, usa un túnel, por ejemplo `cloudflared tunnel --url http://localhost:3000`.
7. En **WhatsApp > Configuración**, registra el webhook `https://TU-URL/webhook` con tu verify token y suscríbete al campo `messages`.
8. Escribe desde tu celular al número de prueba. En modo guiado verás los botones y las listas de WhatsApp.

> **Importante:** usa siempre la API oficial. Las librerías no oficiales que imitan WhatsApp Web pueden hacer que Meta bloquee el número de la clínica.

### Lo que cobra Meta ⚠️

Responder a un paciente dentro de las 24 horas desde su último mensaje no tiene costo de Meta. Los mensajes que inicia la clínica, como los recordatorios, requieren **plantillas aprobadas** y Meta los cobra por mensaje. Revisa los precios vigentes para Chile en la documentación de Meta antes de cotizar.

## Costos de la IA

- El modelo por defecto es `claude-opus-5-5` ($4 por millón de tokens de entrada y $20 por millón de salida). Usa esfuerzo `low`, que es lo adecuado para chat, y caché de prompts: las instrucciones fijas se cobran a precio reducido desde el segundo mensaje.
- Con `CLAUDE_MODEL` puedes probar otro modelo, por ejemplo `claude-haiku-5-5` ($0,10 / $0,50), que es mucho más barato. Pruébalo con conversaciones reales antes de elegir: lo que importa es que agende bien.
- El costo real por conversación depende del largo de cada una. Mídelo en la consola de Anthropic con un piloto antes de fijar la mensualidad del cliente.
- Además, hay un tope de 60 mensajes por contacto al día y un límite por IP en el simulador, para que nadie dispare el costo.

## Seguridad y datos (Ley 21.719)

- Los datos de salud son **datos sensibles**. Por eso el asistente solo pide el nombre y nunca pregunta síntomas en detalle, diagnósticos ni RUT.
- La conversación se guarda para dar continuidad. Tras 6 horas sin actividad parte de cero.
- Para un cliente real:
  - Define cuánto tiempo se guardan los datos.
  - Publica un aviso de privacidad, con un enlace en el primer mensaje.
  - Firma un anexo de tratamiento de datos.
  - Deja las cuentas de Meta, Anthropic y el servidor **a nombre de la clínica**.
- El panel exige usuario y clave (`PANEL_PASSWORD`) cuando el servidor es accesible desde internet. Sin clave, solo responde a pedidos desde el mismo equipo.
- La firma de cada webhook se valida con el App Secret. Los mensajes repetidos se ignoran.

## Adaptar a otra clínica

Edita `data/clinica.json`: nombre, dirección, horario por día, feriados, profesionales, servicios con duración y precio, medios de pago y preguntas frecuentes. Las instrucciones del asistente se generan solas a partir de ese archivo (`src/clinic.ts`).

## Próximos pasos del producto

- [ ] Recordatorio automático el día anterior (requiere una plantilla aprobada por Meta)
- [ ] Sincronización con Google Calendar o con el software de agenda que ya use la clínica
- [ ] Mensajes de voz (transcripción) e imágenes
- [ ] Publicar el simulador en un servidor para enlazarlo desde la web de la agencia
