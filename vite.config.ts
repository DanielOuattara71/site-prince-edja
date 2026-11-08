/*import { fileURLToPath, URL } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})  */
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// Mode API (S2, LIAISON § C.2) : le site lit `src/data/generated/`, écrit par `npm run charger`.
// Sans ces fichiers, la construction s'arrête ici plutôt que de livrer un site vide.
function verifierDonneesChargees(mode: string) {
  const source =
    process.env['PUBLIC_DATA_SOURCE'] ??
    loadEnv(mode, process.cwd(), 'PUBLIC_')['PUBLIC_DATA_SOURCE']
  if (source !== 'api') return
  const dossier = fileURLToPath(new URL('./src/data/generated/', import.meta.url))
  const manifeste = `${dossier}manifeste.json`
  if (!existsSync(manifeste)) {
    throw new Error('PUBLIC_DATA_SOURCE=api : aucune donnée chargée. Lancer `npm run charger`.')
  }
  const { comptes } = JSON.parse(readFileSync(manifeste, 'utf8')) as {
    comptes: Record<string, number>
  }
  const manquants = Object.keys(comptes).filter((nom) => !existsSync(`${dossier}${nom}.json`))
  if (manquants.length > 0) {
    throw new Error(`PUBLIC_DATA_SOURCE=api : fichiers absents (${manquants.join(', ')}).`)
  }
}

export default defineConfig(({ mode }) => {
  verifierDonneesChargees(mode)
  return {
    plugins: [react(), tailwindcss()],
    base: '/site-prince-edja/',
    // `PUBLIC_*` est public par définition (LIAISON § C.2) : l'adresse de l'API doit atteindre le
    // navigateur. Vite n'expose sinon que `VITE_*`, et `PUBLIC_API_URL` restait vide (audit V2-01).
    envPrefix: ['VITE_', 'PUBLIC_'],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  }
})
