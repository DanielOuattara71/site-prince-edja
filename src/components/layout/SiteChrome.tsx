import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { useHasFinePointer } from '@/hooks/useMediaQuery'

/**
 * Chrome global du site : une seule boucle d'animation pour toute la page.
 *
 * Il porte trois choses :
 * 1. le grain fixe (un seul calque pour tout le site, plus un calque par section) ;
 * 2. la barre de progression de lecture, collée au scroll (aucune transition, jamais en retard) ;
 * 3. le halo de comptoir qui suit le pointeur, uniquement sur pointeur fin.
 *
 * Les animations liées au pointeur sont volontairement absentes en `prefers-reduced-motion`.
 */
export function SiteChrome() {
  const progressRef = useRef<HTMLDivElement>(null)
  const haloRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()
  const finePointer = useHasFinePointer()

  useEffect(() => {
    const bar = progressRef.current
    const halo = haloRef.current
    if (!bar && !halo) return

    let raf = 0
    let targetX = window.innerWidth / 2
    let targetY = window.innerHeight / 2
    let currentX = targetX
    let currentY = targetY

    const onPointerMove = (event: PointerEvent) => {
      targetX = event.clientX
      targetY = event.clientY
    }

    if (halo) window.addEventListener('pointermove', onPointerMove, { passive: true })

    const frame = () => {
      raf = requestAnimationFrame(frame)

      if (bar) {
        const doc = document.documentElement
        const scrollable = doc.scrollHeight - window.innerHeight
        const progress = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0
        bar.style.transform = `scaleX(${progress.toFixed(4)})`
      }

      if (halo) {
        // Lissage exponentiel : le halo retarde légèrement le geste, sans jamais le doubler.
        currentX += (targetX - currentX) * 0.12
        currentY += (targetY - currentY) * 0.12
        halo.style.transform = `translate3d(${(currentX - 180).toFixed(1)}px, ${(currentY - 180).toFixed(1)}px, 0)`
      }
    }

    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      if (halo) window.removeEventListener('pointermove', onPointerMove)
    }
  }, [finePointer, reducedMotion])

  return (
    <>
      <div aria-hidden className="grain-fixed" />

      <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[65] h-0.5">
        <div
          ref={progressRef}
          className="h-full w-full origin-left bg-gold-400 will-change-transform"
          style={{ transform: 'scaleX(0)' }}
        />
      </div>

      {finePointer && !reducedMotion && (
        <div
          ref={haloRef}
          aria-hidden
          // `screen` et non `multiply` : le multiply ne peut qu'assombrir, donc le halo
          // disparaissait sur les sols nuit (À porter, Tissé). Le screen éclaircit dans les
          // deux cas — il coûte un peu d'effet sur les fonds clairs, et en gagne sur les
          // fonds sombres, qui sont la moitié de ce site.
          className="pointer-events-none fixed top-0 left-0 z-[59] size-[360px] rounded-full mix-blend-screen will-change-transform"
          style={{
            background:
              'radial-gradient(circle, color-mix(in srgb, var(--color-gold-400) 20%, transparent) 0, color-mix(in srgb, var(--color-gold-300) 9%, transparent) 28%, transparent 70%)',
          }}
        />
      )}
    </>
  )
}
