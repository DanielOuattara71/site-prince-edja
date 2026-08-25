import { useEffect } from 'react'
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity,
} from 'motion/react'
import { useHasFinePointer, useIsDesktop } from '@/hooks/useMediaQuery'
import { DUR, EASE_EXPO } from '@/lib/motion'

const PREVIEW_WIDTH = 240
const PREVIEW_HEIGHT = 300

interface FloatingPreviewProps {
  src: string | null
}

export function FloatingPreview({ src }: FloatingPreviewProps) {
  const finePointer = useHasFinePointer()
  const isDesktop = useIsDesktop()
  const reducedMotion = useReducedMotion()
  const x = useSpring(0, { stiffness: 150, damping: 20, mass: 0.3 })
  const y = useSpring(0, { stiffness: 150, damping: 20, mass: 0.3 })
  const xVelocity = useVelocity(x)
  const rawTilt = useTransform(xVelocity, [-1200, 1200], [-7, 7])
  const tilt = useSpring(rawTilt, { stiffness: 220, damping: 26 })
  const enabled = finePointer && isDesktop && !reducedMotion

  useEffect(() => {
    if (!enabled || !src) return

    const onMove = (event: MouseEvent) => {
      x.set(event.clientX - PREVIEW_WIDTH / 2)
      y.set(event.clientY - PREVIEW_HEIGHT / 2)
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [enabled, src, x, y])

  if (!enabled) return null

  return (
    <AnimatePresence>
      {src && (
        <motion.div
          key="preview"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.6 }}
          transition={{ duration: DUR.base, ease: EASE_EXPO }}
          style={{ x, y, rotate: tilt, width: PREVIEW_WIDTH, height: PREVIEW_HEIGHT }}
          className="pointer-events-none fixed top-0 left-0 z-30 overflow-hidden rounded-md shadow-lg"
        >
          <img src={src} alt="" aria-hidden className="h-full w-full object-cover" />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
