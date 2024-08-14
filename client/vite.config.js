import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    },
    host: 'localhost',
    port: 3000
  },
  build: {
    outDir: 'dist', // Directory where the build output is placed
    base: '/', // Base path for assets in production
    rollupOptions: {
      input: {
        main: './src/index.jsx', // Main entry point
      },
    },
  }
})
