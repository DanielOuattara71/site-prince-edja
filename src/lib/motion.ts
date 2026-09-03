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
