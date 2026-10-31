import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/styles/globals.css'
import { App } from '@/app/App'

const racine = document.getElementById('root')
if (!racine) throw new Error('Élément #root introuvable dans index.html.')

// Le faux serveur n'existe qu'en développement : `import.meta.env.DEV` vaut `false` au
// build, et l'import dynamique disparaît du bundle (D-08, contrôlé par `verifier-dist`).
// En mode `api` (`npm run dev:api`), l'admin parle à la vraie API locale (D-47).
if (import.meta.env.DEV && import.meta.env.MODE !== 'api') {
  const { demarrerFauxServeur } = await import('@/api/mocks/navigateur')
  await demarrerFauxServeur()
}

createRoot(racine).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
