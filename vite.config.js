import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'public/app',
    copyPublicDir: false,
    emptyOutDir: true,
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: true,
    cors: true,
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: true,
  },
});
