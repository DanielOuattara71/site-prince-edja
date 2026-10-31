import { cn } from '@/lib/cn'
import { MOTIFS, type MotifAfricain } from './motifs'

export type { MotifAfricain } from './motifs'

interface AfricanPatternProps {
  motif: MotifAfricain
  /** Position et dimensions, en classes utilitaires (ex. `-right-8 -top-8 h-48 w-48`). */
  className?: string
  /** Couleur du trait : toute valeur CSS valide. Défaut, le brun foncé fourni. */
  couleur?: string
  /**
   * Opacité globale. 0,04–0,10 pour une texture de fond ; jusqu'à ~0,15 pour un
   * accent ponctuel derrière la mascotte.
   */
  opacite?: number
  /** Par défaut le motif est positionné en absolu ; `inline` le rend dans le flux. */
  inline?: boolean
}

/**
 * Motif africain décoratif, rendu à partir des SVG fournis (aucun redessin).
 *
 * Le conteneur est `absolute` par défaut, sans interaction (`pointer-events-none`)
 * et masqué aux technologies d'assistance : ces dessins accompagnent la composition,
 * ils ne portent pas d'information. `preserveAspectRatio` reste celui des fichiers
 * (`xMidYMid meet`), donc aucun motif n'est déformé.
 */
export function AfricanPattern({
  motif,
  className,
  couleur = '#4B3018',
  opacite = 0.06,
  inline = false,
}: AfricanPatternProps) {
  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none [&>svg]:h-full [&>svg]:w-full',
        inline ? 'inline-block' : 'absolute',
        className,
      )}
      style={{ color: couleur, opacity: opacite }}
      dangerouslySetInnerHTML={{ __html: MOTIFS[motif] }}
    />
  )
}
