import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { motion, useReducedMotion } from 'motion/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/cn'
import { DUR, EASE_EXPO } from '@/lib/motion'
import { formatFCFA, formatChapitre } from '@/lib/format'
import { MediaFrame } from '@/components/media/MediaFrame'

export interface PieceRail {
  slug: string
  nom: string
  /** Repère court : matière ou technique. */
  repere: string
  image: string
  prix: number | null
  /** `false` tant que le montant n'est pas arrêté : la carte le dit à côté du prix. */
  prixConfirme?: boolean
  /**
   * Fiche de la pièce. `null` = la pièce n'a pas encore de fiche : la carte reste une
   * vitrine muette, sans lien. Une pièce de démonstration dont le slug n'est pas dans
   * `BIJOUX` n'a pas de fiche — le lien qu'on lui donnerait renverrait au comptoir
   * aussitôt arrivé, ce qui ressemble à un site cassé.
   */
  lien: string | null
}

interface RailProps {
  pieces: PieceRail[]
  className?: string
}

/**
 * LE RAIL — la régie de circulation longue.
 *
 * C'est un défilement **natif** : `overflow-x` + `scroll-snap`. Pas de capture de
 * molette, jamais — c'est le geste qui fait quitter un site marchand, et sur un site
 * où la majeure partie du trafic est tactile, le rail se heurte à chaque fois qu'on
 * veut défiler la page verticalement.
 *
 * Ce qui rend le rail lisible, et qu'on oublie souvent :
 * 1. un **rebord** de la carte suivante toujours visible (6 à 8 % de largeur) ;
 * 2. un **fondu** en `mask-image` sur 6 % de chaque bord — sans lui, personne ne sait
 *    qu'il y a d'autres cartes ;
 * 3. un **compteur** et un **rail de progression** : la position dans la liste.
 *
 * Le glisser au pointeur coupe le snap pendant le geste et le remet au relâchement :
 * l'inertie vient du navigateur, elle n'est pas simulée.
 */
export function Rail({ pieces, className }: RailProps) {
  const reducedMotion = useReducedMotion()
  const pisteRef = useRef<HTMLDivElement>(null)
  const pointeur = useRef({ x: 0, debut: 0, bouge: false })
  const [glisse, setGlisse] = useState(false)
  const [index, setIndex] = useState(0)
  const [progres, setProgres] = useState(0)

  const position = useCallback(() => {
    const piste = pisteRef.current
    if (!piste) return 0
    const cartes = piste.querySelectorAll<HTMLElement>('[data-carte]')
    const centre = piste.scrollLeft + piste.clientWidth / 2
    let meilleur = 0
    let ecart = Infinity
    cartes.forEach((carte, i) => {
      const milieu = carte.offsetLeft + carte.clientWidth / 2
      const d = Math.abs(centre - milieu)
      if (d < ecart) {
        ecart = d
        meilleur = i
      }
    })
    return meilleur
  }, [])

  useEffect(() => {
    const piste = pisteRef.current
    if (!piste) return
    const maj = () => setIndex(position())
    maj()
    piste.addEventListener('scroll', maj, { passive: true })
    window.addEventListener('resize', maj)
    return () => {
      piste.removeEventListener('scroll', maj)
      window.removeEventListener('resize', maj)
    }
  }, [position])

  const aller = useCallback(
    (cible: number) => {
      const piste = pisteRef.current
      if (!piste) return
      const cartes = piste.querySelectorAll<HTMLElement>('[data-carte]')
      const carte = cartes[Math.max(0, Math.min(cartes.length - 1, cible))]
      if (!carte) return
      piste.scrollTo({
        left: carte.offsetLeft - (piste.clientWidth - carte.clientWidth) / 2,
        behavior: reducedMotion ? 'auto' : 'smooth',
      })
    },
    [reducedMotion],
  )

  // La progression se mesure dans l'effet de scroll, pas pendant le rendu : lire un
  // `ref` au rendu est interdit en React strict et donne une valeur fausse au premier passage.
  useEffect(() => {
    const piste = pisteRef.current
    if (!piste) return
    const maj = () => {
      setIndex(position())
      const max = piste.scrollWidth - piste.clientWidth
      setProgres(max > 0 ? Math.min(1, Math.max(0, piste.scrollLeft / max)) : 0)
    }
    maj()
    piste.addEventListener('scroll', maj, { passive: true })
    window.addEventListener('resize', maj)
    return () => {
      piste.removeEventListener('scroll', maj)
      window.removeEventListener('resize', maj)
    }
  }, [position, pieces.length])

  return (
    <div className={cn('relative', className)}>
      {/* Commandes : pilules, présentes seulement au pointeur fin. */}
      <div className="mb-5 hidden items-center gap-4 lg:flex">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => aller(index - 1)}
            aria-label="Pièces précédentes"
            className="flex size-12 items-center justify-center rounded-sharp border border-current/30 transition-colors duration-(--d-fast) hover:bg-[var(--c-accent)] hover:text-[var(--c-sol)]"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => aller(index + 1)}
            aria-label="Pièces suivantes"
            className="flex size-12 items-center justify-center rounded-sharp border border-current/30 transition-colors duration-(--d-fast) hover:bg-[var(--c-accent)] hover:text-[var(--c-sol)]"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
        <span className="data-mono text-sm">{formatChapitre(index, pieces.length)}</span>
        <div className="h-px flex-1 overflow-hidden bg-current/20">
          <motion.div
            className="h-full origin-left bg-[var(--c-accent)]"
            animate={{ scaleX: progres }}
            transition={{ duration: reducedMotion ? 0 : DUR.base, ease: EASE_EXPO }}
          />
        </div>
      </div>

      {/* La piste : plein cadre, avec le rebord de la carte suivante. */}
      <div
        ref={pisteRef}
        onPointerDown={(event) => {
          const piste = pisteRef.current
          if (!piste) return
          pointeur.current = { x: event.clientX, debut: piste.scrollLeft, bouge: false }
          setGlisse(true)
          // La capture garde le geste attaché à la piste : sans elle, un doigt qui sort
          // du conteneur ne donne plus de `pointerup`, et le snap resterait coupé.
          event.currentTarget.setPointerCapture(event.pointerId)
        }}
        onPointerMove={(event) => {
          const piste = pisteRef.current
          if (!piste || !event.currentTarget.hasPointerCapture(event.pointerId)) return
          const dx = event.clientX - pointeur.current.x
          if (Math.abs(dx) > 6) pointeur.current.bouge = true
          piste.scrollLeft = pointeur.current.debut - dx
        }}
        onPointerUp={(event) => {
          const piste = pisteRef.current
          if (piste?.hasPointerCapture(event.pointerId)) {
            piste.releasePointerCapture(event.pointerId)
          }
          setGlisse(false)
          aller(position())
        }}
        onPointerCancel={(event) => {
          const piste = pisteRef.current
          if (piste?.hasPointerCapture(event.pointerId)) {
            piste.releasePointerCapture(event.pointerId)
          }
          setGlisse(false)
        }}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto overscroll-x-contain pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{
          // Pendant le geste, le snap est coupé : sinon la piste se bloque sous le doigt.
          scrollSnapType: glisse ? 'none' : undefined,
          // Le fondu des bords : sans lui, on ne sait pas qu'il y a d'autres cartes.
          WebkitMaskImage:
            'linear-gradient(to right, transparent 0, black 6%, black 94%, transparent 100%)',
          maskImage:
            'linear-gradient(to right, transparent 0, black 6%, black 94%, transparent 100%)',
          touchAction: 'pan-y',
        }}
      >
        {pieces.map((piece, i) => {
          // Une carte de respiration toutes les six : c'est elle qui casse la monotonie
          // du défilement et rappelle qu'il y a des gens derrière les pièces.
          const respiration = i > 0 && i % 6 === 0

          const corps = (
            <>
              <MediaFrame
                src={piece.image}
                alt={piece.nom}
                ratio="3/4"
                className="rounded-sharp"
              />
              <div className="mt-4 flex items-baseline justify-between gap-3">
                <h3 className="font-title text-heading-sm leading-tight text-[var(--c-texte)]">
                  {piece.nom}
                </h3>
                {/* Le prix est une donnée de première grandeur : il prend le texte plein,
                    pas le doux. Ce qui n'est pas arrêté se dit à part, en label. */}
                {piece.prix !== null ? (
                  <span className="data-mono shrink-0 text-sm text-[var(--c-texte)]">
                    {formatFCFA(piece.prix)}
                  </span>
                ) : (
                  <span className="label-caps shrink-0 text-[var(--c-texte-doux)]">
                    Sur commande
                  </span>
                )}
              </div>
              <div className="mt-1 flex items-center justify-between gap-3">
                <p className="label-caps text-[var(--c-texte-doux)]">{piece.repere}</p>
                {/* Le contrat : un montant non arrêté ne s'annonce pas comme arrêté. */}
                {piece.prix !== null && !piece.prixConfirme && (
                  <p className="label-caps text-[var(--c-texte-doux)] opacity-75">indicatif</p>
                )}
              </div>
              {/* Le cadre parle, pas la marchandise : le filet de lien se trace au survol,
                  et il n'existe que sur les cartes qui mènent quelque part. */}
              <span
                aria-hidden
                className="mt-3 block h-px origin-left scale-x-0 bg-[var(--c-accent)] transition-transform duration-(--d-base) ease-expo group-hover:scale-x-100"
              />
            </>
          )

          return (
            <article
              key={piece.slug}
              data-carte
              className={cn(
                'w-[74vw] shrink-0 snap-center sm:w-[46vw] lg:w-[27vw]',
                respiration && 'lg:w-[40vw]',
              )}
            >
              {respiration ? (
                <div className="flex h-full flex-col justify-center gap-4 rounded-sharp border border-[var(--c-trait)] p-8">
                  {/* L'or est un matériau : un filet, pas une étiquette de 12 px. */}
                  <span aria-hidden className="block h-px w-10 bg-[var(--c-accent)]" />
                  <p className="label-caps text-[var(--c-texte-doux)]">L'atelier</p>
                  <p className="font-title text-heading-sm leading-tight text-[var(--c-texte)]">
                    Chaque pièce porte le nom de celui qui l'a faite.
                  </p>
                  <Link
                    to="/contact"
                    className="text-button font-semibold text-[var(--c-texte-doux)] underline underline-offset-4"
                  >
                    Écrire à l'atelier
                  </Link>
                </div>
              ) : piece.lien ? (
                <Link
                  to={piece.lien}
                  className="group block"
                  onClick={(event) => {
                    // Garde anti-clic : on a tourné la piste, on n'a pas choisi la pièce.
                    if (pointeur.current.bouge) event.preventDefault()
                  }}
                >
                  {corps}
                </Link>
              ) : (
                // Pas de fiche pour cette pièce : la carte montre, elle n'invite pas à entrer.
                <div className="block cursor-default">{corps}</div>
              )}
            </article>
          )
        })}
      </div>

      <p className="mt-4 text-caption text-[var(--c-texte-doux)] lg:hidden">
        Glisse horizontalement pour parcourir — {formatChapitre(index, pieces.length)}
      </p>
    </div>
  )
}
