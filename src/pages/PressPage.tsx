import type { PressItem } from '@/types'
import { PRESS } from '@/data/content'
import { useSeo } from '@/hooks/useSeo'
import { Section } from '@/components/layout/Section'
import { Container } from '@/components/layout/Container'
import { Reveal } from '@/components/motion/Reveal'
import { Stagger } from '@/components/motion/Stagger'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface PressCardProps {
  item: PressItem
  index: number
}

function PressCard({ item, index }: PressCardProps) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noreferrer"
      className="group grid grid-cols-[auto_1fr_auto] items-start gap-x-6 gap-y-2 border-t border-sand-200 py-8 transition-colors duration-(--d-base) hover:border-clay-500/70"
    >
      <span aria-hidden className="font-display text-heading-sm text-gold-400">
        {String(index + 1).padStart(2, '0')}
      </span>
      <div className="min-w-0">
        <p className="label-caps text-ink-500">
          {item.source} · {item.date}
        </p>
        <h3 className="mt-2 font-display uppercase text-heading-sm text-ink-900 transition-colors duration-(--d-base) group-hover:text-clay-600 sm:text-heading-md">
          {item.titre}
        </h3>
        <p className="mt-2 max-w-xl text-body text-ink-500">{item.resume}</p>
      </div>
      <ArrowUpRight
        aria-hidden
        className="size-5 -translate-x-1 translate-y-1 text-clay-500 opacity-0 transition-all duration-(--d-base) ease-expo group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
      />
    </a>
  )
}

export default function PressPage() {
  useSeo({
    title: 'Médias & Presse — Prince Edja',
    description:
      'Interviews, portraits et distinctions : TV5MONDE, Fraternité Matin, Ministère du Tourisme, Afrique Magazine et plus.',
  })

  return (
    <Section tone="light" padded={false} className="pt-32 pb-20 lg:pt-44 lg:pb-28">
      <Container>
        <div className="max-w-4xl space-y-6">
          <Eyebrow num="06">Revue de presse</Eyebrow>
          <h1 className="font-display uppercase text-display-lg">
            Médias & presse<span aria-hidden className="text-clay-500">.</span>
          </h1>
          <p className="max-w-2xl text-body-lg text-ink-500">
            Interviews, portraits, distinctions et récits autour du travail de Prince Edja.
          </p>
        </div>

        <div className="mt-16 border-b border-sand-200">
          <Stagger>
            {PRESS.map((item, index) => (
              <PressCard key={item.url} item={item} index={index} />
            ))}
          </Stagger>
        </div>

        <Reveal className="mt-16 flex flex-col items-start justify-between gap-6 rounded-2xl bg-sand-100 p-10 sm:flex-row sm:items-center">
          <div>
            <p className="label-caps text-clay-600">Presse & programmation</p>
            <h2 className="mt-2 font-display uppercase text-heading-md text-ink-900">
              Interviews, festivals et interventions.
            </h2>
          </div>
          <Button href="mailto:contact@ohenetour.com?subject=Demande%20m%C3%A9dia%20-%20Prince%20Edja" variant="dark">
            Contacter l’équipe
          </Button>
        </Reveal>
      </Container>
    </Section>
  )
}
