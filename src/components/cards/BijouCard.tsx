import { Link } from 'react-router'
import { Check } from 'lucide-react'
import type { Bijou } from '@/types'
import { formatFCFA } from '@/lib/format'
import { useLangue } from '@/i18n/contexteLangue'
import { useDemande } from '@/lib/demande'
import { cn } from '@/lib/cn'

interface BijouCardProps {
  bijou: Bijou
}

/**
 * Carte d'une pièce de la collection.
 *
 * Rendu planche-contact : portrait 4:5, aucun cadre, aucun arrondi, aucune
 * ombre. La carte entière est un lien vers la fiche, car une pièce sans fiche
 * atteignable est une impasse, et le `focus-visible` garde le clavier visible.
 *
 * L'ajout à la sélection est un **bouton frère**, pas un enfant du lien : tant
 * qu'il vivait à l'intérieur, le cliquer déclenchait aussi la navigation vers la
 * fiche, et l'ajout était impossible sans quitter la liste.
 *
 * Les montants ne sont pas déclarés dans `Bijou` : ils sont lus tels quels
 * quand la donnée en porte, et la carte reste muette sur le prix tant qu'aucun
 * montant n'existe.
 */
export function BijouCard({ bijou }: BijouCardProps) {
  const { present, basculer } = useDemande()
  const { t } = useLangue()
  const commerce = bijou.commerce
  const prix = commerce?.prix ?? null
  const ancienPrix = commerce?.ancienPrix ?? null
  const choisi = present(bijou.slug)
  const promo = prix != null && ancienPrix != null && ancienPrix > prix

  return (
    <article className="flex flex-col">
      <Link
        to={`/boutique/${bijou.slug}`}
        className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-clay-600"
      >
        <div className="relative aspect-4/5 overflow-hidden">
          <img
            src={bijou.image}
            alt={`Bijou ${bijou.nom}, inspiré de la culture ${bijou.culture}`}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-(--d-reveal) ease-expo group-hover:scale-[1.03]"
          />
        </div>

        {/* Nom et prix sur une même ligne, alignés au bord exact de l'image : pas de
            décalage, la légende et la photo reposent sur la même grille. La ligne de
            prix est toujours rendue — « Sur demande » à défaut de montant — pour que
            toutes les cartes gardent la même hauteur, et pour que le visiteur sache
            où on en est au lieu de lire un silence. */}
        <div className="mt-3 flex items-baseline justify-between gap-3">
          <p className="label-caps text-ink-900">{bijou.nom}</p>
          <p className="flex shrink-0 items-baseline gap-2 text-caption font-light">
            {promo && (
              <span className="text-ink-500 line-through">{formatFCFA(ancienPrix)}</span>
            )}
            <span className={promo ? 'text-promo-500' : 'text-ink-500'}>
              {prix != null ? formatFCFA(prix) : t('demande.surDemande')}
            </span>
          </p>
        </div>
      </Link>

      {/* Pleine largeur : la cible couvre toute la carte et s'aligne sur ses bords,
          au lieu de flotter décalée entre le prix et le vide. */}
      <button
        type="button"
        onClick={() => basculer(bijou)}
        aria-pressed={choisi}
        className={cn(
          'mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border px-4 text-caption font-semibold transition-colors duration-(--d-fast)',
          choisi
            ? 'border-night-900 bg-night-900 text-cream-100'
            : 'border-sand-300 text-ink-700 hover:bg-sand-200',
        )}
      >
        {/* La coche dit l'état d'un coup d'œil. Le seul changement de libellé
            passait inaperçu : on ne savait pas si l'ajout avait pris. */}
        {choisi && <Check aria-hidden className="size-4" />}
        {choisi ? t('demande.retirer') : t('carte.ajouter')}
      </button>
    </article>
  )
}
