import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { PIECES, GALERIE_SHOP } from '@/acces/boutique'
import { useSeo } from '@/hooks/useSeo'
import { usePagination } from '@/hooks/usePagination'
import { useLangue } from '@/i18n/contexteLangue'
import { Section } from '@/components/layout/Section'
import { Container } from '@/components/layout/Container'
import { Reveal } from '@/components/motion/Reveal'
import { BijouCard } from '@/components/cards/BijouCard'
import { ColonneMots } from '@/components/shop/ColonneMots'
import { GalerieLightbox } from '@/components/shop/GalerieLightbox'
import { LookbookPleinEcran } from '@/components/shop/LookbookPleinEcran'
import {
  visuelCouverture,
  visuelCouvertureSrcSet,
  visuelCouvertureSizes,
} from '@/lib/visuels'
import { FiltresCatalogue } from '@/components/shop/FiltresCatalogue'
import { SectionLivres } from '@/components/shop/SectionLivres'

/**
 * Photographie de couverture, en fond de hero.
 */
function HeroCouverture() {
  const [presente, setPresente] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  // Si l'image est déjà en cache au moment de l'hydration (SSR pré-rendu), onLoad
  // ne tirera jamais : on vérifie `complete` au montage.
  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) setPresente(true)
  }, [])

  return (
    <>
      <img
        ref={imgRef}
        src={visuelCouverture}
        srcSet={visuelCouvertureSrcSet}
        sizes={visuelCouvertureSizes}
        alt=""
        onLoad={() => setPresente(true)}
        onError={() => setPresente(false)}
        className={
          presente ? 'absolute inset-0 h-full w-full object-cover object-center' : 'hidden'
        }
      />
      {presente && (
        <>
          <div aria-hidden className="overlay-hero-scrim-forest absolute inset-0 opacity-70" />
          <div aria-hidden className="overlay-cinema-forest absolute inset-0 opacity-30" />
        </>
      )}
    </>
  )
}

/**
 * Page Edja Shop.
 *
 * Composition inspirée d'Outfit et Slight Twist : hero photographique, signature Anton
 * sur sand, grille 4 colonnes accueillant les cartes 4:5 comme une planche de catalogue,
 * mosaïque lookbook sans cadre. Collections numérotées, échelle tactile par
 * culture d'origine, sans tabs.
 */
export default function ShopPage() {
  const [galerieIndex, setGalerieIndex] = useState<number | null>(null)
  const rail = useRef<HTMLDivElement>(null)
  const defiler = (sens: 1 | -1) => {
    const piste = rail.current
    if (!piste) return
    const premiere = piste.firstElementChild
    // 35 % : deux cartes presque entières visibles + une entamée (typographie légère).
    const largeur = premiere
      ? premiere.getBoundingClientRect().width
      : piste.clientWidth * 0.35
    piste.scrollBy({ left: sens * largeur, behavior: 'smooth' })
  }

  const { t } = useLangue()
  const { page } = usePagination()
  useSeo({
    title: page > 1 ? `${t('boutique.page')} ${page}` : 'Edja Shop · Bijoux et livres',
    description:
      'Des objets qui parlent, des symboles qui relient : les bijoux et les livres d’Edja Shop, la boutique de Prince Edja.',
    requete: page > 1 ? `?page=${page}` : '',
  })

  // Sélection mise en avant — les 4 premières pièces, étiquetées « Tribal ».
  const selection = PIECES.slice(0, 4)

  return (
    <>
      {/* Hero : Anton signature, fond forêt, ruban tissu sous la ligne de flottaison. */}
      <Section tone="dark" padded={false} className="relative overflow-hidden bg-forest-950">
        <HeroCouverture />

        <Container className="relative z-10 flex min-h-[70svh] flex-col justify-end pb-16 pt-32 lg:min-h-[78svh] lg:pb-20">
          <div className="space-y-6">
            <p className="label-caps text-cream-100/70">Collection TRIBE — édition limitée</p>
            <h1 className="font-display uppercase text-display-xl text-cream-100">
              Chaque bijou
              <br />
              est une histoire
              <span aria-hidden className="text-clay-500">
                .
              </span>
            </h1>
            <Reveal delay={0.15}>
              <p className="max-w-xl text-body-lg text-cream-100/75">
                Bronze, laiton, argent. Des objets rituels portés à la main — chacun raconte
                une culture d'Afrique de l'Ouest.
              </p>
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* Signature « LA COLLECTION » : Anton géant dans la famille de la boutique. */}
      <section className="border-b border-ink-900/10 bg-sand-50 px-4 py-16 lg:px-6 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div>
            <h2 className="mt-4 font-display uppercase text-display-xl text-ink-900">
              LA
              <br />
              COLLECTION
              <br />
              TRIBE
              <span aria-hidden className="text-clay-600">
                .
              </span>
            </h2>
          </div>
        </div>
      </section>

      {/* Sélection : rail horizontal (scroll-snap) des 4 premières pièces — cartes
          larges, prix confirmés, flèches ; Outfit style éditorial. */}
      <section
        aria-labelledby="boutique-selection"
        className="border-b border-ink-900/10 bg-sand-150 pt-10 pb-16"
      >
        <div className="w-full">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4 px-4 sm:px-6 lg:px-10">
            <div>
              <p className="label-caps text-clay-700">Notre sélection</p>
              <h2
                id="boutique-selection"
                className="mt-2 font-display uppercase text-heading-md text-ink-900"
              >
                Sélection<span aria-hidden className="text-clay-600">.</span>
              </h2>
              <p className="mt-2 max-w-sm text-body text-ink-700">
                Les pièces que nous aimons porter en ce moment — bronze, laiton et argent.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => defiler(-1)}
                aria-label="Faire défiler vers la gauche"
                className="flex size-11 items-center justify-center rounded-full border border-ink-500 text-ink-700 transition-colors duration-(--d-fast) hover:bg-sand-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clay-600"
              >
                <ArrowLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => defiler(1)}
                aria-label="Faire défiler vers la droite"
                className="flex size-11 items-center justify-center rounded-full border border-ink-500 text-ink-700 transition-colors duration-(--d-fast) hover:bg-sand-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clay-600"
              >
                <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
          <div
            ref={rail}
            className="flex snap-x snap-mandatory gap-[3px] overflow-x-auto scroll-pl-4 px-4 [scrollbar-width:none] pb-1 sm:scroll-pl-6 sm:px-6 sm:pb-2 [&::-webkit-scrollbar]:hidden"
            aria-label="Sélection de pièces Edja Shop"
          >
            {selection.map((bijou) => (
              <Reveal key={bijou.slug} className="w-[calc(50vw-1px)] shrink-0 snap-start md:w-[30vw] xl:w-[calc(25vw-2px)]">
                <BijouCard bijou={bijou} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <ColonneMots />

      {/* Le catalogue : heading Anton + grille 4 colonnes paginée. */}
      <Section tone="light" className="bg-sand-100" padded={false} container={false}>
        <Container className="px-4 pt-16 pb-16 sm:px-6">
          <FiltresCatalogue />
        </Container>
      </Section>

      {/* Mosaïque lookbook : plein écran sans cadre, à la façon Slight Twist.
          Contract 1.16.0 : aucune photo validée dans l'admin = aucun lookbook affiché. */}
      {GALERIE_SHOP.length > 0 ? (
        <Section tone="light" className="bg-sand-100" padded={false} container={false}>
          <div id="galerie" className="scroll-mt-24">
            <LookbookPleinEcran images={GALERIE_SHOP} onOuvrir={setGalerieIndex} />
          </div>
        </Section>
      ) : null}

      <SectionLivres />

      <div aria-hidden className="h-20 bg-sand-50 sm:h-24" />

      {GALERIE_SHOP.length > 0 ? (
        <GalerieLightbox images={GALERIE_SHOP} index={galerieIndex} onChangeIndex={setGalerieIndex} />
      ) : null}
    </>
  )
}
