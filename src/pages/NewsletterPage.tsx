import { useState } from 'react'
import { useSeo } from '@/hooks/useSeo'
import { SITE } from '@/acces/site'
import type { CleTraduction } from '@/i18n/dictionnaire'
import { useLangue } from '@/i18n/contexteLangue'
import { Section } from '@/components/layout/Section'
import { Container } from '@/components/layout/Container'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Button } from '@/components/ui/Button'

export type VueNewsletter = 'confirmation' | 'preferences' | 'desinscription'

const VUES: Record<VueNewsletter, { titre: LibelleVue; description: CleTraduction }> = {
  confirmation: {
    titre: { fr: 'Inscription reçue', en: 'Subscription received' },
    description: 'newsletter.confirme',
  },
  preferences: {
    titre: { fr: 'Préférences', en: 'Preferences' },
    description: 'newsletter.metaPreferences',
  },
  desinscription: {
    titre: { fr: 'Désinscription', en: 'Unsubscribe' },
    description: 'newsletter.metaDesinscription',
  },
}

type LibelleVue = { fr: string; en: string }

/**
 * Les trois pages rattachées à la lettre.
 *
 * Le CDC demande confirmation, préférences et désinscription. Aucun prestataire
 * d'emailing n'est choisi : chaque page existe, fait ce qu'elle peut faire sans lui, et
 * annonce ce qui reste à brancher. La segmentation (T-152) est préparée dans les données
 * mais volontairement pas exposée ici.
 */
export default function NewsletterPage({ vue }: { vue: VueNewsletter }) {
  const { t, l } = useLangue()
  const [email, setEmail] = useState('')
  const [fait, setFait] = useState(false)

  useSeo({
    title: `${l(VUES[vue].titre)} · ${t('newsletter.pageTitre')} · ${SITE.name}`,
    // Une description par vue : la même pour les trois donnait à « Préférences » et
    // « Me désinscrire » le texte de confirmation d'inscription.
    description: t(VUES[vue].description),
    indexable: false,
  })

  return (
    <Section tone="light" padded={false} className="pt-32 pb-20 lg:pt-44 lg:pb-28">
      <Container className="max-w-3xl space-y-8">
        <div className="space-y-4">
          <Eyebrow>{t('newsletter.titre')}</Eyebrow>
          <h1 className="font-display uppercase text-display-lg">
            {l(VUES[vue].titre)}
          </h1>
        </div>

        {vue === 'confirmation' && (
          <div className="space-y-6">
            <p className="text-body-lg text-ink-700">{t('newsletter.confirme')}</p>
            <Button to="/" variant="dark">
              {l({ fr: 'Revenir à l’accueil', en: 'Back home' })}
            </Button>
          </div>
        )}

        {vue === 'preferences' && (
          <div className="space-y-6">
            <p className="text-body-lg text-ink-700">
              {/* Texte public : l'ancienne version parlait de prestataire et de données,
                  et finissait sur « À fournir » (texte d'atelier, décision § 8.5). */}
              {l({
                fr: 'Le choix de vos centres d’intérêt sera bientôt disponible ici.',
                en: 'Choosing your interests will soon be available here.',
              })}
            </p>
          </div>
        )}

        {vue === 'desinscription' && (
          <div className="space-y-6">
            {fait ? (
              <p className="text-body-lg text-ink-700">
                {/* Le formulaire n'enregistre rien tant que l'envoi de la lettre n'est pas
                    branché (mission 3) : « Demande enregistrée » était inexact. */}
                {l({
                  fr: `Aucun envoi n’est encore programmé : vous ne recevrez rien de notre part. Pour toute question sur vos données, écrivez à ${SITE.email}.`,
                  en: `No sending is scheduled yet: you will receive nothing from us. For any question about your data, write to ${SITE.email}.`,
                })}
              </p>
            ) : (
              <form
                className="flex flex-wrap items-end gap-4"
                onSubmit={(evenement) => {
                  evenement.preventDefault()
                  setFait(true)
                }}
              >
                <label className="block">
                  <span className="label-caps text-ink-500">{t('newsletter.email')}</span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(evenement) => setEmail(evenement.target.value)}
                    className="mt-2 w-full min-w-64 rounded-md border border-sand-200 bg-transparent px-4 py-3 text-body text-ink-900"
                  />
                </label>
                <Button type="submit" variant="dark" magnetic={false}>
                  {t('newsletter.desinscription')}
                </Button>
              </form>
            )}
          </div>
        )}
      </Container>
    </Section>
  )
}
