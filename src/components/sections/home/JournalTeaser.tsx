import { ARTICLES } from '@/data/content'
import { Section } from '@/components/layout/Section'
import { Container } from '@/components/layout/Container'
import { Stagger } from '@/components/motion/Stagger'
import { ArticleCard } from '@/components/cards/ArticleCard'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ArrowLink } from '@/components/ui/ArrowLink'

export function JournalTeaser() {
  return (
    <Section tone="light">
      <Container>
        <div className="mb-14 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading
            eyebrow="Le journal"
            num="05"
            title={
              <>
                Idées & récits<span aria-hidden className="text-clay-500">.</span>
              </>
            }
            lead="Tourisme, culture, nation branding et mémoires africaines — la lettre de route de Prince Edja."
          />
          <ArrowLink to="/journal" className="shrink-0">
            Tous les articles
          </ArrowLink>
        </div>

        <Stagger className="grid gap-10 md:grid-cols-3">
          {ARTICLES.slice(0, 3).map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </Stagger>
      </Container>
    </Section>
  )
}
