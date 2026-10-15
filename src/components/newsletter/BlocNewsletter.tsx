import { useState } from 'react'
import { PROMESSE_NEWSLETTER } from '@/data/newsletter'
import { cn } from '@/lib/cn'
import { useLangue } from '@/i18n/contexteLangue'
import { Reveal } from '@/components/motion/Reveal'
import { SectionHeading } from '@/components/ui/SectionHeading'

interface Props {
  /** Version compacte du pied de page, où la place est comptée. */
  compact?: boolean
  className?: string
}

interface Intention {
  prenom: string
  email: string
  pays: string
}

const CLE_STOCKAGE = 'pe_newsletter_intentions'

/** Les intentions restent locales : le jour d'un prestataire, ce appel est remplacé. */
function consigner(intention: Intention) {
  try {
    const brutes = window.localStorage.getItem(CLE_STOCKAGE)
    const liste: Intention[] = brutes ? JSON.parse(brutes) : []
    liste.push(intention)
    window.localStorage.setItem(CLE_STOCKAGE, JSON.stringify(liste))
  } catch {
    /* Stockage indisponible (navigation privée) : l'inscription n'est pas perdue pour
       l'utilisateur, elle n'est simplement pas conservée côté maison. */
  }
}

/**
 * Bloc d'inscription à la lettre.
 *
 * Champs du CDC : prénom, email, pays, consentement. Le texte de consentement est à
 * fournir par la maison (du juridique ne s'invente pas) : la case est donc là, vérifiée,
 * mais son libellé annonce l'attente.
 */
export function BlocNewsletter({ compact = false, className }: Props) {
  const { t, l } = useLangue()
  const [prenom, setPrenom] = useState('')
  const [email, setEmail] = useState('')
  const [pays, setPays] = useState('')
  const [consentement, setConsentement] = useState(false)
  const [envoye, setEnvoye] = useState(false)

  const valide = prenom.trim() !== '' && email.includes('@') && consentement
  // La variante compacte ne demande qu'un email : exiger `prenom`, qu'elle n'affiche
  // pas, laissait son bouton désactivé pour toujours.
  const valideCompact = email.includes('@')

  if (compact) {
    return (
      <div className={cn('space-y-3', className)}>
        <p className="label-caps text-gold-400">{t('newsletter.titre')}</p>
        <p className="max-w-md text-caption text-cream-100/70">{PROMESSE_NEWSLETTER}</p>
        {/* Le message de confirmation est annoncé : monté avec son texte, il ne
            l'était pas par les lecteurs d'écran. */}
        <div role="status" aria-live="polite">
          {envoye ? (
            <p className="text-caption font-semibold text-cream-100">
              {t('newsletter.confirmeCompact')}
            </p>
          ) : null}
        </div>
        {!envoye && (
          <form
            className="flex flex-wrap gap-2"
            onSubmit={(evenement) => {
              evenement.preventDefault()
              if (!valideCompact) return
              consigner({ prenom, email, pays })
              setEnvoye(true)
            }}
          >
            <input
              type="email"
              required
              value={email}
              onChange={(evenement) => setEmail(evenement.target.value)}
              placeholder={t('newsletter.email')}
              aria-label={t('newsletter.email')}
              className="min-h-11 min-w-40 flex-1 rounded-full border border-cream-100/25 bg-transparent px-4 text-caption text-cream-100 placeholder:text-cream-100/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clay-600"
            />
            <button
              type="submit"
              disabled={!valideCompact}
              className="inline-flex min-h-11 items-center rounded-full bg-cream-100 px-5 text-caption font-semibold text-night-900 transition-opacity duration-(--d-fast) disabled:opacity-50"
            >
              {t('newsletter.cta')}
            </button>
          </form>
        )}
      </div>
    )
  }

  return (
    <Reveal className={className}>
      <div className="rounded-xl border border-sand-200 bg-sand-100 p-8 lg:p-10">
        <SectionHeading
          eyebrow="La lettre du griot"
          title={
            <>
              Recevoir la lettre<span aria-hidden className="text-clay-500">.</span>
            </>
          }
          lead={PROMESSE_NEWSLETTER}
        />

        {envoye ? (
          <p className="mt-8 text-body-lg text-ink-700">{t('newsletter.confirme')}</p>
        ) : (
          <form
            className="mt-8 space-y-5"
            onSubmit={(evenement) => {
              evenement.preventDefault()
              if (!valide) return
              consigner({ prenom, email, pays })
              setEnvoye(true)
            }}
          >
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="block">
                <span className="label-caps text-ink-500">{t('newsletter.prenom')}</span>
                <input
                  type="text"
                  required
                  value={prenom}
                  onChange={(evenement) => setPrenom(evenement.target.value)}
                  className="mt-2 w-full rounded-md border border-sand-200 bg-transparent px-4 py-3 text-body text-ink-900"
                />
              </label>
              <label className="block">
                <span className="label-caps text-ink-500">{t('newsletter.email')}</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(evenement) => setEmail(evenement.target.value)}
                  className="mt-2 w-full rounded-md border border-sand-200 bg-transparent px-4 py-3 text-body text-ink-900"
                />
              </label>
              <label className="block">
                <span className="label-caps text-ink-500">{t('newsletter.pays')}</span>
                <input
                  type="text"
                  value={pays}
                  onChange={(evenement) => setPays(evenement.target.value)}
                  className="mt-2 w-full rounded-md border border-sand-200 bg-transparent px-4 py-3 text-body text-ink-900"
                />
              </label>
            </div>

            <label className="flex items-baseline gap-3 text-caption text-ink-500">
              <input
                type="checkbox"
                required
                checked={consentement}
                onChange={(evenement) => setConsentement(evenement.target.checked)}
                className="mt-0.5 size-4 shrink-0"
              />
              <span>
                {t('newsletter.consentement')}
                <span className="ml-1 text-ink-500">({l({ fr: 'texte à fournir', en: 'text to be provided' })})</span>
              </span>
            </label>

            <button
              type="submit"
              disabled={!valide}
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-night-900 px-6 text-button font-semibold text-cream-100 transition-opacity duration-(--d-fast) hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t('newsletter.cta')}
            </button>
          </form>
        )}
      </div>
    </Reveal>
  )
}
