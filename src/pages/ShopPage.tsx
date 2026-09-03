import { BIJOUX } from '@/data/content'
import { useSeo } from '@/hooks/useSeo'
import { Section } from '@/components/layout/Section'
import { Container } from '@/components/layout/Container'
import { Reveal } from '@/components/motion/Reveal'
import { Stagger } from '@/components/motion/Stagger'
import { ParallaxImage } from '@/components/media/ParallaxImage'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Button } from '@/components/ui/Button'
import { BijouCard } from '@/components/cards/BijouCard'

const COMING_CATEGORIES = ['Jeux', 'Souvenirs', 'À porter', 'À offrir']

export default function ShopPage() {
  useSeo({
    title: 'Edja Shop — Collection TRIBE',
    description:
      'Des objets qui parlent, des symboles qui relient : bijoux TRIBE façonnés à la main par des artisans ivoiriens.',
  })

  return (
    <>
      <Section tone="light" padded={false} className="pt-32 pb-20 lg:pt-44 lg:pb-28">
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="space-y-6 lg:col-span-6">
              <Eyebrow num="04">Marketplace culturelle · Édition 2026</Eyebrow>
              <h1 className="font-display uppercase text-display-lg">
                Chaque bijou est une histoire
                <span aria-hidden className="text-clay-500">.</span>
              </h1>
              <Reveal delay={0.12}>
                <p className="max-w-xl text-body-lg text-ink-500">
                  Un passeport culturel façonné à la main par des artisans ivoiriens. Bronze,
                  laiton et argent deviennent un langage contemporain inspiré des héritages
                  touareg, akan, dan, yoruba, sénoufo et des royaumes africains.
                </p>
              </Reveal>
            </div>
            <Reveal delay={0.15} className="lg:col-span-5 lg:col-start-8">
              <div className="relative">
                <ParallaxImage
                  src={`${import.meta.env.BASE_URL}images/boutique/hero-tribe.jpg`}
                  alt="Pièce TRIBE façonnée à la main par des artisans ivoiriens"
                  ratio="4/5"
                  range={5}
                  zoomOnHover
                  className="rounded-t-[9rem] rounded-b-2xl"
                />
                <span className="label-caps absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full bg-night-900/85 px-4 py-2 text-cream-100 backdrop-blur-sm">
                  TRIBE · Pièces limitées
                </span>
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>

      <Section tone="light" padded={false} className="pb-24 lg:pb-32">
        <Container>
          <Stagger className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {BIJOUX.map((bijou) => (
              <BijouCard key={bijou.slug} bijou={bijou} />
            ))}
          </Stagger>

          <Reveal className="mt-20 border-t border-sand-200 pt-12">
            <p className="label-caps text-clay-600">Bientôt sur la marketplace</p>
            <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {COMING_CATEGORIES.map((category) => (
                <li
                  key={category}
                  className="label-caps rounded-full border border-sand-200 py-3 text-center text-ink-500"
                >
                  {category}
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
              <p className="max-w-md text-body text-ink-500">
                Fabrication artisanale en Côte d’Ivoire, séries limitées. Précommandes et
                livraison internationale : écrivez-nous.
              </p>
              <Button to="/contact" variant="dark">
                Précommander une pièce
              </Button>
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  )
}
