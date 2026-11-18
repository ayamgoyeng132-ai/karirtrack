import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
// @ts-expect-error ESM server module
import { apiHandler } from './server/api-handler.mjs';

export default defineConfig({
  server: {
    watch: {
      ignored: ['**/data/**'],
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'karirtrack-sqlite-api',
      configureServer(server) {
        server.middlewares.use('/api', apiHandler);
      },
      configurePreviewServer(server) {
        server.middlewares.use('/api', apiHandler);
      },
    },
  ],
});
