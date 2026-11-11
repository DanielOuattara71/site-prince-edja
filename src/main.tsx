import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import '@/styles/globals.css'
import App from '@/App'
import { FournisseurLangue } from '@/i18n/FournisseurLangue'

// `basename` attend le slash final ; une URL sans lui ferait rendre un routeur vide
// (GitHub Pages redirige, ceinture de sécurité côté client pour les autres cas).
const base = import.meta.env.BASE_URL
try {
  if (window.location.pathname === base.replace(/\/+$/, '')) {
    window.history.replaceState(null, '', `${base}${window.location.search}${window.location.hash}`)
  }
} catch {
  /* ignore */
}

const racine = document.getElementById('root')!
const app = (
  <StrictMode>
    <FournisseurLangue>
      <App />
    </FournisseurLangue>
  </StrictMode>
)
// Les routes prérendues arrivent avec leur HTML : on hydrate (react-dom/client). Les autres
// (404 en navigation directe, etc.) partent d'un conteneur vide : création classique.
if (racine.hasChildNodes()) {
  hydrateRoot(racine, app)
} else {
  createRoot(racine).render(app)
}
