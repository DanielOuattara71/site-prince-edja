import { cn } from '@/lib/cn'

export type PositionMotif = 'tl' | 'tr' | 'bl' | 'br'

interface MotifAngleProps {
  position?: PositionMotif
  /** Opacité du motif. Généralement autour de 4–8 %. */
  opacite?: number
  className?: string
}

const CLASSES_POSITION: Record<PositionMotif, string> = {
  tl: 'left-0 top-0',
  tr: 'right-0 top-0',
  bl: 'bottom-0 left-0',
  br: 'bottom-0 right-0',
}

/**
 * Motif d’angle : composition partielle placée dans un coin d’une section.
 * Triangle sombre, opacité faible — un repère géométrique discret. La couleur
 * (et le rendu) se passent par `className`, pour les surfaces sombres (crème, or).
 */
export function MotifAngle({ position = 'tl', opacite = 0.05, className }: MotifAngleProps) {
  return (
    <svg
      aria-hidden
      className={cn(
        'pointer-events-none absolute h-28 w-28 text-ink-900',
        CLASSES_POSITION[position],
        className,
      )}
      viewBox="0 0 120 120"
      fill="currentColor"
      style={{ opacity: opacite }}
    >
      <polygon points="60,10 110,110 10,110" />
    </svg>
  )
}
