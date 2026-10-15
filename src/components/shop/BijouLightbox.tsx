import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ArrowLeft, ArrowRight, X } from 'lucide-react'
import type { Bijou } from '@/types'
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll'
import { usePiegeFocus } from '@/hooks/usePiegeFocus'
import { DUR, EASE_EXPO } from '@/lib/motion'
import { formatChapitre } from '@/lib/format'
import { visuelPiece } from '@/lib/visuels'

interface Props {
  pieces: Bijou[]
  index: number | null
  onChangeIndex: (index: number | null) => void
}

/**
 * Visionneuse plein écran de la collection.
 *
 * Le compteur `02 / 10` est le repère principal : il dit où l'on est dans la série
 * numérotée, ce qu'une grille ne dit jamais. Les flèches du clavier et les boutons
 * font la même chose, le focus reste dans le dialogue et revient à la fiche à la
 * fermeture. Le zoom se fait par clic sur l'image, pas par molette, qui dans une
 * lightbox vole toujours le défilement de la page derrière.
 */
export function BijouLightbox({ pieces, index, onChangeIndex }: Props) {
  const ouvert = index !== null
  const [zoome, setZoome] = useState(false)
  const surface = usePiegeFocus<HTMLDivElement>(ouvert)
  const reduit = useReducedMotion()
  useLockBodyScroll(ouvert)

  const piece = ouvert ? pieces[index] : null
  const suivant = useCallback(() => {
    if (index === null) return
    onChangeIndex((index + 1) % pieces.length)
  }, [index, pieces.length, onChangeIndex])

  const precedent = useCallback(() => {
    if (index === null) return
    onChangeIndex((index - 1 + pieces.length) % pieces.length)
  }, [index, pieces.length, onChangeIndex])

  // Le zoom se réinitialise au changement de pièce. Ajustement pendant le rendu :
  // un effet afficherait d'abord la pièce suivante encore agrandie.
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
      {piece && (
        <motion.div
          className="motif-tisse fixed inset-0 z-[80] flex flex-col bg-night-900/95 backdrop-blur-md"
          data-curseur="galerie"
          initial={reduit ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: DUR.fast, ease: EASE_EXPO }}
        >
          {/* `relative z-10` : sans lui, le `::after` de la trame passerait au-dessus du
              contenu, les éléments positionnés l'emportant sur les autres. */}
          <div
            ref={surface}
            role="dialog"
            aria-modal="true"
            aria-label={piece.nom}
            className="relative z-10 flex h-full flex-col text-cream-100"
          >
            {/* Pas de barre haute : le compteur et la sortie vivent en bas, groupés, sur
                le modèle de Somewhere. Une barre en plus n'aurait fait que dédoubler. */}

            <div className="relative flex min-h-0 flex-1 flex-col">
              {/* Image pleine largeur : dans une galerie, le visuel occupe l'écran et
                  le texte se retire. Le cadrage est `contain`, car recadrer une pièce
                  qu'on est venu examiner n'aurait pas de sens. */}
              <button
                type="button"
                onClick={() => setZoome((valeur) => !valeur)}
                aria-pressed={zoome}
                aria-label={zoome ? 'Réduire l’image' : 'Agrandir l’image'}
                className="relative min-h-0 flex-1 cursor-zoom-in overflow-hidden"
              >
                <motion.img
                  src={visuelPiece(piece.slug)}
                  alt={`Bijou ${piece.nom}, inspiré de la culture ${piece.culture}`}
                  animate={{ scale: zoome ? 1.6 : 1 }}
                  transition={{ duration: DUR.base, ease: EASE_EXPO }}
                  className="h-full w-full object-contain"
                />
              </button>

              {/* Le nom et l'origine, posés sur l'image en haut à gauche : lisibles sans
                  masquer la pièce. */}
              <div className="pointer-events-none absolute left-5 top-4 lg:left-8">
                <p className="label-caps text-cream-100/60">
                  N° {piece.numero} · {piece.culture}
                </p>
                <p className="font-display text-heading-sm uppercase text-cream-100">
                  {piece.nom}
                </p>
              </div>

              {/* Barre unique : navigation groupée d'un côté, retour de l'autre. C'est le
                  schéma de Somewhere : `← 1 / 5 →` puis `Retour` sur la même ligne. */}
              <div className="flex items-center justify-between gap-4 border-t border-cream-100/25 px-5 py-4 lg:px-8">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={precedent}
                    aria-label="Pièce précédente"
                    className="inline-flex size-11 items-center justify-center rounded-full border border-cream-100/25 transition-colors hover:bg-cream-100 hover:text-ink-900"
                  >
                    <ArrowLeft aria-hidden className="size-5" />
                  </button>
                  <p className="label-caps w-20 text-center text-cream-100 tnum">
                    {formatChapitre(index ?? 0, pieces.length)}
                  </p>
                  <button
                    type="button"
                    onClick={suivant}
                    aria-label="Pièce suivante"
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
