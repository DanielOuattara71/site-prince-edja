import { setupWorker } from 'msw/browser'
import { handlers } from '@/api/mocks/handlers'
import { MARQUEUR_EXEMPLE } from '@/api/mocks/donnees'
import { magasin } from '@/api/mocks/magasin'

/**
 * Démarre le faux serveur dans le navigateur. Chargé **seulement** en développement, par
 * un import dynamique gardé par `import.meta.env.DEV` dans `main.tsx` : le build de
 * production n'en contient rien (vérifié par `verifier-dist`).
 *
 * Réglages par l'adresse de la page (pas de stockage navigateur, D-09) :
 * - `?echecs=0.1` : 10 % de pannes simulées ;
 * - `?latence=0` : réponses immédiates.
 */
export async function demarrerFauxServeur(): Promise<void> {
  const parametres = new URLSearchParams(window.location.search)
  const echecs = Number(parametres.get('echecs') ?? '0')
  magasin.tauxEchec = Number.isFinite(echecs) ? Math.min(Math.max(echecs, 0), 1) : 0
  magasin.latence = parametres.get('latence') === '0' ? null : [200, 600]

  await setupWorker(...handlers).start({
    serviceWorker: { url: `${import.meta.env.BASE_URL}mockServiceWorker.js` },
    onUnhandledFrame: 'bypass',
    quiet: true,
  })
  console.info(`[admin] Faux serveur actif (${MARQUEUR_EXEMPLE}). Comptes : *@exemple.test.`)
}
