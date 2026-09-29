import type { Bijou } from '@/types'
import { MediaFrame } from '@/components/media/MediaFrame'
import { PriceTag } from '@/components/ui/PriceTag'
import { marche } from '@/data/produits'

interface BijouCardProps {
  bijou: Bijou
}

/**
 * Carte de pièce.
 *
 * Le visuel est **fixe** (aucune parallaxe) : c'est la règle du contrat — le décor bouge,
 * la marchandise est stable, pour qu'on puisse comparer deux pièces. Le nom passe en
 * Fraunces, la voix de la pièce ; le numéro et le prix restent en données tabulaires.
 */
export function BijouCard({ bijou }: BijouCardProps) {
  const m = marche(bijou.slug)

  return (
    <article className="group flex h-full flex-col">
      <MediaFrame
        src={bijou.image}
        alt={`${bijou.nom} — pièce inspirée de la culture ${bijou.culture}`}
        ratio="3/4"
      />

      <div className="flex items-baseline justify-between gap-4 pt-5">
        <span aria-hidden className="data-mono text-xs text-gold-400">
          {bijou.numero}
        </span>
        <span className="label-caps text-ink-500">{bijou.culture}</span>
      </div>

      <h3 className="mt-1 font-title text-heading-sm leading-tight text-ink-900">{bijou.nom}</h3>

      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-500">{bijou.histoire}</p>

      <div className="mt-4 flex items-end justify-between gap-3 border-t border-sand-200 pt-4">
        <PriceTag montant={m.prix} />
        <span className="data-mono text-[0.6875rem] text-ink-400">{m.reference}</span>
      </div>
      {!m.prixConfirme && <p className="mt-1 text-caption text-ink-400">Prix indicatif — hors livraison</p>}
    </article>
  )
}
