import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { KeyboardEvent } from 'react'
import { useNavigate } from 'react-router'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Search, X } from 'lucide-react'
import { useLangue } from '@/i18n/contexteLangue'
import { avecPluriel } from '@/i18n/dictionnaire'
import type { CleTraduction } from '@/i18n/dictionnaire'
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll'
import { usePiegeFocus } from '@/hooks/usePiegeFocus'
import { DUR, EASE_EXPO } from '@/lib/motion'
import { cn } from '@/lib/cn'
import { aplati, rechercher } from '@/lib/recherche'
import type { Resultat, TypeResultat } from '@/lib/recherche'

interface Props {
  ouvert: boolean
  onClose: () => void
}

const LIBELLE_TYPE: Record<TypeResultat, CleTraduction> = {
  film: 'type.film',
  destination: 'type.destination',
  objet: 'type.objet',
  article: 'type.article',
}

/**
 * Panneau de recherche : combobox accessible.
 *
 * Le rôle `combobox` n'est pas décoratif : il annonce à un lecteur d'écran que la
 * liste sous le champ est une proposition, et `aria-activedescendant` permet de
 * surligner une option **sans lui donner le focus**. Sinon le focus quitterait le
 * champ à chaque flèche et la frappe deviendrait impossible.
 */
export default function PanneauRecherche({ ouvert, onClose }: Props) {
  const [requete, setRequete] = useState('')
  const [indexActif, setIndexActif] = useState(0)
  const champ = useRef<HTMLInputElement>(null)
  const surface = usePiegeFocus<HTMLDivElement>(ouvert)
  const navigate = useNavigate()
  const { t } = useLangue()
  const reduit = useReducedMotion()

  const groupes = useMemo(() => rechercher(requete), [requete])
  const plats = useMemo(() => aplati(groupes), [groupes])
  const total = plats.length

  useLockBodyScroll(ouvert)

  useEffect(() => {
    if (!ouvert) return
    // Un petit décalage : l'élément vient d'être monté, le focus immédiat peut être
    // volé par le navigateur qui rend le bouton déclencheur.
    const minuteur = window.setTimeout(() => champ.current?.focus(), 20)
    return () => window.clearTimeout(minuteur)
  }, [ouvert])

  // Remettre la surbrillance sur la première option quand la requête change. Fait
  // pendant le rendu : un effet afficherait d'abord une ancienne sélection sur les
  // nouveaux résultats.
  const [derniereRequete, setDerniereRequete] = useState(requete)
  if (derniereRequete !== requete) {
    setDerniereRequete(requete)
    setIndexActif(0)
  }

  function aller(resultat: Resultat) {
    navigate(resultat.to)
    onClose()
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      event.preventDefault()
      onClose()
      return
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setIndexActif((i) => (total === 0 ? 0 : (i + 1) % total))
      return
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setIndexActif((i) => (total === 0 ? 0 : (i - 1 + total) % total))
      return
    }
    if (event.key === 'Enter') {
      const cible = plats[indexActif]
      if (cible) {
        event.preventDefault()
        aller(cible)
      }
    }
  }

  const idChamp = useId()
  const idListe = useId()

  return createPortal(
    <AnimatePresence>
      {ouvert && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-start justify-center bg-night-900/80 p-4 pt-[10vh] backdrop-blur-sm sm:pt-[14vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: DUR.fast, ease: EASE_EXPO }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose()
          }}
        >
            <motion.div
            ref={surface}
            role="dialog"
            aria-modal="true"
            aria-label={t('recherche.titre')}
            initial={reduit ? false : { opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: DUR.base, ease: EASE_EXPO }}
            className="grain w-full max-w-2xl overflow-hidden rounded-xl bg-night-900 text-cream-100 border border-cream-100/25"
          >
            <div className="flex items-center gap-3 border-b border-cream-100/25 px-5 py-4">
              <Search aria-hidden className="size-5 shrink-0 text-gold-400" />
              <input
                ref={champ}
                id={idChamp}
                type="text"
                value={requete}
                onChange={(event) => setRequete(event.target.value)}
                onKeyDown={onKeyDown}
                role="combobox"
                aria-expanded={total > 0}
                aria-controls={idListe}
                aria-autocomplete="list"
                aria-activedescendant={plats[indexActif] ? `${idChamp}-opt-${indexActif}` : undefined}
                aria-describedby={`${idChamp}-aide`}
                placeholder={t('recherche.champ')}
                className="min-h-11 w-full bg-transparent text-body-lg placeholder:text-cream-100/40 focus:outline-none"
              />
              <button
                type="button"
                onClick={onClose}
                aria-label={t('recherche.fermer')}
                className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-cream-100/25 transition-colors hover:bg-cream-100 hover:text-ink-900"
              >
                <X aria-hidden className="size-4" />
              </button>
            </div>

            <p id={`${idChamp}-aide`} className="sr-only">
              {t('recherche.indication')}
            </p>

            <div className="max-h-[55vh] overflow-y-auto px-2 py-3">
              {requete.trim() === '' ? (
                <p className="px-4 py-8 text-center text-body text-cream-100/60">
                  {t('recherche.vide')}
                </p>
              ) : total === 0 ? (
                <p className="px-4 py-8 text-center text-body text-cream-100/60">
                  {t('recherche.aucunResultat')}
                </p>
              ) : (
                <>
                  <p aria-live="polite" className="sr-only">
                    {avecPluriel(
                      total,
                      t('recherche.resultatUn'),
                      t('recherche.resultatsPlusieurs'),
                    )}
                  </p>
                  <div role="listbox" id={idListe} aria-label={t('recherche.titre')}>
                    {groupes.map((groupe) => {
                      const idGroupe = `${idChamp}-grp-${groupe.type}`
                      return (
                        <div key={groupe.type} role="group" aria-labelledby={idGroupe}>
                          <p
                            id={idGroupe}
                            className="label-caps px-4 pb-2 pt-4 text-gold-400"
                          >
                            {t(LIBELLE_TYPE[groupe.type])}
                          </p>
                          {groupe.resultats.map((resultat) => {
                            const position = plats.indexOf(resultat)
                            const actif = position === indexActif
                            return (
                              <button
                                key={resultat.id}
                                type="button"
                                role="option"
                                id={`${idChamp}-opt-${position}`}
                                aria-selected={actif}
                                onClick={() => aller(resultat)}
                                onMouseMove={() => setIndexActif(position)}
                                className={cn(
                                  'flex w-full min-h-11 items-baseline gap-4 rounded-md px-4 py-3 text-left transition-colors',
                                  actif ? 'bg-cream-100/10' : 'hover:bg-cream-100/5',
                                )}
                              >
                                <span className="min-w-0 flex-1">
                                  <span className="block truncate text-button font-semibold">
                                    {resultat.titre}
                                  </span>
                                  <span className="mt-0.5 line-clamp-1 block text-caption text-cream-100/55">
                                    {resultat.resume}
                                  </span>
                                </span>
                                {resultat.aVenir && (
                                  <span className="label-caps shrink-0 rounded-full bg-clay-600/20 px-2 py-1 text-clay-500">
                                    {t('recherche.aVenir')}
                                  </span>
                                )}
                              </button>
                            )
                          })}
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </div>

            <p className="border-t border-cream-100/10 px-5 py-3 text-caption text-cream-100/40">
              {t('recherche.indication')}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
