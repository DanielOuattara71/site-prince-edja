import { fileURLToPath, URL } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { msw } from 'msw/vite'
import { defineConfig } from 'vite'

/**
 * L'admin est servi sur sa propre adresse. Son chemin de base se règle au build par
 * `ADMIN_BASE` (lu ici, côté Node : il n'entre jamais dans le bundle) et devient le
 * `basename` du routeur via `import.meta.env.BASE_URL`.
 */
const base = process.env.ADMIN_BASE ?? '/'

/**
 * Mode `api` (`npm run dev:api`, D-47) : pas de faux serveur, et `/admin/api/v1` est relayé
 * vers l'API locale (`prince-edja-api`, port 3000). Le cookie de session reste alors sur
 * l'origine de l'admin, comme en production derrière un même site.
 */
const API_LOCALE = 'http://localhost:3000'

export default defineConfig(({ command, mode }) => ({
  base,
  plugins: [
    react(),
    tailwindcss(),
    // Sert `mockServiceWorker.js` au serveur de développement seulement. En mode
    // `worker-only`, le plugin l'émettrait aussi dans le build : on ne le charge donc
    // jamais pour `vite build` (D-08, contrôlé par `verifier-dist`).
    ...(command === 'serve' && mode !== 'api' ? [msw({ mode: 'worker-only' })] : []),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5180,
    strictPort: true,
    ...(mode === 'api'
      ? { proxy: { '/admin/api/v1': { target: API_LOCALE, changeOrigin: false } } }
      : {}),
  },
  preview: {
    port: 5181,
    strictPort: true,
    // L'administration n'a rien à faire dans un moteur de recherche (section 12).
    headers: { 'X-Robots-Tag': 'noindex, nofollow' },
  },
}))
