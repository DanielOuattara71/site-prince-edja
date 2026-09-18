import { Link } from 'react-router'
import { motion, useReducedMotion } from 'motion/react'
import type { Variants } from 'motion/react'
import { formatPrice } from '@/lib/format'
import { useCart } from '@/lib/cart'
import type { Product } from '@/types'
import { cn } from '@/lib/cn'

interface ProductCardProps {
  product: Product
  /** Preset d'animation de l'univers (hidden/visible) */
  variants?: Variants
  className?: string
}

/**
 * Carte produit marketplace — anatomie commune :
 * image (+ badge statut) → nom + prix → meta (culture · matière · édition).
 * La peau vient des tokens `--u-*` posés sur le conteneur d'univers.
 */
export function ProductCard({ product, variants, className }: ProductCardProps) {
  const reducedMotion = useReducedMotion()
  const { add } = useCart()

  return (
    <motion.article
      variants={variants}
      initial={reducedMotion || !variants ? false : 'hidden'}
      whileInView={reducedMotion || !variants ? undefined : 'visible'}
      viewport={{ once: true, amount: 0.2 }}
      className={cn('group relative h-full', className)}
    >
      <Link
        to={`/boutique/${product.univers}/${product.slug}`}
        className="block focus-visible:outline-none"
        aria-label={`${product.nom} — ${formatPrice(product.prix)}`}
      >
        <div className="relative overflow-hidden rounded-(--u-radius-card) border border-(--u-border) bg-(--u-surface)">
          <img
            src={product.image}
            alt={product.nom}
            loading="lazy"
            decoding="async"
            className="aspect-3/4 w-full object-cover transition-transform duration-(--d-base) ease-expo group-hover:scale-[1.04]"
          />
          <span
            className={cn(
              'label-caps absolute left-3 top-3 z-10 rounded-full px-3 py-1.5',
              'bg-(--u-bg) text-(--u-text) border border-(--u-border)',
            )}
          >
            {product.statut}
          </span>
        </div>
      </Link>

      <div className="flex items-baseline justify-between gap-3 pt-4">
        <h3 className="font-display uppercase text-heading-sm text-(--u-text)">
          <Link to={`/boutique/${product.univers}/${product.slug}`} className="transition-colors hover:text-(--u-accent)">
            {product.nom}
          </Link>
        </h3>
        <p className="text-button font-semibold tnum text-(--u-accent)">
          {formatPrice(product.prix)}
        </p>
      </div>
      <p className="label-caps mt-1.5 text-(--u-text-muted)">
        {product.culture} · {product.matiere}
      </p>

      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="label-caps tnum text-(--u-text-muted)">{product.edition}</span>
        <button
          type="button"
          onClick={() => add(product)}
          aria-label={`Ajouter ${product.nom} au panier`}
          className="label-caps cursor-pointer rounded-full border border-(--u-border) px-4 py-2 text-(--u-text) transition-colors duration-(--d-fast) hover:border-(--u-accent) hover:bg-(--u-accent) hover:text-(--u-on-accent)"
        >
          Ajouter
        </button>
      </div>
    </motion.article>
  )
}