/// <reference types="node" />
import { defineConfig, type ViteDevServer } from 'vite'
import react from '@vitejs/plugin-react'
import { type Server } from 'http'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'configure-server',
      configureServer(server: ViteDevServer) {
        const httpServer = server.httpServer as Server;
        
        httpServer?.on('error', (err) => {
          console.error('Server error:', err);
        });

        httpServer?.on('listening', () => {
          console.log('Server is listening...');
        });
      }
    }
  ],
  server: {
    port: 3000,
    host: true,
    open: true,
    strictPort: false,
    watch: {
      usePolling: true
    },
    hmr: {
      overlay: true
    }
  },
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        console.log('Build warning:', warning);
        warn(warning);
      }
    }
  },
  assetsInclude: ['**/*.txt']
})
