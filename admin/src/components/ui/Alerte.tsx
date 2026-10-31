import type { ReactNode } from 'react'
import { CircleAlert, CircleCheck, Info } from 'lucide-react'
import { cn } from '@/lib/cn'

/**
 * Bandeau d'information, de succès ou d'erreur : icône **et** texte, jamais la couleur
 * seule (section 12). Une erreur est annoncée tout de suite (`role="alert"`).
 */
type Ton = 'info' | 'succes' | 'erreur'

const TONS: Record<Ton, { classes: string; Icone: typeof Info }> = {
  info: { classes: 'border-ink-500 bg-sand-100 text-ink-900', Icone: Info },
  succes: { classes: 'border-forest-900 bg-sage-100 text-forest-900', Icone: CircleCheck },
  erreur: { classes: 'border-clay-700 bg-sand-100 text-clay-700', Icone: CircleAlert },
}

export function Alerte({
  ton = 'info',
  children,
  className,
}: {
  ton?: Ton
  children: ReactNode
  className?: string
}) {
  const { classes, Icone } = TONS[ton]
  return (
    <div
      role={ton === 'erreur' ? 'alert' : 'status'}
      className={cn(
        'flex items-start gap-3 rounded-md border px-4 py-3 text-body',
        classes,
        className,
      )}
    >
      <Icone aria-hidden className="mt-0.5 size-5 shrink-0" />
      <div className="space-y-1">{children}</div>
    </div>
  )
}
