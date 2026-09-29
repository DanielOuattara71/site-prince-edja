import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type ChipTone = 'sombre' | 'clair' | 'accent' | 'contour'

interface ChipProps {
  children: ReactNode
  /** `sombre` = pastille posée sur une photo · `accent` = couleur du comptoir · `contour` = fiche technique */
  tone?: ChipTone
  /** Point de couleur (rareté, disponibilité) — décoratif. */
  bague?: boolean
  className?: string
}

/**
 * La pastille du projet, jusqu'ici recopiée dans quatre fichiers.
 * Rayon pilule autorisé : c'est de la navigation, pas une action marchande.
 */
export function Chip({ children, tone = 'sombre', bague = false, className }: ChipProps) {
  return (
    <span
      className={cn(
        'label-caps inline-flex items-center gap-2 rounded-pill px-3.5 py-1.5',
        tone === 'sombre' && 'bg-night-900/85 text-cream-100 backdrop-blur-sm',
        tone === 'clair' && 'bg-kaolin-50/90 text-ink-900 backdrop-blur-sm',
        // L'accent d'un comptoir ne prend jamais `night-900` en texte : sur Maison & Table
        // l'accent est brique (#a33b27) et le nuit ne rend que 2,8:1. Le texte suit donc le
        // sol du thème, avec le nuit en repli hors marché (là où `--c-sol` n'existe pas).
        tone === 'accent' && 'bg-[var(--c-accent)] text-[color:var(--c-sol,var(--color-night-900))]',
        tone === 'contour' && 'border border-current/30 text-current',
        className,
      )}
    >
      {bague && <span aria-hidden className="size-1.5 shrink-0 rounded-pill bg-gold-400" />}
      {children}
    </span>
  )
}
