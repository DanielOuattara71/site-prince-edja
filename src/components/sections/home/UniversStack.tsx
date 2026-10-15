import { UNIVERS } from '@/data/content'
import { cn } from '@/lib/cn'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ArrowLink } from '@/components/ui/ArrowLink'

const HEADER_OFFSET = 96
const STACK_STEP = 14

export function UniversStack() {
  const lastIndex = UNIVERS.length - 1

  return (
    <Section tone="light">
      <Container>
        <SectionHeading
          eyebrow="Les six piliers"
          num="04"
          title={
            <>
              Raconter. Explorer.
              <br />
              Faire rayonner<span aria-hidden className="text-clay-500">.</span>
            </>
          }
          lead="Six manières de servir le récit africain, du terrain à la scène."
        />

        <div className="mt-16">
          {UNIVERS.map((univers, index) => {
            const isLast = index === lastIndex
            return (
              <article
                key={univers.numero}
                style={{ top: `${HEADER_OFFSET + index * STACK_STEP}px` }}
                className={cn(
                  'sticky mb-6 grid gap-4 rounded-xl border p-8 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:gap-8 sm:p-10',
                  isLast
                    ? 'grain overlay-forest border-forest-900 text-cream-100'
                    : 'border-sand-200 bg-sand-100 text-ink-900',
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    'font-display text-heading-md',
                    isLast ? 'text-gold-400' : 'text-clay-500',
                  )}
                >
                  {univers.numero}
                </span>
                <div>
                  <h3 className="font-display uppercase text-heading-sm sm:text-heading-md">
                    {univers.nom}
                  </h3>
                  <p
                    className={cn(
                      'mt-2 max-w-xl text-body',
                      isLast ? 'text-cream-100/70' : 'text-ink-500',
                    )}
                  >
                    {univers.pitch}
                  </p>
                </div>
                <ArrowLink
                  to={univers.to}
                  tone={isLast ? 'light' : 'dark'}
                  className="justify-self-start sm:justify-self-end"
                >
                  Découvrir
                </ArrowLink>
              </article>
            )
          })}
        </div>
      </Container>
    </Section>
  )
}
