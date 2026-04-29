import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': 'http://localhost:8000',
      '/orders': 'http://localhost:8000',
      '/payments': 'http://localhost:8000',
      '/webhook': 'http://localhost:8000',
    }
  }
})
