import { describe, expect, it } from 'vitest'
import { fr } from '@/i18n/fr'

/**
 * U5 (PROMPT-CORRECTION § 6) : aucun mot technique ne subsiste dans les textes affichés.
 * « à fournir » → « à compléter », « Traduction » → « Langues », « usage(s) » → « utilisé à N
 * endroit(s) », « tag(s) » → « étiquette(s) », « slug » → « adresse de la page ».
 */
const INTERDITS: [RegExp, string][] = [
  [/\bslugs?\b/i, 'slug'],
  [/\btags?\b/i, 'tag'],
  [/à fournir/i, 'à fournir'],
  [/\bTraduction\b/, 'Traduction'],
  [/\busages?\b|usage\(s\)/i, 'usage'],
]

describe('vocabulaire de l’interface (U5)', () => {
  it.each(INTERDITS)('aucun texte ne contient « %s »', (motif) => {
    const fautifs = Object.entries(fr)
      .filter(([, valeur]) => typeof valeur === 'string' && motif.test(valeur))
      .map(([cle, valeur]) => `${cle} = ${String(valeur)}`)
    expect(fautifs).toEqual([])
  })
})
