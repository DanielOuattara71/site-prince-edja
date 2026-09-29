import { useEffect } from 'react'

interface SeoOptions {
  title: string
  description?: string
  /** `false` sur une page utilitaire (composition d'une demande) : elle n'a rien à faire dans l'index. */
  indexable?: boolean
}

function upsert(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.content = content
}

// L'image de partage écrite dans `index.html` (Vite l'a déjà passée sous la base du site).
// On la capte au chargement, avant que le premier rendu ne réécrive le tag.
const IMAGE_DEFAUT =
  typeof document === 'undefined'
    ? ''
    : (document.head.querySelector<HTMLMetaElement>('meta[property="og:image"]')?.content ?? '')

/** URL de la page courante, **sans requête ni ancre** : c'est le rôle d'un canonical que
 *  de dire qu'`?utm_source=…` n'est pas une nouvelle page. */
function urlCourante() {
  return window.location.origin + window.location.pathname
}

/** Un réseau social qui ne exécute pas le JS ne voit que le HTML servi : tout ce qui
 *  sort du document doit donc être absolu, base du site (`/site-prince-edja/`) comprise. */
function absolu(chemin: string) {
  return new URL(chemin, window.location.origin).href
}

export function useSeo({ title, description, indexable = true }: SeoOptions) {
  useEffect(() => {
    document.title = title
    const desc = description ?? ''
    if (desc) upsert('name', 'description', desc)

    // Le robots du document suit la page affichée : une page « noindex » qui ne le
    // réinitialiserait pas empoisonnerait la page suivante dans un SPA.
    upsert('name', 'robots', indexable ? 'index, follow' : 'noindex, follow')

    // La carte de partage décrit la page affichée, pas la maison : sans ça, chaque route
    // se partage avec le titre et la description d'`index.html`.
    upsert('property', 'og:title', title)
    if (desc) upsert('property', 'og:description', desc)
    const url = urlCourante()
    upsert('property', 'og:url', url)
    if (IMAGE_DEFAUT) upsert('property', 'og:image', absolu(IMAGE_DEFAUT))

    // Le canonical vit dans un `<link>`, et n'existait nulle part : avec un titre changé
    // par route et des URLs partagées avec paramètres, les doublons n'avaient pas d'appel.
    let lien = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!lien) {
      lien = document.createElement('link')
      lien.rel = 'canonical'
      document.head.appendChild(lien)
    }
    lien.href = url
  }, [title, description, indexable])
}
