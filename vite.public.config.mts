import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig({
  root: path.resolve('public-site'),
  base: './',
  resolve: { alias: { '@': path.resolve('client/src'), '@shared': path.resolve('shared') } },
  esbuild: { jsx: 'automatic' },
  plugins: [{
    name: 'standalone-public-styles',
    enforce: 'pre',
    transform(code, id) {
      if (id.split('?')[0] === path.resolve('client/src/index.css')) {
        return code.replace("@import '@lark-apaas/client-toolkit/lib/index.css';", '@import "tailwindcss";')
          .replace('@config "../../tailwind.config.ts";', '');
      }
    },
  }],
  build: { outDir: path.resolve('docs'), emptyOutDir: true },
});
