import { createContext, useContext } from 'react'
import type { Bijou } from '@/types'

/**
 * Panier d'achat (contrat 1.14.0) — distinct du système « demande » (devis) qui reste en place
 * pour les pièces sans prix confirmé. Le panier ne stocke que des références : un `varianteId`
 * par ligne (l'API recalcule le prix au moment de la commande), jamais un prix cuisiné côté
 * navigateur. Le montant affiché ici est indicatif.
 *
 * Ce fichier ne contient que le contexte, le hook et les types : le fournisseur vit dans
 * `panier.tsx` pour ne pas casser le fast refresh (react/only-export-components).
 */

export interface LignePanier {
  slug: string
  varianteId: string
  nom: string
  quantite: number
  /** Prix indicatif affiché ; l'API fait foi. */
  prixIndicatif: number | null
  image: string
}

export interface ContextePanier {
  lignes: LignePanier[]
  nombre: number
  totalIndicatif: number
  ajouter: (bijou: Bijou, quantite: number, varianteId?: string) => void
  retirer: (slug: string) => void
  changerQuantite: (slug: string, quantite: number) => void
  vider: () => void
}

export const ContextePanierReact = createContext<ContextePanier | null>(null)

/**
 * Interrupteur du parcours d'achat. Tant que le prestataire de paiement n'est pas branché,
 * les points d'entrée sont grisés et le bouton « Voir ma sélection » (devis) reste la seule
 * action de vente. Repasser à `true` réactive le panier, la commande et le suivi en un seul
 * endroit — le code du parcours reste en place et testé.
 */
export const ACHAT_ACTIF = false

/** Une pièce est achetable quand elle a un prix confirmé et au moins une variante publiée. */
export function achetable(bijou: Bijou): boolean {
  const c = bijou.commerce
  return Boolean(c?.prixConfirme && c.prix != null && c.disponible && c.varianteIds.length > 0)
}

export function usePanier(): ContextePanier {
  const contexte = useContext(ContextePanierReact)
  if (!contexte) throw new Error('usePanier doit être utilisé dans FournisseurPanier.')
  return contexte
}
