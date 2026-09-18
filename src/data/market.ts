import { BIJOUX } from '@/data/content'
import type { MarketUnivers, Product, UniversId } from '@/types'

/* ============================================================
   UNIVERSES — les 5 salles de la marketplace
   (Direction artistique : Design System `--u-*`)
   ============================================================ */

export const UNIVERSES: MarketUnivers[] = [
  {
    id: 'tribe',
    slug: 'tribe',
    num: '00',
    nom: 'TRIBE',
    sousTitre: 'Les Symboles',
    pitch: 'Le musée vivant',
    concept:
      'Bijoux-symboles en bronze, laiton et argent, façonnés à la main par des artisans ivoiriens et inspirés des héritages touareg, akan, dan, yoruba et sénoufo.',
    image: `${import.meta.env.BASE_URL}images/boutique/hero-tribe.jpg`,
    tokenClass: 'u-tribe',
    rituel: [
      { titre: 'Fonte & façonnage', texte: 'Le métal est fondu puis façonné à la main dans les ateliers d’Abidjan.' },
      { titre: 'Ciselure des symboles', texte: 'Chaque symbole culturel est ciselé pièce par pièce, sans moules industriels.' },
      { titre: 'Polissage miroir', texte: 'Un polissage long révèle la lumière du bronze, du laiton ou de l’argent.' },
      { titre: 'Coffret & histoire', texte: 'La pièce part avec son histoire et son numéro d’édition, prête à être portée.' },
    ],
  },
  {
    id: 'porte',
    slug: 'porte',
    num: '01',
    nom: 'PORTÉ',
    sousTitre: 'L’Héritage Porté',
    pitch: 'Le tissu qui raconte',
    concept: 'Textiles, foulards et accessoires portés : wax, indigo et tissés, choisis auprès d’ateliers locaux.',
    image: `${import.meta.env.BASE_URL}images/motifs/motif-africain.jpg`,
    tokenClass: 'u-porte',
    rituel: [
      { titre: 'Cueillette du coton', texte: 'Le coton est cueilli et préparé localement, sans intermédiaires.' },
      { titre: 'Filage & teinture', texte: 'Indigo, écorces et terre donnent les couleurs profondes des étoffes.' },
      { titre: 'Tissage', texte: 'Les métiers traditionnels donnent le rythme — bandes étroites assemblées.' },
      { titre: 'Finitions', texte: 'Ourlets, franges et repassage à la main avant l’expédition.' },
    ],
  },
  {
    id: 'don',
    slug: 'don',
    num: '02',
    nom: 'DON',
    sousTitre: 'Le Rituel du Coffret',
    pitch: 'Le geste généreux',
    concept: 'Coffrets et pièces à offrir : symboles gravés, messages personnalisés, emballage cérémoniel.',
    image: `${import.meta.env.BASE_URL}images/placeholder-carre.svg`,
    tokenClass: 'u-don',
    rituel: [
      { titre: 'Choisir la pièce', texte: 'Sélectionnez le symbole qui dit ce que vous ne dites pas.' },
      { titre: 'Graver le message', texte: 'Une intention gravée à la main, en trois mots ou une phrase.' },
      { titre: 'Envelopper', texte: 'Coffret, papier de coton et ruban or — emballage offert.' },
      { titre: 'Offrir', texte: 'Livraison accompagnée d’une carte racontant l’histoire du symbole.' },
    ],
  },
  {
    id: 'memoire',
    slug: 'memoire',
    num: '03',
    nom: 'MÉMOIRE',
    sousTitre: 'L’Album Retrouvé',
    pitch: 'Les objets-témoins',
    concept:
      'Souvenirs et éditions limitées : tirages d’archives X’PLORE, impressions numérotées, objets porteurs d’histoire.',
    image: `${import.meta.env.BASE_URL}images/placeholder-fleuve.svg`,
    tokenClass: 'u-memoire',
    rituel: [
      { titre: 'Sélection d’archives', texte: 'Chaque visuel provient des archives de la série X’PLORE.' },
      { titre: 'Tirage soigné', texte: 'Impressions sur papiers de création, numérotées à la main.' },
      { titre: 'Annotation', texte: 'Lieu, date et histoire annotés au dos de chaque tirage.' },
      { titre: 'Mise sous verre', texte: 'Emballage rigide anti-pli, prêt à encadrer.' },
    ],
  },
  {
    id: 'awale',
    slug: 'awale',
    num: '04',
    nom: 'AWALÉ',
    sousTitre: 'Le Terrier',
    pitch: 'Le terrier ludique',
    concept:
      'Jeux traditionnels et éveil culturel : plateaux sculptés, jeux de société africains, transmission par le jeu.',
    image: `${import.meta.env.BASE_URL}images/placeholder-foret.svg`,
    tokenClass: 'u-awale',
    rituel: [
      { titre: 'Sculpture du plateau', texte: 'Bois massif sculpté et poncé à la main, graines incluses.' },
      { titre: 'Règles du jeu', texte: 'Chaque plateau part avec ses règles illustrées et ses variantes.' },
      { titre: 'Transmission', texte: 'Des ateliers pour apprendre à jouer, à Abidjan comme ailleurs.' },
      { titre: 'Réparations à vie', texte: 'Les plateaux sont réparables à vie dans l’atelier d’origine.' },
    ],
  },
]

/* ============================================================
   PRODUCTS — catalogue (TRIBE en production, autres univers à venir)
   ============================================================ */

const PRIX_FCFA: Record<string, number> = {
  agadez: 48_000,
  akuaba: 42_000,
  deangle: 46_000,
  oba: 56_000,
  baoule: 40_000,
  nka: 36_000,
  baobabe: 45_000,
  mambo: 52_000,
  okoro: 39_000,
  kowe: 41_000,
}

const MATIERES = ['Bronze', 'Laiton', 'Argent'] as const

const PRECOMMANDE = new Set(['agadez', 'kowe'])

export const PRODUCTS: Product[] = BIJOUX.map((bijou, index) => ({
  ...bijou,
  univers: 'tribe' as UniversId,
  prix: PRIX_FCFA[bijou.slug] ?? 42_000,
  statut: PRECOMMANDE.has(bijou.slug) ? ('Précommande' as const) : ('Disponible' as const),
  matiere: MATIERES[index % MATIERES.length],
  edition: `n°${bijou.numero}/12`,
}))

/* ============================================================
   Helpers
   ============================================================ */

export function getUniversBySlug(slug: string | undefined): MarketUnivers | undefined {
  return UNIVERSES.find((univers) => univers.slug === slug)
}

export function getProductsByUnivers(univers: UniversId): Product[] {
  return PRODUCTS.filter((product) => product.univers === univers)
}

export function getProduct(slug: string | undefined, univers?: string): Product | undefined {
  return PRODUCTS.find(
    (product) => product.slug === slug && (univers ? product.univers === univers : true),
  )
}

export function getFeatured(limit = 3): Product[] {
  return PRODUCTS.slice(0, limit)
}

export function countByUnivers(univers: UniversId): number {
  return getProductsByUnivers(univers).length
}