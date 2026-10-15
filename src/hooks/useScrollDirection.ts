import { useEffect, useState } from 'react'
import { useReducedMotion } from 'motion/react'

/** Seuil de décollement de la barre, en pixels. */
const SEUIL = 32
/** Marge anti-vibration : sans elle, un scroll de 3 px ferait clignoter la barre. */
const TOLERANCE = 8

interface Options {
  /** La barre reste visible malgré la descente (menu ouvert, focus, sous-menu). */
  force?: boolean
  /** Jeton de remise à zéro : la route courante. Un changement de page la montre. */
  jeton?: string
}

interface EtatDefilement {
  /** Le seuil est dépassé : la barre passe en mode flottante. */
  degagee: boolean
  /** La barre doit être visible (remontée, ou exception). */
  visible: boolean
}

/**
 * Sens et seuil du défilement, sans re-rendre à chaque événement.
 *
 * Un seul écouteur passif, throttlé par `requestAnimationFrame`. La position COURANTE
 * vit dans des refs : React n'est prévenu que lorsque l'état change vraiment, pas à
 * chaque pixel parcouru.
 */
export function useScrollDirection({ force = false, jeton }: Options = {}): EtatDefilement {
  const [degagee, setDegagee] = useState(false)
  const [descend, setDescend] = useState(false)
  const reduit = useReducedMotion()

  useEffect(() => {
    let frame = 0
    let dernier = window.scrollY

    const evaluer = () => {
      frame = 0
      const y = window.scrollY
      const passe = y > SEUIL

      setDegagee((actuel) => (actuel === passe ? actuel : passe))

      if (!passe) {
        setDescend(false)
        dernier = y
        return
      }

      const delta = y - dernier
      if (Math.abs(delta) > TOLERANCE) {
        setDescend(delta > 0)
        dernier = y
      }
    }

    const onScroll = () => {
      if (frame === 0) frame = window.requestAnimationFrame(evaluer)
    }

    evaluer()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame !== 0) window.cancelAnimationFrame(frame)
    }
  }, [])

  // Changement de route : la barre revient, le visiteur vient d'arriver sur une page.
  useEffect(() => {
    setDescend(false)
  }, [jeton])

  // Mouvement réduit : la barre ne se cache jamais, seuls les fondus restent.
  const visible = !descend || force || Boolean(reduit)

  return { degagee, visible }
}
