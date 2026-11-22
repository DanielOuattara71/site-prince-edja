import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/styles/globals.css'
import { App } from '@/app/App'

const racine = document.getElementById('root')
if (!racine) throw new Error('Élément #root introuvable dans index.html.')

// Le faux serveur n'existe qu'en développement et dans le build **démo** (mode `demo`,
// réservé à la démonstration sur GitHub Pages, jamais au build de production). En mode `api`
// (`npm run dev:api`), l'admin parle à la vraie API locale (D-47).
if (import.meta.env.MODE !== 'api' && (import.meta.env.DEV || import.meta.env.MODE === 'demo')) {
  const { demarrerFauxServeur } = await import('@/api/mocks/navigateur')
  await demarrerFauxServeur()
}

createRoot(racine).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
