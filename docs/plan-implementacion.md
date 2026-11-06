# Plan de implementación — Inteligencia Aplicada

Fecha: 4 de noviembre de 2026. Los hitos con fechas y responsables están en [HITOS.md](HITOS.md).

> **Ojo con los planes gratuitos:** los límites y condiciones de los planes gratis cambian seguido. Todo lo marcado con ⚠️ hay que confirmarlo en la página oficial antes de usarlo con un cliente.

---

## 1. Herramientas: qué usamos y qué falta implementar

### 1.1 Lo que ya tenemos (costo $0)

| Área | Herramienta | Estado |
|---|---|---|
| Web de la agencia | React + Vite + Tailwind, publicada en GitHub Pages | ✅ Publicada (falta dominio propio) |
| Código y versiones | GitHub (cuenta marlon-g-m) | ✅ |
| Desarrollo | Claude Code (yo) + tu experiencia de ingeniero | ✅ |
| Correo | Gmail `inteligenciaaplicada.cl@gmail.com` | ✅ Temporal |
| Contacto | WhatsApp +56 9 7663 0940 | ✅ Pasar a WhatsApp Business |
| Marca | Logo IA, guía de marca (`brand/BRAND.md`) | ✅ |

### 1.2 Lo que necesitamos para entregar cada servicio

Para cada servicio: el "stack" estándar que usaremos con todos los clientes, para no partir de cero cada vez.

#### Asistentes de WhatsApp con IA (producto estrella)

| Pieza | Herramienta recomendada | Costo | Nota |
|---|---|---|---|
| Canal | **WhatsApp Business Platform (Cloud API de Meta)** | Gratis la plataforma; Meta cobra por mensajes de plantilla ⚠️ | Es la vía oficial. **No usar** librerías no oficiales (Baileys, Evolution API en modo no oficial): Meta puede bloquear el número del cliente. |
| Cerebro | API de Claude (Anthropic) | Pago por uso, se traspasa al cliente | Alternativa con plan gratis para la demo: API de Gemini ⚠️ |
| Orquestación | **n8n Community** (instalado en servidor propio) | Gratis ⚠️ licencia | Su licencia ("Sustainable Use") permite construir flujos para clientes, pero **no** revender n8n como servicio alojado. Instálalo en la cuenta del cliente. Confirmar en la FAQ de n8n. |
| Bandeja humana | Chatwoot (código abierto) | Gratis instalado propio | Para que el equipo del cliente tome la conversación cuando el bot deriva. |
| Agenda | Google Calendar o Cal.com | Gratis | |
| Base de datos | Supabase (plan free) | Gratis ⚠️ | El proyecto gratis se pausa si no tiene uso; para producción conviene el plan pago o Postgres en el servidor. |

**Qué debo implementar (Claude):** una plantilla reutilizable del bot: webhook de WhatsApp, prompt con la información del negocio, derivación a humano, agenda y registro en base de datos. Con eso, cada cliente nuevo es 70 % configuración y 30 % desarrollo.

#### Automatización de procesos

| Pieza | Herramienta | Costo |
|---|---|---|
| Flujos | n8n Community (servidor propio) | Gratis |
| Servidor | Oracle Cloud "Always Free" o Google Cloud e2-micro ⚠️ | Gratis con límites |
| Planillas | Google Sheets / Excel en OneDrive | Lo que el cliente ya tiene |
| Facturación electrónica | Sistema gratuito del SII (MiPyme) o el que use el cliente | Gratis |

**Por implementar:** biblioteca de 5 flujos tipo (cotización automática, recordatorio de cobranza, reporte semanal por correo, respaldo de planillas, alerta de stock).

#### Páginas y aplicaciones web

| Pieza | Herramienta | Costo | Nota |
|---|---|---|---|
| Hosting de clientes | **Cloudflare Pages** | Gratis | Permite uso comercial. **Evita Vercel Hobby para clientes:** ese plan es solo para uso personal, no comercial ⚠️. GitHub Pages tampoco está pensado para sitios comerciales. |
| Dominio | NIC Chile (`.cl`) | ~10 mil pesos al año ⚠️ | Lo paga el cliente, a su nombre. |
| Formularios | Formspree o Web3Forms (plan free) ⚠️ | Gratis | |
| Métricas | Cloudflare Web Analytics o Google Analytics 4 | Gratis | |
| SEO local | Google Search Console + Perfil de Empresa en Google | Gratis | |

**Por implementar:** plantilla base de sitio para pyme (la de nuestra web, adaptable por rubro).

#### Modernización de sistemas y migración a la nube

| Pieza | Herramienta | Costo |
|---|---|---|
| Nubes | AWS, Google Cloud, Azure | Capas gratis y créditos de bienvenida ⚠️ |
| Programas de créditos | AWS Activate, Google for Startups, Microsoft for Startups | Postular cuando exista la SpA ⚠️ |
| Infraestructura como código | Terraform u OpenTofu | Gratis |
| Contenedores | Docker | Gratis |
| Monitoreo | UptimeRobot + Sentry (planes free) | Gratis |
| Respaldos | rclone + almacenamiento del cliente | Gratis |

**Por implementar:** checklist de auditoría técnica (qué tiene el cliente, riesgos, plan por etapas) y plantilla de informe.

#### Ley 21.719 (datos personales)

| Pieza | Herramienta | Costo |
|---|---|---|
| Inventario de datos | Planilla plantilla (qué datos, dónde, quién accede, para qué) | Gratis |
| Documentos | Política de privacidad, registro de actividades, protocolo de incidentes | Plantillas propias |

⚠️ Para la parte legal, alíate con un abogado: nosotros hacemos lo técnico (dónde están los datos, accesos, seguridad); el abogado firma lo jurídico. Esto también suma confianza.

### 1.3 Herramientas para operar la agencia (también gratis)

| Para qué | Herramienta |
|---|---|
| Pipeline de clientes | HubSpot CRM gratis o un tablero en Notion ⚠️ |
| Videollamadas | Google Meet |
| Agendar diagnósticos | Cal.com o "Agenda de citas" de Google Calendar ⚠️ |
| Videos de auditoría para prospectos | Loom (plan free) ⚠️ |
| Facturación | Portal gratuito del SII |
| Contratos | Firma electrónica simple (válida para contratos privados según la Ley 19.799) |
| Correo masivo con permiso | Brevo (plan free) ⚠️ |

---

## 2. Plan de marketing: encontrar empresas que nos necesiten

### 2.1 Cliente ideal (empezar con 2 rubros, no todos)

| Rubro | Por qué | Dolor típico |
|---|---|---|
| **Clínicas dentales, kinesiología y veterinarias** | Viven de la agenda, usan WhatsApp todo el día | Horas que no se confirman, recepción saturada |
| **Corredoras de propiedades** | Muchas consultas repetidas, venta de alto valor | Interesados que se pierden por no responder rápido |
| Estudios contables (segunda ola) | Mucho papeleo repetitivo | Documentos por correo y WhatsApp, vencimientos |
| Distribuidoras y ferreterías (segunda ola) | Cotizan a mano | Cotizaciones lentas, stock desordenado |

**Recomendación:** partir con clínicas y corredoras, porque el asistente de WhatsApp se demuestra en 5 minutos y el valor se nota de inmediato.

### 2.2 Señales de que una empresa nos necesita

Revisa estas señales antes de contactar a alguien. Así cada mensaje es personalizado y no spam:

- Reseñas en Google que dicen "no contestan", "nunca responden", "difícil conseguir hora".
- Web lenta, sin versión para celular, sin HTTPS o sin botón de WhatsApp.
- Solo atiende "de 9 a 18" y no tiene reservas en línea.
- Publica en Instagram, pero sus respuestas tardan días.
- Su formulario de contacto no funciona (pruébalo).

### 2.3 Dónde encontrarlas (gratis)

| Fuente | Cómo usarla |
|---|---|
| Google Maps | Busca "clínica dental Providencia", "corredora de propiedades Ñuñoa" y revisa las reseñas. |
| Doctoralia, Portal Inmobiliario, Yapo | Listados públicos por rubro. |
| LinkedIn | Dueños y gerentes de pymes; aquí buscas personas, no empresas. |
| Tu red | Familia, amigos, excompañeros: ¿quién tiene o trabaja en una pyme? Es el canal que más rápido convierte. |
| Cámaras y gremios | Cámara de Comercio de Santiago, asociaciones gremiales del rubro, eventos de Sercotec y Corfo. |
| Mercado Público (ChileCompra) | Licitaciones pequeñas de desarrollo web y soporte, para más adelante. |

### 2.4 Canales y tácticas

1. **Red personal y referidos (semana 1):** un mensaje a 30 contactos explicando qué haces y pidiendo que te presenten a alguien. Ofrece una comisión o descuento por cliente referido.
2. **Auditoría gratuita personalizada (la táctica del video de Benjamín Cordero):** eliges una empresa con señales de necesidad y grabas un Loom de 2 minutos mostrando su web o su WhatsApp y cómo lo mejorarías. Puedes sumar una captura del rediseño. Se envía por correo o LinkedIn, **de 10 a 15 por día, cada uno personalizado.**
3. **LinkedIn (constante):** 2 o 3 publicaciones por semana desde tu perfil personal: demos cortas del bot, antes y después de una automatización, explicaciones simples de la Ley 21.719. Yo te ayudo a redactarlas.
4. **Perfil de Empresa en Google:** gratis. Te pone en Maps cuando alguien busca "automatización Santiago" y es donde llegarán tus primeras reseñas.
5. **Alianzas:** contadores y agencias de marketing que ya atienden pymes y no hacen tecnología. Les das una comisión por cliente referido.
6. **Contenido sobre la Ley 21.719 (urgente):** entra en vigencia el 1 de diciembre de 2026 ⚠️. Ofrece un "chequeo gratuito de datos personales" de 20 minutos como gancho.

**Lo que no hay que hacer:**
- Mensajes masivos por WhatsApp a números que no te escribieron: va contra las políticas de WhatsApp y te pueden bloquear el número.
- Comprar bases de datos de correos.
- Al contactar empresas en frío, usa datos de contacto comerciales públicos, preséntate claro y ofrece dejar de escribir si no les interesa (opt-out). Así cumples con la ley de datos y no dañas tu reputación.

### 2.5 Embudo y metas (hipótesis para ajustar con datos reales)

| Etapa | Meta por mes |
|---|---|
| Empresas contactadas con auditoría personalizada | 100 |
| Respuestas | 15–20 |
| Diagnósticos de 30 minutos | 6–8 |
| Propuestas enviadas | 4–5 |
| Clientes cerrados | 1–2 |

Mide todo en el CRM desde el primer día: así sabrás qué canal funciona y dónde se cae el embudo.

### 2.6 Oferta de lanzamiento

- **Programa piloto:** 2 clientes con un 40 % de descuento a cambio de un caso de éxito publicado (con permiso), una reseña en Google y una reunión de feedback.
- **Paquetes con precio "desde" en UF** (definir después de los pilotos, cuando sepas cuántas horas toma cada uno):
  - Asistente WhatsApp: instalación + mensualidad.
  - Automatización: por flujo + soporte.
  - Web: pago único + mantención.
  - Diagnóstico Ley 21.719: precio fijo.

---

## 3. Qué falta para generar confianza

### 3.1 Diagnóstico actual

| Aspecto | Hoy | Lo que falta |
|---|---|---|
| Identidad legal | Persona natural | SpA, inicio de actividades en el SII, factura electrónica |
| Dominio y correo | `github.io` + Gmail | `inteligenciaaplicada.cl` + `contacto@inteligenciaaplicada.cl` |
| Rostro humano | La web no muestra quién está detrás | Sección "Quién está detrás" con tu foto, nombre, trayectoria y LinkedIn. **Es lo que más confianza genera en una agencia nueva.** |
| Prueba social | Ningún caso | 2 pilotos documentados, reseñas en Google, testimonios reales con permiso |
| Demostración | Chat ilustrativo en la web | Demo funcional: un número de WhatsApp donde el prospecto pruebe el bot en vivo |
| Legal en la web | Nada | Política de privacidad y términos de uso (obligatorio con la Ley 21.719) |
| Contratos | Nada | Contrato de servicios tipo, acuerdo de confidencialidad (NDA), anexo de tratamiento de datos |
| Proceso | Descrito en la web | Propuesta tipo en PDF, cronograma, reportes semanales al cliente |
| Garantías | Ninguna | Por ejemplo: "si el asistente no funciona como lo acordamos en 30 días, devolvemos la instalación". Una garantía concreta baja la barrera de compra. |
| Seguridad | Nada escrito | Política breve: accesos con 2FA, cuentas a nombre del cliente, respaldos, borrado de datos al terminar |
| Precios | "A cotizar" | Precios "desde" publicados |
| Credenciales | Ninguna visible | Certificaciones (ver abajo) y portafolio en GitHub |

### 3.2 Credenciales accesibles

- Insignias gratuitas de Google Cloud Skills Boost y cursos gratuitos de Anthropic Academy y Microsoft Learn ⚠️.
- AWS Certified Cloud Practitioner (pago, unos USD 100 ⚠️): sirve para vender migraciones a la nube.
- Tu título y experiencia de ingeniero: muéstralos. Para una pyme pesa más "lo hace un ingeniero" que cualquier insignia.

### 3.3 Principios que dan confianza (y que ya están en la marca)

- **Las cuentas son del cliente:** el dominio, el WhatsApp, la nube y los datos quedan a su nombre. Nunca lo "secuestramos". Dilo en voz alta: es un diferenciador.
- Precio cerrado y sin letra chica.
- Avances cada semana, visibles.
- Nada de testimonios, logos ni cifras inventadas.

---

## 4. Siguientes pasos

Ver [HITOS.md](HITOS.md): hitos por fase, con fecha, responsable y criterio de "listo".
