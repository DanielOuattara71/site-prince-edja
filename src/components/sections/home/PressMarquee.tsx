import { Link } from 'react-router'
import { PRESS } from '@/data/content'
import { Container } from '@/components/layout/Container'
import { Marquee } from '@/components/motion/Marquee'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Reveal } from '@/components/motion/Reveal'

const SOURCES = [...new Set(PRESS.map((item) => item.source))]

export function PressMarquee() {
  return (
    <section aria-label="Ils parlent de Prince Edja" className="overlay-savane border-y border-sage-300 py-10">
      <Container>
        <Reveal>
          <Eyebrow num="05">Ils en parlent</Eyebrow>
        </Reveal>
      </Container>
      <Link to="/presse" className="mt-8 block" aria-label="Lire la revue de presse complète">
        <Marquee duration={30}>
          {SOURCES.map((source) => (
            <span key={source} className="flex shrink-0 items-center">
              <span className="whitespace-nowrap px-8 font-display uppercase text-heading-sm text-ink-400 transition-colors duration-(--d-fast) hover:text-leaf-600 lg:text-heading-md">
                {source}
              </span>
              <span aria-hidden className="size-1.5 rounded-full bg-leaf-600" />
            </span>
          ))}
        </Marquee>
      </Link>
    </section>
  )
}
