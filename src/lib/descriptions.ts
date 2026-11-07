import type { Bijou, Episode } from '@/types'

/**
 * Descriptions de référencement des fiches (audit V2-10) : le pitch seul faisait 49 à 68
 * caractères, trop court pour les résultats de recherche. On le complète **uniquement** avec des
 * champs déjà publiés (numéro, lieu, culture) — aucune affirmation nouvelle.
 */
export function descriptionEpisode(episode: Episode): string {
  return `${episode.pitch} Épisode ${episode.numero} de X’PLORE, la série documentaire de Prince Edja tournée à ${episode.lieu}, en Côte d’Ivoire.`
}

export function descriptionDestination(nom: string, episode?: Episode): string {
  // Pas de « carnet » ni de « guide » : les PDF ne sont pas encore livrés (audit V2-02).
  const base = `${nom}, étape de X’PLORE en Côte d’Ivoire, sur la carte du parcours documentaire de Prince Edja.`
  return episode ? `${episode.pitch} ${base}` : base
}

export function descriptionObjet(objet: Bijou): string {
  return `${objet.nom}, pièce de culture ${objet.culture}. ${objet.histoire} À découvrir sur Edja Shop, la boutique de Prince Edja.`
}
