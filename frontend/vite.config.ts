import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    watch: {
      ignored: ['**/*.mp4', '**/videos/**', '**/dist/**', '**/node_modules/**'],
    },
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/videos/hero': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/videos/scroll': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/videos/cinematic': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/assets/images': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
});
