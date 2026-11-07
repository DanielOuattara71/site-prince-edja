import { createContext, useContext } from 'react'
import type { Langue } from '@/api/schemas/communs'

/**
 * Langue affichée par un formulaire bilingue (U2) : **un seul** sélecteur en haut du
 * formulaire, et chaque champ traduit montre la langue choisie. L'autre langue garde ses
 * valeurs dans le formulaire : rien n'est perdu en changeant.
 *
 * Sans fournisseur (fiche hors gabarit), les champs traduits gardent leurs propres onglets.
 */
export interface LangueFormulaire {
  langue: Langue
  choisir: (langue: Langue) => void
}

export const ContexteLangueFormulaire = createContext<LangueFormulaire | null>(null)

export function useLangueFormulaire(): LangueFormulaire | null {
  return useContext(ContexteLangueFormulaire)
}

/** Événement qui demande d'afficher une langue (lien du résumé d'erreurs vers un champ). */
export const EVENEMENT_LANGUE = 'pe:afficher-langue'

/** Affiche la langue d'un champ `traductions.<langue>.…` avant d'y placer le curseur. */
export function montrerLangueDe(champ: string): void {
  const trouve = /^traductions\.(fr|en)\./.exec(champ)
  if (trouve) window.dispatchEvent(new CustomEvent(EVENEMENT_LANGUE, { detail: trouve[1] ?? 'fr' }))
}

/** Suggestion d'adresse du serveur (`traductions.<langue>.slug`), ou rien. */
export function suggestionAdresse(
  suggestion: { champ: string; valeur: string } | null | undefined,
): { langue: Langue; valeur: string } | null {
  const langue = suggestion?.champ.split('.')[1]
  return suggestion && (langue === 'fr' || langue === 'en')
    ? { langue, valeur: suggestion.valeur }
    : null
}

/** Langues dont un chemin `traductions.<langue>.…` figure dans la liste. */
export function languesCitees(chemins: readonly string[]): Langue[] {
  const langues = new Set<Langue>()
  for (const chemin of chemins) {
    const trouve = /^traductions\.(fr|en)\./.exec(chemin)
    if (trouve) langues.add(trouve[1] as Langue)
  }
  return [...langues]
}
