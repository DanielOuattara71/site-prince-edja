import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { useSeo } from '@/hooks/useSeo'
import { SITE } from '@/acces/site'
import type { CleTraduction } from '@/i18n/dictionnaire'
import { useLangue } from '@/i18n/contexteLangue'
import { adresseApi } from '@/lib/formulaire'
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
  const [searchParams] = useSearchParams()
  const [etatLien, setEtatLien] = useState<'idle' | 'ok' | 'echec'>('idle')
  const jeton = searchParams.get('jeton')
  const repli = adresseApi() === null
  const appelleApi = vue === 'confirmation' || vue === 'desinscription'

  /* Le lien de l'e-mail porte le jeton : un GET active (ou désinscrit) l'abonné côté maison,
     sans session. Rejouer ne change rien (contrat § 18). Sans API configurée, la page garde
     son texte en flou documenté. */
  useEffect(() => {
    if (repli || !jeton || !appelleApi || etatLien !== 'idle') return
    const chemin = vue === 'confirmation' ? 'confirmation' : 'desinscription'
    fetch(`${adresseApi()}/public/api/v1/newsletter/${chemin}?jeton=${encodeURIComponent(jeton)}`)
      .then((reponse) => setEtatLien(reponse.ok ? 'ok' : 'echec'))
      .catch(() => setEtatLien('echec'))
  }, [repli, jeton, vue, appelleApi, etatLien])

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
          <h1 className="font-display uppercase text-display-lg">{l(VUES[vue].titre)}</h1>
        </div>

        {vue === 'confirmation' && (
          <div className="space-y-6">
            {repli ? (
              <p className="text-body-lg text-ink-700">{t('newsletter.confirme')}</p>
            ) : !jeton ? (
              <p className="text-body-lg text-ink-700">{t('newsletter.lienConfirmationRequis')}</p>
            ) : etatLien === 'idle' ? (
              <p className="text-body-lg text-ink-700">{t('newsletter.verification')}</p>
            ) : etatLien === 'ok' ? (
              <p className="text-body-lg text-ink-700">{t('newsletter.confirmationOk')}</p>
            ) : (
              <p className="text-body-lg text-ink-700">
                {t('newsletter.lienInvalide')}{' '}
                <a href={`mailto:${SITE.email}`} className="font-semibold underline">
                  {SITE.email}
                </a>
              </p>
            )}
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
            {repli ? (
              <p className="text-body-lg text-ink-700">
                {t('newsletter.lienDesinscriptionRequis')}
              </p>
            ) : !jeton ? (
              <p className="text-body-lg text-ink-700">
                {t('newsletter.lienDesinscriptionRequis')}
              </p>
            ) : etatLien === 'idle' ? (
              <p className="text-body-lg text-ink-700">{t('newsletter.verification')}</p>
            ) : etatLien === 'ok' ? (
              <p className="text-body-lg text-ink-700">{t('newsletter.desinscriptionOk')}</p>
            ) : (
              <p className="text-body-lg text-ink-700">
                {t('newsletter.lienInvalide')}{' '}
                <a href={`mailto:${SITE.email}`} className="font-semibold underline">
                  {SITE.email}
                </a>
              </p>
            )}
            <Button to="/" variant="dark">
              {l({ fr: 'Revenir à l’accueil', en: 'Back home' })}
            </Button>
          </div>
        )}
      </Container>
    </Section>
  )
}
