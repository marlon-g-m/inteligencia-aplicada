# Inteligencia Aplicada

Repositorio de la agencia **Inteligencia Aplicada**, una consultora tecnológica chilena: software a medida, apps, páginas web, asistentes de WhatsApp con IA, automatización y migración a la nube.

- Remoto: github.com/marlon-g-m/inteligencia-aplicada (rama `main`).
- Web publicada: https://inteligenciaaplicada.vercel.app/ (Vercel, plan Hobby; proyecto `marlon-g/inteligencia-aplicada`, deploy con `npx vercel@48.10.2 deploy --prod` desde `web/`). GitHub Pages sigue activo como respaldo.
- Contacto de la marca: WhatsApp +56 9 7663 0940 · inteligenciaaplicada.cl@gmail.com

## Carpetas

| Carpeta | Qué es |
|---|---|
| `web/` | Sitio en React 18 + Vite 5 + Tailwind 3 + TypeScript. `npm run build` en `web/`. |
| `brand/` | Guía de marca (`BRAND.md`), logos SVG y la fuente de la imagen Open Graph (`og-image.html`). |
| `demo-clinica/` | Demo de asistente de WhatsApp para una clínica (Node 24, `node:sqlite`). Modo guiado gratis o modo IA con `ANTHROPIC_API_KEY`. |
| `auditoria/` | Herramienta de auditoría web para prospectos: `node src/auditar.ts <url>`. |
| `ventas/` | Kit de ventas: propuesta tipo, contrato, NDA, anexo de datos (Ley 21.719) y checklist de diagnóstico. Los legales son borradores para abogado. |
| `docs/` | Plan de implementación, hitos (`HITOS.md`) y brief F.R.A.M.E. |

## Reglas

- **Publicar = producción.** Un push a `main` que toque `web/**` despliega la web con GitHub Actions (`.github/workflows/pages.yml`). Pide autorización antes de hacer push.
- Fija las versiones exactas de las dependencias, y que tengan al menos 2 semanas de antigüedad.
- Las fotos de `web/public/img/` son de Unsplash (licencia libre), descargadas en WebP a unos 1200 px.
- Respeta las animaciones con `prefers-reduced-motion` y deja la web sin scroll lateral desde 360 px de ancho.
- Antes de publicar, prueba en el navegador en celular y escritorio, y corre la auditoría sobre la web publicada.
- Tono de la marca: cercano, claro, en español de Chile y sin tecnicismos innecesarios.
