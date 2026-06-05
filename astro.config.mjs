import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  vite: {
    envPrefix: ['VITE_', 'PUBLIC_'],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/three/') || id.includes('node_modules/@react-three/') || id.includes('node_modules/postprocessing')) {
              return 'three-vendor';
            }
            if (id.includes('node_modules/motion') || id.includes('node_modules/lucide-react') || id.includes('node_modules/html-to-image')) {
              return 'motion-vendor';
            }
          },
        },
      },
    },
  },
});