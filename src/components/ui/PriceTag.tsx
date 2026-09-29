import { cn } from '@/lib/cn'
import { formatFCFA } from '@/lib/format'

interface PriceTagProps {
  /** Montant en francs CFA, entier, sans separateur. `null` = pièce sur commande. */
  montant: number | null
  /** Prix d'avant, affiche barre. */
  compare?: number | null
  /** Mention discret sous le montant (livraison, taxes). */
  note?: string
  size?: 'carte' | 'cartel' | 'hero'
  className?: string
}

/**
 * Le prix est une information de fin de parcours : en monospace, tabulaire, lisible.
 * Jamais en Anton condensé, jamais dans une image.
 */
export function PriceTag({ montant, compare, note, size = 'carte', className }: PriceTagProps) {
  if (montant === null) {
    return (
      <p className={cn('data-mono label-caps text-ink-500', className)}>Sur commande</p>
    )
  }

  return (
    <p className={cn('flex flex-col gap-1', className)}>
      <span className="flex items-baseline gap-2.5">
        <span
          className={cn(
            'data-mono font-semibold text-ink-900',
            size === 'carte' && 'text-body',
            size === 'cartel' && 'text-heading-sm',
            size === 'hero' && 'text-heading-md',
          )}
        >
          {formatFCFA(montant)}
        </span>
        {compare && compare > montant && (
          <span className="data-mono text-caption text-ink-500 line-through">
            {formatFCFA(compare)}
          </span>
        )}
      </span>
      {note && <span className="text-caption leading-snug text-ink-500">{note}</span>}
    </p>
  )
}
