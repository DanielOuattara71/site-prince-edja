import { useState } from 'react'
import { useSeo } from '@/hooks/useSeo'
import { SITE } from '@/data/site'
import type { CleTraduction } from '@/i18n/dictionnaire'
import { useLangue } from '@/i18n/contexteLangue'
import { Section } from '@/components/layout/Section'
import { Container } from '@/components/layout/Container'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Button } from '@/components/ui/Button'

export type VueNewsletter = 'confirmation' | 'preferences' | 'desinscription'

const VUES: Record<VueNewsletter, { numero: string; titre: LibelleVue; description: CleTraduction }> = {
  confirmation: {
    numero: '01',
    titre: { fr: 'Inscription reçue', en: 'Subscription received' },
    description: 'newsletter.confirme',
  },
  preferences: {
    numero: '02',
    titre: { fr: 'Préférences', en: 'Preferences' },
    description: 'newsletter.metaPreferences',
  },
  desinscription: {
    numero: '03',
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
          <Eyebrow num={VUES[vue].numero}>{t('newsletter.titre')}</Eyebrow>
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
              {l({
                fr: 'Les préférences de réception arrivent avec le prestataire d’emailing. Les centres d’intérêt sont déjà prévus dans les données ; rien n’est exposé avant ce choix.',
                en: 'Delivery preferences arrive with the email provider. Interest segments are already prepared in the data; nothing is exposed before that choice.',
              })}
            </p>
            <p className="text-caption text-ink-500">
              {l({ fr: 'À fournir', en: 'To be provided' })} : {l({ fr: 'prestataire et textes', en: 'provider and copy' })}
            </p>
          </div>
        )}

        {vue === 'desinscription' && (
          <div className="space-y-6">
            {fait ? (
              <p className="text-body-lg text-ink-700">
                {l({
                  fr: 'Demande enregistrée. Elle sera effective une fois le prestataire branché.',
                  en: 'Request recorded. It will take effect once the provider is connected.',
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
