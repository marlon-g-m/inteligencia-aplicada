# Inteligencia Aplicada

Agencia de automatización, IA, desarrollo web, modernización de sistemas y migración a la nube. Santiago, Chile.

## Estructura

| Carpeta | Contenido |
|---|---|
| `brand/` | Guía de marca (`BRAND.md`) y logos en SVG |
| `web/` | Sitio web: React 18 + Vite + Tailwind CSS 3.4, portada con el paquete `shaders` (WebGPU) |
| `demo-clinica/` | Asistente de WhatsApp con IA para clínicas: agenda, simulador web y panel de recepción |
| `auditoria/` | Revisión automática de la web de un prospecto: informe de una página, borrador de mensaje y lista priorizada |
| `ventas/` | Kit de ventas: precios, propuesta tipo, contrato, NDA, anexo de datos (Ley 21.719), checklist de diagnóstico y mensajes de prospección |
| `docs/` | Plan de implementación, hitos (`HITOS.md`), pendientes (`PENDIENTES.md`) y brief F.R.A.M.E. |

## Ver el sitio en local

```bash
npm --prefix web install
```

```bash
npm --prefix web run dev
```

Luego abre http://localhost:5173.

## Publicación

La web principal está en Vercel: https://inteligenciaaplicada.vercel.app/
Se despliega a mano desde `web/` con `npx vercel@48.10.2 deploy --prod`.

GitHub Pages queda como respaldo. Cada push a `main` que toque `web/` compila el sitio y lo publica ahí:
https://marlon-g-m.github.io/inteligencia-aplicada/

La portada usa WebGPU. En navegadores sin soporte queda un degradado azul marino de respaldo.

## Pendientes

Están en [docs/PENDIENTES.md](docs/PENDIENTES.md).
