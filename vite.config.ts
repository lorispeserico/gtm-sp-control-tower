// FILE: vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Use import.meta.url to get the current directory
      '@': path.resolve(new URL('.', import.meta.url).pathname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
  },
} as any)
