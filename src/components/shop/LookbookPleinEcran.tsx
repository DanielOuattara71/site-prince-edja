import { useMemo } from 'react'
import type { Bijou } from '@/types'
import { visuelPiece } from '@/lib/visuels'

interface Props {
  pieces: Bijou[]
  onOuvrir: (bijou: Bijou) => void
}

/** Alternance des rangées : une pleine largeur, puis deux moitiés, et ainsi de suite. */
function construireRangees(pieces: Bijou[]): Bijou[][] {
  const rangees: Bijou[][] = []
  let index = 0
  let pleine = true

  while (index < pieces.length) {
    const taille = pleine ? 1 : 2
    rangees.push(pieces.slice(index, index + taille))
    index += taille
    pleine = !pleine
  }

  return rangees
}

/**
 * Lookbook plein écran.
 *
 * Le parti pris est celui de Somewhere : les visuels se touchent, bord à bord, sans
 * marge ni arrondi ni légende. La collection est le sujet : un cadre, un espace ou une
 * étiquette entre deux pièces rappellerait qu'on regarde un catalogue plutôt qu'un
 * lookbook. Le seul texte est l'horodatage en tête, et il dit où l'on est.
 *
 * L'alternance pleine largeur / deux moitiés donne le rythme : uniforme, la grille
 * redevient une planche-contact.
 */
export function LookbookPleinEcran({ pieces, onOuvrir }: Props) {
  const rangees = useMemo(() => construireRangees(pieces), [pieces])

  return (
    <section
      aria-label="Lookbook de la collection"
      data-curseur="galerie"
      className="bg-sand-100 px-4 pt-4 sm:px-6 sm:pt-6"
    >
      {/* Pas de bandeau horodaté ni de compteur : le titre de la galerie au-dessus dit
          déjà combien de pièces il y a, et la date changerait à chaque visite sans
          rien apprendre. */}
      {/* `gap-2` et non `gap-1` : deux vignettes jointives à 4 px se touchent, et le
          doigt ne sait plus laquelle il vise. */}
      <div className="grid grid-cols-2 gap-2 pt-1.5 sm:gap-2 sm:pt-2">
        {rangees.map((rangee) =>
          rangee.map((bijou) => (
            <button
              key={bijou.slug}
              type="button"
              onClick={() => onOuvrir(bijou)}
              aria-label={`Examiner ${bijou.nom} en plein écran`}
              className={
                'group relative block overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clay-600 ' +
                (rangee.length === 1 ? 'col-span-2 aspect-4/3 sm:aspect-16/9' : 'aspect-4/5')
              }
            >
              <img
                src={visuelPiece(bijou.slug)}
                alt={`Bijou ${bijou.nom}, inspiré de la culture ${bijou.culture}`}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-(--d-reveal) ease-expo group-hover:scale-[1.03]"
              />
              {/* Aucune légende : le nom n'apparaît qu'au survol, et sans cadre. */}
              <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-night-900/80 to-transparent px-4 pb-3 pt-8 opacity-0 transition-opacity duration-(--d-base) group-hover:opacity-100 group-focus-visible:opacity-100">
                <span className="block text-left font-display text-heading-sm uppercase text-cream-100">
                  {bijou.nom}
                </span>
                <span className="label-caps block text-left text-cream-100/70">
                  N° {bijou.numero} · {bijou.culture}
                </span>
              </span>
            </button>
          )),
        )}
      </div>
    </section>
  )
}
