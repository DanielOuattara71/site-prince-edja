import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export interface LigneCartel {
  cle: string
  valeur: ReactNode
}

interface CartelProps {
  /** Paires clé → valeur, dans l'ordre de lecture d'un cartel de musée. */
  lignes: LigneCartel[]
  /** `comptoir` reprend les jetons de l'univers, `neutre` reste sur la palette du site. */
  tone?: 'neutre' | 'comptoir'
  className?: string
}

/**
 * Le cartel : la signature documentaire du projet.
 * Filets et monospace, pas de liste à puces ni de carte ombrée.
 * Une clé se lit en 11 px capitales, la valeur en 15 px — le contraste fait la hiérarchie.
 */
export function Cartel({ lignes, tone = 'neutre', className }: CartelProps) {
  return (
    <dl
      className={cn(
        'divide-y',
        tone === 'comptoir' ? 'divide-[color:var(--c-trait)]' : 'divide-sand-200',
        className,
      )}
    >
      {lignes.map((ligne) => (
        <div
          key={ligne.cle}
          className="grid grid-cols-[minmax(0,7.5rem)_1fr] items-baseline gap-x-6 gap-y-1 py-3 sm:grid-cols-[minmax(0,9rem)_1fr]"
        >
          <dt
            className={cn(
              'label-caps text-ink-500',
              tone === 'comptoir' && 'text-[var(--c-texte-doux)]',
            )}
          >
            {ligne.cle}
          </dt>
          <dd
            className={cn(
              'text-body text-ink-900',
              tone === 'comptoir' && 'text-[var(--c-texte)]',
            )}
          >
            {ligne.valeur}
          </dd>
        </div>
      ))}
    </dl>
  )
}
