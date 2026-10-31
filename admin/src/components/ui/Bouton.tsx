import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

/**
 * Bouton de l'admin : zone cliquable de 44 px au moins, focus visible (anneau terracotta
 * global), état désactivé lisible. Variantes de la section 5 du prompt.
 */
export type VarianteBouton = 'primaire' | 'secondaire' | 'discret' | 'danger'

const VARIANTES: Record<VarianteBouton, string> = {
  primaire: 'bg-clay-600 text-cream-100 hover:bg-clay-700',
  secondaire: 'border border-ink-500 bg-sand-50 text-ink-900 hover:bg-sand-100',
  discret: 'text-ink-900 underline-offset-4 hover:underline',
  danger: 'border border-clay-700 bg-sand-50 text-clay-700 hover:bg-sand-100',
}

export function Bouton({
  variante = 'primaire',
  className,
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variante?: VarianteBouton }) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 text-button font-semibold transition-colors duration-(--d-fast) disabled:cursor-not-allowed disabled:opacity-60',
        VARIANTES[variante],
        className,
      )}
      {...props}
    />
  )
}
