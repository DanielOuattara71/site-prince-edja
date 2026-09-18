import { UNIVERSES, countByUnivers, getFeatured } from '@/data/market'
import { useSeo } from '@/hooks/useSeo'
import { Section } from '@/components/layout/Section'
import { Container } from '@/components/layout/Container'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { StatItem } from '@/components/ui/StatItem'
import { Button } from '@/components/ui/Button'
import { Reveal } from '@/components/motion/Reveal'
import { Stagger } from '@/components/motion/Stagger'
import { CategoryGates } from '@/components/market/CategoryGates'
import { ProductCard } from '@/components/market/ProductCard'

const RITUEL_MAISON = [
  { titre: 'Choisir', texte: 'Explorez les univers et la pièce qui parle de vous.' },
  { titre: 'Personnaliser', texte: 'Gravure, coffret, message — la pièce devient vôtre.' },
  { titre: 'Précommander', texte: 'Paiement mobile money, carte ou virement international.' },
  { titre: 'Recevoir', texte: 'Livraison suivie depuis Abidjan, coffret et histoire inclus.' },
]

const FAQ = [
  {
    question: 'Les pièces sont-elles vraiment faites main ?',
    reponse:
      'Oui. Chaque pièce est façonnée, ciselée et polie à la main par des artisans ivoiriens partenaires — pas de moules industriels.',
  },
  {
    question: 'Comment payer depuis l’étranger ?',
    reponse:
      'Mobile money (Orange, MTN, Wave), carte bancaire et virement international. Écrivez-nous pour un lien de paiement sécurisé.',
  },
  {
    question: 'Quels sont les délais de livraison ?',
    reponse:
      'Abidjan sous 48 h, Afrique de l’Ouest sous 5 jours, international sous 10 à 15 jours. Chaque colis est suivi.',
  },
]

export default function MarketplacePage() {
  useSeo({
    title: 'Marketplace — Prince Edja · TRIBE & univers',
    description:
      'La marketplace culturelle de Prince Edja : bijoux TRIBE, textiles PORTÉ, coffrets DON, éditions MÉMOIRE et jeux AWALÉ — faits main en Côte d’Ivoire.',
  })

  const featured = getFeatured(3)

  return (
    <>
      {/* Hero maison — sobre, l'écran le plus neutre du site */}
      <Section tone="light" padded={false} className="pt-32 pb-16 lg:pt-44 lg:pb-24">
        <Container>
          <div className="max-w-4xl space-y-6">
            <Eyebrow num="Boutique">Marketplace culturelle · Édition 2026</Eyebrow>
            <h1 className="font-display uppercase text-display-lg">
              Cinq salles, une maison<span aria-hidden className="text-clay-500">.</span>
            </h1>
            <Reveal delay={0.1}>
              <p className="max-w-2xl text-body-lg text-ink-500">
                Des objets qui parlent, des symboles qui relient. Chaque univers a sa lumière,
                son rythme et ses artisans — tous racontent la Côte d’Ivoire au monde.
              </p>
            </Reveal>
          </div>
          <Stagger className="mt-14 grid grid-cols-2 gap-8 border-t border-sand-200 pt-10 lg:grid-cols-4">
            <StatItem value={countByUnivers('tribe')} suffix="+" label="Pièces TRIBE" />
            <StatItem value={UNIVERSES.length} label="Univers de création" />
            <StatItem value={8} label="Cultures représentées" />
            <StatItem value={100} suffix="%" label="Fait main en Côte d’Ivoire" />
          </Stagger>
        </Container>
      </Section>

      {/* Les 5 portes-arches — sélecteur d'univers */}
      <Section tone="light" padded={false} className="pb-24 lg:pb-32">
        <Container>
          <SectionHeading
            eyebrow="Les univers"
            num="00"
            title="Entrez par la porte qui vous ressemble"
            lead="Chaque salle a son identité visuelle, ses matériaux et ses artisans. La navigation reste la même partout — seule la lumière change."
            className="mb-12"
          />
          <CategoryGates />
        </Container>
      </Section>

      {/* Pièces signatures — cross-univers (TRIBE en production) */}
      <Section tone="dark" className="u-tribe">
        <Container>
          <div className="mb-12 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <SectionHeading
              eyebrow="Pièces signatures"
              num="01"
              tone="dark"
              title="TRIBE — Les Symboles"
              lead="La collection fondatrice : bijoux en bronze, laiton et argent, séries limitées à 12 exemplaires."
            />
            <Button to="/boutique/tribe" variant="ghost-light">
              Visiter l’univers TRIBE
            </Button>
          </div>
          <Stagger className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </Stagger>
        </Container>
      </Section>

      {/* Le rituel maison — réassurance commune */}
      <Section tone="light">
        <Container>
          <SectionHeading eyebrow="Le rituel maison" num="02" title="Comment se passe une précommande" className="mb-12" />
          <Stagger className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {RITUEL_MAISON.map((etape, index) => (
              <div key={etape.titre} className="space-y-3 border-t border-sand-200 pt-6">
                <p className="label-caps tnum text-gold-400">{String(index + 1).padStart(2, '0')}</p>
                <h3 className="font-display uppercase text-heading-sm text-ink-900">{etape.titre}</h3>
                <p className="text-body text-ink-500">{etape.texte}</p>
              </div>
            ))}
          </Stagger>
        </Container>
      </Section>

      {/* FAQ commune */}
      <Section tone="light" padded={false} className="pb-24 lg:pb-32">
        <Container>
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <SectionHeading eyebrow="Questions" num="03" title="Bon à savoir" />
            </div>
            <div className="lg:col-span-8">
              <Stagger className="space-y-4">
                {FAQ.map((item) => (
                  <details key={item.question} className="group rounded-2xl border border-sand-200 bg-sand-100 px-6 py-5">
                    <summary className="cursor-pointer list-none font-display uppercase text-heading-sm text-ink-900 transition-colors group-open:text-clay-600">
                      {item.question}
                    </summary>
                    <p className="mt-3 text-body text-ink-500">{item.reponse}</p>
                  </details>
                ))}
              </Stagger>
            </div>
          </div>
        </Container>
      </Section>

      {/* CTA contact */}
      <Section tone="light" padded={false} className="pb-24 lg:pb-32">
        <Container>
          <Reveal className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-night-900 px-8 py-12 text-cream-100 lg:flex-row lg:items-center">
            <div className="space-y-2">
              <p className="label-caps text-gold-400">Bespoke</p>
              <h2 className="font-display uppercase text-heading-md">
                Une pièce sur mesure pour votre événement ?
              </h2>
              <p className="text-body text-cream-100/70">
                Séries d’entreprise, cadeaux d’hôtes, éditions privées : écrivez-nous.
              </p>
            </div>
            <Button to="/contact" variant="primary">
              Démarrer un projet
            </Button>
          </Reveal>
        </Container>
      </Section>
    </>
  )
}