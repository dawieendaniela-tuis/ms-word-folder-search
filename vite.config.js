import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import fs from 'fs';
import path from 'path';

const useHttps = process.argv.includes('--https');

const devCerts = () => {
  if (!useHttps) return undefined;
  try {
    const certDir = path.join(process.env.HOME || process.env.USERPROFILE, '.office-addin-dev-certs');
    return {
      key: fs.readFileSync(path.join(certDir, 'localhost.key')),
      cert: fs.readFileSync(path.join(certDir, 'localhost.crt')),
      ca: fs.readFileSync(path.join(certDir, 'ca.crt')),
    };
  } catch {
    return undefined;
  }
};

export default defineConfig({
  plugins: [svelte()],
  base: './',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        taskpane: 'taskpane.html',
      },
    },
  },
  server: {
    https: devCerts(),
    port: 3000,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
});
