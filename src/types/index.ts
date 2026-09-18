export interface SiteInfo {
  name: string
  role: string
  tagline: string[]
  devise: string
  mission: string
  bio: string[]
  email: string
  linkedin: string
  linkedinLabel: string
  localisation: string
  heroImage: string
  stats: Stat[]
}

export interface Stat {
  value: number
  suffix?: string
  label: string
}

export interface NavItem {
  label: string
  to: string
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
}

export interface TravelCity {
  nom: string
  intention: string
  image: string
}

export interface Bijou {
  slug: string
  numero: string
  culture: string
  nom: string
  histoire: string
  image: string
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

/* ============================================================
   MARKETPLACE — Types
   ============================================================ */

export type UniversId = 'tribe' | 'porte' | 'don' | 'memoire' | 'awale'

export type ProductStatut = 'Disponible' | 'Précommande' | 'Bientôt'

export interface MarketUnivers {
  id: UniversId
  slug: string
  num: string
  nom: string
  sousTitre: string
  pitch: string
  concept: string
  image: string
  /** Classe des Category Design Tokens (globals.css) */
  tokenClass: string
  rituel: { titre: string; texte: string }[]
}

export interface Product extends Bijou {
  univers: UniversId
  /** Prix en FCFA */
  prix: number
  statut: ProductStatut
  matiere: string
  /** Numéro d'édition, ex. "n°03/12" */
  edition?: string
}

export interface CartLine {
  slug: string
  nom: string
  image: string
  prix: number
  univers: UniversId
  quantite: number
}
