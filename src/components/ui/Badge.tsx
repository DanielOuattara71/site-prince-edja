import type { ArticleStatut } from '@/types'
import { cn } from '@/lib/cn'

interface BadgeProps {
  statut: ArticleStatut
}

export function Badge({ statut }: BadgeProps) {
  const isSoon = statut === 'à venir'
  return (
    <span
      className={cn(
        'label-caps inline-flex items-center rounded-full border px-3 py-1',
        isSoon ? 'border-clay-500/40 text-clay-600' : 'border-gold-400/60 text-ink-700',
      )}
    >
      {statut}
    </span>
  )
}
