import { Link } from 'react-router'
import { ArrowUpRight } from 'lucide-react'
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
  const classes = cn(
    'group inline-flex items-center gap-2 text-button font-semibold',
    tone === 'light' ? 'text-cream-100' : 'text-ink-900',
    className,
  )
  const icon = (
    <ArrowUpRight
      aria-hidden
      className="size-4 shrink-0 transition-transform duration-(--d-fast) ease-expo group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
    />
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
        {icon}
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
      {icon}
    </a>
  )
}
