# Hitos — Inteligencia Aplicada

Inicio: 4 de noviembre de 2026. Contexto y justificación en [plan-implementacion.md](plan-implementacion.md).

**Responsables:** 👤 Tú (Marlon) · 🤖 Claude · 🤝 Ambos

Marca cada casilla al cumplirla. Al cierre de cada fase, revisamos las métricas antes de pasar a la siguiente.

---

## Fase 0 — Base legal e identidad · hasta el 18 nov 2026

**Meta:** existir formalmente y verse profesional.

- [ ] 👤 Constituir **Inteligencia Aplicada SpA** en "Empresa en un Día" (registrodeempresasysociedades.cl)
- [ ] 👤 Inicio de actividades en el SII y habilitar la facturación electrónica gratuita
- [ ] 👤 Buscar la marca en INAPI y evaluar el registro de la marca mixta (nombre + logo), clases 35 y 42
- [ ] 👤 Comprar `inteligenciaaplicada.cl` en NIC Chile
- [ ] 🤖 Conectar el dominio a la web y configurar `contacto@inteligenciaaplicada.cl` (Cloudflare Email Routing + "Enviar como" en Gmail)
- [ ] 👤 Instalar WhatsApp Business en el número +56 9 7663 0940, con perfil, horario, catálogo de servicios y logo
- [ ] 👤 Crear el Perfil de Empresa en Google
- [ ] 👤 Crear la página de empresa en LinkedIn y actualizar tu perfil personal (título: "Fundador · Inteligencia Aplicada")
- [ ] 👤 Enviarme tu foto profesional y una biografía corta
- [ ] 🤖 Agregar a la web la sección "Quién está detrás" (falta tu foto y biografía). Política de privacidad y términos de uso: listos

**Listo cuando:** la web está en el dominio `.cl`, con correo propio, tu cara visible y la política de privacidad publicada.

---

## Fase 1 — Kit de ventas y demo · hasta el 2 dic 2026

**Meta:** tener algo que mostrar y con qué cerrar.

- [x] 👤 Elegir el primer rubro: **clínicas** (4 nov)
- [ ] 🤖 Construir el **demo funcional del asistente de WhatsApp** para ese rubro (Cloud API + IA + agenda), en un número de prueba. Código listo en `demo-clinica/`; falta 👤 la API key de Anthropic y la app de Meta
- [x] 🤖 Plantilla reutilizable del bot (repositorio propio, documentada): `demo-clinica/`, se adapta con `data/clinica.json`
- [x] 🤖 Propuesta comercial tipo: alcance, plazos, precio en UF y garantía: `ventas/propuesta-comercial.md`
- [x] 🤖 Borradores de contrato de servicios, NDA y anexo de tratamiento de datos: `ventas/`
- [ ] 👤 Revisión de los contratos con un abogado (idealmente un aliado para la parte legal de la Ley 21.719)
- [x] 🤖 Checklist de diagnóstico de 30 minutos (preguntas, qué observar, plantilla de resumen): `ventas/checklist-diagnostico.md`
- [x] 🤖 Herramienta de auditoría para prospectos: analiza una web (velocidad, celular, HTTPS, botón de WhatsApp) y genera un informe de 1 página: `auditoria/`
- [x] 👤 Definir los precios "desde" de los 4 paquetes: `ventas/precios.md` (5 nov)
- [x] 🤖 Publicar los precios "desde" y el demo en la web: secciones "Pruébalo ahora" y "Precios" (5 nov)
- [ ] 👤 Configurar el CRM (HubSpot gratis o Notion) con las etapas del embudo
- [ ] 👤 Configurar el agendador de diagnósticos (Cal.com o Google Calendar) y enlazarlo desde la web

**Listo cuando:** cualquier prospecto puede probar el bot en vivo, agendar un diagnóstico solo y recibir una propuesta en menos de 48 horas.

---

## Fase 2 — Lanzamiento y pilotos · hasta el 31 dic 2026

**Meta:** 2 clientes piloto funcionando y primeras métricas reales.

- [ ] 👤 Mensaje a 30 contactos de tu red personal pidiendo presentaciones
- [ ] 🤝 Lista de 100 empresas objetivo con señales de necesidad (reseñas, web, horarios) cargada en el CRM
- [ ] 👤 Enviar de 10 a 15 auditorías personalizadas por día hábil (Loom + informe)
- [ ] 🤖 Calendario de contenido para LinkedIn: 8 publicaciones (demos, antes y después, Ley 21.719)
- [ ] 👤 Publicar 2 o 3 veces por semana
- [ ] 👤 Realizar al menos 8 diagnósticos
- [ ] 👤 Cerrar **2 pilotos** con descuento a cambio de un caso de éxito, una reseña y feedback
- [ ] 🤝 Implementar los pilotos con avances semanales al cliente
- [ ] 👤 Contactar a 3 posibles aliados (contadores o agencias de marketing) con una propuesta de comisión

**Listo cuando:** hay 2 pilotos en producción y el embudo tiene datos de al menos 100 contactos.

**Métricas a revisar:** tasa de respuesta, diagnósticos agendados, propuestas, cierres y horas reales por proyecto.

---

## Fase 3 — Primeros ingresos recurrentes · hasta el 31 mar 2027

**Meta:** clientes pagando mensualidad y prueba social publicada.

- [ ] 🤝 Documentar los 2 casos de éxito, con números reales y permiso del cliente
- [ ] 🤖 Publicar los casos y testimonios en la web
- [ ] 👤 Conseguir las primeras 5 reseñas en Google
- [ ] 👤 Cerrar **3 clientes pagados** (precio completo)
- [ ] 👤 Alcanzar **5 clientes con mensualidad** (soporte, bot o mantención)
- [ ] 🤝 Ajustar los precios con las horas reales de los pilotos
- [ ] 🤖 Segunda plantilla de rubro (el que no elegiste en la Fase 1)
- [ ] 👤 Postular a créditos de nube para la SpA (AWS Activate, Google for Startups o Microsoft for Startups)
- [ ] 👤 Revisar las convocatorias de Sercotec y Corfo que financian la digitalización de pymes, como argumento de venta para tus clientes

**Listo cuando:** los ingresos mensuales recurrentes cubren tus costos fijos y tienes 2 casos publicados.

---

## Fase 4 — Escalar · desde abr 2027

- [ ] Biblioteca de flujos de automatización por rubro
- [ ] Servicio de modernización y migración a la nube con un caso real
- [ ] Certificación AWS Cloud Practitioner u otra equivalente
- [ ] Evaluar la primera contratación o un freelancer de apoyo
- [ ] Licitaciones pequeñas en Mercado Público

---

## Registro de avances

| Fecha | Hito cumplido | Nota |
|---|---|---|
| 2026-11-04 | Nombre, logo, guía de marca y web publicada | `marlon-g-m.github.io/inteligencia-aplicada` |
| 2026-11-04 | Web v2 en React con portada animada | Publicada |
| 2026-11-04 | Modo guiado sin IA del asistente (costo $0) y herramienta de auditoría para prospectos | `demo-clinica/`, `auditoria/` |
| 2026-11-04 | Asistente de WhatsApp para clínicas (código, simulador, panel y 11 pruebas) | `demo-clinica/`, pendiente la conexión real |
| 2026-11-05 | Kit de ventas: propuesta tipo, contrato, NDA, anexo de datos y checklist de diagnóstico; términos de uso en la web | `ventas/`, contratos pendientes de revisión legal |
| 2026-11-05 | Demo del asistente guiado publicado en la web (sección "Pruébalo ahora") | Corre en el navegador, sin costo; auditoría 100/100 |
| 2026-11-05 | Precios "desde" de los 4 paquetes aprobados y publicados en la web | Revisados el mismo día: asistente 10 UF + 4 UF/mes, automatización 5 UF, web 7 UF (landing 4 UF), diagnóstico Ley 21.719 gratis |
