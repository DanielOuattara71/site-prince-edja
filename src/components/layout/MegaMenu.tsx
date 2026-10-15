import { useEffect, useRef } from 'react'
import { NavLink } from 'react-router'
import { motion, useReducedMotion } from 'motion/react'
import { useLangue } from '@/i18n/contexteLangue'
import type { EntreeNav } from '@/data/navigation'
import { DUR, EASE_EXPO } from '@/lib/motion'

interface Props {
  /** Identifiant référencé par `aria-controls` de l'entrée qui ouvre le panneau. */
  id: string
  entree: EntreeNav
  ouvert: boolean
  onFermer: () => void
}

/**
 * Méga-menu d'un groupe de navigation (desktop).
 *
 * S'ouvre au survol **et** au focus : le survol seul exclut le clavier, le clic seul
 * oblige à viser une cible minuscule. L'entrée principale reste un lien vers sa page
 * hub. Un bouton qui ne navigue pas est une impression, pas une navigation.
 */
export function MegaMenu({ id, entree, ouvert, onFermer }: Props) {
  const { l } = useLangue()
  const reduit = useReducedMotion()
  const panneau = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ouvert) return
    const declencheur = document.getElementById(`${id}-declencheur`) as HTMLAnchorElement | null
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      onFermer()
      // Le focus retourne à l'entrée : un panneau quitté sans son déclencheur laisse
      // le clavier perdu au milieu de la page.
      declencheur?.focus()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [ouvert, onFermer, id])

  if (!entree.enfants || entree.enfants.length === 0) return null

  return (
    <motion.div
      id={id}
      ref={panneau}
      role="group"
      aria-label={l(entree.libelle)}
      initial={reduit ? false : { opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DUR.base, ease: EASE_EXPO }}
      // -mt-2.5 : la barre flottante s'arrête 16px au-dessus du bas de l'en-tête.
      // Sans ce décalage, le panneau restait suspendu 10px sous son bord.
      className="-mt-2.5 absolute left-0 top-full z-50 w-max max-w-[min(90vw,44rem)] pt-3"
    >
      <div className="grain rounded-xl bg-night-900 p-6 text-cream-100 border border-cream-100/25 lg:p-8">
        {entree.degre && (
          <p className="label-caps mb-5 text-gold-400">{l(entree.degre)}</p>
        )}
        <ul className="space-y-1">
          {entree.enfants.map((enfant, index) => (
            <li key={enfant.to}>
              <NavLink
                to={enfant.to}
                onClick={onFermer}
                className={({ isActive }) =>
                  `group flex items-baseline gap-4 rounded-md px-3 py-3 transition-colors duration-(--d-fast) hover:bg-cream-100/10 ${
                    isActive ? 'text-gold-400' : 'text-cream-100'
                  }`
                }
              >
                <span className="label-caps w-6 shrink-0 text-cream-100/40">
                  0{index + 1}
                </span>
                <span className="font-display text-heading-sm uppercase tracking-wide">
                  {l(enfant.libelle)}
                </span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  )
}
