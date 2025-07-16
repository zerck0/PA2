import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// Configuration Vite pour le Backoffice EcoDeli
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    // Configuration essentielle pour le hot reload dans Docker
    watch: {
      usePolling: true,
      interval: 1000
    },
    hmr: {
      // Configuration HMR pour Docker - utilise le port externe
      clientPort: 3001,
      host: 'localhost'
    },
    // Configuration proxy pour les appels API en développement
    proxy: {
      '/api': {
        target: 'http://ecodeli-backend-dev:8080',
        changeOrigin: true,
        secure: false
      }
    }
  },
})
