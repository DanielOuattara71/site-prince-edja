import type { Langue } from '@/api/schemas/communs'

/**
 * État d'une langue d'un champ traduit (section 10, `ChampTraduit`). Le français est la
 * référence : l'anglais n'est « à traduire » que si le français existe.
 */
export type EtatTraduction = 'traduit' | 'a_traduire' | 'vide'

export type ValeursTraduites = Partial<Record<Langue, string | null | undefined>>

const rempli = (valeur: string | null | undefined) => Boolean(valeur?.trim())

export function etatTraduction(langue: Langue, valeurs: ValeursTraduites): EtatTraduction {
  if (rempli(valeurs[langue])) return 'traduit'
  if (langue !== 'fr' && rempli(valeurs.fr)) return 'a_traduire'
  return 'vide'
}

/**
 * Libellé lisible d'un chemin de `champsAFournir` (`traductions.fr.extrait` → « Résumé (FR) »).
 * Un chemin sans libellé connu s'affiche tel quel : mieux vaut un nom technique qu'un trou.
 */
export function libelleChamp(chemin: string, libelles: Record<string, string> = {}): string {
  const traduit = /^traductions\.(fr|en)\.(.+)$/.exec(chemin)
  if (traduit) {
    const [, langue = '', reste = ''] = traduit
    return `${libelles[reste] ?? reste} (${langue.toUpperCase()})`
  }
  return libelles[chemin] ?? chemin
}
