import { useEffect } from 'react'

export interface SeoOptions {
  title: string
  description?: string
  /** `false` pour une page qui n'a rien à faire dans l'index (squelette légal, utilitaires). */
  indexable?: boolean
  /** Requête propre à la page (`?page=2`) : elle entre dans l'adresse canonique et `og:url`. */
  requete?: string
}

/**
 * Prérendu (entry-server) : les pages n'ont pas d'effet à jouer côté serveur, donc pas de
 * balises à écrire dans un document `document`. Elles les déposent ici ; le script de prérendu
 * les lit et les injecte dans le HTML. Inerte côté client.
 */
export interface BalisePreRendue {
  titre: string
  description?: string
  indexable: boolean
  url: string
}
const collecte: BalisePreRendue[] = []
let basePreRendue: string | null = null

/** Prérendu uniquement : pose la base `origine` et la route pour ce rendu. */
export function preparerBalisesPreRendues(route: string, origine: string) {
  basePreRendue = `${origine.replace(/\/+$/, '')}${route}`
  collecte.length = 0
}

/** Prérendu uniquement : récupère les balises déposées pour ce rendu. */
export function balisesPreRendues(): BalisePreRendue[] {
  if (basePreRendue === null) return []
  const copie = [...collecte]
  collecte.length = 0
  return copie
}

function upsertMeta(attr: 'name' | 'property', cle: string, contenu: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${cle}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, cle)
    document.head.appendChild(el)
  }
  el.content = contenu
}

/**
 * Unique point d'écriture des balises de page.
 *
 * Les balises `og` doivent être **absolues** : un robot social n'exécute pas le JS, il
 * ne lit que le HTML servi. Le canonical est pris sur l'URL courante sans requête ni
 * ancre. Dire que `?utm_source=…` est une autre page créerait des doublons.
 */
export function useSeo({ title, description, indexable = true, requete = '' }: SeoOptions) {
  // Prérendu : pas de `document`, les balises sont déposées dans la collecte (inerte sinon).
  if (import.meta.env.SSR && basePreRendue !== null) {
    collecte.push({
      titre: title,
      ...(description !== undefined ? { description } : {}),
      indexable,
      url: `${basePreRendue}${requete}`,
    })
  }

  useEffect(() => {
    document.title = title
    if (description) {
      upsertMeta('name', 'description', description)
      upsertMeta('property', 'og:description', description)
    }

    upsertMeta('property', 'og:title', title)
    upsertMeta('name', 'robots', indexable ? 'index, follow' : 'noindex, follow')

    const url = window.location.origin + window.location.pathname + requete
    upsertMeta('property', 'og:url', url)

    const ogImage = document.head
      .querySelector<HTMLMetaElement>('meta[property="og:image"]')
      ?.getAttribute('content')
    if (ogImage) {
      upsertMeta('property', 'og:image', new URL(ogImage, window.location.origin).href)
    }

    let lien = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!lien) {
      lien = document.createElement('link')
      lien.rel = 'canonical'
      document.head.appendChild(lien)
    }
    lien.href = url
  }, [title, description, indexable, requete])
}

/**
 * Un bloc JSON-LD ponctuel, retiré au démontage.
 *
 * Séparez de `useSeo` : les deux n'ont pas le même cycle de vie. Un fil d'Ariane doit
 * disparaître dès qu'on quitte la page, une balise og globale reste.
 */
export function useJsonLd(schema: Record<string, unknown> | null) {
  useEffect(() => {
    if (!schema) return
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify(schema)
    document.head.appendChild(script)
    return () => {
      script.remove()
    }
  }, [schema])
}

/** Fil d'Ariane lisible par les moteurs : même source que le fil affiché. */
export function schemaFilDariane(
  fragments: { libelle: { fr: string; en: string }; to: string }[],
  langue: 'fr' | 'en',
  base: string,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: fragments.map((fragment, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: fragment.libelle[langue],
      item: `${base}${fragment.to === '/' ? '' : fragment.to.replace(/^\//, '')}`,
    })),
  }
}
