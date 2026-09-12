import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// En desarrollo, /api pasa al backend local; producción usa VITE_API_URL.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})
