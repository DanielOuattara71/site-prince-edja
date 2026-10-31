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
    testTimeout: 20_000,
  },
})
