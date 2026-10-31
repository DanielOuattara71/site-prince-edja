import type { z } from 'zod'

/**
 * Préférences d'affichage (D-09) : **le seul** module autorisé à toucher `localStorage`.
 *
 * N'y entre que ce qui règle l'affichage pour cette personne sur ce poste (colonnes
 * masquées, largeur de l'aperçu) : jamais un contenu, un brouillon, un jeton ou une donnée
 * personnelle. Chaque lecture est validée ; une valeur illisible, un stockage refusé
 * (navigation privée) ou absent rendent la valeur par défaut, sans erreur.
 */
const PREFIXE = 'pe-admin:'

export function lirePreference<T>(cle: string, schema: z.ZodType<T>, parDefaut: T): T {
  try {
    const brut = localStorage.getItem(PREFIXE + cle)
    if (brut === null) return parDefaut
    const lu = schema.safeParse(JSON.parse(brut))
    return lu.success ? lu.data : parDefaut
  } catch {
    return parDefaut
  }
}

export function ecrirePreference(cle: string, valeur: unknown): void {
  try {
    localStorage.setItem(PREFIXE + cle, JSON.stringify(valeur))
  } catch {
    // Stockage plein ou refusé : la préférence vaut pour cette page seulement.
  }
}
