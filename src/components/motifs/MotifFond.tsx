import { useId } from 'react'

interface MotifFondProps {
  /** Opacité du motif. Texture de fond : généralement entre 4 % et 10 %. */
  opacite?: number
  /** Taille (en unités) de la tuile de répétition. */
  taille?: number
}

/**
 * Motif de fond : triangles répétés, en pointant vers le bas.
 *
 * Texture légère pour les surfaces qui en ont besoin. Le motif est décoratif :
 * il ne doit jamais chevaucher un titre ou un texte difficile à lire.
 */
export function MotifFond({ opacite = 0.05, taille = 120 }: MotifFondProps) {
  const id = useId().replace(/:/g, '')

  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox={`0 0 ${taille} ${taille}`}
      preserveAspectRatio="xMidYMid slice"
      style={{ opacity: opacite }}
    >
      <pattern id={id} width={taille} height={taille} patternUnits="userSpaceOnUse">
        <polygon
          points={`${taille / 2},0 ${taille},${taille} 0,${taille}`}
          style={{ fill: 'var(--color-ink-900)' }}
        />
      </pattern>
      <rect width={taille} height={taille} fill={`url(#${id})`} />
    </svg>
  )
}
