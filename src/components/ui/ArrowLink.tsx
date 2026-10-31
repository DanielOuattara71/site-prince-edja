import { Link } from 'react-router'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface ArrowLinkProps {
  to?: string
  href?: string
  external?: boolean
  children: ReactNode
  tone?: 'light' | 'dark'
  className?: string
}

export function ArrowLink({
  to,
  href,
  external,
  children,
  tone = 'dark',
  className,
}: ArrowLinkProps) {
  // `min-h-11` : ce lien sert de seul CTA à plusieurs sections. Sans lui, la cible
  // ne dépassait pas 20 px de haut.
  const classes = cn(
    'group inline-flex min-h-11 items-center text-button font-semibold',
    tone === 'light' ? 'text-cream-100' : 'text-ink-900',
    className,
  )
  const label = (
    <span className="relative">
      {children}
      <span
        aria-hidden
        className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-current transition-transform duration-(--d-base) ease-expo group-hover:scale-x-100"
      />
    </span>
  )

  if (to) {
    return (
      <Link to={to} className={classes}>
        {label}
      </Link>
    )
  }

  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
      className={classes}
    >
      {label}
    </a>
  )
}
