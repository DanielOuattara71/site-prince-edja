export interface SiteInfo {
  name: string
  role: string
  /** Signature du hero, imposée par le CDC. */
  signature: string
  /** Phrase manifeste du hero, imposée par le CDC. */
  manifeste: string
  tagline: string[]
  devise: string
  mission: string
  bio: string[]
  email: string
  linkedin: string
  linkedinLabel: string
  localisation: string
  heroImage: string
  /** Dérivés du hero : deux largeurs pour ne pas servir 1672 px à un téléphone. */
  heroSrcSet?: string
  heroSizes?: string
  stats: Stat[]
}

export interface Stat {
  value: number | null
  suffix?: string
  label: string
  /** Date de validation du chiffre. Absente = donnée non confirmée. */
  date?: string
}

export interface NavItem {
  label: string
  to: string
}

/** Format d'un contenu indexé. Sert à grouper la recherche et à filtrer. */
export type FormatContenu = 'film' | 'destination' | 'objet' | 'article'

/** Projet de rattachement. `TRIBE` = la collection d'objets, `JOURNAL` = les articles. */
export type ProjetContenu = 'XPLORE' | 'TASTE_TRAVEL' | 'TRIBE' | 'JOURNAL'

/**
 * Vocabulaire commun de classification.
 *
 * `pays`, `ville`, `theme` et `annee` sont **optionnels et vides par défaut** : une
 * valeur incertaine se laisse vide. Une provenance inventée sur une fiche publiée
 * engage la maison. On ne comble pas un champ de crédibilité avec du plausible.
 */
export interface Tags {
  pays?: string[]
  ville?: string[]
  theme?: string[]
  annee?: string
  format: FormatContenu
  projet: ProjetContenu
}

export interface Univers {
  numero: string
  nom: string
  pitch: string
  to: string
}

export interface Episode {
  slug: string
  numero: string
  titre: string
  lieu: string
  pitch: string
  image: string
  guide?: string
  tags: Tags
}

export interface TravelCity {
  nom: string
  intention: string
  image: string
  tags: Tags
}

export interface Bijou {
  slug: string
  numero: string
  culture: string
  nom: string
  histoire: string
  image: string
  tags: Tags
  /** Données commerciales. Toutes optionnelles : une pièce sans prix se demande. */
  commerce?: CommerceBijou
}

/**
 * Données commerciales d'une pièce.
 *
 * Tout est optionnel et vide par défaut : le CDC interdit d'inventer un prix, une
 * matière ou un créateur. `prixConfirme` reste faux tant qu'un montant n'est pas
 * validé, et la fiche affiche alors « sur demande » plutôt qu'un chiffre.
 */
export interface CommerceBijou {
  reference: string
  /** Montant en FCFA. `null` = sur demande. */
  prix: number | null
  /** Prix d'avant, quand la pièce est soldée. */
  ancienPrix?: number | null
  prixConfirme: boolean
  matieres: string[]
  tailles: string[]
  edition: { numero: number; total: number } | null
  atelier: string | null
  village: string | null
  poids: number | null
  /** Visuels supplémentaires. Les photos réelles sont à fournir. */
  galerie: string[]
  disponible: boolean
  createur: { nom: string; pays: string | null; ville: string | null; bio: string } | null
  /** Univers marchand de la pièce (les huit catégories du CDC). `culture` désigne
   *  l'origine du symbole, pas la famille de produits : les confondre rendait le
   *  filtre « Catégorie » incapable de rien retourner. */
  categorie: string
}

export type ArticleStatut = 'publié' | 'à venir'

export interface Article {
  slug: string
  categorie: string
  titre: string
  extrait: string
  statut: ArticleStatut
  image: string
  date?: string
  /** Temps de lecture en minutes. Absent tant que le corps de l'article n'existe pas. */
  lecture?: number
  tags: Tags
}

export interface PressItem {
  source: string
  date: string
  titre: string
  resume: string
  url: string
}

export interface Milestone {
  periode: string
  titre: string
  description: string
}

export interface Distinction {
  id: string
  annee: string
  titre: string
  delivreePar?: string
  description: string
  image: string
  url?: string
}

export interface ContactMotif {
  numero: string
  titre: string
  description: string
}

export interface GalleryItem {
  src: string
  alt: string
  to: string
  ratio: string
  speed: number
  label?: string
  external?: boolean
}
