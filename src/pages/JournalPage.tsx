import { useState } from 'react'
import { ARTICLES, CATEGORIES_JOURNAL } from '@/data/content'
import { cn } from '@/lib/cn'
import { useSeo } from '@/hooks/useSeo'
import { Section } from '@/components/layout/Section'
import { Container } from '@/components/layout/Container'
import { Reveal } from '@/components/motion/Reveal'
import { Stagger } from '@/components/motion/Stagger'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { ArticleCard } from '@/components/cards/ArticleCard'
import { BlocNewsletter } from '@/components/newsletter/BlocNewsletter'

export default function JournalPage() {
  useSeo({
    title: 'Journal · Idées & récits',
    description:
      'Tourisme, culture, nation branding, hospitalité et mémoires africaines : le journal de Prince Edja.',
  })

  const [filtre, setFiltre] = useState<string | null>(null)

  const [featured] = ARTICLES
  // La une est filtrée avec les autres. L'exclure de la liste affichait la carte
  // « à la une » d'une catégorie en même temps que « aucun article dans cette
  // catégorie » — la page se contredisait elle-même. Sans filtre, la grille reprend
  // la liste privée de cette une, sinon elle s'afficherait deux fois.
  const visibles = filtre
    ? ARTICLES.filter((article) => article.categorie === filtre)
    : ARTICLES.slice(1)

  return (
    <>
      <Section tone="light" padded={false} className="pt-32 pb-20 lg:pt-44 lg:pb-28">
        <Container>
          <div className="max-w-3xl space-y-6">
            <Eyebrow num="01">Le journal</Eyebrow>
            <h1 className="font-display uppercase text-display-lg">
              Idées & récits<span aria-hidden className="text-clay-500">.</span>
            </h1>
            <p className="max-w-2xl text-body-lg text-ink-500">
              Plus de trente pays. Une seule Afrique. Chaque voyage devient une rencontre, une
              image et une histoire à transmettre.
            </p>
          </div>

          {/* La une ne tient sa place qu'aucun filtre actif : sinon elle doublonne avec
              la grille filtrée. */}
          {!filtre && (
            <Reveal className="mt-20 border-t border-sand-200 pt-14">
              <p className="label-caps mb-8 text-clay-600">À la une</p>
              <ArticleCard article={featured} featured priority />
            </Reveal>
          )}

          <div className="mt-20 border-t border-sand-200 pt-14">
            <div className="mb-10 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setFiltre(null)}
                aria-pressed={filtre === null}
                className={cn(
                  'min-h-11 rounded-full border px-4 text-caption font-semibold transition-colors duration-(--d-fast)',
                  filtre === null
                    ? 'border-night-900 bg-night-900 text-cream-100'
                    : 'border-sand-300 text-ink-700 hover:bg-sand-200',
                )}
              >
                Tous les articles
              </button>
              {CATEGORIES_JOURNAL.map((categorie) => (
                <button
                  key={categorie}
                  type="button"
                  onClick={() => setFiltre(categorie === filtre ? null : categorie)}
                  aria-pressed={filtre === categorie}
                  className={cn(
                    'min-h-11 rounded-full border px-4 text-caption font-semibold transition-colors duration-(--d-fast)',
                    filtre === categorie
                      ? 'border-night-900 bg-night-900 text-cream-100'
                      : 'border-sand-300 text-ink-700 hover:bg-sand-200',
                  )}
                >
                  {categorie}
                </button>
              ))}
            </div>

            <Stagger className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {visibles.map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </Stagger>

            {visibles.length === 0 && (
              <p className="text-body text-ink-500">
                Aucun article dans cette catégorie pour l’instant.
              </p>
            )}
          </div>

        </Container>
      </Section>

      <BlocNewsletter />
    </>
  )
}
