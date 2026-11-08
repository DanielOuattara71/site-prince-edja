import { Link } from 'react-router'
import { LIVRES } from '@/acces/boutique'
import type { Bijou } from '@/types'
import { formatFCFA } from '@/lib/format'
import { useLangue } from '@/i18n/contexteLangue'

/**
 * Section « Livres » de la boutique.
 *
 * Disposition reconstituée d'après la capture fournie par la maison (la vitrine
 * d'Outfit comme apparentement visuel) :
 *
 * 1. **Le mot géant** — le titre de la section en display Anton, posé dans
 *    l'encre des titres de la maison (`ink-900`), la même couleur que le titre
 *    « Les 10 pièces » du catalogue. La taille passe par un style en ligne
 *    `clamp()`, car les valeurs arbitraires à virgules ne sont pas générées
 *    par Tailwind (piège documenté) et aucun token ne couvre un wordmark
 *    pleine largeur.
 * 2. **Le filet** — une ligne pleine largeur qui referme le wordmark.
 * 3. **Le libellé** — « Livres » en label-caps sous le filet.
 * 4. **La rangée produits** — la maquette des quatre livres, bord à bord, images
 *    portrait 4:5.
 * 5. **La pastille flottante** — un disque `clay-500` à cheval sur le bord haut
 *    de la rangée, lien « Tout voir » vers le catalogue ; seule interaction de
 *    la section. L'accent de la maison reste sur la pastille, le rouge vit dans
 *    le wordmark.
 *
 * Données : `LIVRES` (titres suffixés « (maquette) », fichiers de couverture
 * déjà présents du site). Le jour où le CDC livre la vraie liste, seul le tableau
 * change. Aucune carte n'est un lien : les maquettes n'ont pas de fiche, et une
 * navigation morte serait pire qu'une carte muette.
 */

export function CarteLivre({ livre }: { livre: Bijou }) {
  const prix = livre.commerce?.prix ?? null

  return (
    <article className="group">
      <div className="relative aspect-4/5 overflow-hidden bg-sand-200">
        <img
          src={livre.image}
          alt={`Maquette de couverture du livre fictif ${livre.nom}`}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-(--d-reveal) ease-expo group-hover:scale-[1.03]"
        />
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-3 px-1">
        <p className="label-caps text-ink-900">{livre.nom}</p>
        <p className="shrink-0 text-caption font-light text-ink-500">
          {prix != null ? formatFCFA(prix) : '—'}
        </p>
      </div>
    </article>
  )
}

export function SectionLivres() {
  const { l } = useLangue()

  return (
    <section
      aria-label={l({ fr: 'Livres', en: 'Books' })}
      className="relative bg-sand-100 pt-[52px]"
    >
      {/* 1 — le mot géant. Le clamp passe par un style en ligne : les valeurs
          arbitraires à virgules ne sont jamais générées par Tailwind. */}
      <div className="px-4 sm:px-6">
        <h2
          style={{ fontSize: 'clamp(2rem, 11vw, 10rem)', lineHeight: 0.9 }}
          className="select-none font-display uppercase tracking-tight text-ink-900"
        >
          {l({ fr: 'Livres', en: 'Books' })}
        </h2>

        {/* 2 — le filet qui referme le wordmark. */}
        <div aria-hidden className="mt-4 mb-5 h-[3px] w-full bg-ink-900/20" />

        {/* 3 — le libellé sous le filet. */}
        <p className="mb-10 label-caps uppercase text-ink-700">
          {l({ fr: 'Livres', en: 'Books' })}
        </p>
      </div>

      {/* 5 — la pastille flottante, à cheval sur la rangée produits. Altitude 10 :
          une pastille sur image, pas une modale. */}
      <Link
        to="#catalogue"
        className="absolute right-[6%] top-[52px] z-10 flex size-20 -translate-y-1/2 items-center justify-center rounded-full bg-clay-600 text-center text-caption font-semibold text-cream-100 transition-[transform,background-color] hover:bg-clay-700 duration-(--d-fast) hover:scale-[1.05] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-clay-600 lg:size-28 xl:right-[9%]"
      >
        {l({ fr: 'Tout voir', en: 'View all' })}
      </Link>

      {/* 4 — la rangée produits, bord à bord comme la capture. */}
      <div className="grid grid-cols-2 gap-[3px] px-4 pb-[52px] sm:px-6 lg:grid-cols-4">
        {LIVRES.map((livre) => (
          <CarteLivre key={livre.slug} livre={livre} />
        ))}
      </div>
    </section>
  )
}
