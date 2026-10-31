import type { CSSProperties } from 'react'
import { cn } from '@/lib/cn'
import { contenuMotif, type MotifAfricain } from './motifs'

export type TonRuban = 'light' | 'dark'

interface Placement {
  motif: MotifAfricain
  /** Centre horizontal du motif, en unités de la tuile. */
  x: number
  /** Côté du carré occupé par le motif, en unités. */
  taille: number
  /** Rotation autour du centre, en degrés. */
  rotation?: number
}

/**
 * Une tuile de ruban = une séquence de cinq motifs, puis la même séquence décalée
 * d'une demi-tuile avec la spirale tournée dans l'autre sens. L'alternance est
 * volontairement discrète : elle crée un rythme de tissage, pas deux rubans
 * différents.
 */
const SEQUENCE: Placement[] = [
  { motif: 'linear-01', x: 34, taille: 42 },
  { motif: 'circulaire-03', x: 90, taille: 32 },
  { motif: 'symetrique-04', x: 150, taille: 42 },
  { motif: 'spiral-02', x: 210, taille: 36, rotation: 45 },
  { motif: 'lineaire-05', x: 270, taille: 32 },
]

const SEQUENCE_DESKTOP: Placement[] = [
  ...SEQUENCE,
  ...SEQUENCE.map((placement) => ({
    ...placement,
    x: placement.x + 300,
    rotation: placement.rotation === 45 ? -45 : undefined,
  })),
]

/**
 * Version mobile : quatre motifs, plus grands relativement à la hauteur. Le bloc
 * tissé (`lineaire-05`), trop fin à cette échelle, est réservé au desktop.
 */
const SEQUENCE_MOBILE: Placement[] = [
  { motif: 'linear-01', x: 40, taille: 32 },
  { motif: 'circulaire-03', x: 120, taille: 26 },
  { motif: 'symetrique-04', x: 200, taille: 32 },
  { motif: 'spiral-02', x: 280, taille: 28, rotation: 45 },
]

const HAUTEUR_DESKTOP = 64
const LARGEUR_DESKTOP = 600
const HAUTEUR_MOBILE = 44
const LARGEUR_MOBILE = 320

function groupe(placement: Placement, couleur: string, hauteur: number): string {
  const echelle = placement.taille / 200
  const transformation = placement.rotation
    ? `translate(${placement.x} ${hauteur / 2}) rotate(${placement.rotation}) scale(${echelle}) translate(-100 -100)`
    : `translate(${placement.x - placement.taille / 2} ${(hauteur - placement.taille) / 2}) scale(${echelle})`

  return `<g transform="${transformation}" style="color:${couleur}">${contenuMotif(placement.motif)}</g>`
}

function construireTuile(
  principal: string,
  accent: string,
  placements: Placement[],
  largeur: number,
  hauteur: number,
): string {
  const motifs = placements
    .map((placement) =>
      groupe(
        placement,
        placement.motif === 'symetrique-04' ? accent : principal,
        hauteur,
      ),
    )
    .join('')

  // Deux filets ochre ferment le ruban sans alourdir la bande : ils courent au-dessus
  // et au-dessous des motifs, jamais à travers.
  const filets = `<path d="M0 ${hauteur * 0.05} H${largeur} M0 ${hauteur * 0.95} H${largeur}" fill="none" stroke="${accent}" stroke-width="1.4" opacity="0.6"/>`

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${largeur}" height="${hauteur}" viewBox="0 0 ${largeur} ${hauteur}">${filets}${motifs}</svg>`
}

function uri(svg: string): string {
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}

const RUBANS: Record<TonRuban, { desktop: string; mobile: string }> = {
  light: {
    desktop: uri(
      construireTuile('#4B3018', '#A95625', SEQUENCE_DESKTOP, LARGEUR_DESKTOP, HAUTEUR_DESKTOP),
    ),
    mobile: uri(
      construireTuile('#4B3018', '#A95625', SEQUENCE_MOBILE, LARGEUR_MOBILE, HAUTEUR_MOBILE),
    ),
  },
  dark: {
    desktop: uri(
      construireTuile('#F7F4EC', '#A95625', SEQUENCE_DESKTOP, LARGEUR_DESKTOP, HAUTEUR_DESKTOP),
    ),
    mobile: uri(
      construireTuile('#F7F4EC', '#A95625', SEQUENCE_MOBILE, LARGEUR_MOBILE, HAUTEUR_MOBILE),
    ),
  },
}

interface AfricanPatternRibbonProps {
  /** `light` sur ivoire, `dark` sur nuit ou forêt. */
  tone?: TonRuban
  /** Marges ou largeur particulières ; la hauteur reste celle du ruban. */
  className?: string
}

/**
 * Ruban décoratif composé des cinq motifs fournis.
 *
 * La tuile est une image SVG encodée en data URI et répétée horizontalement par le
 * CSS : pas de duplication de DOM, pas de débordement, pas de dépendance. La hauteur
 * pilote l'échelle de toute la composition (`background-size: auto 100%`), donc les
 * motifs restent proportionnés et lisibles d'un écran à l'autre.
 *
 * Purement décoratif : `aria-hidden`, aucun élément focusable, `pointer-events-none`.
 */
export function AfricanPatternRibbon({ tone = 'light', className }: AfricanPatternRibbonProps) {
  return (
    <div
      aria-hidden
      className={cn(
        'ruban-motifs pointer-events-none h-11 w-full select-none sm:h-14',
        className,
      )}
      style={
        {
          '--ruban-desktop': RUBANS[tone].desktop,
          '--ruban-mobile': RUBANS[tone].mobile,
        } as CSSProperties
      }
    />
  )
}
