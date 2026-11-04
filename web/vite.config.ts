import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base relativo: funciona en GitHub Pages (/inteligencia-aplicada/) y en un dominio propio
export default defineConfig({
  plugins: [react()],
  base: './',
})
