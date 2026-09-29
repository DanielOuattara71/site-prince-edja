import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { useNavigate } from 'react-router'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/cn'
import { DUR, EASE_EXPO } from '@/lib/motion'
import { formatChapitre } from '@/lib/format'
import { MediaFrame } from '@/components/media/MediaFrame'
import { PriceTag } from '@/components/ui/PriceTag'

export interface VitrinePiece {
  slug: string
  nom: string
  culture: string
  histoire: string
  image: string
  /** Prix en FCFA, ou `null` si la pièce est sur commande. */
  prix: number | null
  /** `false` tant que le montant est provisoire : la carte l'indique alors. */
  prixConfirme?: boolean
  /** Référence courte affichée en données tabulaires. */
  reference?: string
}

interface VitrineProps {
  pieces: VitrinePiece[]
  /** Lien de la carte centrale. */
  lien?: (slug: string) => string
  className?: string
}

/**
 * LA VITRINE — coverflow 3D piloté par un index, pas par un défilement.
 *
 * La carte centrale est l'unique carte qui parle : elle seule montre sa description et
 * son prix. Tout le reste est de la profondeur. C'est la règle qui évite l'effet « tas
 * de cartes » d'un carrousel de catalogue.
 *
 * Valeurs relevées dans le moteur du studio de référence, puis adoucies : moins de
 * rotation (22° au lieu de 30° — 30° fait « démonstration », 22° fait « vitrine »),
 * rayon 3 px, et le prix collé à la carte active parce qu'un prix partout n'est lu nulle part.
 *
 * Trois détails font la sensation, et aucun n'est décoratif :
 * 1. pendant le glisser, la carte suit le pointeur en 1:1 (transition coupée) ;
 * 2. au relâchement, `.8s` expo, et un geste rapide avance de deux crans ;
 * 3. garde anti-clic : un déplacement de plus de 6 px annule le clic — sinon on ouvre
 *    une pièce en voulant simplement tourner la vitrine.
 */
export function Vitrine({ pieces, lien, className }: VitrineProps) {
  const reducedMotion = useReducedMotion()
  const navigate = useNavigate()
  const [index, setIndex] = useState(0)
  const [drag, setDrag] = useState(0)
  const [survol, setSurvol] = useState<number | null>(null)

  const sceneRef = useRef<HTMLDivElement>(null)
  // Le drag vit dans une ref en plus de l'état : pendant le geste, `drag` dans une closure
  // serait la valeur du rendu précédent, et le seuil d'accroche se déclencherait d'un cran en retard.
  const dragRef = useRef(0)
  const pointeur = useRef({ x: 0, y: 0, bouge: false })
  const vitesse = useRef(0)

  const total = pieces.length
  const go = useCallback(
    (cible: number) => {
      setIndex(Math.max(0, Math.min(total - 1, cible)))
    },
    [total],
  )

  // Navigation au clavier, active seulement quand la vitrine est à l'écran.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
      const scene = sceneRef.current
      if (!scene) return
      const rect = scene.getBoundingClientRect()
      if (rect.bottom < 0 || rect.top > window.innerHeight) return
      if (event.key === 'ArrowLeft') {
        go(index - 1)
      } else {
        // Deux crans quand le geste a été rapide : l'intention est comptée, pas ignorée.
        go(index + (Math.abs(vitesse.current) > 1.2 ? 2 : 1))
      }
      vitesse.current = 0
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, index])

  const surbrillance = survol ?? index
  const fige = reducedMotion

  return (
    <div className={cn('relative', className)}>
      <div
        ref={sceneRef}
        className="relative flex h-[clamp(360px,42vw,600px)] touch-pan-y select-none items-center justify-center"
        style={{ perspective: 1400 }}
        onPointerDown={(event) => {
          // Pointer Events plutôt que les événements souris : c'est la seule façon que le
          // glisser fonctionne au doigt. Le `touch-pan-y` de la classe laisse passer le
          // défilement vertical — on ne capture que l'axe horizontal.
          pointeur.current = { x: event.clientX, y: event.clientY, bouge: false }
          vitesse.current = 0
          dragRef.current = 0
          event.currentTarget.setPointerCapture(event.pointerId)
        }}
        onPointerMove={(event) => {
          if (!event.currentTarget.hasPointerCapture(event.pointerId)) return
          const scene = sceneRef.current
          if (!scene) return
          const rect = scene.getBoundingClientRect()
          const deplacementX = event.clientX - pointeur.current.x
          const deplacementY = event.clientY - pointeur.current.y

          // Un geste franchement vertical n'est pas un glissement de vitrine : on le laisse
          // passer à la page, sinon on piège le scroll sur mobile.
          if (!pointeur.current.bouge && Math.abs(deplacementY) > Math.abs(deplacementX)) {
            return
          }
          // Normalisé sur 52 % de la largeur, comme sur la source : parcourir toute la
          // scène ne doit pas faire balayer le catalogue entier.
          const brut = -deplacementX / (rect.width * 0.52)
          const borne = Math.max(-1.2, Math.min(1.2, brut))
          dragRef.current = borne
          setDrag(borne)
          if (Math.abs(deplacementX) > 6) pointeur.current.bouge = true
        }}
        onPointerUp={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId)
          }
          const courant = dragRef.current
          const cran = Math.abs(courant) > 0.28 ? Math.sign(courant) : 0
          vitesse.current = courant
          dragRef.current = 0
          setDrag(0)
          go(index + cran)
        }}
        onPointerCancel={() => {
          dragRef.current = 0
          setDrag(0)
        }}
      >
        {pieces.map((piece, k) => {
          // Distance à la carte centrale, drag compris. Le plafond à ±3 carte est ce qui
          // garde le DOM et le calcul léger même avec un catalogue de deux cents pièces.
          const ecart = k - index - drag
          const borne = Math.max(-3, Math.min(3, ecart))
          const abs = Math.abs(ecart)
          const central = abs < 0.4

          const tx = borne * 0.46 * 0.62 * 100
          const tz = -Math.min(abs, 3) * 165
          const ry = -borne * 22
          const rx = abs * 1.6
          const echelle = Math.max(0.72, 1 - abs * 0.07)
          const chute = abs * 8
          const opacite = abs > 2.6 ? 0 : Math.max(0, 1 - abs * 0.45)

          return (
            <motion.article
              key={piece.slug}
              className="absolute origin-center w-[min(84vw,460px)]"
              style={{
                transform: `translate3d(${tx}%, ${chute}px, ${tz}px) rotateY(${ry}deg) rotateX(${rx}deg) scale(${echelle})`,
                zIndex: 60 - Math.round(abs * 10),
                opacity: opacite,
                pointerEvents: central ? 'auto' : 'none',
              }}
              animate={{ rotateY: ry, rotateX: rx }}
              transition={{ duration: fige || drag !== 0 ? 0 : 0.8, ease: EASE_EXPO }}
              aria-hidden={!central}
            >
              <div
                className="pointer-events-auto relative"
                onClick={(event) => {
                  // Garde anti-clic : on a tourné, on n'a pas choisi.
                  if (pointeur.current.bouge) {
                    event.preventDefault()
                    return
                  }
                  if (lien) navigate(lien(piece.slug))
                }}
                onPointerEnter={(event) => {
                  // Le survol n'est pas un toucher : sur tactile, un `onMouseEnter`
                  // simulé laisserait une carte agrandie après un simple tap.
                  if (event.pointerType === 'mouse') setSurvol(k)
                }}
                onPointerLeave={() => setSurvol(null)}
              >
                <MediaFrame
                  src={piece.image}
                  alt={`${piece.nom} — pièce inspirée de la culture ${piece.culture}`}
                  ratio="4/5"
                  className="rounded-sharp border border-[var(--c-trait)]"
                />

                {/* Le halo de la carte centrale : c'est lui qui dit « c'est celle-ci ». */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-sharp transition-shadow duration-(--d-base)"
                  style={{
                    boxShadow: central
                      ? '0 0 60px color-mix(in srgb, var(--c-accent) 26%, transparent)'
                      : 'none',
                  }}
                />

                <div className="pointer-events-none absolute inset-x-0 bottom-0 rounded-b-sharp bg-gradient-to-t from-night-900/90 to-transparent p-5">
                  {/* L'or est un matériau : un filet, pas une étiquette de 12 px. `gold-400`
                      en petit texte sur une photo ne se lit pas et le contrat l'interdit. */}
                  <span aria-hidden className="mb-2 block h-px w-8 bg-[var(--c-accent)]" />
                  <p className="label-caps text-cream-100/75">{piece.culture}</p>
                  <h3 className="mt-1 font-title text-heading-sm leading-tight text-cream-100">
                    {piece.nom}
                  </h3>

                  {/* Le récit et le prix n'existent que sur la carte active. */}
                  <div
                    className="overflow-hidden transition-all duration-(--d-base)"
                    style={{ maxHeight: central ? 268 : 0, opacity: central ? 1 : 0 }}
                  >
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-cream-100/75">
                      {piece.histoire}
                    </p>
                  <div className="mt-3 flex items-end justify-between gap-3 [&_.text-ink-900]:text-cream-100 [&_.text-ink-500]:text-cream-100/60">
                    <PriceTag montant={piece.prix} />
                    {piece.reference && (
                      <span className="data-mono text-[0.6875rem] opacity-60">
                        {piece.reference}
                      </span>
                    )}
                  </div>
                  {!piece.prixConfirme && (
                    <p className="mt-1 text-caption text-cream-100/55">
                      Prix indicatif — hors livraison
                    </p>
                  )}
                    {/* Une seule carte invite à entrer : c'est elle qui porte le lien.
                        L'invite est décorative, le clic appartient déjà à la carte. */}
                    {lien && central && (
                      <span className="label-caps mt-3 inline-flex items-center gap-2 text-cream-100/80">
                        Voir la pièce
                        <span aria-hidden className="h-px w-6 bg-[var(--c-accent)]" />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.article>
          )
        })}
      </div>

      {/* Commandes : seulement ce qui se manipule. */}
      <div className="mt-8 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => go(index - 1)}
            disabled={index === 0}
            aria-label="Pièce précédente"
            className="flex size-12 items-center justify-center rounded-sharp border border-current/30 transition-colors duration-(--d-fast) disabled:opacity-30 enabled:hover:border-[var(--c-accent)] enabled:hover:bg-[var(--c-accent)] enabled:hover:text-[var(--c-sol)]"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            disabled={index === total - 1}
            aria-label="Pièce suivante"
            className="flex size-12 items-center justify-center rounded-sharp border border-current/30 transition-colors duration-(--d-fast) disabled:opacity-30 enabled:hover:border-[var(--c-accent)] enabled:hover:bg-[var(--c-accent)] enabled:hover:text-[var(--c-sol)]"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>

        <span className="data-mono text-sm">{formatChapitre(surbrillance, total)}</span>

        <div className="h-px flex-1 overflow-hidden bg-current/20">
          <motion.div
            className="h-full origin-left bg-[var(--c-accent)]"
            animate={{ scaleX: (surbrillance + 1) / total }}
            transition={{ duration: reducedMotion ? 0 : DUR.base, ease: EASE_EXPO }}
          />
        </div>

        <span aria-live="polite" className="sr-only">
          Pièce {index + 1} sur {total}
        </span>
      </div>
    </div>
  )
}
