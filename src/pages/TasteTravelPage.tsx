import { TRAVEL_CITIES, TRAVEL_PARTNERS, TRAVEL_PROGRAMME } from '@/data/content'
import { SITE } from '@/data/site'
import { useSeo } from '@/hooks/useSeo'
import { Section } from '@/components/layout/Section'
import { Container } from '@/components/layout/Container'
import { Reveal } from '@/components/motion/Reveal'
import { Stagger } from '@/components/motion/Stagger'
import { ParallaxImage } from '@/components/media/ParallaxImage'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Tag } from '@/components/ui/Tag'
import { ArrowLink } from '@/components/ui/ArrowLink'
import { Button } from '@/components/ui/Button'
import { CityCard } from '@/components/cards/CityCard'

export default function TasteTravelPage() {
  useSeo({
    title: 'Taste & Travel — Prince Edja',
    description:
      'Trois capitales, trois tables, une Afrique qui se découvre par le goût : Abidjan, Dakar, Conakry. Avec Noom Hotels et Air Côte d’Ivoire.',
  })

  return (
    <>
      <Section tone="dark" container={false} padded={false}>
        <Container className="pt-36 pb-14 lg:pt-48 lg:pb-20">
          <div className="max-w-4xl space-y-6">
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
          </div>
        </Container>

        <div className="relative">
          <ParallaxImage
            src="/images/voyage/bandeau-littoral.png"
            alt="Littoral ouest-africain — escale Taste & Travel"
            ratio="21/9"
            range={8}
            priority
          />
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-night-900/90 to-transparent" />
          <div className="absolute bottom-5 left-5 z-10 flex flex-wrap items-center gap-3 lg:left-10 lg:bottom-8">
            <span className="label-caps text-gold-400">Avec</span>
            {TRAVEL_PARTNERS.map((partner) => (
              <span
                key={partner}
                className="rounded-full bg-night-900/85 px-4 py-2 text-sm font-semibold text-cream-100 backdrop-blur-sm"
              >
                {partner}
              </span>
            ))}
          </div>
        </div>
      </Section>

      <Section tone="dark">
        <Container>
          <Stagger className="grid gap-12 sm:grid-cols-3 sm:gap-8">
            {TRAVEL_CITIES.map((city, index) => (
              <CityCard key={city.nom} city={city} index={index} />
            ))}
          </Stagger>

          <div className="mt-24 grid gap-8 border-t border-cream-100/15 pt-16 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <Eyebrow tone="dark">L’intention</Eyebrow>
              <div className="mt-6 space-y-1">
                {['Voir', 'Goûter', 'Comprendre'].map((word, index) => (
                  <Reveal key={word} delay={index * 0.1}>
                    <p className="font-display uppercase text-display-lg">
                      {word}
                      <span
                        aria-hidden
                        className={index === 2 ? 'text-clay-500' : 'text-gold-400'}
                      >
                        .
                      </span>
                    </p>
                  </Reveal>
                ))}
              </div>
            </div>
            <Reveal delay={0.15} className="self-end lg:col-span-7">
              <div className="space-y-7">
                <p className="max-w-xl text-body-lg text-cream-100/70">
                  Un film conçu pour voyager sur les écrans, dans les festivals, au sein des
                  hôtels et auprès de tous ceux qui veulent découvrir une Afrique contemporaine
                  et désirable.
                </p>
                <div className="flex flex-wrap gap-3">
                  {TRAVEL_PROGRAMME.map((item) => (
                    <Tag key={item} tone="dark">
                      {item}
                    </Tag>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>

          <Reveal className="mt-24">
            <div className="grain flex flex-col items-start justify-between gap-8 rounded-2xl bg-night-800 p-10 text-cream-100 lg:flex-row lg:items-center lg:p-12">
              <div className="max-w-xl space-y-3">
                <p className="label-caps text-gold-400">Diffusion & partenariats</p>
                <h2 className="font-display uppercase text-heading-md">
                  Projeter Taste & Travel
                  <span aria-hidden className="text-clay-500">.</span>
                </h2>
                <p className="text-body text-cream-100/70">
                  Festivals, hôtels, institutions : invitez le film sur votre écran ou associez
                  votre marque à la prochaine saison.
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-start gap-4 sm:flex-row sm:items-center">
                <Button
                  href={`mailto:${SITE.email}?subject=Projection%20Taste%20%26%20Travel`}
                  variant="primary"
                >
                  Projeter le film
                </Button>
                <ArrowLink to="/presse" tone="light">
                  Vu dans la presse
                </ArrowLink>
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  )
}
