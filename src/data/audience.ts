/**
 * Audience de Prince Edja (CDC T-120).
 *
 * Plateformes, tailles, géographies, profils, reach, impressions et engagement. Aucun
 * chiffre n'est avancé sans source : les lignes sans valeur restent vides et le bloc
 * affiche la mention d'attente. `date` porte la date de validation du chiffre.
 */

export interface LigneAudience {
  plateforme: string
  /** Nombre d'abonnés. `null` = non fourni. */
  taille: number | null
  /** Portée (reach) mensuelle. `null` = non fournie. */
  portee: number | null
  /** Date de validation des chiffres de la ligne. */
  date?: string
}

export const AUDIENCE: LigneAudience[] = [
  { plateforme: 'Toutes plateformes', taille: 600000, portee: null },
  { plateforme: 'Instagram', taille: null, portee: null },
  { plateforme: 'TikTok', taille: null, portee: null },
  { plateforme: 'YouTube', taille: null, portee: null },
  { plateforme: 'LinkedIn', taille: null, portee: null },
  { plateforme: 'Facebook', taille: null, portee: null },
]

/** Profils d'audience et zones géographiques : à fournir, jamais inventés. */
export const AUDIENCE_PROFILS: { label: string; valeur: string | null }[] = [
  { label: 'Géographies', valeur: null },
  { label: 'Profils', valeur: null },
  { label: 'Impressions', valeur: null },
  { label: 'Engagement', valeur: null },
]
