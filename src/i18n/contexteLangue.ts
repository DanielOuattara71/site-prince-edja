import { createContext, useContext } from 'react'
import type { CleTraduction, Langue } from './dictionnaire'
import type { Libelle } from '@/data/navigation'

export interface ContexteLangue {
  langue: Langue
  definirLangue: (langue: Langue) => void
  /** Libellé d'interface. */
  t: (cle: CleTraduction) => string
  /** Libellé bilingue des données de navigation. */
  l: (libelle: Libelle) => string
  afficherLangue: (nom: string) => string
}

/**
 * Contexte tenu hors du fichier de composant.
 *
 * `react/only-export-components` veut qu'un fichier `.tsx` n'exporte que des
 * composants : y glisser le hook casserait le fast refresh à chaque édition du
 * fichier. Fournisseur d'un côté, contexte et hook de l'autre.
 */
export const LangueContexte = createContext<ContexteLangue | null>(null)

export function useLangue(): ContexteLangue {
  const contexte = useContext(LangueContexte)
  if (!contexte) {
    throw new Error('useLangue doit être utilisé dans <FournisseurLangue>')
  }
  return contexte
}
