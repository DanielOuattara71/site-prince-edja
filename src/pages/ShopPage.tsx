import { useRef, useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { BIJOUX } from '@/data/content'
import { GALERIE_SHOP } from '@/data/shop'
import { useSeo } from '@/hooks/useSeo'
import { Section } from '@/components/layout/Section'
import { Container } from '@/components/layout/Container'
import { Reveal } from '@/components/motion/Reveal'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { BijouCard } from '@/components/cards/BijouCard'
import { ColonneMots } from '@/components/shop/ColonneMots'
import { GalerieLightbox } from '@/components/shop/GalerieLightbox'
import { CitationEncadree } from '@/components/shop/BlocsEditoriaux'
import { LookbookPleinEcran } from '@/components/shop/LookbookPleinEcran'
import {
  visuelCouverture,
  visuelCouvertureSrcSet,
  visuelCouvertureSizes,
  VISUEL_TEST_CARTE,
  ALT_TEST_CARTE,
} from '@/lib/visuels'
import { FiltresCatalogue } from '@/components/shop/FiltresCatalogue'
import { SectionLivres } from '@/components/shop/SectionLivres'
import { AfricanPatternRibbon } from '@/components/motifs/AfricanPatternRibbon'

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
 * **est** (hero, colonne de mots), ensuite ce qu'il faut **voir** (une sélection de
 * pièces), puis **le regard** (galerie indépendante), et enfin ce que la pièce
 * **devient** (le porté). On ne met pas la collection entière en avant : dès qu'on
 * montre dix pièces en grand, plus rien ne l'est.
 */
export default function ShopPage() {
  const [galerieIndex, setGalerieIndex] = useState<number | null>(null)
  const rail = useRef<HTMLDivElement>(null)

  useSeo({
    title: 'Edja Shop · Collection TRIBE',
    description:
      'Des objets qui parlent, des symboles qui relient : bijoux TRIBE façonnés à la main par des artisans ivoiriens.',
  })

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
        className="relative overflow-hidden bg-forest-950"
      >
        <HeroCouverture />

        <Container className="relative z-10 flex min-h-[78svh] flex-col justify-end pb-20 pt-32 lg:min-h-[86svh] lg:pb-28">
          <div className="space-y-6">
            <Eyebrow tone="dark">
              Chaque bijou est une histoire
            </Eyebrow>
            <h1 className="font-display uppercase text-display-xl leading-[0.92] text-cream-100">
              Chaque bijou
              <br />
              est une histoire
              <span aria-hidden className="text-clay-500">.</span>
            </h1>
            <Reveal delay={0.15}>
              <p className="max-w-xl text-body-lg text-cream-100/75">
                Un passeport culturel façonné à la main par des artisans ivoiriens.
                Bronze, laiton et argent deviennent un langage contemporain inspiré
                des héritages d'Afrique de l'Ouest.
              </p>
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* Le ruban prend la couleur de la forêt : il relie la photo du hero au
          chapitre des mots sans créer une nouvelle rupture de fond. */}
      <div className="bg-forest-950">
        <AfricanPatternRibbon tone="dark" />
      </div>

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
                <BijouCard
                  bijou={bijou}
                  image={VISUEL_TEST_CARTE}
                  imageAlt={ALT_TEST_CARTE}
                />
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

      {/* La galerie est indépendante des fiches : elle ne rejoue pas les visuels
          des pièces. Son titre, son cadrage et ses légendes vivent dans
          `LookbookPleinEcran` ; la page ne fait que lui passer `GALERIE_SHOP`. */}
      <Section tone="light" className="bg-sand-100" padded={false} container={false}>
        {/* Hors du Container : il est en `max-w-7xl` + `lg:px-16 xl:px-20`, donc un
            enfant ne peut jamais être bord à bord. Le lookbook doit sortir du
            conteneur, pas tenter de le compenser à la marge. */}
        <div id="galerie" className="scroll-mt-24">
          <LookbookPleinEcran images={GALERIE_SHOP} onOuvrir={setGalerieIndex} />
        </div>
      </Section>

      {/* La maquette « Livres » occupe la place laissée par la section « porté »
          (Ce que la pièce devient sur vous) : mot géant clay, filet, rangée
          d'en-tête, quatre couvertures bord à bord et pastille « Tout voir »
          flottante. Données fictives suffixées, dans `livres.ts`. */}
      <SectionLivres />

      <CitationEncadree />

      {/* La citation est le dernier bloc : sans cet intervalle ivoire, le divider
          arrondi du footer sombre disparaîtrait dedans. La marge reste propre à
          la boutique, pas au footer global. */}
      <div aria-hidden className="h-20 bg-sand-50 sm:h-24" />

      <GalerieLightbox
        images={GALERIE_SHOP}
        index={galerieIndex}
        onChangeIndex={setGalerieIndex}
      />
    </>
  )
}
