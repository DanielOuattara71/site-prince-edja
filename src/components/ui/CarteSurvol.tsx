import { Link } from 'react-router'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface Props {
  /** Visuel de la carte. */
  image: string
  /** Texte alternatif du visuel. */
  alt: string
  /** Titre, révélé au survol. */
  titre: string
  /** Ligne secondaire (catégorie, année, statut). */
  sousTitre?: string
  /** Contenu libre sous le titre : prix, durée, CTA. */
  children?: ReactNode
  /** Destination de la carte entière. */
  to: string
  ratio?: string
  className?: string
}

/**
 * Carte de carrousel à révélation au survol.
 *
 * L'image occupe toute la carte ; les informations n'apparaissent qu'au survol, sous un
 * voile encre. Trois règles la gouvernent :
 *
 * 1. **Le clavier voit la même chose que la souris** : `group-focus-within` doublonne
 *    `group-hover`, et la carte entière est un lien, donc le focus est dedans.
 * 2. **Le tactile n'a pas de survol** : `pointer-coarse:` affiche les informations en
 *    permanence sur les écails sans pointeur fin, sinon elles seraient définitivement
 *    invisibles sur mobile.
 * 3. **Mouvement réduit** : plus de glissement, seulement un voile instantané. Aucune
 *    information n'est perdue.
 *
 * Tokens existants uniquement : encre pour le voile, crème pour le texte, terracotta en
 * filet d'accent.
 */
export function CarteSurvol({
  image,
  alt,
  titre,
  sousTitre,
  children,
  to,
  ratio = '4/5',
  className,
}: Props) {
  return (
    <article className={cn('group relative block', className)}>
      <Link
        to={to}
        className="block overflow-hidden rounded-[3px] bg-sand-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-clay-600"
      >
        <div className="relative" style={{ aspectRatio: ratio }}>
          <img
            src={image}
            alt={alt}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-[700ms] ease-expo group-hover:scale-[1.03] group-focus-within:scale-[1.03] motion-reduce:transition-none"
          />

          {/* Le voile : il porte l'information, il ne décore pas. */}
          <span
            aria-hidden
            className="absolute inset-0 bg-night-900/55 opacity-0 transition-opacity duration-(--d-base) group-hover:opacity-100 group-focus-within:opacity-100 pointer-coarse:opacity-100 motion-reduce:transition-none"
          />

          {/* Filet d'accent, présent dès le survol. */}
          <span
            aria-hidden
            className="absolute inset-x-6 top-6 h-px origin-left scale-x-0 bg-gold-400 transition-transform duration-(--d-base) ease-expo group-hover:scale-x-100 group-focus-within:scale-x-100 pointer-coarse:scale-x-100 motion-reduce:transition-none"
          />

          <div className="absolute inset-x-0 bottom-0 p-6">
            {sousTitre && (
              <p className="label-caps translate-y-2 text-cream-100/70 opacity-0 transition-all duration-(--d-base) ease-expo group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 pointer-coarse:translate-y-0 pointer-coarse:opacity-100 motion-reduce:transition-none">
                {sousTitre}
              </p>
            )}
            <h3 className="mt-2 font-display text-heading-sm uppercase leading-none tracking-wide text-cream-100">
              {titre}
            </h3>
            {children && (
              <div className="mt-3 translate-y-2 opacity-0 transition-all delay-75 duration-(--d-base) ease-expo group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 pointer-coarse:translate-y-0 pointer-coarse:opacity-100 motion-reduce:transition-none">
                {children}
              </div>
            )}
          </div>
        </div>
      </Link>
    </article>
  )
}
