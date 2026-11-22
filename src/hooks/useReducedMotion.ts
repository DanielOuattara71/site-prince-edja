import { useEffect, useState } from 'react'
import { useReducedMotion as useMotionReducedMotion } from 'motion/react'

/**
 * Préférence « réduire les animations », sûre pour l'hydratation.
 *
 * `motion/react` lit `matchMedia` : au prérendu la valeur est `null`, au premier rendu client
 * elle est déjà `true`/`false`. Utilisée directement dans le rendu, elle fait diverger le HTML
 * prérendu et l'hydratation (React #418) chez les visiteurs qui réduisent les animations.
 * Ce hook renvoie `false` au premier rendu — identique au serveur — puis la vraie valeur
 * après montage. Les animations démarrent donc une frame plus tard, sans erreur ni saut.
 */
export function useReducedMotion(): boolean {
  const preference = useMotionReducedMotion()
  const [apresMontage, setApresMontage] = useState(false)
  useEffect(() => {
    setApresMontage(preference === true)
  }, [preference])
  return apresMontage
}
