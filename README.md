# Inteligencia Aplicada

Agencia de automatización, IA, desarrollo web, modernización de sistemas y migración a la nube. Santiago, Chile.

## Estructura

| Carpeta | Contenido |
|---|---|
| `brand/` | Guía de marca (`BRAND.md`) y logos en SVG |
| `web/` | Sitio web: React 18 + Vite + Tailwind CSS 3.4, portada con el paquete `shaders` (WebGPU) |
| `demo-clinica/` | Asistente de WhatsApp con IA para clínicas: agenda, simulador web y panel de recepción |
| `docs/` | Brief F.R.A.M.E. y prompts opcionales para Claude Design y recursos visuales |

## Ver el sitio en local

```bash
npm --prefix web install
```

```bash
npm --prefix web run dev
```

Luego abre http://localhost:5173.

## Publicación

Cada push a `main` que toque `web/` compila el sitio y lo publica en GitHub Pages:
https://marlon-g-m.github.io/inteligencia-aplicada/

La portada usa WebGPU. En navegadores sin soporte queda un degradado azul marino de respaldo.

## Pendientes

- Conectar el dominio `.cl` cuando esté comprado.
