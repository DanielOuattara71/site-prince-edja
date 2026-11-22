import { BIJOUX } from './content'
import type { Bijou, GalerieImage } from '@/types'
import { img } from '@/lib/images'

/**
 * Données commerciales de la collection TRIBE (CDC lot 02).
 *
 * Aucun montant, aucune matière, aucun créateur n'est avancé : les pièces restent
 * « sur demande » jusqu'à ce que la maison fournisse et valide ces informations. Les
 * champs existent pour que la bascule se fasse sans toucher aux composants.
 */

/** Les huit catégories du CDC. */
export const CATEGORIES_SHOP = [
  'Bijoux & accessoires',
  'Mode',
  'Livres & photographie',
  'Art & décoration',
  'Travel essentials',
  'Éditions X’PLORE',
  'Guides',
  'Collections limitées',
] as const

/** La collection actuelle ne compte que des bijoux : les sept autres catégories sont vides. */
const CATEGORIE_PAR_DEFAUT = 'Bijoux & accessoires'

/**
 * Prix provisoires (FCFA), identiques à la base de dev ; l'admin peut les modifier.
 * Indexés par référence TRIBE (`bijou.numero` = `variante.reference` sans le suffixe ‑1).
 */
const PRIX_PAR_SLUG: Record<string, number> = {
  agadez: 250_000,
  akuaba: 180_000,
  deangle: 220_000,
  oba: 350_000,
  baoule: 200_000,
  nka: 280_000,
  baobabe: 150_000,
  mambo: 220_000,
  okoro: 140_000,
  kowe: 170_000,
}

const BASE = {
  reference: '',
  prix: null,
  ancienPrix: null,
  prixConfirme: false,
  // Les données de départ n'ont pas d'identifiants serveur : le bouton d'envoi
  // retombe sur la messagerie tant qu'aucune pièce ne porte de variante réelle.
  varianteIds: [],
  matieres: [],
  tailles: [],
  edition: null,
  atelier: null,
  village: null,
  poids: null,
  galerie: [],
  disponible: true,
  createur: null,
  // La collection actuelle ne compte que des bijoux : les sept autres catégories
  // attendent leurs produits. `culture` désigne l'origine du symbole, pas la famille
  // de produits — les confondre rendait le filtre inopérant.
  categorie: CATEGORIE_PAR_DEFAUT,
}

/** Pièces enrichies de leurs données commerciales. */
export const PIECES: Bijou[] = BIJOUX.map((bijou) => ({
  ...bijou,
  commerce: {
    ...BASE,
    // Prix provisoires : l'admin les modifie dans la fiche (le site reflète la base).
    prix: PRIX_PAR_SLUG[bijou.slug] ?? null,
    prixConfirme: PRIX_PAR_SLUG[bijou.slug] !== undefined,
  },
}))

/** Pièces disponibles à la demande. */
export const piecesDisponibles = PIECES.filter((piece) => piece.commerce?.disponible)

/** Filtres du CDC : catégorie, prix, origine, créateur, disponibilité. */
export const FILTRES_SHOP = ['catégorie', 'prix', 'origine', 'créateur', 'disponibilité'] as const

/**
 * Galerie éditoriale de la boutique.
 *
 * Ces images ne sont **pas** les visuels des pièces : elles ne doivent pas
 * répéter le catalogue. Elles composent un regard sur les gestes, les symboles
 * et les détails qui entourent la collection. Les fichiers viennent du journal
 * de la maison ; le jour où la campagne TRIBE est livrée, seul ce tableau
 * change, ni le composant ni la page.
 */
export const GALERIE_SHOP: GalerieImage[] = [
  {
    src: img(`images/journal/raconter-pour-exister.jpg`),
    alt: 'Prince Edja, mains couvertes de bagues dorées, dans une mise en scène de studio.',
    titre: 'Le geste',
    legende: 'La main comme récit',
  },
  {
    src: img(`images/journal/porter-un-symbole.jpg`),
    alt: 'Masques traditionnels portés lors d’une cérémonie.',
    titre: 'Le symbole',
    legende: 'Ce que l’objet retient',
  },
  {
    src: img(`images/journal/afrique-multitude-de-mondes.jpg`),
    alt: 'Détail d’un masque traditionnel orné de cauris et de plumes.',
    titre: 'Le détail',
    legende: 'Ce que le regard choisit',
  },
  {
    src: img(`images/journal/griot-moderne.jpg`),
    alt: 'Danseurs en tenue de cérémonie sous un ciel bleu.',
    titre: 'La transmission',
    legende: 'Le geste collectif',
  },
]
