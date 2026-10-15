
/**
 * Les projets de la page « Histoires » (CDC T-301 à T-304).
 *
 * Les projets réels (les six épisodes X'PLORE et Taste & Travel) sont lus dans les
 * données existantes. Les autres projets du CDC n'ont aucun contenu : ils sont posés
 * comme squelettes au statut « en préparation », jamais remplis de plausible.
 */

export type StatutProjet = 'disponible' | 'en production' | 'en préparation'

export interface Projet {
  slug: string
  titre: string
  /** Court texte de présentation. */
  accroche: string
  format: 'Documentaire' | 'Série' | 'Émission' | 'Archive'
  annee: string
  pays: string[]
  statut: StatutProjet
  theme: string[]
  image: string
  /** Projet sans contenu : les cases vides s'affichent comme telles. */
  aFournir: boolean
  /**
   * Page réelle du projet, quand elle n'est pas une fiche d'épisode. Sans elle, la
   * carte pointe vers `/xplore/<slug>`, qui n'existe que pour les six épisodes.
   */
  route?: string
}

export const PROJETS: Projet[] = [
  {
    slug: 'xplore-cote-divoire',
    titre: 'X’PLORE Côte d’Ivoire',
    accroche:
      'Six routes, six histoires : la série documentaire qui arpente la Côte d’Ivoire à hauteur d’homme.',
    format: 'Série',
    annee: '',
    pays: ['Côte d’Ivoire'],
    statut: 'disponible',
    theme: ['Nature', 'Mémoire'],
    image: `${import.meta.env.BASE_URL}images/xplore/bandeau-foret.jpg`,
    aFournir: false,
    route: '/xplore',
  },
  {
    slug: 'taste-and-travel',
    titre: 'Taste & Travel',
    accroche:
      'Émission gastronomique et culturelle : la table comme premier poste frontière.',
    format: 'Émission',
    annee: '',
    pays: ['Côte d’Ivoire'],
    statut: 'disponible',
    theme: ['Gastronomie', 'Culture'],
    image: `${import.meta.env.BASE_URL}images/voyage/bandeau-littoral.jpg`,
    aFournir: false,
    route: '/taste-and-travel',
  },
  {
    slug: 'chant-des-cotes',
    titre: 'Chant des Côtes',
    accroche: 'Projet annoncé par le CDC.',
    format: 'Documentaire',
    annee: '',
    pays: [],
    statut: 'en préparation',
    theme: [],
    image: '',
    aFournir: true,
  },
  {
    slug: 'nuances-du-zaouli',
    titre: 'Les Nuances du Zaouli',
    accroche: 'Projet annoncé par le CDC.',
    format: 'Documentaire',
    annee: '',
    pays: [],
    statut: 'en préparation',
    theme: [],
    image: '',
    aFournir: true,
  },
  {
    slug: 'route-du-masa',
    titre: 'Sur la Route du MASA',
    accroche: 'Projet annoncé par le CDC.',
    format: 'Documentaire',
    annee: '',
    pays: [],
    statut: 'en préparation',
    theme: [],
    image: '',
    aFournir: true,
  },
  {
    slug: 'archive-dafrique',
    titre: 'Archive d’Afrique',
    accroche: 'Bibliothèque de mémoires : personnages, événements, traditions, objets et récits oraux.',
    format: 'Archive',
    annee: '',
    pays: [],
    statut: 'en préparation',
    theme: ['Mémoire', 'Patrimoine'],
    image: '',
    aFournir: true,
  },
]

/** Les sept filtres du CDC. */
export const FILTRES_PROJETS = [
  'Documentaires',
  'Séries',
  'Histoire',
  'Patrimoine',
  'Tourisme',
  'En production',
  'Archives',
] as const
