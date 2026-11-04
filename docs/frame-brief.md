# Brief F.R.A.M.E. — Web de Inteligencia Aplicada

Método del video de Benjamín Cordero ("Páginas Web ANIMADAS de $10,000 con Claude Design"):
**planificar primero**, generar los recursos visuales después y armar la página en un solo intento.

| Paso | Qué es | Cómo lo hicimos aquí |
|---|---|---|
| **F** Fundación | Brief, marca, estructura y prompts antes de diseñar | `brand/BRAND.md` + este documento |
| **R** Render | Imágenes generadas con IA (ChatGPT Images, Higgsfield) | Reemplazado por una animación en código (canvas): no requiere herramientas de pago y pesa casi nada |
| **A** Animación | Video en loop (primer y último cuadro iguales) | La animación en canvas es un loop infinito por diseño |
| **M** Montaje | La página armada en un solo prompt (Claude Design) | Construida directamente en código en `site/` |
| **E** Entrega | GitHub + Vercel o Cloudflare | Pendiente: ver README |

## Lo que tomamos del video

- Portada cinematográfica a pantalla completa con fondo en movimiento.
- La portada se desvanece al bajar, para dar descanso a la vista.
- Poco texto por bloque y mucho espacio: nada de páginas "bombardeadas" de información.
- Aparición suave de cada bloque al hacer scroll.
- Una sección que rota sola (rubros) y se detiene al pasar el mouse.
- Franja en movimiento que se detiene al pasar el mouse.
- Proceso en 4 pasos "sin fricción" y precio "sin letra chica".
- No usar reseñas inventadas: el video las usa, pero publicar testimonios falsos daña la confianza y puede ser publicidad engañosa. Las agregamos cuando haya clientes reales.

## Si quieres llevarla a Claude Design (opcional)

Pega este prompt en claude.ai/design junto con `brand/logo-horizontal.svg` y una captura de la web actual:

```text
Rediseña en alta fidelidad la landing de "Inteligencia Aplicada", consultora tecnológica chilena
(automatización, asistentes de WhatsApp con IA, web, modernización de sistemas, migración a la nube
y adecuación a la Ley 21.719 de datos personales). Público: gerentes de pymes chilenas.

Marca: formal y confiable. Azul marino #0B1F3A, fondo #F7F8FA, único acento azul real #1D4ED8
(#7AA2FF en modo oscuro). Títulos en Manrope 700 con una palabra en Instrument Serif cursiva.
Tono: cercano, directo, tuteo, sin jerga.

Estructura: portada oscura a pantalla completa con fondo animado de líneas de datos y titular
"Modernizamos lo que ya funciona en tu empresa"; franja de tecnologías en movimiento; frase del
problema; servicios en bento; asistente de WhatsApp con chat de ejemplo; antes/después; rubros en
pestañas que rotan solas; proceso en 4 pasos; preguntas frecuentes; contacto que abre WhatsApp.

Movimiento: la portada se desvanece al hacer scroll, los bloques aparecen con fundido suave, todo
con versión de movimiento reducido. Sin testimonios ni logos de clientes. Sin robots ni cerebros.
```

## Prompts para generar recursos visuales (opcional)

Si más adelante quieres un video de fondo en vez de la animación en código:

- **Imagen (ChatGPT Images / Higgsfield):** "Abstract dark navy background (#0B1F3A), thin flowing luminous blue lines like data streams crossing from left to right, a few soft glowing points traveling along them, cinematic, minimal, lots of negative space on the left for text, no text, no robots, 16:9, 4K."
- **Video (Seedance / Kling):** usar la misma imagen como primer y último cuadro. "Slow, subtle motion of the flowing lines, glowing points travel along them, camera static, perfectly loopable, 8 seconds."
