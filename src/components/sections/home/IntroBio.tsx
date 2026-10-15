import { ArrowUpRight } from 'lucide-react'
import { SITE } from '@/data/site'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { Reveal } from '@/components/motion/Reveal'
import { LazyImage } from '@/components/media/LazyImage'
import { Eyebrow } from '@/components/ui/Eyebrow'

/**
 * Manifeste de la page d'accueil.
 *
 * Le CDC demande trois choses et rien de plus : un texte court sur la mission, un
 * portrait éditorial et une citation. Les chiffres ne vivent plus ici, ils ont leur
 * propre bande (« Preuves ») : les répéter sur le même écran les rendait invisibles.
 */
export function IntroBio() {
  return (
    <Section tone="light">
      <Container>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-5">
            <LazyImage
              src={`${import.meta.env.BASE_URL}images/a-propos/portrait-edja.jpg`}
              alt="Prince Edja, portrait éditorial"
              ratio="4/5"
              className="overflow-hidden rounded-md bg-sand-200"
            />
          </Reveal>

          <div className="space-y-8 lg:col-span-7">
            <Reveal>
              <div className="space-y-6">
                <Eyebrow num="01">Qui suis-je</Eyebrow>
                <blockquote className="border-l-2 border-leaf-600 pl-6 font-quote text-heading-sm italic leading-snug text-ink-900 sm:text-heading-md">
                  {SITE.mission}
                </blockquote>
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <p className="max-w-2xl text-body-lg text-ink-700">{SITE.role}</p>
            </Reveal>

            <Reveal delay={0.16}>
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
            </Reveal>
          </div>
        </div>
      </Container>
    </Section>
  )
}
