import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { useLocation } from 'react-router'
import { AnimatePresence, motion } from 'motion/react'
import { X } from 'lucide-react'
import { PROMESSE_NEWSLETTER } from '@/acces/site'
import { Button } from '@/components/ui/Button'
import { SectionHeading } from '@/components/ui/SectionHeading'
import {
  estInscrit,
  emailValide,
  consignerIntention,
  marquerInscrit,
  VERSION_CONSENTEMENT,
} from '@/lib/newsletter'
import { adresseApi, envoyerNewsletter } from '@/lib/formulaire'
import { useLangue } from '@/i18n/contexteLangue'
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll'
import { usePiegeFocus } from '@/hooks/usePiegeFocus'
import { DUR, EASE_EXPO } from '@/lib/motion'

/**
 * Fenêtre d'inscription à la lettre du Griot.
 *
 * Déclenchée une fois, après environ 20 s de navigation, sur les pages de
 * contenu. Le verrou de fermeture est posé en localStorage (30 j) : le visiteur
 * qui ferme ne la revoira pas avant. Un marqueur d'inscription existant ferme le
 * cycle : jamais de seconde sollicitation après acceptation.
 *
 * Accessibilité et ergonomie : fermeture Échap / bouton / clic extérieur, focus
 * amarré à l'ouverture puis rendu à la fermeture, bloque le scroll pendant
 * l'ouverture, respire la réduction de mouvement. Altitude z-80 (étage modales,
 * échelle maison).
 */

const CLE_MODAL_VERROU = 'pe_newsletter_modal_verrou'
const DUR_MODALE_PRESENCE = 20
const DUR_MODALE_FERME = 30 * 24 * 60 * 60 * 1000

/** Pages de lecture où une fenêtre d'inscription est pertinente : lecture
 *  longue, engagement fort. Les autres (accueil, boutique, contact, légales,
 *  admin, formulaire) portent déjà leur propre point de collecte actif. */
function pageDeLecture(pathname: string): boolean {
  return (
    pathname.startsWith('/journal') ||
    pathname.startsWith('/histoires') ||
    pathname.startsWith('/xplore') ||
    pathname.startsWith('/taste-and-travel') ||
    pathname.startsWith('/destinations')
  )
}

type Statut = 'idle' | 'erreur' | 'invalide' | 'existe' | 'succes' | 'consentement'

export function FenetreNewsletter() {
  const { t, langue } = useLangue()
  const { pathname } = useLocation()
  const [ouverte, setOuverte] = useState(false)
  const [email, setEmail] = useState('')
  const [prenom, setPrenom] = useState('')
  const [pays, setPays] = useState('')
  const [consentement, setConsentement] = useState(false)
  const [statut, setStatut] = useState<Statut>('idle')
  const boutonFermer = useRef<HTMLButtonElement>(null)
  const surface = usePiegeFocus<HTMLDivElement>(ouverte)

  const fermer = useCallback(() => {
    setOuverte(false)
    try {
      window.localStorage.setItem(CLE_MODAL_VERROU, String(Date.now() + DUR_MODALE_FERME))
    } catch {
      /* Stockage indisponible : la modale ne se re-fermera pas avant expiration. */
    }
  }, [])

  // Une fois, après ~20 s, hors des fenêtres déjà couvertes par un point de
  // collecte actif (abonné connu, verrou de fermeture, autre fenêtre ouverte).
  // Le minuteur repart à zéro à chaque changement de route : une page de lecture
  // repousse l'échéance, une autre ne la relance pas.
  useEffect(() => {
    if (!pageDeLecture(pathname)) return
    let verrou: number = 0
    let marque: string | null = null
    try {
      verrou = Number(window.localStorage.getItem(CLE_MODAL_VERROU) ?? 0)
      marque = window.localStorage.getItem('pe_newsletter_abonnes')
    } catch {
      /* Stockage indisponible : pas de verrou lisible, on retombe sur une fenêtre possible. */
    }
    const autorise = !verrou || Date.now() > verrou + DUR_MODALE_FERME
    if (!autorise || marque) return

    // Vérifié à l'échéance, page rendue : une page qui porte déjà un bloc d'inscription
    // plein (`data-bloc-newsletter`) ne reçoit pas une troisième sollicitation.
    const minute = window.setTimeout(() => {
      if (document.querySelector('[data-bloc-newsletter]')) return
      setOuverte(true)
    }, DUR_MODALE_PRESENCE * 1000)
    return () => window.clearTimeout(minute)
  }, [pathname])

  // Fermeture au clavier. Le verrou de focus et le verrou de scroll sont posés par
  // les hooks dédiés ; celui-ci ne fait que l'Échap.
  useEffect(() => {
    if (!ouverte) return
    const touche = (evenement: KeyboardEvent) => {
      if (evenement.key === 'Escape') fermer()
    }
    window.addEventListener('keydown', touche)
    return () => window.removeEventListener('keydown', touche)
  }, [ouverte, fermer])

  useLockBodyScroll(ouverte)

  const inscription = async (evenement: FormEvent<HTMLFormElement>) => {
    evenement.preventDefault()
    if (!emailValide(email)) {
      setStatut('invalide')
      return
    }
    if (estInscrit(email)) {
      setStatut('existe')
      return
    }
    if (!consentement) {
      setStatut('consentement')
      return
    }
    const consentementAccepte = {
      date: new Date().toISOString(),
      version: VERSION_CONSENTEMENT,
      source: pathname,
    }
    const intention = { email, prenom, pays, consentement: consentementAccepte }
    if (adresseApi() === null) {
      // Sans API (REPLI documenté) : l'intention reste côté maison, en flou.
      consignerIntention(intention)
      marquerInscrit(intention)
      setStatut('succes')
      return
    }
    const ok = await envoyerNewsletter(intention, t('newsletter.consentement'), pathname, langue)
    if (ok) {
      // La maison écrit et confirme par e-mail ; le marqueur local évite toute re-sollicitation.
      marquerInscrit(intention)
      setStatut('succes')
    } else {
      setStatut('erreur')
    }
  }

  return (
    <AnimatePresence>
      {ouverte ? (
        <motion.div
          key="fenetre-newsletter"
          ref={surface}
          role="dialog"
          aria-modal="true"
          aria-label={t('newsletter.titre')}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-night-900/70 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: EASE_EXPO }}
          onClick={(evenement) => {
            if (evenement.target === evenement.currentTarget) fermer()
          }}
        >
          <motion.div
            className="relative w-full max-w-md rounded-xl bg-sand-100 p-6 text-ink-900 sm:p-8"
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ duration: DUR.base, ease: EASE_EXPO }}
          >
            <button
              ref={boutonFermer}
              type="button"
              onClick={fermer}
              aria-label={t('newsletter.fermer')}
              className="absolute right-4 top-4 flex size-11 cursor-pointer items-center justify-center rounded-full text-ink-700 transition-colors duration-(--d-fast) hover:bg-sand-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clay-600"
            >
              <X aria-hidden className="size-6" />
            </button>

            {statut === 'succes' ? (
              <div className="space-y-6">
                <SectionHeading
                  eyebrow={t('newsletter.titre')}
                  title={
                    <>
                      {t('newsletter.titreLongue')}
                      <span aria-hidden className="text-clay-500">
                        .
                      </span>
                    </>
                  }
                />
                <p className="text-body-lg text-ink-700">{t('newsletter.confirme')}</p>
                <Button variant="dark" magnetic={false} onClick={fermer}>
                  {t('newsletter.retourAccueil')}
                </Button>
              </div>
            ) : (
              <form className="space-y-5" onSubmit={(evenement) => void inscription(evenement)}>
                <div className="space-y-3">
                  <p className="label-caps text-clay-600">{t('newsletter.titre')}</p>
                  <p className="text-body text-ink-700">{PROMESSE_NEWSLETTER}</p>
                </div>
                <div className="space-y-4">
                  <label className="block">
                    <span className="label-caps text-ink-500">{t('newsletter.prenom')}</span>
                    <input
                      type="text"
                      required
                      value={prenom}
                      onChange={(evenement) => {
                        setPrenom(evenement.target.value)
                        setStatut('idle')
                      }}
                      placeholder={t('newsletter.prenom')}
                      aria-label={t('newsletter.prenom')}
                      className="mt-2 w-full rounded-md border border-sand-200 bg-transparent px-4 py-3 text-body text-ink-900"
                    />
                  </label>
                  <label className="block">
                    <span className="label-caps text-ink-500">{t('newsletter.email')}</span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(evenement) => {
                        setEmail(evenement.target.value)
                        setStatut('idle')
                      }}
                      placeholder={t('newsletter.email')}
                      aria-label={t('newsletter.email')}
                      className="mt-2 w-full rounded-md border border-sand-200 bg-transparent px-4 py-3 text-body text-ink-900"
                    />
                  </label>
                  <label className="block">
                    <span className="label-caps text-ink-500">{t('newsletter.pays')}</span>
                    <input
                      type="text"
                      value={pays}
                      onChange={(evenement) => setPays(evenement.target.value)}
                      placeholder={t('newsletter.pays')}
                      aria-label={t('newsletter.pays')}
                      className="mt-2 w-full rounded-md border border-sand-200 bg-transparent px-4 py-3 text-body text-ink-900"
                    />
                  </label>
                  <label className="flex items-baseline gap-3 text-caption text-ink-500">
                    <input
                      type="checkbox"
                      required
                      checked={consentement}
                      onChange={(evenement) => setConsentement(evenement.target.checked)}
                      className="mt-0.5 size-4 shrink-0"
                    />
                    <span>{t('newsletter.consentement')}</span>
                  </label>
                  {statut === 'invalide' ? (
                    <p role="alert" className="text-caption font-semibold text-clay-700">
                      {t('newsletter.emailInvalide')}
                    </p>
                  ) : null}
                  {statut === 'existe' ? (
                    <p role="alert" className="text-caption font-semibold text-ink-500">
                      {t('newsletter.dejaInscrit')}
                    </p>
                  ) : null}
                  {statut === 'consentement' ? (
                    <p role="alert" className="text-caption font-semibold text-clay-700">
                      {t('newsletter.consentementRequis')}
                    </p>
                  ) : null}
                  {statut === 'erreur' ? (
                    <p role="alert" className="text-caption font-semibold text-clay-700">
                      {t('newsletter.inscriptionEchoue')}
                    </p>
                  ) : null}
                </div>
                <Button type="submit" magnetic={false}>
                  {t('newsletter.cta')}
                </Button>
              </form>
            )}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
