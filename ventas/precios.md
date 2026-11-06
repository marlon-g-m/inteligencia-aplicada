# Precios "desde"

> **Aprobado por Marlon el 5 de noviembre de 2026 y publicado en la web** (sección "Precios", `web/src/sections/Pricing.tsx`). Si cambias un valor aquí, cámbialo también allá. Los precios son sin IVA y en UF. Como referencia, la UF está en unos **$41.270** (noviembre de 2026, [SII](https://www.sii.cl/valores_y_fechas/uf/uf2026.htm)).

## Criterio

- **Posición: rango medio del mercado, no el más barato.** Lo que nos diferencia: trabajo de ingeniero, precio cerrado, las cuentas quedan a nombre del cliente y hay garantía. Competir por el precio más bajo contra plantillas de $150.000 no conviene.
- **Referencia interna: 1 UF por hora de trabajo** (unos $41.000), un valor razonable para un ingeniero independiente en Chile. Cada precio "desde" equivale a las horas de un proyecto simple. Si los pilotos muestran más horas, se sube.
- **Cada paquete tiene una mensualidad**, porque el ingreso recurrente es lo que sostiene la agencia (Fase 3).
- **Pilotos:** a los 2 primeros clientes, 40 % de descuento en la implementación (no en la mensualidad), a cambio de un caso de éxito, una reseña y feedback.

## Los 4 paquetes

### 1. Asistente de WhatsApp con IA: **desde 18 UF + 4 UF al mes**

| | Propuesta | Mercado en Chile |
|---|---|---|
| Implementación | **18 UF** (≈ $743.000) | $500.000 a $800.000 una consulta de 1 a 3 profesionales; $1,2 a $3 millones una clínica mediana |
| Mensualidad | **4 UF** (≈ $165.000) | $120.000 a $450.000, o 5 a 25 UF un agente operado por agencia |

- **Incluye:** la configuración con los datos del negocio, la conexión a la API oficial de WhatsApp en el número del cliente, la agenda con horarios, colación y feriados, el panel de recepción, la derivación a una persona, una capacitación de 1 hora y 30 días de ajustes.
- **La mensualidad incluye:** servidor, monitoreo, uso de IA hasta **500 conversaciones al mes**, cambios menores (precios, horarios, servicios) y soporte por WhatsApp.
- **Sube el precio si:** se integra con un software de agenda que ya usan (Dentalink, Medilink, Reservo, etc.), hay más de 3 profesionales, o se agregan recordatorios automáticos.
- **Aparte:** lo que cobra Meta por los mensajes que inicia la clínica, como los recordatorios. Se traspasa al costo, sin margen. Responder al paciente dentro de las 24 horas no tiene costo de Meta.
- **Margen:** con 500 conversaciones al mes, el costo de IA y servidor debería quedar bajo 1,5 UF. Hay que confirmarlo midiendo el piloto en la consola de Anthropic.

### 2. Automatización de procesos: **desde 8 UF por flujo + 1,5 UF al mes**

| | Propuesta | Mercado en Chile |
|---|---|---|
| Flujo simple (por ejemplo: formulario → planilla → correo/WhatsApp) | **8 UF** (≈ $330.000) | $300.000 a $800.000 |
| Flujo con IA (leer documentos, clasificar, responder) | **desde 15 UF** | $1 a $3 millones |
| Mensualidad (hasta 5 flujos) | **1,5 UF** (≈ $62.000) | n8n o Make: USD 10 a 20 al mes, solo la herramienta |

- **La mensualidad incluye:** servidor de n8n, respaldos, monitoreo de fallas y ajustes menores.
- **Gancho comercial:** el diagnóstico gratis de 30 minutos detecta 2 o 3 flujos. Se ofrece el primero y se muestra el ahorro en horas al mes.

### 3. Página web: **desde 12 UF + 1 UF al mes**

| | Propuesta | Mercado en Chile |
|---|---|---|
| Sitio para pyme (hasta 5 secciones, a medida) | **12 UF** (≈ $495.000) | 5,3 a 8,6 UF, con mediana de $295.000; $350.000 a $550.000 según otros blogs |
| Landing de una página | **7 UF** (≈ $290.000) | 3,1 a 6,5 UF |
| Mantención | **1 UF al mes** (≈ $41.000) | Rara vez se incluye; hosting de $12.000 a $50.000 al año |

- **Vamos por sobre la mediana a propósito.** El sitio es a medida (no una plantilla), carga rápido, se ve bien en celular, tiene botón de WhatsApp, SEO básico y política de privacidad según la Ley 21.719. Antes de entregar, se le pasa nuestra auditoría, y el informe va como prueba.
- **La mantención incluye:** hosting, renovación del dominio a nombre del cliente, respaldos y hasta 1 hora de cambios al mes.
- **Tienda online:** cotización aparte, desde unas 25 UF.

### 4. Diagnóstico Ley 21.719: **precio fijo 6 UF**

| | Propuesta | Mercado en Chile |
|---|---|---|
| Diagnóstico técnico | **6 UF** (≈ $248.000), descontable si luego contrata la adecuación | Desde gratis (como gancho comercial) hasta 10 UF + IVA |

- **Incluye:** un inventario de qué datos personales maneja el negocio y dónde los guarda, la revisión de la web (formularios, cookies, política de privacidad), los accesos, respaldos y proveedores, y un informe de brechas con prioridades.
- **Es un diagnóstico técnico, no asesoría legal.** La parte jurídica la hace el abogado aliado (Fase 1). Hay que decirlo así en la propuesta.
- **Es oportuno:** la ley entra en plena vigencia el **1 de diciembre de 2026**. Es un buen motivo para escribirle a prospectos este mes.

## Lo que tienes que decidir

1. **¿Te acomoda la posición en el rango medio?** La alternativa sería partir más abajo para cerrar los pilotos rápido, pero el descuento de piloto ya cumple ese rol.
2. **¿Los 4 paquetes se publican en la web**, o solo el asistente y la web, y los otros dos quedan "a cotizar"?
3. **¿500 conversaciones al mes incluidas en el asistente?** Es un tope fácil de explicar. Una clínica chica rara vez lo pasa.
4. **¿El diagnóstico de Ley 21.719 cobrado o gratis?** Cobrado da seriedad. Gratis atrae más prospectos, pero ya regalamos el diagnóstico general de 30 minutos.

Cuando lo apruebes (con o sin cambios), lo publico en la web y lo paso a la [propuesta comercial](propuesta-comercial.md).

## Fuentes

Casi todas las fuentes son blogs de empresas que venden estos servicios, así que son referencias comerciales y no un estudio de mercado neutral.

- Asistente de WhatsApp: [UPG](https://www.upg.cl/blog/cuanto-cuesta-chatbot-ia-whatsapp-chile/), [CercAI](https://cercai.cl/cuanto-cuesta-chatbot-ia-chile-2026/), [Rankaglia (clínicas)](https://rankaglia.com/tecnologia/desarrollo-chatbot-ia-clinicas-medicas/), [Creative Reach](https://creativereach.ai/es/blog/cuanto-cuesta-un-chatbot-de-whatsapp-en-chile)
- Automatización: [Álvaro Cofré](https://alvarocofre.dev/articulos/automatizacion-ia-pymes-chile), [Velai](https://velai.cl/blog/automatizacion-procesos-ia-pymes-chile/), [iAutomatiza](https://iautomatiza.cl/blog/n8n-vs-make-vs-zapier)
- Páginas web: [Rocket Media (estudio de 14 agencias)](https://rocketmedia.cl/blog/cuanto-cuesta-una-pagina-web-en-chile/), [OptiWeb](https://www.optiweb.cl/blog/cuanto-cuesta-una-pagina-web-en-chile), [Best Solution](https://bestsolution.cl/cuanto-cuesta-pagina-web-chile-2026/)
- Ley 21.719: [IDATA Chile](https://www.idatachile.com/proteccion-datos.html), [Apollo.TI](https://apolloti.cl/blog/cuanto-cuesta-adecuarse-ley-21719), [SmartDPO](https://www.smartdpo.cl/)
