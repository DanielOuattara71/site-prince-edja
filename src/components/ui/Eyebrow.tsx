import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface EyebrowProps {
  children: ReactNode
  /**
   * Identifiant de contenu uniquement (épisode, objet).
   * La numérotation des sections a été retirée du site : ne pas s'en servir pour
   * ordonner une suite de sections, aucun tiret de liaison ne l'accompagne plus.
   */
  num?: string
  tone?: 'light' | 'dark'
  className?: string
}

export function Eyebrow({ children, num, tone = 'light', className }: EyebrowProps) {
  return (
    <p
      className={cn(
        'label-caps flex items-center gap-2.5',
        tone === 'light' ? 'text-ink-500' : 'text-cream-100/70',
        className,
      )}
    >
      {num && (
        // Le numéro est or sur fond nuit (8,4:1) et terracotta sur ivoire (4,9:1) :
        // l'or en texte sur sable tombe à 2,1:1, la règle de la maison le réserve aux
        // filets et aux puces.
        <span
          className={cn(
            'font-display tracking-normal',
            tone === 'dark' ? 'text-gold-400' : 'text-clay-600',
          )}
        >
          {num}
        </span>
      )}
      <span>{children}</span>
    </p>
  )
}
