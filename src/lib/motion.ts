import type { Variants } from 'motion/react'

export const EASE_EXPO = [0.16, 1, 0.3, 1] as const
export const EASE_QUART = [0.76, 0, 0.24, 1] as const

export const DUR = {
  fast: 0.25,
  base: 0.45,
  reveal: 0.75,
} as const

export const STAGGER_STEP = 0.08

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DUR.reveal, ease: EASE_EXPO },
  },
}

export const itemUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DUR.reveal, ease: EASE_EXPO },
  },
}

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: STAGGER_STEP },
  },
}

const INTRO_KEY = 'pe:intro-jouee'

export const REPLAY_INTRO_EVENT = 'pe:replay-intro'

export function introAlreadyPlayed(): boolean {
  try {
    return Boolean(sessionStorage.getItem(INTRO_KEY))
  } catch {
    return false
  }
}

export function introDelay(): number {
  if (typeof window === 'undefined') return 0
  return introAlreadyPlayed() ? 0 : 2.35
}

export function markIntroDone(): void {
  try {
    sessionStorage.setItem(INTRO_KEY, '1')
  } catch {
    /* stockage indisponible : l'intro se rejouera simplement */
  }
}

export function replayIntro(): void {
  try {
    sessionStorage.removeItem(INTRO_KEY)
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent(REPLAY_INTRO_EVENT))
}

/* ============================================================
   MARKETPLACE — Presets d'animation par univers
   Tous en transform/opacity/filter (GPU), reduced-motion géré
   par les composants (fallback fade simple).
   ============================================================ */

/** Durée du voile d'entrée d'univers (gate-wipe) en secondes */
export const GATE_WIPE_DURATION = 0.6

/** TRIBE — la pièce s'éclaire à la lampe (brightness + rise) */
export const spotlightReveal: Variants = {
  hidden: { opacity: 0.12, y: 16, filter: 'brightness(0.45)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'brightness(1)',
    transition: { duration: DUR.reveal, ease: EASE_EXPO },
  },
}

/** PORTÉ — le tissu se déploie (rotation amortie + rise) */
export const rippleFold: Variants = {
  hidden: { opacity: 0, rotate: 1.5, y: 24 },
  visible: {
    opacity: 1,
    rotate: 0,
    y: 0,
    transition: { duration: DUR.base, ease: EASE_EXPO },
  },
}

/** DON — le ruban se noue avant le contenu (filet scaleX) */
export const ribbonDraw: Variants = {
  hidden: { scaleX: 0 },
  visible: {
    scaleX: 1,
    transition: { duration: DUR.base, ease: EASE_QUART },
  },
}

/** MÉMOIRE — feuilletage d'album (rotateY depuis le bord gauche) */
export const pageTurn: Variants = {
  hidden: { opacity: 0, rotateY: -6, transformPerspective: 900 },
  visible: {
    opacity: 1,
    rotateY: 0,
    transition: { duration: DUR.reveal, ease: EASE_QUART },
  },
}

/** AWALÉ — les graines se posent (glissement horizontal) */
export const seedsPlace: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: DUR.base, ease: EASE_EXPO },
  },
}

/** Voile d'entrée d'univers (gate-wipe) — scaleY 1 → 0 */
export const gateWipe = {
  initial: { scaleY: 1 },
  animate: { scaleY: 0 },
  transition: { duration: 0.6, ease: EASE_QUART },
} as const
