import { cn } from '@/lib/cn'

interface MotifAccentProps {
  className?: string
}

/**
 * Motif d’accent : petite forme géométrique (losange) qui souligne un titre
 * ou un élément important. Couleur : orange ocre de la marque (clay).
 */
export function MotifAccent({ className }: MotifAccentProps) {
  return (
    <svg
      aria-hidden
      className={cn('mr-2 inline-block h-3 w-3 shrink-0 text-clay-500 align-middle', className)}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <rect x={8} y={8} width={8} height={8} transform="rotate(45 12 12)" />
    </svg>
  )
}
