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
      <Section tone="light" padded={false} className="pt-32 pb-20 lg:pt-44 lg:pb-28">
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
            <div className="relative overflow-hidden rounded-2xl bg-night-900 px-8 py-14 text-center text-cream-100 sm:px-12">
              <div
                aria-hidden
                className="absolute inset-0 opacity-100"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Crect width='120' height='120' fill='%2314100B'/%3E%3Cg fill='none' stroke='%23d9a441' stroke-width='1.6' opacity='0.95'%3E%3Cpath d='M60 10 L74 24 L60 38 L46 24 Z'/%3E%3Cpath d='M60 82 L74 96 L60 110 L46 96 Z'/%3E%3Cpath d='M10 60 L24 74 L38 60 L24 46 Z'/%3E%3Cpath d='M82 60 L96 74 L110 60 L96 46 Z'/%3E%3C/g%3E%3Cg fill='none' stroke='%23c96f2e' stroke-width='1.4' opacity='0.85'%3E%3Cpath d='M30 30 L42 42 M42 30 L30 42 M78 30 L90 42 M90 30 L78 42 M30 78 L42 90 M42 78 L30 90 M78 78 L90 90 M90 78 L78 90'/%3E%3C/g%3E%3Cg fill='%23d9a441' opacity='0.9'%3E%3Ccircle cx='60' cy='60' r='6'/%3E%3Ccircle cx='24' cy='24' r='1.8'/%3E%3Ccircle cx='96' cy='24' r='1.8'/%3E%3Ccircle cx='24' cy='96' r='1.8'/%3E%3Ccircle cx='96' cy='96' r='1.8'/%3E%3C/g%3E%3Cg fill='%23b5c2a8' opacity='0.85'%3E%3Cpath d='M60 42 L66 54 L54 54 Z'/%3E%3Cpath d='M60 78 L54 66 L66 66 Z'/%3E%3C/g%3E%3C/svg%3E")`,
                  backgroundSize: '120px 120px',
                  backgroundRepeat: 'repeat',
                }}
              />
              <div aria-hidden className="absolute inset-0 bg-night-900/30" />
              <div className="relative z-10">
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
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  )
}
