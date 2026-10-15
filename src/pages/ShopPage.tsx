import { useRef, useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { BIJOUX } from '@/data/content'
import { useSeo } from '@/hooks/useSeo'
import { Section } from '@/components/layout/Section'
import { Container } from '@/components/layout/Container'
import { Reveal } from '@/components/motion/Reveal'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Button } from '@/components/ui/Button'
import { BijouCard } from '@/components/cards/BijouCard'
import { ColonneMots } from '@/components/shop/ColonneMots'
import { SectionPortes } from '@/components/shop/SectionPortes'
import { BijouLightbox } from '@/components/shop/BijouLightbox'
import { BandeParallaxe, BlocSuivant, CitationEncadree } from '@/components/shop/BlocsEditoriaux'
import { LookbookPleinEcran } from '@/components/shop/LookbookPleinEcran'
import { visuelCouverture, visuelCouvertureSrcSet, visuelCouvertureSizes } from '@/lib/visuels'
import { FiltresCatalogue } from '@/components/shop/FiltresCatalogue'

/**
 * Photographie de couverture, en fond de hero.
 *
 * Elle n'est rendue qu'au chargement effectif : un fichier manquant laisse un hero
 * typographique plutôt qu'un cadre vide. Les voiles ne sont posés qu'avec elle, sinon
 * on assombrissait un fond déjà nuit.
 */
function HeroCouverture() {
  const [presente, setPresente] = useState(false)

  return (
    <>
      <img
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
 * L'ordre suit un raisonnement de vente éditoriale : d'abord ce que la collection
 * **est** (hero, colonne de mots), ensuite ce qu'il faut **voir** (trois pièces mises
 * en avant), puis **tout** le reste (lookbook plein écran), et enfin ce que la pièce
 * **devient** (le porté). On ne met pas la collection entière en avant : dès qu'on
 * montre dix pièces en grand, plus rien ne l'est.
 */
export default function ShopPage() {
  const [visionneuse, setVisionneuse] = useState<number | null>(null)
  const rail = useRef<HTMLDivElement>(null)

  useSeo({
    title: 'Edja Shop · Collection TRIBE',
    description:
      'Des objets qui parlent, des symboles qui relient : bijoux TRIBE façonnés à la main par des artisans ivoiriens.',
  })

  const reste = BIJOUX.slice(3)

  const defiler = (sens: 1 | -1) => {
    const piste = rail.current
    if (!piste) return
    const premiere = piste.firstElementChild
    const largeur = premiere
      ? premiere.getBoundingClientRect().width + 3
      : piste.clientWidth * 0.75
    piste.scrollBy({ left: sens * largeur, behavior: 'smooth' })
  }

  return (
    <>
      {/*
        Hero photographique : la photo occupe tout l'écran, le titre est posé par-
        dessus. C'est le ressort magazine. Les voiles sont ce qui rend le texte crème
        lisible sur une image dont on ne maîtrise pas la densité.
      */}
      <Section
        tone="dark"
        padded={false}
        className="motif-tisse relative overflow-hidden bg-forest-950"
      >
        <HeroCouverture />

        <Container className="relative z-10 flex min-h-[78svh] flex-col justify-end pb-20 pt-32 lg:min-h-[86svh] lg:pb-28">
          {/* Ligne de base : trois repères, un filet au-dessus, séparateurs pointillés. */}
          <div className="mb-6 flex items-center justify-between gap-4 border-t border-cream-100/30 pt-4 text-cream-100 lg:mb-10">
            <span className="label-caps">Edja Shop</span>
            <span
              aria-hidden
              className="h-px flex-1 border-t border-dotted border-cream-100/40"
            />
            <span className="label-caps hidden sm:inline">Collection TRIBE</span>
            <span
              aria-hidden
              className="hidden h-px flex-1 border-t border-dotted border-cream-100/40 sm:block"
            />
            <span className="label-caps">Abidjan</span>
          </div>

          <div className="space-y-6">
            <Eyebrow num="01" tone="dark">
              Chaque bijou est une histoire
            </Eyebrow>
            <h1 className="font-display uppercase text-display-xl leading-[0.92] text-cream-100">
              Chaque bijou
              <br />
              est une histoire
              <span aria-hidden className="text-clay-500">.</span>
            </h1>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <Reveal delay={0.15}>
                <p className="max-w-xl text-body-lg text-cream-100/75">
                  Un passeport culturel façonné à la main par des artisans ivoiriens.
                  Bronze, laiton et argent deviennent un langage contemporain inspiré
                  des héritages d'Afrique de l'Ouest.
                </p>
              </Reveal>
              <Reveal delay={0.2}>
                {/* La signature géographique : la maison est à un endroit, pas nulle part. */}
                <p className="label-caps shrink-0 text-gold-400">
                  05°20' N · 004°02' W
                  <span aria-hidden className="mx-2 text-cream-100/40">
                    ·
                  </span>
                  {BIJOUX.length} pièces numérotées
                </p>
              </Reveal>
            </div>
          </div>
        </Container>
      </Section>

      <ColonneMots />

      <Section
        tone="light"
        padded={false}
        container={false}
        className="mt-[3px] border-t border-ink-900/10 bg-sand-150 pt-[52px]"
      >
        <Container className="max-w-none px-0 sm:px-0 lg:px-0 xl:px-0">
          <div className="flex flex-wrap items-center justify-between gap-6 px-4 pb-[22px] sm:px-6">
            <h2 className="label-caps text-ink-500">Sélection</h2>
            <div className="flex items-center gap-2">
              <Button href="#galerie" variant="ghost-dark" magnetic={false}>
                Voir les {BIJOUX.length} pièces
              </Button>
              <button
                type="button"
                onClick={() => defiler(-1)}
                aria-label="Faire défiler vers la gauche"
                className="flex size-9 items-center justify-center rounded-full border border-sand-300 text-ink-700 transition-colors duration-(--d-fast) hover:bg-sand-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clay-600"
              >
                <ArrowLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => defiler(1)}
                aria-label="Faire défiler vers la droite"
                className="flex size-9 items-center justify-center rounded-full border border-sand-300 text-ink-700 transition-colors duration-(--d-fast) hover:bg-sand-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clay-600"
              >
                <ArrowRight className="size-4" />
              </button>
            </div>
          </div>

          <div
            ref={rail}
            className="flex scroll-pl-4 snap-x snap-mandatory gap-[3px] overflow-x-auto px-4 pb-[52px] [scrollbar-width:none] sm:scroll-pl-6 sm:px-6 [&::-webkit-scrollbar]:hidden"
          >
            {BIJOUX.map((bijou, index) => (
              <Reveal
                key={bijou.slug}
                delay={Math.min(index, 4) * 0.06}
                className="w-[calc(50vw-1px)] shrink-0 snap-start sm:w-[calc(25vw-1px)]"
              >
                <BijouCard bijou={bijou} />
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* `container={false}` est indispensable : par défaut `Section` enveloppe TOUT son
          contenu dans un `Container` (`max-w-7xl`), ce qui recadrerait le lookbook
          malgré la sortie manuelle. Ici on gère le cadrage nous-mêmes. */}
      <Section tone="light" className="bg-sand-100" padded={false} container={false}>
        <Container className="px-4 pt-[52px] pb-16 sm:px-6">
          <FiltresCatalogue />
        </Container>
      </Section>

      {/* La section ne porte plus de titre : `FiltresCatalogue`, juste au-dessus,
          annonce déjà « Les N pièces » avec le même `Eyebrow num="02"` — deux fois la
          même annonce sur deux sections voisines. Le lookbook se suffit à lui-même. */}
      <Section tone="light" className="bg-sand-100" padded={false} container={false}>
        {/* Hors du Container : il est en `max-w-7xl` + `lg:px-16 xl:px-20`, donc un
            enfant ne peut jamais être bord à bord. Le lookbook doit sortir du
            conteneur, pas tenter de le compenser à la marge. */}
        <div id="galerie" className="scroll-mt-24">
          <LookbookPleinEcran
            pieces={BIJOUX}
            onOuvrir={(piece) => setVisionneuse(BIJOUX.indexOf(piece))}
          />
        </div>
      </Section>

      <SectionPortes pieces={reste} />

      <CitationEncadree />

      <BandeParallaxe />

      <BlocSuivant />

      <Section tone="light">
        <Container>
          <Reveal className="border-t border-sand-200 pt-12">
            <p className="label-caps text-clay-600">Bientôt sur la marketplace</p>
            <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {['Jeux', 'Souvenirs', 'À porter', 'À offrir'].map((category) => (
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

      <BijouLightbox
        pieces={BIJOUX}
        index={visionneuse}
        onChangeIndex={setVisionneuse}
      />
    </>
  )
}
