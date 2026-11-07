/**
 * Offres de collaboration (CDC T-121) et sections du template d'étude de cas (T-122).
 *
 * Les libellés des offres sont ceux du CDC. Les descriptions restent à écrire avec la
 * maison : vides plutôt que remplies de généralités. Une offre sans texte s'affiche avec son
 * titre seul (l'ancienne mention « PROPOSITION à valider » était un texte d'atelier, § 8.5).
 */

export interface Offre {
  titre: string
  /** Vide tant que la maison ne l'a pas écrit. */
  texte: string
}

export const OFFRES: Offre[] = [
  { titre: 'Brand content', texte: '' },
  { titre: 'Destination campaigns', texte: '' },
  { titre: 'Travel experiences', texte: '' },
  { titre: 'Ambassade de marque', texte: '' },
  { titre: 'Storytelling', texte: '' },
  { titre: 'Production audiovisuelle', texte: '' },
  { titre: 'Conférences', texte: '' },
  { titre: 'Documentaires sponsorisés', texte: '' },
]

/** Les huit sections du template d'étude de cas du CDC. */
export const ETAPES_CAS = [
  'Challenge',
  'Idée',
  'Exécution',
  'Contenus',
  'Diffusion',
  'Résultats',
  'Témoignage',
  'Galerie',
]
