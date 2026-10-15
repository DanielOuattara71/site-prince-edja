import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface EyebrowProps {
  children: ReactNode
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
      {num && <span aria-hidden className="h-px w-6 bg-current opacity-50" />}
      <span>{children}</span>
    </p>
  )
}
