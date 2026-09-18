import { Link } from 'react-router'
import { ArrowUpRight } from 'lucide-react'
import { UNIVERSES, countByUnivers } from '@/data/market'
import { Stagger } from '@/components/motion/Stagger'
import { cn } from '@/lib/cn'

/**
 * Les 5 portes-arches du Carrefour — chaque porte porte
 * les tokens de son univers (classe `u-*`) pour prévisualiser l'ambiance.
 */
export function CategoryGates({ className }: { className?: string }) {
  return (
    <Stagger className={cn('grid gap-5 md:grid-cols-2 lg:grid-cols-5', className)}>
      {UNIVERSES.map((univers) => {
        const count = countByUnivers(univers.id)
        return (
          <Link
            key={univers.id}
            to={`/boutique/${univers.slug}`}
            className={cn(
              univers.tokenClass,
              'group relative flex h-[26rem] flex-col justify-end overflow-hidden rounded-t-[7rem] rounded-b-2xl border border-(--u-border) bg-(--u-bg) text-(--u-text) transition-transform duration-(--d-base) ease-expo hover:-translate-y-2 focus-visible:outline-none lg:h-[30rem]',
            )}
          >
            <img
              src={univers.image}
              alt=""
              aria-hidden
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover opacity-60 transition-transform duration-(--d-reveal) ease-expo group-hover:scale-[1.05]"
            />
            <div className="absolute inset-0 bg-(--u-bg)/40" aria-hidden />
            <div className="relative z-10 space-y-2 p-6">
              <p className="label-caps tnum text-(--u-highlight)">
                {univers.num} · {count > 0 ? `${count} pièces` : 'Bientôt'}
              </p>
              <p className="font-display uppercase text-heading-md">{univers.nom}</p>
              <p className="text-body text-(--u-text-muted)">{univers.pitch}</p>
              <span className="label-caps inline-flex items-center gap-1.5 pt-2 text-(--u-accent)">
                Entrer
                <ArrowUpRight
                  aria-hidden
                  className="size-4 transition-transform duration-(--d-fast) group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </span>
            </div>
          </Link>
        )
      })}
    </Stagger>
  )
}