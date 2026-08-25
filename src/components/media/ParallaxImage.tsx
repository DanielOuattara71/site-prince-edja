import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { cn } from '@/lib/cn'

interface ParallaxImageProps {
  src: string
  alt: string
  priority?: boolean
  range?: number
  className?: string
  imgClassName?: string
}

export function ParallaxImage({
  src,
  alt,
  priority = false,
  range = 6,
  className,
  imgClassName,
}: ParallaxImageProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [`-${range}%`, `${range}%`])

  return (
    <div ref={ref} className={cn('relative overflow-hidden', className)}>
      <motion.img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : 'auto'}
        style={reducedMotion ? undefined : { y }}
        className={cn(
          'h-full w-full scale-[1.15] object-cover',
          imgClassName,
        )}
      />
    </div>
  )
}
