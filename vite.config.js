import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Blueforge AI — production build config
// Replaces in-browser Babel + 15 individual JSX scripts with one minified bundle.
// Run: `npm install && npm run build` → outputs ./dist
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    outDir: 'dist',
    cssCodeSplit: false,        // single CSS bundle
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: undefined,  // single JS bundle for marketing site
      },
    },
  },
  server: {
    port: 5173,
    open: true,
  },
});
