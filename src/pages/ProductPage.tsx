import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router'
import { Hand, Globe, ShieldCheck } from 'lucide-react'
import { getProduct, getProductsByUnivers, getUniversBySlug } from '@/data/market'
import { SITE } from '@/data/site'
import { useCart } from '@/lib/cart'
import { formatPrice } from '@/lib/format'
import { useSeo } from '@/hooks/useSeo'
import { Container } from '@/components/layout/Container'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Button } from '@/components/ui/Button'
import { ParallaxImage } from '@/components/media/ParallaxImage'
import { ProductCard } from '@/components/market/ProductCard'
import { cn } from '@/lib/cn'

const REASSURANCE = [
  { icon: Hand, texte: 'Façonné à la main par des artisans ivoiriens' },
  { icon: Globe, texte: 'Livraison internationale suivie depuis Abidjan' },
  { icon: ShieldCheck, texte: 'Mobile money, carte ou virement — retour 14 jours' },
]

export default function ProductPage() {
  const { univers: universSlug, slug } = useParams()
  const univers = getUniversBySlug(universSlug)
  const product = getProduct(slug, universSlug)
  const { add } = useCart()
  const [added, setAdded] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useSeo({
    title: product
      ? `${product.nom} · ${product.culture} — ${univers?.nom ?? 'Marketplace'}`
      : 'Pièce — Marketplace Prince Edja',
    description: product?.histoire,
  })

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  if (!product) {
    return (
      <div className="bg-sand-50 text-ink-900">
        <Container className="space-y-6 pt-32 pb-24 text-center lg:pt-44">
          <h1 className="font-display uppercase text-display-lg">Pièce introuvable.</h1>
          <p className="text-body text-ink-500">Cette pièce n’est plus exposée — ou n’existe pas.</p>
          <Button to="/boutique" variant="dark">
            Retour à la marketplace
          </Button>
        </Container>
      </div>
    )
  }

  const similaires = getProductsByUnivers(product.univers)
    .filter((item) => item.slug !== product.slug)
    .slice(0, 3)

  const handleAdd = () => {
    add(product)
    setAdded(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div className={cn(univers?.tokenClass ?? 'u-market', 'bg-(--u-bg) text-(--u-text)')}>
      <Container className="pt-28 pb-20 lg:pt-40 lg:pb-28">
        {/* Fil d'Ariane */}
        <nav
          aria-label="Fil d’Ariane"
          className="label-caps mb-10 flex flex-wrap gap-2 text-(--u-text-muted)"
        >
          <Link to="/boutique" className="transition-colors hover:text-(--u-accent)">
            Boutique
          </Link>
          <span aria-hidden>/</span>
          <Link
            to={`/boutique/${product.univers}`}
            className="transition-colors hover:text-(--u-accent)"
          >
            {univers?.nom}
          </Link>
          <span aria-hidden>/</span>
          <span aria-current="page" className="text-(--u-accent)">
            {product.nom}
          </span>
        </nav>

        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Image produit */}
          <div className="lg:col-span-7">
            <ParallaxImage
              src={product.image}
              alt={`Pièce ${product.nom}, inspirée de la culture ${product.culture}`}
              ratio="4/5"
              range={3}
              priority
              className="rounded-(--u-radius-card)"
            />
          </div>

          {/* Fiche produit — sticky */}
          <div className="lg:col-span-5">
            <div className="space-y-6 lg:sticky lg:top-28">
              <Eyebrow num={product.numero} tone="dark">
                {univers?.nom} · {product.culture}
              </Eyebrow>
              <h1 className="font-display uppercase text-display-lg">{product.nom}</h1>

              <div className="flex flex-wrap items-center gap-3">
                <span className="label-caps rounded-full border border-(--u-border) px-3 py-1.5 text-(--u-text)">
                  {product.statut}
                </span>
                <span className="label-caps rounded-full border border-(--u-border) px-3 py-1.5 text-(--u-text-muted)">
                  {product.matiere}
                </span>
                {product.edition && (
                  <span className="label-caps rounded-full border border-(--u-accent) px-3 py-1.5 tnum text-(--u-accent)">
                    {product.edition}
                  </span>
                )}
              </div>

              <p className="text-body-lg text-(--u-text-muted)">{product.histoire}</p>

              <p className="font-display uppercase text-heading-md tnum text-(--u-accent)">
                {formatPrice(product.prix)}
              </p>

              <div className="flex flex-wrap gap-4" aria-live="polite">
                <Button variant="primary" onClick={handleAdd} magnetic={false}>
                  {added ? 'Ajouté ✓' : 'Ajouter au panier'}
                </Button>
                <Button
                  href={`mailto:${SITE.email}?subject=${encodeURIComponent(
                    `Question — pièce ${product.nom}`,
                  )}`}
                  variant="ghost-light"
                  magnetic={false}
                >
                  Poser une question
                </Button>
              </div>

              <ul className="space-y-3 border-t border-(--u-border) pt-6">
                {REASSURANCE.map(({ icon: Icon, texte }) => (
                  <li
                    key={texte}
                    className="flex items-center gap-3 text-body text-(--u-text-muted)"
                  >
                    <Icon aria-hidden className="size-5 shrink-0 text-(--u-accent)" />
                    {texte}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Container>

      {/* Barre sticky mobile — prix + CTA toujours accessibles */}
      <div
        className={cn(
          'fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-4 border-t border-(--u-border) bg-(--u-bg)/95 px-5 py-3 backdrop-blur-md lg:hidden',
        )}
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      >
        <div className="min-w-0">
          <p className="label-caps truncate text-(--u-text-muted)">{product.nom}</p>
          <p className="text-button font-semibold tnum text-(--u-accent)">
            {formatPrice(product.prix)}
          </p>
        </div>
        <Button variant="primary" onClick={handleAdd} magnetic={false}>
          {added ? 'Ajouté ✓' : 'Ajouter'}
        </Button>
      </div>

      {/* Produits similaires — même univers */}
      {similaires.length > 0 && (
        <Container className="pb-24 lg:pb-32">
          <div className="mb-10 flex items-center justify-between gap-4 border-t border-(--u-border) pt-14">
            <h2 className="font-display uppercase text-heading-md text-(--u-text)">
              Poursuivre dans {univers?.nom}
            </h2>
            <Link to={`/boutique/${product.univers}`} className="label-caps text-(--u-accent)">
              Tout voir
            </Link>
          </div>
          <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {similaires.map((item) => (
              <ProductCard key={item.slug} product={item} />
            ))}
          </div>
        </Container>
      )}
    </div>
  )
}