import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { cpSync, mkdirSync } from 'node:fs';

const gameOutput = fileURLToPath(new URL('./dist', import.meta.url));
const gamePublicFiles = ['favicon.svg', 'CREDITOS.txt', 'assets/img', 'assets/musica', 'assets/sonidos'];

export default defineConfig({
  base: './',
  server: { host: '127.0.0.1', port: 5173, strictPort: true },
  preview: { host: '127.0.0.1', port: 4173, strictPort: true },
  build: {
    emptyOutDir: false, copyPublicDir: false, manifest: true,
    target: 'es2022', assetsInlineLimit: 0,
  },
  plugins: [{
    name: 'copy-game-public-assets',
    apply: 'build',
    closeBundle() {
      mkdirSync(gameOutput, { recursive: true });
      for (const relativePath of gamePublicFiles) {
        const source = fileURLToPath(new URL(`./public/${relativePath}`, import.meta.url));
        const destination = fileURLToPath(new URL(`./dist/${relativePath}`, import.meta.url));
        cpSync(source, destination, { recursive: true });
      }
    },
  }],
});
