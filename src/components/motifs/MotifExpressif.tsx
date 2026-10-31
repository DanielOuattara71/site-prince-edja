import { cn } from '@/lib/cn'

interface MotifExpressifProps {
  className?: string
}

/**
 * Motif expressif : composition plus visible, réservée à une ou deux zones
 * stratégiques. Ici : l’arrière-plan discret derrière la mascotte.
 */
export function MotifExpressif({ className }: MotifExpressifProps) {
  return (
    <svg
      aria-hidden
      className={cn(
        'pointer-events-none absolute h-36 w-36 text-clay-500 opacity-[0.06]',
        className,
      )}
      viewBox="0 0 120 120"
      fill="currentColor"
    >
      <polygon points="60,8 112,112 8,112" />
    </svg>
  )
}
