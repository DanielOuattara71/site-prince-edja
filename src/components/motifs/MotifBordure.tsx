import { cn } from '@/lib/cn'

export type PositionMotif = 'tl' | 'tr' | 'bl' | 'br'

interface MotifBordureProps {
  position?: PositionMotif
  /** Opacité du trait. Zigzag discret : généralement autour de 4–8 %. */
  opacite?: number
}

const CLASSES_POSITION: Record<PositionMotif, string> = {
  tl: 'left-0 top-0',
  tr: 'right-0 top-0',
  bl: 'bottom-0 left-0',
  br: 'bottom-0 right-0',
}

/**
 * Motif de bordure : composition linéaire (zigzag), pour séparateurs ou encadrements.
 * Le trait reste fin et discret.
 */
export function MotifBordure({ position = 'br', opacite = 0.05 }: MotifBordureProps) {
  return (
    <svg
      aria-hidden
      className={cn('pointer-events-none absolute h-32 w-32', CLASSES_POSITION[position])}
      viewBox="0 0 120 40"
      fill="none"
    >
      <path
        d="M0 20 L15 5 L30 20 L45 5 L60 20 L75 5 L90 20 L105 5 L120 20 L120 40 L0 40 Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ opacity: opacite }}
      />
    </svg>
  )
}
