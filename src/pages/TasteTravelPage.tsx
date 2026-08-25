import { TRAVEL_CITIES, TRAVEL_PARTNERS } from '@/data/content'
import { Section } from '@/components/layout/Section'
import { Container } from '@/components/layout/Container'
import { Reveal } from '@/components/motion/Reveal'
import { Stagger } from '@/components/motion/Stagger'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { CityCard } from '@/components/cards/CityCard'

export default function TasteTravelPage() {
  return (
    <>
      <Section tone="dark" className="pt-36 lg:pt-48">
        <Container className="max-w-4xl space-y-6">
          <Eyebrow num="03" tone="dark">
            Film · Gastronomie · Afrique
          </Eyebrow>
          <h1 className="font-display uppercase text-display-lg">Taste & Travel</h1>
          <Reveal delay={0.1}>
            <blockquote className="border-l-2 border-gold-400 pl-6 font-quote italic leading-snug text-heading-sm text-cream-100 sm:text-heading-md">
              « Le voyage commence à table. »
            </blockquote>
          </Reveal>
          <Reveal delay={0.18}>
            <p className="max-w-2xl text-body-lg text-cream-100/70">
              Un programme de voyage et de gastronomie porté par Prince Edja : hospitalité,
              cuisine, culture urbaine et rencontres humaines entre Abidjan, Dakar et Conakry.
              Une narration premium pour montrer comment les saveurs deviennent une porte
              d’entrée vers les peuples et les territoires.
            </p>
          </Reveal>
          <Reveal delay={0.24} className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2">
            <span className="label-caps text-gold-400">Avec</span>
            {TRAVEL_PARTNERS.map((partner) => (
              <span key={partner} className="font-display uppercase text-heading-sm text-cream-100/80">
                {partner}
              </span>
            ))}
          </Reveal>
        </Container>
      </Section>

      <Section tone="dark">
        <Container>
          <Stagger className="grid gap-12 sm:grid-cols-3 sm:gap-8">
            {TRAVEL_CITIES.map((city, index) => (
              <CityCard key={city.nom} city={city} index={index} />
            ))}
          </Stagger>

          <div className="mt-24 space-y-8 border-t border-cream-100/15 pt-16 lg:grid lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <Eyebrow tone="dark">L’intention</Eyebrow>
              <div className="mt-6 space-y-1">
                {['Voir', 'Goûter', 'Comprendre'].map((word, index) => (
                  <Reveal key={word} delay={index * 0.1}>
                    <p className="font-display uppercase text-display-lg">
                      {word}
                      <span aria-hidden className={index === 2 ? 'text-clay-500' : 'text-gold-400'}>
                        .
                      </span>
                    </p>
                  </Reveal>
                ))}
              </div>
            </div>
            <Reveal delay={0.15} className="self-end lg:col-span-7">
              <p className="max-w-xl text-body-lg text-cream-100/70">
                Un film conçu pour voyager sur les écrans, dans les festivals, au sein des hôtels
                et auprès de tous ceux qui veulent découvrir une Afrique contemporaine et
                désirable.
              </p>
            </Reveal>
          </div>
        </Container>
      </Section>
    </>
  )
}
