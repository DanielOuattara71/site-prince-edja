import { BIJOUX } from './content'
import type { Bijou } from '@/types'

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

const BASE = {
  reference: '',
  prix: null,
  ancienPrix: null,
  prixConfirme: false,
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
  commerce: { ...BASE },
}))

/** Pièces disponibles à la demande. */
export const piecesDisponibles = PIECES.filter((piece) => piece.commerce?.disponible)

/** Filtres du CDC : catégorie, prix, origine, créateur, disponibilité. */
export const FILTRES_SHOP = [
  'catégorie',
  'prix',
  'origine',
  'créateur',
  'disponibilité',
] as const
