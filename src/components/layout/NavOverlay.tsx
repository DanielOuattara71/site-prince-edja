import { useEffect, useId, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/cn'
import { NAV_PRINCIPALE } from '@/data/navigation'
import { SITE } from '@/data/site'
import { Container } from '@/components/layout/Container'
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll'
import { usePiegeFocus } from '@/hooks/usePiegeFocus'
import { EASE_QUART } from '@/lib/motion'
import { useLangue } from '@/i18n/contexteLangue'
import { LangueSwitcher } from '@/components/layout/LangueSwitcher'
import { CtaTravailler } from '@/components/layout/CtaTravailler'
import { RechercheGlobale } from '@/components/layout/RechercheGlobale'

interface NavOverlayProps {
  open: boolean
  onClose: () => void
}

const lineUp = {
  hidden: { y: '110%' },
  visible: { y: '0%', transition: { duration: 0.6, ease: EASE_QUART } },
}

/**
 * Overlay de navigation mobile.
 *
 * Hiérarchie : les six entrées d'abord, à taille de titres, puis les sous-rubriques
 * repliées, un écran de téléphone ne pouvant pas montrer tout le plan à la fois sans
 * écraser la lecture. Chaque rangée fait au moins 44 px, y compris les bascules de
 * groupe. Le piège de focus est dans `usePiegeFocus` : Tab ne s'échappe pas derrière.
 */
export function NavOverlay({ open, onClose }: NavOverlayProps) {
  const [deplies, setDeplies] = useState<string[]>([])
  const premier = useRef<HTMLAnchorElement>(null)
  const surface = usePiegeFocus<HTMLDivElement>(open)
  const onCloseRef = useRef(onClose)
  const { pathname } = useLocation()
  const { t, l } = useLangue()

  const idPanneau = useId()

  // Les sous-rubriques se replient en quittant l'overlay : sinon la prochaine
  // ouverture rouvrirait un état que personne n'a demandé. Ajustement pendant le
  // rendu. Un effet provoquerait un rendu supplémentaire.
  const [derniereOuverture, setDerniereOuverture] = useState(open)
  if (derniereOuverture !== open) {
    setDerniereOuverture(open)
    if (!open) setDeplies([])
  }

  useEffect(() => {
    onCloseRef.current = onClose
  })

  useLockBodyScroll(open)

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCloseRef.current()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  useEffect(() => {
    onCloseRef.current()
  }, [pathname])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id="menu-overlay"
          ref={surface}
          role="dialog"
          aria-modal="true"
          aria-label={t('nav.ouvrirMenu')}
          initial={{ y: '-100%' }}
          animate={{ y: 0 }}
          exit={{ y: '-100%' }}
          transition={{ duration: 0.65, ease: EASE_QUART }}
          className="grain fixed inset-0 z-40 bg-night-900 text-cream-100"
        >
          <div
            aria-hidden
            className="absolute inset-x-0 top-full h-[10vh]"
            style={{ borderRadius: '0 0 100% 100%', background: 'var(--color-night-900)' }}
          />
          <Container className="flex h-full flex-col overflow-y-auto pt-20 pb-10">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="label-caps text-gold-400">Navigation</p>
              <div className="flex items-center gap-2">
                <RechercheGlobale tone="sombre" className="!px-3" />
                <LangueSwitcher className="rounded-full border border-cream-100/20" />
              </div>
            </div>

            {/* Première action visible : sous 1024 px, le CTA quitte la barre du
                header et prend cette place, en grand. Ton crème : la surface est
                night-900, un plein encre s'y confondrait. */}
            <motion.div variants={lineUp} className="mb-8">
              <CtaTravailler tone="sombre" className="w-full py-3.5" />
            </motion.div>

            <motion.nav
              aria-label={t('nav.etiquette')}
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.06, delayChildren: 0.2 } },
              }}
            >
              <ul>
                {NAV_PRINCIPALE.map((entree, index) => {
                  const deplie = deplies.includes(entree.to)
                  const idEnfants = `${idPanneau}-enfants-${index}`

                  return (
                    <li key={entree.to} className="border-b border-cream-100/10">
                      <motion.div variants={lineUp}>
                        <div className="flex items-center gap-1">
                          <NavLink
                            ref={index === 0 ? premier : undefined}
                            to={entree.to}
                            className={({ isActive }) =>
                              cn(
                                'flex min-h-11 flex-1 items-baseline gap-3 py-3 font-display uppercase text-heading-sm',
                                isActive ? 'text-clay-500' : 'text-cream-100',
                              )
                            }
                          >
                            <span className="label-caps shrink-0 text-cream-100/35">
                              {String(index + 1).padStart(2, '0')}
                            </span>
                            {l(entree.libelle)}
                          </NavLink>

                          {entree.enfants && entree.enfants.length > 0 && (
                            <button
                              type="button"
                              onClick={() =>
                                setDeplies((actuel) =>
                                  actuel.includes(entree.to)
                                    ? actuel.filter((to) => to !== entree.to)
                                    : [...actuel, entree.to],
                                )
                              }
                              aria-expanded={deplie}
                              aria-controls={idEnfants}
                              aria-label={deplie ? t('nav.fermerGroupe') : t('nav.ouvrirGroupe')}
                              className="inline-flex size-11 shrink-0 items-center justify-center rounded-full text-cream-100/60 transition-colors hover:text-cream-100"
                            >
                              <ChevronDown
                                aria-hidden
                                className={cn(
                                  'size-5 transition-transform duration-(--d-base)',
                                  deplie && 'rotate-180',
                                )}
                              />
                            </button>
                          )}
                        </div>

                        {entree.enfants && entree.enfants.length > 0 && (
                          <AnimatePresence initial={false}>
                            {deplie && (
                              <motion.ul
                                id={idEnfants}
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.28, ease: EASE_QUART }}
                                className="overflow-hidden"
                              >
                                {entree.enfants.map((enfant) => (
                                  <li key={enfant.to}>
                                    <NavLink
                                      to={enfant.to}
                                      className={({ isActive }) =>
                                        cn(
                                          'flex min-h-11 items-center border-l border-cream-100/25 pl-4 text-body text-cream-100/70 transition-colors hover:text-cream-100',
                                          isActive && 'text-clay-500',
                                        )
                                      }
                                    >
                                      {l(enfant.libelle)}
                                    </NavLink>
                                  </li>
                                ))}
                              </motion.ul>
                            )}
                          </AnimatePresence>
                        )}
                      </motion.div>
                    </li>
                  )
                })}
              </ul>
            </motion.nav>

            <div className="mt-8 space-y-4">
              <a href={`mailto:${SITE.email}`} className="block text-body-lg font-semibold">
                {SITE.email}
              </a>
              <p className="label-caps text-cream-100/60">{SITE.localisation}</p>
            </div>
          </Container>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
