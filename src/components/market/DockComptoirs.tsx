import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Link, useLocation } from 'react-router'
import { Bookmark, ChevronUp } from 'lucide-react'
import { COMPTOIRS } from '@/data/comptoirs'
import { cn } from '@/lib/cn'
import { DUR, EASE_EXPO, EASE_QUART, delaiCyclique } from '@/lib/motion'
import { formatChapitre } from '@/lib/format'
import { themeDeComptoir, themeVersVariablesCss } from '@/lib/themeComptoir'
import { useIsDesktop } from '@/hooks/useMediaQuery'

/**
 * Le dock des comptoirs — la barre de navigation du marché, en bas de l'écran.
 *
 * Quatre états, et c'est ce qui le distingue d'une simple barre :
 *
 * 1. REPLÍ — l'emblème, le libellé du comptoir courant, sa position (`03 / 04`).
 * 2. OUVERT — les items se **relèvent** en `rotateX` (origine basse) avec 70 ms
 *    d'écart : le clapet. Animé en hauteur, pas en largeur, donc sans mesure à hacker.
 * 3. ACTIF — dans un comptoir, le dock prend le sol et l'accent de ce comptoir.
 *    On sait où l'on est sans lire : c'est le rôle du thème de contexte.
 * 4. MASQUÉ — il se retire à la descente et revient à la montée.
 *
 * Volontairement absent : rotation automatique, capture de molette, et tout ce qui
 * fait défiler la page tout seul. Le dock se pilote au survol, au focus et au tap.
 */
export function DockComptoirs({
  totalSelection = 0,
  onOuvrirSelection,
}: {
  /** Nombre de pièces dans « Ma sélection ». */
  totalSelection?: number
  onOuvrirSelection?: () => void
}) {
  const desktop = useIsDesktop()
  const reducedMotion = useReducedMotion()
  const [ouvert, setOuvert] = useState(false)
  const [masque, setMasque] = useState(false)
  const listeRef = useRef<HTMLUListElement>(null)
  const dernierY = useRef(0)
  const { pathname } = useLocation()

  const total = COMPTOIRS.length

  // Comparaison par segment, pas par fin de chaîne : sur `/boutique/a-porter/baoule`,
  // `endsWith('/boutique/a-porter')` renvoie faux et le dock perdait le comptoir courant.
  const segments = pathname.split('/').filter(Boolean)
  const indexUrl = COMPTOIRS.findIndex(
    (c) => segments[0] === 'boutique' && segments[1] === c.slug,
  )
  const courant = COMPTOIRS[indexUrl >= 0 ? indexUrl : 0]
  // Sur `/boutique` (le marché entier), rien n'est « courant » : on affiche le compte.
  const surLeMarche = indexUrl < 0

  // Le dock vit **hors** du `<Comptoir>` de la page : c'est un fixed posé par le layout.
  // Sans les variables du thème écrites ici, les `var(--c-*)` qu'il emploie ne résolvent
  // nulle part et le dock reste nuit y compris sur les sols clairs de Mémoire et de
  // Maison & Table — l'inverse exact du rôle annoncé (« on sait où l'on est sans lire »).
  // Le sol y est repris en 86 % : le dock est un verre teinté posé sur la page, pas une
  // plaque. En opaque, le `backdrop-blur` et le halo en dessous ne servaient à rien.
  const styleDock = useMemo(() => {
    const theme = themeDeComptoir(courant.theme)
    return {
      ...themeVersVariablesCss(theme),
      backgroundColor: 'color-mix(in srgb, var(--c-sol) 86%, transparent)',
    } as CSSProperties
  }, [courant.theme])

  const fermer = useCallback(() => setOuvert(false), [])

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      if (Math.abs(y - dernierY.current) > 8) {
        setMasque(y > dernierY.current && y > 220)
        dernierY.current = y
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Échap ferme, flèches pilotent le focus entre items (le dock reste atteignable au clavier).
  useEffect(() => {
    if (!ouvert) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        fermer()
        return
      }
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return
      const items = Array.from(
        listeRef.current?.querySelectorAll<HTMLAnchorElement>('[data-item]') ?? [],
      )
      if (items.length === 0) return
      const position = items.findIndex((item) => item === document.activeElement)
      const suivant = event.key === 'ArrowRight' ? position + 1 : position - 1
      items[(suivant + items.length) % items.length]?.focus()
      // Sans cela, les flèches font aussi défiler la page sous le dock.
      event.preventDefault()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [ouvert, fermer])

  const varianteItem = {
    cache: { opacity: 0, rotateX: -92 },
    visible: (index: number) => ({
      opacity: 1,
      rotateX: 0,
      transition: {
        duration: reducedMotion ? 0 : DUR.base,
        ease: EASE_QUART,
        // La cascade se recycle tous les quatre items : au-delà, elle n'annonce plus le
        // clapet, elle le fait durer.
        delay: delaiCyclique(index, 0.07),
      },
    }),
  }


  return (
    <>
      {/* Réserve la hauteur du dock : aucun contenu ne doit finir dessous. */}
      <div aria-hidden className="h-24" />

      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
        style={{
          zIndex: 35, // sous le header (50) et sous la grande nav (40) : jamais au-dessus d'un overlay
          transform: masque ? 'translateY(150%)' : 'translateY(0)',
          // En mouvement réduit, le dock apparaît et disparaît net : pas de glissement.
          transition: reducedMotion ? 'none' : 'transform 0.45s var(--ease-expo)',
        }}
      >
        <motion.div
          onPointerEnter={desktop ? () => setOuvert(true) : undefined}
          onPointerLeave={desktop ? fermer : undefined}
          data-comptoir-courant={courant.theme}
          className="pointer-events-auto relative rounded-pill border border-current/15 shadow-[0_10px_36px_-12px_rgba(20,16,11,0.42)] backdrop-blur-md"
          style={styleDock}
        >
          {/* Le sol du comptoir courant : c'est lui qui tingue le dock quand on change de catégorie. */}
          <span
            aria-hidden
            className="halo-comptoir pointer-events-none absolute -inset-px -z-10 rounded-pill opacity-70"
          />

          {/* La ligne haute : le plan du dock, puis « Ma sélection » à sa droite. Elle doit
              être en flex : le bouton du plan est en `w-full`, donc posé à la ligne, n'importe
              quel second enfant viendrait s'empiler sous la pilule. */}
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => setOuvert((o) => !o)}
              aria-expanded={ouvert}
              aria-controls="dock-comptoirs"
              className="flex min-h-12 w-full items-center justify-between gap-4 rounded-pill px-4 outline-none focus-visible:ring-2 focus-visible:ring-current"
            >
              <span className="flex items-center gap-3">
                <span className="label-caps opacity-70">Comptoirs</span>
                <span className="text-button font-semibold">
                  {surLeMarche ? `Le Marché · ${total}` : courant.nom}
                </span>
              </span>
              <span className="flex items-center gap-3">
                <span className="data-mono text-xs opacity-70">
                  {surLeMarche ? '00' : formatChapitre(indexUrl, total)}
                </span>
                <motion.span
                  animate={{ rotate: ouvert ? 180 : 0 }}
                  transition={{ duration: reducedMotion ? 0 : DUR.base, ease: EASE_EXPO }}
                >
                  <ChevronUp className="size-4 opacity-70" />
                </motion.span>
              </span>
            </button>

            {/* Ma sélection : séparée du plan, à droite de la pilule. Le mot « panier » est
                absent de tout le marché — on réserve, on n'achète pas en ligne.
                Elle est accessible dès le plus petit écran : sous 640 px, seuls le repère et
                le compteur restent visibles, masquer ce bouton laissait la sélection
                invisible et donc irrécupérable sur téléphone. */}
            {onOuvrirSelection && (
              <button
                type="button"
                onClick={onOuvrirSelection}
                aria-label={`Ma sélection, ${totalSelection} pièce${totalSelection > 1 ? 's' : ''}`}
                className="ml-1 flex shrink-0 items-center gap-1.5 rounded-pill border-l border-current/15 py-2 pr-3 pl-2.5 transition-colors duration-(--d-fast) hover:opacity-70 focus-visible:ring-2 focus-visible:ring-current sm:gap-2 sm:pr-4"
              >
                {/* Le signet se remplit dès qu'une pièce est posée : l'état se voit sans
                    qu'on ait à écrire « 01 » en doré dans une corps de 11 px. */}
                <Bookmark
                  className={cn(
                    'size-4 transition-opacity duration-(--d-fast)',
                    totalSelection > 0 ? 'fill-current opacity-100' : 'opacity-50',
                  )}
                  aria-hidden
                />
                <span aria-hidden className="data-mono text-[0.6875rem] opacity-70">
                  {String(totalSelection).padStart(2, '0')}
                </span>
                <span className="label-caps hidden sm:inline">Ma sélection</span>
              </button>
            )}
          </div>

          <AnimatePresence>
            {ouvert && (
              <motion.div
                id="dock-comptoirs"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: reducedMotion ? 0 : DUR.base, ease: EASE_EXPO }}
                className="overflow-hidden"
              >
                <nav aria-label="Comptoirs" className="border-t border-current/15 pt-1">
                  <ul
                    ref={listeRef}
                    className={cn(
                      'flex',
                      desktop ? 'flex-row items-center gap-0.5 px-2 pb-1' : 'flex-col px-2 pb-2',
                    )}
                  >
                    {COMPTOIRS.map((comptoir, index) => (
                      <li key={comptoir.slug}>
                        <motion.div
                          custom={index}
                          variants={varianteItem}
                          initial="cache"
                          animate="visible"
                          style={{ transformPerspective: 700 }}
                        >
                          <Link
                            to={`/boutique/${comptoir.slug}`}
                            data-item
                            aria-current={index === indexUrl ? 'page' : undefined}
                            className={cn(
                              'flex min-h-12 items-center gap-2.5 rounded-pill px-4 outline-none',
                              'transition-colors duration-(--d-fast) focus-visible:ring-2 focus-visible:ring-current',
                              // L'actif est une pastille remplie, pas une étiquette dorée à 16 px :
                              // l'or est un matériau. Le survol reste un fond, jamais un remplissage.
                              index === indexUrl
                                ? 'bg-[var(--c-accent)] text-[var(--c-sol)]'
                                : 'opacity-75 hover:bg-[var(--c-surface)] hover:opacity-100',
                            )}
                          >
                            <span className="data-mono text-[0.6875rem] opacity-60">
                              {comptoir.numero}
                            </span>
                            <span className="whitespace-nowrap text-button font-semibold">
                              {comptoir.nom}
                            </span>
                            <span className="sr-only">
                              {comptoir.nbPieces > 0
                                ? `, ${comptoir.nbPieces} pièces`
                                : ', en ouverture'}
                            </span>
                            <span aria-hidden className="data-mono text-[0.6875rem] opacity-60">
                              {comptoir.nbPieces > 0 ? comptoir.nbPieces : '—'}
                            </span>
                          </Link>
                        </motion.div>
                      </li>
                    ))}
                  </ul>
                </nav>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  )
}
