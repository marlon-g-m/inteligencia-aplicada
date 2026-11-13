// Actualiza la UF de referencia de la sección de precios con el valor del día (mindicador.cl).
// Uso: npm run uf (desde web/). Después hay que publicar la web para que se vea.
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const file = fileURLToPath(new URL('../src/sections/Pricing.tsx', import.meta.url))

// mindicador.cl a veces corta la conexión o tarda: se reintenta antes de rendirse
async function ufDeHoy() {
  let ultimo
  for (let intento = 1; intento <= 4; intento++) {
    try {
      const res = await fetch('https://mindicador.cl/api/uf', { signal: AbortSignal.timeout(30_000) })
      if (!res.ok) throw new Error(`respondió ${res.status}`)
      return (await res.json()).serie?.[0]
    } catch (e) {
      ultimo = e
      await new Promise((r) => setTimeout(r, 2000))
    }
  }
  throw new Error(`No se pudo consultar mindicador.cl (${ultimo.message}). Prueba más tarde o copia el valor desde sii.cl.`)
}

const hoy = await ufDeHoy()
if (!(hoy?.valor > 30_000 && hoy.valor < 80_000)) throw new Error(`Valor de UF inesperado: ${JSON.stringify(hoy)}`)

// Los precios se muestran redondeados a miles, así que basta la UF redondeada a la decena
const uf = Math.round(hoy.valor / 10) * 10
const mes = new Date(hoy.fecha).toLocaleDateString('es-CL', { month: 'long', year: 'numeric', timeZone: 'America/Santiago' })

const antes = readFileSync(file, 'utf8')
const viejo = antes.match(/const UF_REF = (\d+)/)?.[1]
if (!viejo || !/const UF_REF_MES = '[^']*'/.test(antes)) throw new Error('No encontré UF_REF o UF_REF_MES en Pricing.tsx')
const despues = antes.replace(/const UF_REF = \d+/, `const UF_REF = ${uf}`).replace(/const UF_REF_MES = '[^']*'/, `const UF_REF_MES = '${mes}'`)

if (despues === antes) {
  console.log(`Sin cambios: la UF de referencia ya es $${uf.toLocaleString('es-CL')} (${mes}).`)
} else {
  writeFileSync(file, despues)
  console.log(`UF de referencia: $${Number(viejo).toLocaleString('es-CL')} → $${uf.toLocaleString('es-CL')} (${mes}).`)
  console.log('Revisa también los montos en pesos de ventas/precios.md.')
}
