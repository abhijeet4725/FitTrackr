import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',   // required when running inside Docker
    port: 5173,
    proxy: {
      '/api': {
        // In Docker: VITE_API_TARGET=http://backend:5000
        // Locally:   falls back to http://localhost:5000
        target: process.env.VITE_API_TARGET || 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
})

