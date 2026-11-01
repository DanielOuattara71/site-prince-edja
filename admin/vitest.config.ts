import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    restoreMocks: true,
    // Parcours complets en jsdom (connexion, pages paresseuses, audits axe) : sous la charge
    // de la suite entière, et sur les deux cœurs de la CI, 5 s ne suffisent pas toujours (D-46).
    testTimeout: 45_000,
    // Chaque fichier lance un jsdom et des parcours complets : au-delà de quatre en parallèle, la
    // machine sature et les attentes de 10 s expirent au hasard (D-56, D-65).
    maxWorkers: 4,
  },
})
