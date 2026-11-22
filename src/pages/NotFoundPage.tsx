import { useSeo } from '@/hooks/useSeo'
import { ENTREES_404 } from '@/acces/site'
import { useLangue } from '@/i18n/contexteLangue'
import { Section } from '@/components/layout/Section'
import { Container } from '@/components/layout/Container'
import { LazyImage } from '@/components/media/LazyImage'
import { img } from '@/lib/images'
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
    <Section
      tone="dark"
      padded={false}
      className="grain relative isolate overflow-hidden"
    >
      {/* Fond photographique : une des photos de sky déjà présentes (sans inventer de nouvelle
          image), un voile obscurci pour que le texte cream/gold reste lisible — comme sur la
          page Histoires, qui utilise ce modèle de fundu. */}
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
        <LazyImage
          src={img('images/hero/contemplation-sur-la-vallee-doree.jpg')}
          alt=""
          className="h-full w-full"
          imgClassName="object-cover transition-[opacity,filter,transform] duration-(--d-reveal) ease-expo"
        />
        <div className="overlay-hero-scrim absolute inset-0" />
      </div>
      <Container className="relative z-10 flex min-h-svh flex-col items-center justify-center gap-8 text-center">
        <div className="space-y-4">
          <h1 className="font-display uppercase text-display-xl text-gold-400">
            404
            <span aria-hidden className="text-clay-500">
              .
            </span>
          </h1>
          <p className="mx-auto max-w-md text-body-lg text-cream-100/70">{t('p404.texte')}</p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {ENTREES_404.map((entree) => (
            <Button key={entree.to} to={entree.to} variant="ghost-dark" magnetic={false}>
              {l(entree.libelle)}
            </Button>
          ))}
        </div>

        {/* La section entière est `tone="dark"` : la recherche doit être en ton sombre,
            sinon son encre se pose sur la nuit et disparaît. */}
        <RechercheGlobale tone="sombre" />

        <Button to="/" variant="primary">
          {t('p404.ou')}
        </Button>
      </Container>
    </Section>
  )
}
