import { SITE } from '@/data/site'
import { MILESTONES } from '@/data/content'
import { useSeo } from '@/hooks/useSeo'
import { Section } from '@/components/layout/Section'
import { Container } from '@/components/layout/Container'
import { Reveal } from '@/components/motion/Reveal'
import { Stagger } from '@/components/motion/Stagger'
import { StatItem } from '@/components/ui/StatItem'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Button } from '@/components/ui/Button'

export default function AboutPage() {
  useSeo({
    title: 'À propos — Prince Edja',
    description:
      'Parcours, distinctions et mission de Prince Edja : briser les clichés, préserver la mémoire et faire du tourisme un pont entre les peuples.',
  })

  return (
    <>
      <Section tone="light" className="pt-32 lg:pt-44">
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="space-y-6 lg:col-span-7">
              <Eyebrow num="01">Prince Edja</Eyebrow>
              <h1 className="font-display uppercase text-display-lg">
                Raconter l’Afrique depuis l’Afrique
                <span aria-hidden className="text-clay-500">.</span>
              </h1>
              <p className="max-w-xl text-body-lg text-ink-500">{SITE.role}</p>
              <Button to="/contact" variant="dark">
                Travailler ensemble
              </Button>
            </div>

            <Reveal className="lg:col-span-5" delay={0.15}>
              <blockquote className="border-l-2 border-gold-400 pl-6 font-quote italic leading-snug text-heading-sm text-ink-900 sm:text-heading-md">
                {SITE.mission}
              </blockquote>
            </Reveal>
          </div>

          <Stagger className="mt-20 grid grid-cols-2 gap-x-6 gap-y-10 border-t border-sand-200 pt-12 sm:grid-cols-4">
            {SITE.stats.map((stat) => (
              <StatItem key={stat.label} value={stat.value} suffix={stat.suffix} label={stat.label} />
            ))}
          </Stagger>
        </Container>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Person',
              name: 'Prince Edja',
              alternateName: 'Edja Kouamey Franck Arnaud',
              jobTitle: ['Storyteller', 'Producteur audiovisuel', 'Consultant en marketing touristique'],
              email: `mailto:${SITE.email}`,
              address: { '@type': 'PostalAddress', addressLocality: 'Abidjan', addressCountry: 'CI' },
              sameAs: [SITE.linkedin],
              award: MILESTONES.filter((m) => m.periode >= '2024').map((m) => m.titre),
            }),
          }}
        />
      </Section>

      <Section tone="light">
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="space-y-8 lg:col-span-5">
              <Eyebrow num="02">Le parcours</Eyebrow>
              <Reveal>
                <h2 className="font-display uppercase text-display-lg">
                  Onze ans au service du récit<span aria-hidden className="text-clay-500">.</span>
                </h2>
              </Reveal>
            </div>

            <ol className="relative space-y-12 border-l border-sand-200 pl-8 lg:col-span-7">
              {MILESTONES.map((milestone, index) => (
                <li key={`${milestone.periode}-${milestone.titre}`} className="relative">
                  <span
                    aria-hidden
                    className="absolute -left-[37px] top-1.5 size-2.5 rounded-full bg-clay-500 ring-4 ring-sand-50"
                  />
                  <Reveal delay={index * 0.06}>
                    <p className="label-caps text-clay-600">{milestone.periode}</p>
                    <h3 className="mt-2 font-display uppercase text-heading-sm text-ink-900">
                      {milestone.titre}
                    </h3>
                    <p className="mt-2 max-w-xl text-body text-ink-500">{milestone.description}</p>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>

          <Reveal className="mt-24 border-t border-sand-200 pt-14">
            <blockquote className="mx-auto max-w-3xl text-center font-quote italic text-body-lg text-ink-700 sm:text-heading-sm">
              « Faire voyager les regards. Faire vivre les cultures. Faire grandir la mémoire. »
            </blockquote>
          </Reveal>
        </Container>
      </Section>
    </>
  )
}
