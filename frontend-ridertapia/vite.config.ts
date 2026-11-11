import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true
  },
  test: {
    environment: 'jsdom',
    // Los tests usan el modo local (localStorage), no el backend
    env: { VITE_USAR_API: 'false' },
    setupFiles: './src/test/setup.ts',
    include: ['src/**/*.test.{ts,tsx}'],
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      reportsDirectory: './coverage',
      // Alcance: la capa de logica (services y utils), donde estan las reglas de negocio.
      // data/ y models/ son datos y tipos; demo.service solo genera ventas de ejemplo.
      include: ['src/services/**', 'src/utils/**'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/test/**', 'src/services/demo.service.ts']
    }
  }
});