import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  integrations: [react()],
  build: {
    inlineStylesheets: 'always',
  },
  vite: {
    envPrefix: ['VITE_', 'PUBLIC_'],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (
              id.includes('node_modules/react/') ||
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/scheduler/')
            ) {
              return 'react-vendor';
            }
            if (
              id.includes('node_modules/motion') ||
              id.includes('node_modules/lucide-react') ||
              id.includes('node_modules/html-to-image')
            ) {
              return 'motion-vendor';
            }
          },
        },
      },
    },
  },
});
