import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    proxy: {
      '/api': {
        target: 'http://pdv_backend:8000', // Docker service name
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
