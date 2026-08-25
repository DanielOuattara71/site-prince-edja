import { Link } from 'react-router'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { MagneticButton } from '@/components/motion/MagneticButton'

type ButtonVariant = 'primary' | 'dark' | 'ghost-light' | 'ghost-dark'

const VARIANT_STYLES: Record<ButtonVariant, { button: string; fill: string; hoverText: string }> =
  {
    primary: {
      button: 'bg-clay-500 text-cream-100',
      fill: 'bg-clay-600',
      hoverText: '',
    },
    dark: {
      button: 'bg-ink-900 text-cream-100',
      fill: 'bg-ink-700',
      hoverText: '',
    },
    'ghost-light': {
      button: 'border border-cream-100/50 text-cream-100',
      fill: 'bg-cream-100',
      hoverText: 'group-hover:text-ink-900',
    },
    'ghost-dark': {
      button: 'border border-ink-900/40 text-ink-900',
      fill: 'bg-ink-900',
      hoverText: 'group-hover:text-cream-100',
    },
  }

interface ButtonProps {
  children: ReactNode
  variant?: ButtonVariant
  to?: string
  href?: string
  external?: boolean
  magnetic?: boolean
  type?: 'button' | 'submit'
  onClick?: () => void
  className?: string
}

export function Button({
  children,
  variant = 'primary',
  to,
  href,
  external,
  magnetic = true,
  type = 'button',
  onClick,
  className,
}: ButtonProps) {
  const styles = VARIANT_STYLES[variant]

  const inner = (
    <>
      <span
        aria-hidden
        className={cn(
          'absolute inset-0 origin-bottom scale-y-0 rounded-full transition-transform duration-(--d-base) ease-(--ease-quart) group-hover:scale-y-100 group-focus-visible:scale-y-100',
          styles.fill,
        )}
      />
      <span
        className={cn(
          'relative z-10 flex items-center justify-center gap-2 transition-colors duration-(--d-base)',
          styles.hoverText,
        )}
      >
        {children}
      </span>
    </>
  )

  const classes = cn(
    'group relative inline-flex cursor-pointer items-center justify-center overflow-hidden rounded-full px-7 py-3.5 text-button font-semibold',
    styles.button,
    className,
  )

  let element: ReactNode
  if (to) {
    element = (
      <Link to={to} className={classes}>
        {inner}
      </Link>
    )
  } else if (href) {
    element = (
      <a
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noreferrer' : undefined}
        className={classes}
      >
        {inner}
      </a>
    )
  } else {
    element = (
      <button type={type} onClick={onClick} className={classes}>
        {inner}
      </button>
    )
  }

  return magnetic ? <MagneticButton>{element}</MagneticButton> : element
}
