import { useParams } from 'react-router'
import { ARTICLES } from '@/data/content'
import { useSeo } from '@/hooks/useSeo'
import { Section } from '@/components/layout/Section'
import { Container } from '@/components/layout/Container'
import { Stagger } from '@/components/motion/Stagger'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Button } from '@/components/ui/Button'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { BlocNewsletter } from '@/components/newsletter/BlocNewsletter'
import { useJsonLd } from '@/hooks/useSeo'
import { ArticleCard } from '@/components/cards/ArticleCard'
import { formatDate } from '@/lib/format'

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>()
  const article = ARTICLES.find((item) => item.slug === slug)

  useSeo({
    title: article
      ? `${article.titre} · Journal · Prince Edja`
      : 'Article introuvable · Journal · Prince Edja',
    description: article?.extrait,
    // Les sept articles de ce déploiement sont « à venir » : les indexer promettrait
    // une lecture impossible. La page reste consultable et entrera dans l'index dès
    // que `statut` passera à « publié », sans changer une ligne ici.
    indexable: article?.statut === 'publié',
  })

  useJsonLd(
    article
      ? {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: article.titre,
          description: article.extrait,
          articleSection: article.categorie,
          datePublished: article.date,
          inLanguage: 'fr',
          author: { '@type': 'Person', name: 'Prince Edja' },
        }
      : null,
  )

  const lies = article
    ? ARTICLES.filter(
        (autre) =>
          autre.slug !== article.slug &&
          (autre.categorie === article.categorie ||
            autre.tags.pays?.some((pays) => article.tags.pays?.includes(pays)) ||
            autre.tags.projet === article.tags.projet),
      ).slice(0, 3)
    : []

  if (!article) {
    return (
      <Section tone="light" padded={false} className="pt-32 pb-20 lg:pt-44 lg:pb-28">
        <Container className="space-y-4">
          <h1 className="font-display uppercase text-display-lg">Article introuvable.</h1>
          <Button to="/journal" variant="dark">
            Retour au journal
          </Button>
        </Container>
      </Section>
    )
  }

  return (
    <>
      <Section tone="light" padded={false} className="pt-32 pb-20 lg:pt-44 lg:pb-28">
        <Container className="max-w-3xl space-y-8">
          <Breadcrumb titreFinal={article.titre} />

          <div className="space-y-4">
            <Eyebrow>{article.categorie}</Eyebrow>
            <h1 className="font-display uppercase text-display-lg text-balance">
              {article.titre}
            </h1>
            <p className="text-body-lg text-ink-500">{article.extrait}</p>
            {(article.date || article.lecture) && (
              <p className="text-caption text-ink-500">
                {[
                  article.date ? formatDate(article.date) : null,
                  article.lecture ? `${article.lecture} min de lecture` : null,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            )}
          </div>

          <div className="space-y-2 rounded-xl border border-sand-200 bg-sand-100 p-6">
            <p className="label-caps text-ink-500">Rédaction en cours</p>
            <p className="text-body text-ink-700">
              Cet article n'est pas encore publié. Il rejoindra le journal dès que sa
              rédaction est terminée.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <Button to="/journal" variant="dark">
              Tous les articles
            </Button>
            <Button to="/contact" variant="ghost-dark">
              Être prévenu de la parution
            </Button>
          </div>
        </Container>
      </Section>

      {lies.length > 0 && (
        <Section tone="light" className="bg-sand-150">
          <Container className="space-y-10">
            <div className="space-y-2">
              <Eyebrow num="01">À lire ensuite</Eyebrow>
              <h2 className="font-display uppercase text-display-lg">
                Articles liés<span aria-hidden className="text-clay-500">.</span>
              </h2>
              <p className="text-body text-ink-500">
                Même thème, même pays ou même projet.
              </p>
            </div>
            <Stagger className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {lies.map((autre) => (
                <ArticleCard key={autre.slug} article={autre} />
              ))}
            </Stagger>
          </Container>
        </Section>
      )}

      <BlocNewsletter />
    </>
  )
}
