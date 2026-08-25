import { useEffect, useRef, useState } from 'react'
import { animate, useInView, useReducedMotion } from 'motion/react'
import { EASE_EXPO } from '@/lib/motion'

interface StatItemProps {
  value: number
  suffix?: string
  label: string
}

export function StatItem({ value, suffix = '', label }: StatItemProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const reducedMotion = useReducedMotion()
  const [display, setDisplay] = useState(() => (reducedMotion ? value : 0))

  useEffect(() => {
    if (!inView || reducedMotion) return
    const controls = animate(0, value, {
      duration: 1.4,
      ease: EASE_EXPO,
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    })
    return () => controls.stop()
  }, [inView, value, reducedMotion])

  return (
    <div ref={ref}>
      <p className="font-display uppercase text-heading-md text-ink-900 tnum">
        <span className="sr-only">
          {value}
          {suffix}
        </span>
        <span aria-hidden>
          {display}
          <span className="text-clay-500">{suffix}</span>
        </span>
      </p>
      <p className="label-caps mt-2 text-ink-500">{label}</p>
    </div>
  )
}
