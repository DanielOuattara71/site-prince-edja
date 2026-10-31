import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ArrowLeft, ArrowRight, X } from 'lucide-react'
import type { GalerieImage } from '@/types'
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll'
import { usePiegeFocus } from '@/hooks/usePiegeFocus'
import { DUR, EASE_EXPO } from '@/lib/motion'
import { formatChapitre } from '@/lib/format'
import { srcsetContenu } from '@/lib/visuels'

interface Props {
  images: GalerieImage[]
  index: number | null
  onChangeIndex: (index: number | null) => void
}

/**
 * Visionneuse plein écran de la galerie éditoriale.
 *
 * Elle ne montre pas les fiches produit : chaque image est indépendante et garde
 * son titre. Même mécanique que `BijouLightbox` — focus piégé, clavier, zoom —
 * mais le vocabulaire change : on parle d'images, pas de pièces.
 */
export function GalerieLightbox({ images, index, onChangeIndex }: Props) {
  const ouvert = index !== null
  const [zoome, setZoome] = useState(false)
  const surface = usePiegeFocus<HTMLDivElement>(ouvert)
  const reduit = useReducedMotion()
  useLockBodyScroll(ouvert)

  const image = ouvert ? images[index] : null
  const suivant = useCallback(() => {
    if (index === null) return
    onChangeIndex((index + 1) % images.length)
  }, [index, images.length, onChangeIndex])

  const precedent = useCallback(() => {
    if (index === null) return
    onChangeIndex((index - 1 + images.length) % images.length)
  }, [index, images.length, onChangeIndex])

  // Le zoom se réinitialise au changement d'image. Ajustement pendant le rendu :
  // un effet afficherait d'abord l'image suivante encore agrandie.
  const [dernierIndex, setDernierIndex] = useState(index)
  if (dernierIndex !== index) {
    setDernierIndex(index)
    setZoome(false)
  }

  useEffect(() => {
    if (!ouvert) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onChangeIndex(null)
      else if (event.key === 'ArrowRight') suivant()
      else if (event.key === 'ArrowLeft') precedent()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [ouvert, suivant, precedent, onChangeIndex])

  return (
    <AnimatePresence>
      {image && (
        <motion.div
          className="motif-tisse fixed inset-0 z-[80] flex flex-col bg-night-900/95 backdrop-blur-md"
          data-curseur="galerie"
          initial={reduit ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: DUR.fast, ease: EASE_EXPO }}
        >
          {/* `relative z-10` : sans lui, le `::after` de la trame passerait au-dessus
              du contenu, les éléments positionnés l'emportant sur les autres. */}
          <div
            ref={surface}
            role="dialog"
            aria-modal="true"
            aria-label={image.titre}
            className="relative z-10 flex h-full flex-col text-cream-100"
          >
            <div className="relative flex min-h-0 flex-1 flex-col">
              {/* `object-contain` : on est venu regarder l'image, pas la recadrer. */}
              <button
                type="button"
                onClick={() => setZoome((valeur) => !valeur)}
                aria-pressed={zoome}
                aria-label={zoome ? 'Réduire l’image' : 'Agrandir l’image'}
                className="relative min-h-0 flex-1 cursor-zoom-in overflow-hidden"
              >
                <motion.img
                  src={image.src}
                  srcSet={srcsetContenu(image.src)}
                  sizes="100vw"
                  alt={image.alt}
                  animate={{ scale: zoome ? 1.6 : 1 }}
                  transition={{ duration: DUR.base, ease: EASE_EXPO }}
                  className="h-full w-full object-contain"
                />
              </button>

              <div className="pointer-events-none absolute left-5 top-4 max-w-md lg:left-8">
                <p className="label-caps text-cream-100/60">Galerie</p>
                <p className="font-display text-heading-sm uppercase text-cream-100">
                  {image.titre}
                </p>
                {image.legende && (
                  <p className="mt-1 text-caption text-cream-100/70">{image.legende}</p>
                )}
              </div>

              {/* Barre unique : navigation groupée d'un côté, retour de l'autre. */}
              <div className="flex items-center justify-between gap-4 border-t border-cream-100/25 px-5 py-4 lg:px-8">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={precedent}
                    aria-label="Image précédente"
                    className="inline-flex size-11 items-center justify-center rounded-full border border-cream-100/25 transition-colors hover:bg-cream-100 hover:text-ink-900"
                  >
                    <ArrowLeft aria-hidden className="size-5" />
                  </button>
                  <p className="label-caps w-20 text-center text-cream-100 tnum">
                    {formatChapitre(index ?? 0, images.length)}
                  </p>
                  <button
                    type="button"
                    onClick={suivant}
                    aria-label="Image suivante"
                    className="inline-flex size-11 items-center justify-center rounded-full border border-cream-100/25 transition-colors hover:bg-cream-100 hover:text-ink-900"
                  >
                    <ArrowRight aria-hidden className="size-5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => onChangeIndex(null)}
                  className="group inline-flex min-h-11 items-center gap-2 text-caption font-semibold text-cream-100/80 underline-offset-4 transition-colors hover:text-cream-100 hover:underline"
                >
                  Retour
                  <X aria-hidden className="size-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
