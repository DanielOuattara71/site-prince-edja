/**
 * Offres de collaboration (CDC T-121) et sections du template d'étude de cas (T-122).
 *
 * Les libellés des offres sont ceux du CDC. Les descriptions restent à écrire avec la
 * maison : elles sont marquées comme proposition plutôt que remplies de généralités.
 */

export interface Offre {
  titre: string
  texte: string
}

export const OFFRES: Offre[] = [
  { titre: 'Brand content', texte: 'PROPOSITION à valider.' },
  { titre: 'Destination campaigns', texte: 'PROPOSITION à valider.' },
  { titre: 'Travel experiences', texte: 'PROPOSITION à valider.' },
  { titre: 'Ambassade de marque', texte: 'PROPOSITION à valider.' },
  { titre: 'Storytelling', texte: 'PROPOSITION à valider.' },
  { titre: 'Production audiovisuelle', texte: 'PROPOSITION à valider.' },
  { titre: 'Conférences', texte: 'PROPOSITION à valider.' },
  { titre: 'Documentaires sponsorisés', texte: 'PROPOSITION à valider.' },
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
