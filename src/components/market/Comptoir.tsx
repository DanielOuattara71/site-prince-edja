import { useMemo } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { cleDeComptoir, themeDeComptoir, themeVersVariablesCss } from '@/lib/themeComptoir'
import { ComptoirContext } from '@/components/market/contexteComptoir'

interface ComptoirProps {
  /** Clé du thème dans `THEMES`. Une clé inconnue retombe sur le comptoir 01. */
  slug: string
  children: ReactNode
  className?: string
}

/**
 * Enveloppe un comptoir et y pose son univers : sol, accent, halo, texte.
 *
 * Les enfants lisent les jetons via `var(--c-*)` et n'ont donc aucune connaissance
 * de la catégorie dans laquelle ils se trouvent : c'est ce qui permet d'ouvrir un
 * huitième comptoir sans écrire un composant de plus.
 */
export function Comptoir({ slug, children, className }: ComptoirProps) {
  const theme = themeDeComptoir(slug)
  const cle = cleDeComptoir(slug)

  const valeur = useMemo(() => ({ theme, slug: cle }), [theme, cle])

  const style = useMemo(() => themeVersVariablesCss(theme) as CSSProperties, [theme])

  return (
    <ComptoirContext.Provider value={valeur}>
      <div
        data-comptoir={valeur.slug}
        data-regie={theme.regie}
        style={style}
        className={cn('relative isolate transition-colors duration-(--d-reveal) ease-expo', className)}
      >
        {children}
      </div>
    </ComptoirContext.Provider>
  )
}
