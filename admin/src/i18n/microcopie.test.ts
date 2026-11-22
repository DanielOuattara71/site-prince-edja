import { describe, expect, it } from 'vitest'
import { fr } from '@/i18n/fr'

/**
 * Régression de la microcopie (chantier UX/UI, 12/11/2026) : pas de texte verbose dans
 * l'interface. Les motifs sont ceux que la maison a bannis pour l'administration ;
 * le plafond de ligne est celui relevé avant le chantier (168 caractères).
 */

/** Sous-chaînes interdites (tournure administrative ou périphrase inutile). */
const INTERDITS: [RegExp, string][] = [
  [/Cette section vous/i, '« Cette section vous… »'],
  [/Veuillez\s/i, '« Veuillez… »'],
  [/\svous pouvez\b/i, '« vous pouvez »'],
  [/\svous permet\b/i, '« vous permet »'],
  [/\spermet de\s/i, '« permet de »'],
]

/** Libellés réécrits au chantier UX/UI : chacun tient sur une ligne (écrans denses). */
const REECRITES = [
  'bienvenue.etape1',
  'bienvenue.etape2',
  'bienvenue.etape3',
  'categorie.intro',
  'tags.intro',
  'guides.intro',
  'motif.intro',
  'navigation.intro',
  'parametres.intro',
  'surLeSite.intro',
  'audience.intro',
  'aFournir.intro',
  'conflit.texte',
  'variante.intro',
  'mediatheque.supprimerTexte',
  'createurs.desactiverTexte',
  'categorie.supprimerTexte',
  'erreur.403.texte',
  'projet.supprimerTexte',
  'projet.formatAide',
] as const

const longueurMaxGlobale = 175
const longueurMaxReecrie = 115

describe('microcopie de l’interface (chantier UX/UI)', () => {
  const entrees = Object.entries(fr) as [string, string][]

  it('aucun texte vide', () => {
    const vides = entrees.filter(([, texte]) => texte.trim().length === 0).map(([cle]) => cle)
    expect(vides).toEqual([])
  })

  it.each(INTERDITS)('aucun texte ne contient %s', (motif) => {
    const fautifs = entrees
      .filter(([, texte]) => motif.test(texte))
      .map(([cle, texte]) => `${cle} = ${texte}`)
    expect(fautifs).toEqual([])
  })

  it('aucun texte ne dépasse le plafond global de la ligne', () => {
    const tropLongs = entrees
      .filter(([, texte]) => texte.length > longueurMaxGlobale)
      .map(([cle, texte]) => `${cle} (${texte.length})`)
    expect(tropLongs).toEqual([])
  })

  it('chaque libellé réécrit tient sur une ligne', () => {
    for (const cle of REECRITES) {
      const texte = fr[cle]
      expect(typeof texte, cle).toBe('string')
      expect(
        (texte as string).length,
        `${cle} fait ${(texte as string).length} caractères`,
      ).toBeLessThanOrEqual(longueurMaxReecrie)
    }
  })
})
