import { ArrowUpRight } from 'lucide-react'
import { SITE } from '@/data/site'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { Reveal } from '@/components/motion/Reveal'
import { Stagger } from '@/components/motion/Stagger'
import { StatItem } from '@/components/ui/StatItem'
import { Eyebrow } from '@/components/ui/Eyebrow'

export function IntroBio() {
  return (
    <Section tone="light">
      <Container>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-5">
            <div className="space-y-8">
              <Eyebrow num="01">Qui suis-je</Eyebrow>
              <blockquote className="border-l-2 border-leaf-600 pl-6 font-quote italic leading-snug text-heading-sm text-ink-900 sm:text-heading-md">
                {SITE.mission}
              </blockquote>
              <a
                href={SITE.linkedin}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-2 text-button font-semibold text-ink-900"
              >
                {SITE.linkedinLabel}
                <ArrowUpRight
                  aria-hidden
                  className="size-4 transition-transform duration-(--d-fast) ease-expo group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </a>
            </div>
          </Reveal>

          <div className="space-y-8 lg:col-span-7">
            {SITE.bio.map((paragraph, index) => (
              <Reveal key={paragraph.slice(0, 24)} delay={index * 0.08}>
                <p className={index === 0 ? 'text-body-lg font-semibold text-ink-900' : 'text-body-lg text-ink-700'}>
                  {paragraph}
                </p>
              </Reveal>
            ))}

            <Stagger className="grid grid-cols-2 gap-x-6 gap-y-10 border-t border-sand-200 pt-10 sm:grid-cols-4">
              {SITE.stats.map((stat) => (
                <StatItem key={stat.label} value={stat.value} suffix={stat.suffix} label={stat.label} />
              ))}
            </Stagger>
          </div>
        </div>
      </Container>
    </Section>
  )
}
