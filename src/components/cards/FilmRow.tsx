import type { MouseEventHandler } from 'react'
import { Link } from 'react-router'
import { ArrowUpRight } from 'lucide-react'
import { LazyImage } from '@/components/media/LazyImage'

interface FilmRowProps {
  numero: string
  titre: string
  lieu: string
  pitch?: string
  image: string
  to: string
  onEnter: MouseEventHandler<HTMLAnchorElement>
  onLeave: MouseEventHandler<HTMLAnchorElement>
}

export function FilmRow({
  numero,
  titre,
  lieu,
  pitch,
  image,
  to,
  onEnter,
  onLeave,
}: FilmRowProps) {
  return (
    <Link
      to={to}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="group grid grid-cols-[auto_1fr_auto] items-baseline gap-x-4 gap-y-2 border-t border-cream-100/15 py-7 transition-colors duration-(--d-base) hover:border-clay-500/70 sm:py-9"
    >
      <span aria-hidden className="font-display text-heading-sm text-gold-400">
        {numero}
      </span>

      <div className="min-w-0">
        <h3 className="truncate font-display uppercase text-heading-md transition-colors duration-(--d-base) group-hover:text-clay-500 sm:text-display-lg sm:group-hover:text-clay-500">
          {titre}
        </h3>
        <LazyImage
          src={image}
          alt=""
          ratio="16/10"
          className="mt-4 rounded-sm lg:hidden"
        />
        {pitch && (
          <p className="mt-2 max-w-md text-sm text-cream-100/60">{pitch}</p>
        )}
      </div>

      <div className="flex flex-col items-end gap-2 self-center">
        <span className="label-caps text-cream-100/50">{lieu}</span>
        <ArrowUpRight
          aria-hidden
          className="size-5 -translate-x-1 translate-y-1 text-gold-400 opacity-0 transition-all duration-(--d-base) ease-expo group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
        />
      </div>
    </Link>
  )
}
