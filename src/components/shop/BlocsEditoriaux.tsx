import { GALLERY_QUOTE } from '@/data/gallery'
import { EPISODES } from '@/data/content'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Button } from '@/components/ui/Button'
import { ParallaxImage } from '@/components/media/ParallaxImage'
import { LazyImage } from '@/components/media/LazyImage'

/**
 * Citation encadrée, avec visuel carré.
 *
 * La citation existe déjà et est **sourcée** (`GALLERY_QUOTE`, TV5MONDE 2024) : on ne
 * l'invente pas, on la met en scène. Le cadre carré est la forme de la référence : un
 * portrait plutôt qu'une bannière, pour que la parole soit le sujet.
 */
export function CitationEncadree() {
  return (
    <Section tone="light" className="bg-sand-100">
      <Container>
        <figure className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16">
          <div className="space-y-6">
            <Eyebrow num="03">Ce qu'on en dit</Eyebrow>
            <blockquote className="font-quote text-heading-sm italic leading-snug text-ink-900 sm:text-heading-md">
              {GALLERY_QUOTE.texte}
            </blockquote>
            <figcaption className="flex flex-wrap items-center gap-4 border-t border-sand-300 pt-5">
              <LazyImage
                src={GALLERY_QUOTE.avatar}
                alt=""
                ratio="1/1"
                className="size-12 shrink-0 rounded-full"
              />
              <span className="label-caps text-ink-500">
                {GALLERY_QUOTE.source}
                <span aria-hidden className="mx-2 text-gold-400">
                  ·
                </span>
                {GALLERY_QUOTE.date}
              </span>
            </figcaption>
          </div>

          {/* Emplacement du portrait d'atelier. La photo n'existe pas encore : le bloc
              garde sa taille et sa forme, pour que la mise en page ne saute pas. */}
          <div className="overflow-hidden rounded-xl bg-sand-200">
            <LazyImage
              src={`${import.meta.env.BASE_URL}images/a-propos/portrait-edja.jpg`}
              alt="Prince Edja, lunettes et bijoux or"
              ratio="1/1"
            />
          </div>
        </figure>
      </Container>
    </Section>
  )
}

/**
 * Bande parallaxe pleine largeur.
 *
 * Une respiration entre deux blocs denses. Elle ne porte aucune information : c'est ce
 * qui lui permet d'exister sans photo de produit, la campagne du site suffit.
 */
export function BandeParallaxe() {
  // 26svh et non 38 : c'est une respiration entre deux blocs denses, pas une
  // troisième section. Une page de onze écrans n'a pas besoin de cent vicaires.
  return (
    <div className="relative h-[26svh] overflow-hidden">
      <ParallaxImage
        src={`${import.meta.env.BASE_URL}images/a-propos/portrait-edja.jpg`}
        alt=""
        priority={false}
        range={6}
        className="absolute inset-0 h-[125%] w-full"
      />
      <div aria-hidden className="overlay-cinema-forest absolute inset-0" />
    </div>
  )
}

/**
 * Aiguillage vers un autre univers, en pied de page.
 *
 * Le motif vient de Realevate : image pleine largeur en parallaxe, voile, puis un petit
 * label, un grand titre et une description. Il fait circuler vers la série X'PLORE :
 * la boutique n'est pas une impasse.
 */
export function BlocSuivant() {
  const premier = EPISODES[0]

  return (
    <section className="relative overflow-hidden bg-night-900 text-cream-100">
      <div className="relative h-[52svh]">
        <ParallaxImage
          src={premier.image}
          alt=""
          range={7}
          className="absolute inset-0 h-[125%] w-full"
        />
        <div aria-hidden className="overlay-cinema-forest absolute inset-0" />
        <div aria-hidden className="overlay-hero-scrim-forest absolute inset-0" />

        <Container className="relative flex h-full flex-col justify-end pb-10 lg:pb-14">
          <div className="space-y-4">
            <p className="label-caps text-gold-400">Suivant · La série</p>
            <h2 className="max-w-2xl font-display uppercase text-display-lg">
              X'PLORE
              <span aria-hidden className="text-clay-500">.</span>
            </h2>
            <p className="max-w-xl text-body-lg text-cream-100/75">
              Six routes, six histoires, une Côte d'Ivoire filmée à hauteur d'homme. Les
              objets de la collection TRIBE viennent de ces mêmes territoires.
            </p>
            <div className="pt-2">
              {/* `to` et pas `href` : un lien interne rechargé ferait repartir la SPA
                  de zéro, perdant le défilement et l'état. */}
              <Button to="/xplore" variant="ghost-light" magnetic={false}>
                Découvrir la série
              </Button>
            </div>
          </div>
        </Container>
      </div>
    </section>
  )
}
