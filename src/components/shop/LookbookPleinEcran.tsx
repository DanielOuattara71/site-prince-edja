import { useMemo } from 'react'
import type { GalerieImage } from '@/types'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { srcsetContenu } from '@/lib/visuels'

interface Props {
  images: GalerieImage[]
  onOuvrir: (index: number) => void
}

/** Alternance des rangées : une pleine largeur, puis deux moitiés, et ainsi de suite. */
function construireRangees(images: GalerieImage[]): GalerieImage[][] {
  const rangees: GalerieImage[][] = []
  let index = 0
  let pleine = true

  while (index < images.length) {
    const taille = pleine ? 1 : 2
    rangees.push(images.slice(index, index + taille))
    index += taille
    pleine = !pleine
  }

  return rangees
}

/**
 * Galerie éditoriale de la boutique.
 *
 * Elle est indépendante des fiches produit : `images` ne contient pas les visuels
 * des pièces, et un clic n'ouvre pas une fiche. Le regard porte sur les gestes,
 * les symboles et les détails qui entourent la collection.
 *
 * Le parti pris reste celui de Somewhere : les visuels se touchent, bord à bord,
 * sans cadre ni arrondi. L'alternance pleine largeur / deux moitiés donne le
 * rythme ; le titre et la légende n'apparaissent qu'au survol ou au focus.
 */
export function LookbookPleinEcran({ images, onOuvrir }: Props) {
  const rangees = useMemo(() => construireRangees(images), [images])

  return (
    <section aria-label="Galerie de la maison" className="bg-sand-100">
      <div className="px-4 pt-12 sm:px-6 sm:pt-16">
        <Eyebrow>La galerie</Eyebrow>
        <h2 className="mt-4 font-display uppercase text-display-lg">
          Regard
          <span aria-hidden className="text-clay-500">.</span>
        </h2>
      </div>

      <div
        data-curseur="galerie"
        className="grid grid-cols-2 gap-2 px-4 pt-10 sm:px-6 sm:pt-12"
      >
        {rangees.map((rangee) =>
          rangee.map((image) => {
            const index = images.indexOf(image)

            return (
              <button
                key={image.src}
                type="button"
                onClick={() => onOuvrir(index)}
                aria-label={`Agrandir ${image.titre} en plein écran`}
                className={
                  'group relative block overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clay-600 ' +
                  (rangee.length === 1 ? 'col-span-2 aspect-16/9 sm:aspect-[21/9]' : 'aspect-square')
                }
              >
                <img
                  src={image.src}
                  srcSet={srcsetContenu(image.src)}
                  sizes={rangee.length === 1 ? '100vw' : '(max-width: 640px) 50vw, 50vw'}
                  alt={image.alt}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-(--d-reveal) ease-expo group-hover:scale-[1.03]"
                />
                {/* Aucune légende permanente : le titre apparaît au survol, et sans cadre. */}
                <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-night-900/80 to-transparent px-4 pb-3 pt-8 opacity-0 transition-opacity duration-(--d-base) group-hover:opacity-100 group-focus-visible:opacity-100">
                  <span className="block text-left font-display text-heading-sm uppercase text-cream-100">
                    {image.titre}
                  </span>
                  {image.legende && (
                    <span className="label-caps block text-left text-cream-100/70">
                      {image.legende}
                    </span>
                  )}
                </span>
              </button>
            )
          }),
        )}
      </div>
    </section>
  )
}
