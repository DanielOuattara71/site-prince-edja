import { EPISODES } from '@/data/content'
import { Container } from '@/components/layout/Container'
import { Reveal } from '@/components/motion/Reveal'
import { PdfCard } from '@/components/ui/PdfCard'

export function GuidesGrid() {
  const guides = EPISODES.filter((episode) => episode.guide)

  return (
    <section aria-label="Guides de voyage téléchargeables" className="section-y bg-sand-100">
      <Container>
        <Reveal className="mb-12 max-w-2xl space-y-5">
          <p className="label-caps text-clay-600">Préparer le voyage</p>
          <h2 className="font-display uppercase text-display-lg text-ink-900">
            Télécharger nos guides<span aria-hidden className="text-clay-500">.</span>
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {guides.map((episode) => (
              <PdfCard key={episode.slug} titre={episode.lieu} href={episode.guide!} />
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
