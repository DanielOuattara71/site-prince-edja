/**
 * DONNÉES MARCHÉ — source unique à remplacer par le backend.
 *
 * ⚠️ Les montants ci‑dessous sont des **mock**. Ils servent à juger la mise en scène
 * (taille, position, contraste du prix sur la carte) et ne doivent pas être publiés
 * comme des prix définitifs. Le champ `prixConfirme` vaut `false` tant que le backend
 * n'existe pas : l'interface affiche alors « prix indicatif » au lieu d'annoncer un
 * montant comme s'il était arrêté.
 *
 * Migration prévue : une requête remplace `PRODUITS`, la forme ne bouge pas.
 */

export interface Edition {
  numero: number
  total: number
}

export interface PieceMarche {
  /**
   * Référence courte, en données tabulaires : PE‑TRIBE‑01.
   * Le `slug` n'est pas dans la valeur : il est la clé du dictionnaire `PRODUITS`.
   */
  reference: string
  /** Montant en FCFA, entier. `null` = sur devis, à traiter au cas par cas. */
  prix: number | null
  /** `false` tant que le montant est un mock ou n'a pas été validé. */
  prixConfirme: boolean
  matieres: string[]
  tailles: string[]
  edition: Edition | null
  /**
   * Atelier et ville : `null` tant qu'ils ne sont pas fournis et vérifiés.
   * Volontairement non remplis : une provenance inventée sur une fiche produit
   * publiée engage la réputation de la maison. À renseigner avec la personne concernée.
   */
  atelier: string | null
  village: string | null
  /** Poids en grammes : sert au calcul de livraison, pas à l'affichage. */
  poids: number | null
}

const MOCK: Omit<PieceMarche, 'slug' | 'reference'> = {
  prix: null,
  prixConfirme: false,
  matieres: [],
  tailles: [],
  edition: null,
  atelier: null,
  village: null,
  poids: null,
}

export const PRODUITS: Record<string, PieceMarche> = {
  agadez: {
    ...MOCK,
    reference: 'PE-TRIBE-01',
    prix: 32000,
    matieres: ['Bronze', 'Laiton'],
    tailles: ['TU'],
    edition: { numero: 12, total: 30 },
    poids: 46,
  },
  akuaba: {
    ...MOCK,
    reference: 'PE-TRIBE-02',
    prix: 28000,
    matieres: ['Laiton', 'Cire'],
    tailles: ['TU'],
    edition: { numero: 8, total: 30 },
    poids: 38,
  },
  deangle: {
    ...MOCK,
    reference: 'PE-TRIBE-03',
    prix: 35000,
    matieres: ['Bronze'],
    tailles: ['TU'],
    edition: { numero: 21, total: 30 },
    poids: 52,
  },
  oba: {
    ...MOCK,
    reference: 'PE-TRIBE-04',
    prix: 45000,
    matieres: ['Bronze doré', 'Laiton'],
    tailles: ['TU', 'M'],
    edition: { numero: 4, total: 30 },
    poids: 64,
  },
  baoule: {
    ...MOCK,
    reference: 'PE-TRIBE-05',
    prix: 68000,
    matieres: ['Or 18 carats'],
    tailles: ['TU', 'M'],
    edition: { numero: 2, total: 12 },
    poids: 21,
  },
  nka: {
    ...MOCK,
    reference: 'PE-TRIBE-06',
    prix: 22000,
    matieres: ['Laiton'],
    tailles: ['TU'],
    edition: { numero: 26, total: 30 },
    poids: 33,
  },
  baobabe: {
    ...MOCK,
    reference: 'PE-TRIBE-07',
    prix: 52000,
    matieres: ['Bronze', 'Argent'],
    tailles: ['M'],
    edition: { numero: 6, total: 20 },
    poids: 71,
  },
  mambo: {
    ...MOCK,
    reference: 'PE-TRIBE-08',
    prix: 38000,
    matieres: ['Laiton', 'Pierre'],
    tailles: ['TU'],
    edition: { numero: 15, total: 30 },
    poids: 58,
  },
  okoro: {
    ...MOCK,
    reference: 'PE-TRIBE-09',
    prix: 25000,
    matieres: ['Bronze'],
    tailles: ['TU'],
    edition: { numero: 30, total: 30 },
    poids: 41,
  },
  kowe: {
    ...MOCK,
    reference: 'PE-TRIBE-10',
    prix: 18000,
    matieres: ['Coton', 'Laiton'],
    tailles: ['TU', 'M', 'L'],
    edition: { numero: 9, total: 40 },
    poids: 27,
  },
}

/** Données marché d'une pièce, ou un objet vide si elle n'est pas encore référencée. */
export function marche(slug: string): PieceMarche {
  return PRODUITS[slug] ?? { ...MOCK, reference: '—', prix: null }
}

/**
 * Pièces de démonstration pour les comptoirs sans inventaire réel.
 *
 * Règles tenues ici, volontairement strictes :
 * - les visuels sont les **placeholders SVG déjà présents** dans `public/images/`, donc
 *   personne ne peut les prendre pour une photo de vente ;
 * - les noms sont **descriptifs et neutres**. J'ai refusé d'inventer un nom de tissu,
 *   une origine ou un symbole : ce sont des affirmations culturelles, et le catalogue
 *   du comptoir Tissé attend de vraies pièces photographiées, pas du plausible.
 * - aucun atelier, aucun village, aucun prix confirmé.
 *
 * Ces entrées disparaissent dès que le backend arrive.
 */
export interface PieceDemo {
  slug: string
  nom: string
  repere: string
  image: string
  prix: number | null
  /** Toujours `false` en démonstration : aucune de ces valeurs n'est arrêtée. */
  prixConfirme: boolean
}

const placeholder = (nom: string) => `${import.meta.env.BASE_URL}images/${nom}`

/**
 * Le filet du « pas encore confirmé » est posé une fois ici plutôt que recopié sur
 * chaque ligne : si une de ces pièces devenait vendable, ce n'est pas un `false` oublié
 * qui laisserait un prix provisoire s'afficher comme un prix arrêté.
 */
const demo = (piece: Omit<PieceDemo, 'prixConfirme'>): PieceDemo => ({
  ...piece,
  prixConfirme: false,
})

export const PIECES_TISSE: PieceDemo[] = [
  demo({
    slug: 'bande-01',
    nom: 'Bande tissée — exemple',
    repere: 'placeholder · à photographier',
    image: placeholder('placeholder-paysage.svg'),
    prix: 15000,
  }),
  demo({
    slug: 'bande-02',
    nom: 'Bande tissée — exemple',
    repere: 'placeholder · à photographier',
    image: placeholder('placeholder-carre.svg'),
    prix: 15000,
  }),
  demo({
    slug: 'bande-03',
    nom: 'Ceinture — exemple',
    repere: 'placeholder · à photographier',
    image: placeholder('placeholder-fleuve.svg'),
    prix: 22000,
  }),
  demo({
    slug: 'bande-04',
    nom: 'Ceinture — exemple',
    repere: 'placeholder · à photographier',
    image: placeholder('placeholder-foret.svg'),
    prix: 22000,
  }),
  demo({
    slug: 'bande-05',
    nom: 'Étole — exemple',
    repere: 'placeholder · à photographier',
    image: placeholder('placeholder-portrait.svg'),
    prix: 35000,
  }),
  demo({
    slug: 'bande-06',
    nom: 'Étole — exemple',
    repere: 'placeholder · à photographier',
    image: placeholder('placeholder-paysage.svg'),
    prix: 35000,
  }),
  demo({
    slug: 'bande-07',
    nom: 'Sac — exemple',
    repere: 'placeholder · à photographier',
    image: placeholder('placeholder-carre.svg'),
    prix: 40000,
  }),
]

/** Pièces de démonstration disponibles pour un comptoir donné. */
export function piecesDemo(comptoirSlug: string): PieceDemo[] {
  return comptoirSlug === 'tisse' ? PIECES_TISSE : []
}

