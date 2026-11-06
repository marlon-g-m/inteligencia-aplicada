# Pendientes

Lista corta de lo que falta, para retomar en otra sesión. El detalle por fase está en [HITOS.md](HITOS.md).
Actualizado: 6 de noviembre de 2026.

## Estado actual

- **Web publicada** en https://inteligenciaaplicada.vercel.app/ (principal) y en GitHub Pages (respaldo). Incluye el demo del asistente, los precios, la sección "Quién está detrás" con foto, y la política de privacidad y los términos de uso.
- **Precios aprobados:**
  - Agente de IA para WhatsApp: 10 UF + 4 UF al mes.
  - Agente de confirmaciones: 6 UF + 2 UF al mes (con el agente de WhatsApp: 3 UF + 1 UF al mes).
  - Automatización: 5 UF por flujo + 1 UF al mes.
  - Web: 7 UF (landing desde 4 UF) + 1 UF al mes.
  - Diagnóstico Ley 21.719: gratis.
  - Pilotos: 40 % de descuento.

  Detalle y criterio en [ventas/precios.md](../ventas/precios.md).
- **Prospección:** 24 clínicas dentales auditadas y priorizadas, con informes en PDF de las de prioridad A. Están en `ventas/prospectos/` (privado, fuera de Git) y las plantillas en [ventas/mensajes-prospeccion.md](../ventas/mensajes-prospeccion.md).

## Te toca a ti (Marlon)

**Ventas, lo más urgente.** La Ley 21.719 entra en plena vigencia el 1 de diciembre de 2026, y es el mejor gancho:
- [ ] Visitar las clínicas de **Rengo** con su informe impreso: Guema (Arturo Prat 54), Biodont (Urriola 618-A) y Samy (Arturo Prat 211, su web está caída).
- [ ] Escribir a Intersalud y Centro Odontológico (Rancagua), y a Almahue y CEOS (Providencia).
- [ ] Mandar el mensaje a tus 30 contactos personales, pidiendo presentaciones.
- [ ] Anotar cada contacto en la tabla de seguimiento de `ventas/prospectos/lista-priorizada-2026-11.md`.

**Identidad y trámites:**
- [ ] Comprar `inteligenciaaplicada.cl` en NIC Chile.
- [ ] Constituir la SpA, hacer el inicio de actividades en el SII y habilitar la facturación electrónica.
- [ ] Buscar la marca en INAPI.
- [ ] Instalar WhatsApp Business en el +56 9 7663 0940, con perfil, horario y catálogo.
- [ ] Crear el Perfil de Empresa en Google y la página de empresa en LinkedIn.
- [ ] Que un abogado revise los contratos, el NDA y el anexo de datos de `ventas/`.

**Para el demo real:**
- [ ] Conseguir la API key de Anthropic y crear la app de Meta (WhatsApp Cloud API), para conectar `demo-clinica/` a un número de prueba.

**Herramientas:**
- [ ] Configurar el CRM (HubSpot gratis o Notion) y el agendador de diagnósticos (Cal.com o Google Calendar).

## Puede hacerlo Claude

- [x] **Agente de confirmaciones** construido en `demo-clinica/` (6 nov): envío diario, reagendar o cancelar, aviso de cupo libre, panel y simulador, con 11 pruebas. Falta: crear la plantilla `confirmacion_hora` en Meta cuando exista la app (ver `demo-clinica/README.md`) y probarlo con un número real.
- [ ] **Opcional:** sumar la confirmación al demo de la web (`web/`), que hoy solo tiene el agente de agenda.
- [ ] **Cuando exista el dominio:** conectarlo a Vercel y configurar `contacto@inteligenciaaplicada.cl` (Cloudflare Email Routing + "Enviar como" en Gmail).
- [ ] **Cuando estén la API key y la app de Meta:** conectar el asistente de `demo-clinica/` a WhatsApp y probarlo de punta a punta.
- [ ] **Calendario de LinkedIn:** 8 publicaciones redactadas (el demo, un antes y después, la Ley 21.719, etc.).
- [ ] **Completar la lista de prospectos** hasta llegar a 100 (otras comunas u otros rubros), con su auditoría.
- [ ] **Auditoría:** el mensaje generado mezcla "tú" y "ustedes" ("¿cómo estás?" y luego "les pueden estar costando"). Hay que dejarlo todo en "ustedes". Además, el informe queda en 2 páginas y no en 1.
- [ ] **Limpieza:** actualizar o borrar `AGENTS.md`, que está sin commit y desactualizado (todavía habla de GitHub Pages y no menciona Vercel ni `ventas/`).
- [ ] **Mantención:** actualizar de vez en cuando `UF_REF` en `web/src/sections/Pricing.tsx`, que hoy usa una UF de $41.270 (noviembre de 2026).

## Cómo se trabaja en este repo (lo que no es obvio)

- **Desplegar en Vercel:** hay que lanzar `npx vercel@48.10.2 deploy --prod --yes` desde `web/` en el panel de terminal del usuario. Las terminales de Claude no ven la sesión de Vercel. Si no hay sesión, el usuario corre `npx vercel@48.10.2 login`.
- **Push a `main`:** si toca `web/**`, despliega GitHub Pages. Pide autorización antes.
- **El motor del demo de la web** es una copia de `demo-clinica/src`. Si cambias el bot, corre `npm run sync:demo` en `web/`.
- **Si cambias un precio,** cámbialo en `ventas/precios.md` y también en `web/src/sections/Pricing.tsx` y en la FAQ (`web/src/sections/Rest.tsx`).
