import { useSeo } from '@/hooks/useSeo'
import { ENTREES_404 } from '@/acces/site'
import { useLangue } from '@/i18n/contexteLangue'
import { Section } from '@/components/layout/Section'
import { Container } from '@/components/layout/Container'
import { Button } from '@/components/ui/Button'
import { RechercheGlobale } from '@/components/layout/RechercheGlobale'

/**
 * 404 utile.
 *
 * Une page d'erreur a deux jobs : dire que l'adresse est fausse, et **rendre la main**.
 * Un lien « retour à l'accueil » oblige à recommencer toute la navigation ; trois
 * entrées principales et la recherche laissent repartir du bon endroit.
 */
export default function NotFoundPage() {
  const { t, l } = useLangue()

  useSeo({
    title: 'Page introuvable · Prince Edja',
    description:
      "Cette page n'existe pas ou plus. Retrouvez les histoires, la série X'PLORE et Edja Shop.",
    indexable: false,
  })

  return (
    <Section tone="light" padded={false} className="bg-sand-50">
      <Container className="flex min-h-svh flex-col items-center justify-center gap-8 text-center">
        <div className="space-y-4">
          <h1 className="font-display uppercase text-display-xl text-ink-900">
            404
            <span aria-hidden className="text-clay-600">
              .
            </span>
          </h1>
          <p className="mx-auto max-w-md text-body-lg text-ink-700">{t('p404.texte')}</p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {ENTREES_404.map((entree) => (
            <Button key={entree.to} to={entree.to} variant="ghost-dark" magnetic={false}>
              {l(entree.libelle)}
            </Button>
          ))}
        </div>

        {/* Section claire : la recherche est en ton clair, sinon son encre se pose sur
            l'ivoire et disparaît. */}
        <RechercheGlobale tone="clair" />

        <Button to="/" variant="primary">
          {t('p404.ou')}
        </Button>
      </Container>
    </Section>
  )
}
