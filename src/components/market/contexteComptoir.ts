import { createContext, useContext } from 'react'
import type { ThemeComptoir } from '@/lib/themeComptoir'

export interface ComptoirContextValue {
  theme: ThemeComptoir
  slug: string
}

/**
 * Contexte séparé du composant : un fichier qui exporte à la fois un hook et un
 * composant casse le Fast Refresh (règle `react/only-export-components` du projet).
 */
export const ComptoirContext = createContext<ComptoirContextValue | null>(null)

/** Thème du comptoir courant, ou `null` hors de la marketplace. */
export function useComptoir(): ComptoirContextValue | null {
  return useContext(ComptoirContext)
}

