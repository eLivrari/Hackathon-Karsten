import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base relativa para funcionar no GitHub Pages sem configurar nada
export default defineConfig({
  plugins: [react()],
  base: './',
})
