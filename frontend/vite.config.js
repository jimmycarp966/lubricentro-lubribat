import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          firebase: ['firebase/app', 'firebase/database', 'firebase/auth'],
          ui: ['react-hot-toast', 'react-icons', '@iconify/react'],
          utils: ['date-fns', 'axios']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
}) 