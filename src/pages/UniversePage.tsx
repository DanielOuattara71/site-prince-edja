import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router'
import { motion, useReducedMotion } from 'motion/react'
import type { Variants } from 'motion/react'
import { getProductsByUnivers, getUniversBySlug } from '@/data/market'
import { useSeo } from '@/hooks/useSeo'
import { Section } from '@/components/layout/Section'
import { Stagger } from '@/components/motion/Stagger'
import { Container } from '@/components/layout/Container'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Button } from '@/components/ui/Button'
import { Reveal } from '@/components/motion/Reveal'
import { ParallaxImage } from '@/components/media/ParallaxImage'
import { ProductCard } from '@/components/market/ProductCard'
import { CategoryGates } from '@/components/market/CategoryGates'
import { cn } from '@/lib/cn'
import { EASE_QUART, fadeUp, pageTurn, rippleFold, seedsPlace, spotlightReveal } from '@/lib/motion'
import type { UniversId } from '@/types'

/* Voile d'entrée : marque le passage de porte, une seule fois par entrée */
function GateWipe() {
  const reducedMotion = useReducedMotion()
  const [done, setDone] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setDone(true), 750)
    return () => clearTimeout(timer)
  }, [])

  if (reducedMotion || done) return null
  return (
    <motion.div
      aria-hidden
      initial={{ scaleY: 1 }}
      animate={{ scaleY: 0 }}
      transition={{ duration: 0.6, ease: EASE_QUART }}
      style={{ transformOrigin: 'top' }}
      className="pointer-events-none fixed inset-0 z-[70] bg-(--u-wipe)"
    />
  )
}

/* Mise en page de galerie par univers (grille ≠ même couleur ≠ même rythme) */
const GALLERY_GRID: Record<UniversId, string> = {
  tribe: 'grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3',
  porte: 'grid gap-8 sm:grid-cols-2',
  don: 'grid gap-8 sm:grid-cols-2',
  memoire: 'grid gap-8 sm:grid-cols-2 lg:grid-cols-3',
  awale: 'grid gap-6 grid-cols-2 lg:grid-cols-4',
}

const UNIVERS_VARIANTS: Record<UniversId, Variants> = {
  tribe: spotlightReveal,
  porte: rippleFold,
  don: fadeUp,
  memoire: pageTurn,
  awale: seedsPlace,
}

type Tri = 'nouveautes' | 'prix-asc' | 'prix-desc'

export default function UniversePage() {
  const { univers: universSlug } = useParams()
  const univers = getUniversBySlug(universSlug)
  const products = useMemo(() => (univers ? getProductsByUnivers(univers.id) : []), [univers])
  const [filtre, setFiltre] = useState('Tous')
  const [tri, setTri] = useState<Tri>('nouveautes')

  useSeo({
    title: univers ? `${univers.nom} — ${univers.sousTitre} · Marketplace` : 'Univers — Marketplace',
    description: univers?.concept,
  })

  /* Le filtre se réinitialise quand on change d'univers */
  useEffect(() => {
    setFiltre('Tous')
  }, [universSlug])

  const facettes = useMemo(
    () => [...new Set(products.map((product) => product.culture))],
    [products],
  )

  const shown = useMemo(() => {
    const list = filtre === 'Tous' ? [...products] : products.filter((p) => p.culture === filtre)
    if (tri === 'prix-asc') list.sort((a, b) => a.prix - b.prix)
    if (tri === 'prix-desc') list.sort((a, b) => b.prix - a.prix)
    return list
  }, [products, filtre, tri])

  if (!univers) {
    return (
      <Section tone="light" className="pt-32 lg:pt-44">
        <Container className="space-y-6 text-center">
          <h1 className="font-display uppercase text-display-lg">Univers introuvable.</h1>
          <p className="text-body text-ink-500">Cette salle n’existe pas encore dans la maison.</p>
          <Button to="/boutique" variant="dark">
            Retour au Carrefour
          </Button>
        </Container>
      </Section>
    )
  }

  const variantes = UNIVERS_VARIANTS[univers.id]

  return (
    <div className={cn(univers.tokenClass, 'bg-(--u-bg) text-(--u-text)')}>
      <GateWipe />

      {/* Hero d'univers */}
      <Container className="pt-32 pb-16 lg:pt-44 lg:pb-24">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-7">
            <Eyebrow num={univers.num} tone="dark">
              Univers · {univers.pitch}
            </Eyebrow>
            <h1 className="font-display uppercase text-display-lg">
              {univers.nom}
              <span aria-hidden className="text-(--u-accent)">
                .
              </span>
            </h1>
            <p className="text-body-lg text-(--u-text-muted)">{univers.concept}</p>
          </div>
          <Reveal className="lg:col-span-5">
            <ParallaxImage
              src={univers.image}
              alt={univers.nom}
              ratio="4/5"
              range={4}
              className="rounded-(--u-radius-card)"
            />
          </Reveal>
        </div>
      </Container>

      {/* Sous-nav d'univers — étages */}
      <nav
        aria-label={`Navigation ${univers.nom}`}
        className="sticky top-16 z-30 border-y border-(--u-border) bg-(--u-bg) lg:top-20"
      >
        <Container className="flex items-center gap-2 overflow-x-auto py-3">
          {[
            { href: '#galerie', label: 'Galerie' },
            { href: '#editorial', label: 'Éditorial' },
            { href: '#catalogue', label: 'Catalogue' },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="label-caps shrink-0 rounded-full border border-(--u-border) px-4 py-2 text-(--u-text-muted) transition-colors duration-(--d-fast) hover:border-(--u-accent) hover:bg-(--u-accent) hover:text-(--u-on-accent)"
            >
              {item.label}
            </a>
          ))}
        </Container>
      </nav>

      {/* Galerie principale — geste visuel de l'univers */}
      <div id="galerie" className="scroll-mt-32">
      <Container className="py-20 lg:py-28">
        {products.length > 0 ? (
          <div className={cn('grid', GALLERY_GRID[univers.id])}>
            {shown.map((product, index) => (
              <ProductCard
                key={product.slug}
                product={product}
                variants={variantes}
                className={cn(
                  univers.id === 'porte' && index % 3 === 1 && 'sm:mt-12',
                  univers.id === 'memoire' && index % 4 === 1 && 'sm:rotate-1',
                  univers.id === 'awale' && index === 0 && 'col-span-2',
                )}
              />
            ))}
          </div>
        ) : (
          <Reveal className="space-y-4 rounded-(--u-radius-card) border border-(--u-border) p-10 text-center">
            <p className="label-caps text-(--u-accent)">Univers en préparation</p>
            <h2 className="font-display uppercase text-heading-md">
              {univers.nom} ouvre bientôt ses portes.
            </h2>
            <p className="mx-auto max-w-md text-body text-(--u-text-muted)">{univers.concept}</p>
          </Reveal>
        )}
      </Container>
      </div>

      {/* Section éditoriale — le rituel de fabrication */}
      <div id="editorial" className="scroll-mt-32 bg-(--u-bg-deep)">
        <Container className="py-20 lg:py-28">
          <h2 className="mb-12 font-display uppercase text-heading-md text-(--u-text)">
            Le rituel de fabrication
          </h2>
          <Stagger className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {univers.rituel.map((etape, index) => (
              <div key={etape.titre} className="space-y-3 border-t border-(--u-border) pt-6">
                <p className="label-caps tnum text-(--u-highlight)">
                  {String(index + 1).padStart(2, '0')}
                </p>
                <h3 className="font-display uppercase text-heading-sm text-(--u-text)">
                  {etape.titre}
                </h3>
                <p className="text-body text-(--u-text-muted)">{etape.texte}</p>
              </div>
            ))}
          </Stagger>
        </Container>
      </div>

      {/* Catalogue — filtres + tri */}
      <div id="catalogue" className="scroll-mt-32">
      <Container className="py-20 lg:py-28">
        <div className="mb-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <h2 className="font-display uppercase text-heading-md text-(--u-text)">
            Catalogue <span className="tnum text-(--u-accent)">[{products.length}]</span>
          </h2>
          {products.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {['Tous', ...facettes].map((facet) => (
                <button
                  key={facet}
                  type="button"
                  onClick={() => setFiltre(facet)}
                  aria-pressed={filtre === facet}
                  className={cn(
                    'label-caps cursor-pointer rounded-full border px-4 py-2 transition-colors duration-(--d-fast)',
                    filtre === facet
                      ? 'border-(--u-accent) bg-(--u-accent) text-(--u-on-accent)'
                      : 'border-(--u-border) text-(--u-text-muted) hover:border-(--u-accent)',
                  )}
                >
                  {facet}
                </button>
              ))}
              <select
                value={tri}
                onChange={(event) => setTri(event.target.value as Tri)}
                aria-label="Trier le catalogue"
                className="label-caps cursor-pointer rounded-full border border-(--u-border) bg-transparent px-4 py-2 text-(--u-text-muted)"
              >
                <option value="nouveautes">Nouveautés</option>
                <option value="prix-asc">Prix croissant</option>
                <option value="prix-desc">Prix décroissant</option>
              </select>
            </div>
          )}
        </div>

        {products.length > 0 && (
          <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {shown.map((product) => (
              <ProductCard key={product.slug} product={product} variants={variantes} />
            ))}
          </div>
        )}
      </Container>
      </div>

      {/* Cross-univers — continuer la visite */}
      <Container className="pb-24 lg:pb-32">
        <Reveal className="space-y-8 border-t border-(--u-border) pt-14">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <h2 className="font-display uppercase text-heading-md text-(--u-text)">
              Continuer la visite
            </h2>
            <Link to="/boutique" className="label-caps text-(--u-accent)">
              ← Retour au Carrefour
            </Link>
          </div>
          <CategoryGates className="opacity-90" />
        </Reveal>
      </Container>
    </div>
  )
}