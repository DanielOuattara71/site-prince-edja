import { motion, useReducedMotion } from 'motion/react'
import { DUR, EASE_EXPO } from '@/lib/motion'

interface TextRevealLinesProps {
  lines: string[]
  as?: 'h1' | 'h2' | 'p'
  delay?: number
  className?: string
}

export function TextRevealLines({ lines, as = 'p', delay = 0, className }: TextRevealLinesProps) {
  const reducedMotion = useReducedMotion()
  const Tag = as

  if (reducedMotion) {
    return (
      <Tag aria-label={lines.join(' ')} className={className}>
        {lines.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </Tag>
    )
  }

  return (
    <Tag aria-label={lines.join(' ')} className={className}>
      {lines.map((line, index) => (
        <span key={line} aria-hidden className="block overflow-hidden pb-[0.14em]">
          <motion.span
            initial={{ y: '112%' }}
            whileInView={{ y: '0%' }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{
              duration: 0.85,
              ease: EASE_EXPO,
              delay: delay + index * 0.09,
            }}
            className="block will-change-transform"
          >
            {line || '\u00A0'}
          </motion.span>
        </span>
      ))}
    </Tag>
  )
}

export const TEXT_REVEAL_DURATION = DUR.reveal
