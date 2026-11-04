# Inteligencia Aplicada

Agencia de automatización, IA, desarrollo web, modernización de sistemas y migración a la nube. Santiago, Chile.

## Estructura

| Carpeta | Contenido |
|---|---|
| `brand/` | Guía de marca (`BRAND.md`) y logos en SVG |
| `site/` | Sitio web de la agencia: HTML, CSS y JS estático, sin dependencias |
| `docs/` | Brief F.R.A.M.E. y prompts opcionales para Claude Design y recursos visuales |

## Ver el sitio en local

```bash
npx serve@14.2.4 site -l 4321
```

Luego abre http://localhost:4321.

## Antes de publicar

- Confirmar el dominio y actualizar las etiquetas `og:` con la URL real.
- Publicar la carpeta `site/` en Vercel, Netlify o Cloudflare Pages. Es estática, así que no requiere build.
