import { useEffect, useRef, useState } from 'react'
import { animate, useInView, useReducedMotion } from 'motion/react'
import { EASE_EXPO } from '@/lib/motion'

interface StatItemProps {
  /** `null` = chiffre non fourni. Le composant affiche alors la mention d'attente. */
  value: number | null
  suffix?: string
  label: string
  /** Date de validation du chiffre. Absente = donnée à confirmer. */
  date?: string
  /** Mention affichée à la place d'une valeur ou d'une date manquante. */
  aFournir?: string
}

export function StatItem({
  value,
  suffix = '',
  label,
  date,
  aFournir = 'À fournir',
}: StatItemProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const reducedMotion = useReducedMotion()
  const [display, setDisplay] = useState(() => (reducedMotion || value === null ? 0 : value))

  useEffect(() => {
    if (!inView || reducedMotion || value === null) return
    const controls = animate(0, value, {
      duration: 1.4,
      ease: EASE_EXPO,
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    })
    return () => controls.stop()
  }, [inView, value, reducedMotion])

  const isNatureStat = label.toLowerCase().includes('pays')

  return (
    <div ref={ref}>
      {value === null ? (
        <p className="font-display uppercase text-heading-sm text-ink-500">{aFournir}</p>
      ) : (
        <p className="font-display uppercase text-heading-md text-ink-900 tnum">
          <span className="sr-only">
            {value}
            {suffix}
          </span>
          <span aria-hidden>
            {display}
            <span className={isNatureStat ? 'text-leaf-600' : 'text-clay-500'}>{suffix}</span>
          </span>
        </p>
      )}
      <p className="label-caps mt-2 text-ink-500">{label}</p>
      <p className="mt-1 text-caption text-ink-500">{date ?? aFournir}</p>
    </div>
  )
}
