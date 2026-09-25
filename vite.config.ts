import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const page = (path: string) => fileURLToPath(new URL(path, import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  // Caminhos relativos: o build funciona em qualquer subpasta (GitHub Pages, Netlify, Vercel).
  base: './',
  plugins: [react(), tailwindcss()],
  build: {
    // Saída em docs/: o GitHub Pages publica direto dessa pasta.
    outDir: 'docs',
    emptyOutDir: true,
    // O three.js sozinho tem ~740 kB minificado; os demais chunks ficam bem abaixo disso.
    chunkSizeWarningLimit: 800,
    rolldownOptions: {
      input: {
        landing: page('./index.html'),
        montar: page('./montar/index.html'),
      },
      output: {
        codeSplitting: {
          groups: [
            { name: 'three', test: /node_modules[\\/]three[\\/]/, priority: 3 },
            {
              name: 'react',
              test: /node_modules[\\/](react|react-dom|scheduler|zustand)[\\/]/,
              priority: 2,
            },
            { name: 'r3f', test: /node_modules[\\/]/, priority: 1 },
          ],
        },
      },
    },
  },
})
