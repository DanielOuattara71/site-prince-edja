import { useEffect, useRef } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Link } from 'react-router'
import { X } from 'lucide-react'
import { BIJOUX } from '@/data/content'
import { marche } from '@/data/produits'
import { formatFCFA } from '@/lib/format'
import { DUR } from '@/lib/motion'
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll'
import { Button } from '@/components/ui/Button'
import type { LigneSelection } from '@/lib/selection'

interface TiroirSelectionProps {
  lignes: LigneSelection[]
  ouvert: boolean
  onClose: () => void
  onRetirer: (slug: string) => void
  onQuantite: (slug: string, quantite: number) => void
  /** Vider la sélection entière — l'action n'existe qu'à partir de deux lignes. */
  onVider: () => void
}

/**
 * LE TIROIR « Ma sélection »
 *
 * C'est un moment **marchand**, pas un moment de spectacle : la durée `fast`, aucune
 * animation d'entrée scénique, aucune image au-dessus de 64 px. Le contrat l'impose, et
 * c'est la bonne décision — un tiroir qui danse fait perdre l'attention de l'action.
 *
 * Le sol est en `kaolin-50` : les mentions secondaires y sont en `ink-700`. `ink-400` n'y
 * rend que 3,8:1 et `ink-500` 4,5:1 tout juste — sous le seuil AA pour du texte de 12 px.
 * La hiérarchie se fait donc par la taille et la casse, pas par la couleur.
 *
 * Rien n'est réservé ici, et le mot « panier » est absent de tout l'écran : le visiteur
 * doit comprendre qu'il compose une demande, pas qu'il achète.
 */
export function TiroirSelection({
  lignes,
  ouvert,
  onClose,
  onRetirer,
  onQuantite,
  onVider,
}: TiroirSelectionProps) {
  const reducedMotion = useReducedMotion()
  const premierRef = useRef<HTMLButtonElement>(null)
  const panneauRef = useRef<HTMLElement | null>(null)

  useLockBodyScroll(ouvert)

  useEffect(() => {
    if (!ouvert) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [ouvert, onClose])

  // Deuxième effet, délibérément sans `onClose` dans ses dépendances : le parent recrée
  // sa closure à chaque rendu, et remonter celui-ci à chaque rendu rendrait le focus au
  // déclencheur pendant que le visiteur compose sa demande — à chaque changement de
  // quantité. Le focus ne bouge donc qu'au moment où le tiroir s'ouvre et se referme.
  useEffect(() => {
    if (!ouvert) return
    // Le tiroir vole le focus : il doit le rendre. Sans ce retour, le fermer laisse
    // le curseur sur `body` et Tab repart du haut de la page.
    const declencheur =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
    premierRef.current?.focus()

    // `aria-modal` ne retient pas le clavier : sans ce piège, Tab franchit le rideau et
    // parcourt la page d'à côté, pourtant cachée sous le volet. On la ramène dans le
    // panneau, dans les deux sens. En capture, pour la voir avant tout garde-fou local.
    const pieger = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return
      const panneau = panneauRef.current
      if (!panneau) return
      const cibles = Array.from(
        panneau.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => el.getClientRects().length > 0)
      if (cibles.length === 0) return
      const premier = cibles[0]
      const dernier = cibles[cibles.length - 1]
      const actif = document.activeElement
      const hors = !panneau.contains(actif)
      if (event.shiftKey && (hors || actif === premier)) {
        event.preventDefault()
        dernier.focus()
      } else if (!event.shiftKey && (hors || actif === dernier)) {
        event.preventDefault()
        premier.focus()
      }
    }

    document.addEventListener('keydown', pieger, true)
    return () => {
      document.removeEventListener('keydown', pieger, true)
      declencheur?.focus()
    }
  }, [ouvert])

  const total = lignes.reduce((somme, l) => {
    const bijou = BIJOUX.find((b) => b.slug === l.slug)
    const prix = bijou ? marche(bijou.slug).prix : null
    return somme + (prix ?? 0) * l.quantite
  }, 0)

  type Bijou = (typeof BIJOUX)[number]

  const items = lignes
    .map((ligne) => ({ ligne, bijou: BIJOUX.find((b) => b.slug === ligne.slug) }))
    .filter((x): x is { ligne: LigneSelection; bijou: Bijou } => x.bijou !== undefined)

  return (
    <AnimatePresence>
      {ouvert && (
        <>
          {/* Le rideau se clique mais ne se tabule pas : un second bouton « fermer »
              hors du panneau serait un arrêt de tabulation que le piège de focus
              rendrait inatteignable. Échap et le bouton du panneau suffisent. */}
          <motion.div
            aria-hidden
            onClick={onClose}
            className="fixed inset-0 z-40 cursor-default bg-night-900/50 backdrop-blur-[2px]"
            initial={reducedMotion ? undefined : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reducedMotion ? undefined : { opacity: 0 }}
            transition={{ duration: DUR.fast }}
          />

          <motion.aside
            ref={panneauRef}
            role="dialog"
            aria-modal="true"
            aria-label="Ma sélection"
            className="fixed inset-y-0 right-0 z-41 flex w-full max-w-[26rem] flex-col border-l border-sand-200 bg-kaolin-50 text-ink-900"
            initial={reducedMotion ? undefined : { x: '100%' }}
            animate={{ x: 0 }}
            exit={reducedMotion ? undefined : { x: '100%' }}
            transition={{ duration: DUR.fast, ease: 'easeOut' }}
          >
            <div className="flex items-center justify-between border-b border-sand-200 px-6 py-5">
              <div className="flex items-baseline gap-3">
                {/* Le titre du tiroir est un titre, pas une étiquette : c'est lui qui nomme
                    l'espace. Le compte, lui, est une donnée — il prend la mono. */}
                <h2 className="font-title text-heading-sm leading-none">Ma sélection</h2>
                <span className="data-mono text-sm text-ink-700">
                  {String(lignes.length).padStart(2, '0')}
                </span>
              </div>
              <button
                ref={premierRef}
                type="button"
                onClick={onClose}
                className="flex size-11 items-center justify-center rounded-sharp text-ink-700 transition-colors duration-(--d-fast) hover:bg-sand-200 hover:text-ink-900"
              >
                <X className="size-5" />
                <span className="sr-only">Fermer</span>
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
                <p className="font-title text-heading-sm">La sélection attend sa première pièce.</p>
                <Link
                  to="/boutique"
                  onClick={onClose}
                  className="text-button font-semibold text-clay-600 underline underline-offset-4"
                >
                  Voir les comptoirs
                </Link>
              </div>
            ) : (
              <>
                <ul className="flex-1 divide-y divide-sand-200 overflow-y-auto px-6">
                  {items.map(({ ligne, bijou }) => {
                    const m = marche(bijou.slug)
                    return (
                      <li key={bijou.slug} className="flex gap-4 py-4">
                        {/* 64 px : la taille d'une vignette de liste. Au-delà, c'est de la place volée. */}
                        <img
                          src={bijou.image}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          className="size-16 shrink-0 rounded-sharp object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-title text-body-lg leading-tight">{bijou.nom}</p>
                          <p className="data-mono mt-0.5 text-caption text-ink-700">
                            {m.reference}
                          </p>
                          {ligne.taille && (
                            <p className="mt-0.5 text-caption text-ink-700">
                              Taille {ligne.taille}
                            </p>
                          )}
                          <div className="mt-2 flex items-center gap-3">
                            <div className="flex items-center rounded-sharp border border-sand-300">
                              <button
                                type="button"
                                onClick={() => onQuantite(bijou.slug, ligne.quantite - 1)}
                                className="flex size-9 items-center justify-center text-ink-700"
                                aria-label={`Retirer un exemplaire de ${bijou.nom}`}
                              >
                                −
                              </button>
                              <span className="data-mono w-7 text-center text-sm">
                                {ligne.quantite}
                              </span>
                              <button
                                type="button"
                                onClick={() => onQuantite(bijou.slug, ligne.quantite + 1)}
                                className="flex size-9 items-center justify-center text-ink-700"
                                aria-label={`Ajouter un exemplaire de ${bijou.nom}`}
                              >
                                +
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => onRetirer(bijou.slug)}
                              className="text-caption text-ink-700 underline underline-offset-4 hover:text-clay-600"
                            >
                              Retirer
                            </button>
                          </div>
                        </div>
                        <p className="data-mono shrink-0 text-sm">
                          {m.prix ? formatFCFA(m.prix * ligne.quantite) : '—'}
                        </p>
                      </li>
                    )
                  })}
                </ul>

                <div className="border-t border-sand-200 px-6 py-5">
                  <div className="flex items-baseline justify-between">
                    <span className="label-caps text-ink-700">Total indicatif</span>
                    {/* Le total est la première donnée de l'ardoise : il prend l'échelle du titre. */}
                    <span className="data-mono text-heading-sm">{formatFCFA(total)}</span>
                  </div>
                  <p className="mt-2 text-caption text-ink-700">
                    Frais de livraison calculés après confirmation. Le règlement se fait par
                    Mobile Money, virement ou sur place.
                  </p>
                  <Button to="/ma-demande" variant="primary" className="mt-4 w-full">
                    Envoyer ma demande
                  </Button>
                  <p className="mt-2 text-caption text-ink-700">
                    Rien n'est réservé tant que la demande n'est pas envoyée.
                  </p>
                  {/* Vider n'existe qu'à partir de deux lignes : retirer une sélection d'une
                      seule pièce se fait déjà avec « Retirer » sur la ligne. */}
                  {lignes.length > 1 && (
                    <button
                      type="button"
                      onClick={onVider}
                      className="mt-3 text-caption text-ink-700 underline underline-offset-4 transition-colors duration-(--d-fast) hover:text-clay-600"
                    >
                      Tout retirer
                    </button>
                  )}
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

