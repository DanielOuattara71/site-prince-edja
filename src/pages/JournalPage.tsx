import { ARTICLES } from '@/data/content'
import { useSeo } from '@/hooks/useSeo'
import { Section } from '@/components/layout/Section'
import { Container } from '@/components/layout/Container'
import { Reveal } from '@/components/motion/Reveal'
import { Stagger } from '@/components/motion/Stagger'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Button } from '@/components/ui/Button'
import { ArticleCard } from '@/components/cards/ArticleCard'

export default function JournalPage() {
  useSeo({
    title: 'Journal — Idées & récits',
    description:
      'Tourisme, culture, nation branding, hospitalité et mémoires africaines : le journal de Prince Edja.',
  })

  const [featured, ...rest] = ARTICLES

  return (
    <>
      <Section tone="light" className="pt-32 lg:pt-44">
        <Container>
          <div className="max-w-4xl space-y-6">
            <Eyebrow num="05">Le journal</Eyebrow>
            <h1 className="font-display uppercase text-display-lg">
              Idées & récits<span aria-hidden className="text-clay-500">.</span>
            </h1>
            <p className="max-w-2xl text-body-lg text-ink-500">
              Plus de trente pays. Une seule Afrique. Chaque voyage devient une rencontre, une
              image et une histoire à transmettre.
            </p>
          </div>

          <Reveal className="mt-16 border-t border-sand-200 pt-14">
            <p className="label-caps mb-8 text-clay-600">À la une</p>
            <ArticleCard article={featured} featured />
          </Reveal>

          <Stagger className="mt-20 grid gap-x-8 gap-y-14 border-t border-sand-200 pt-14 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </Stagger>

          <Reveal className="mt-24">
            <div className="grain rounded-2xl bg-night-900 px-8 py-14 text-center text-cream-100 sm:px-12">
              <p className="label-caps text-gold-400">La lettre de route</p>
              <h2 className="mx-auto mt-4 max-w-xl font-display uppercase text-display-lg">
                Recevoir les prochains récits
                <span aria-hidden className="text-clay-500">.</span>
              </h2>
              <div className="mt-8 flex justify-center">
                <Button
                  href={`mailto:${'contact@ohenetour.com'}?subject=Inscription%20au%20journal%20de%20Prince%20Edja`}
                  variant="primary"
                >
                  S’inscrire au journal
                </Button>
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  )
}
