import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { cpSync, mkdirSync } from 'node:fs';

const demoOutput = fileURLToPath(new URL('./dist-demo-final', import.meta.url));
const demoPublicFiles = ['favicon.svg', 'CREDITOS.txt', 'assets/img', 'assets/musica', 'assets/sonidos'];

// A separate entry and output folder keep the deliverable independent of the month campaign.
export default defineConfig({
  root: fileURLToPath(new URL('./demo', import.meta.url)),
  publicDir: '../public',
  base: './',
  build: {
    outDir: '../dist-demo-final', emptyOutDir: false, copyPublicDir: false,
    manifest: true, target: 'es2022', assetsInlineLimit: 0,
  },
  plugins: [{
    name: 'copy-demo-public-assets',
    apply: 'build',
    closeBundle() {
      mkdirSync(demoOutput, { recursive: true });
      for (const relativePath of demoPublicFiles) {
        const source = fileURLToPath(new URL(`./public/${relativePath}`, import.meta.url));
        const destination = fileURLToPath(new URL(`./dist-demo-final/${relativePath}`, import.meta.url));
        cpSync(source, destination, { recursive: true });
      }
    },
  }],
  preview: { host: '127.0.0.1', port: 4174, strictPort: true },
});
