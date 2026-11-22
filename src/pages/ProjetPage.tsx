import { lazy, Suspense } from 'react'
import { useParams } from 'react-router'
import { pageProjet } from '@/acces/projets'
import { useSeo } from '@/hooks/useSeo'
import { useLangue } from '@/i18n/contexteLangue'
import { libelleFiabilite } from '@/lib/fiabilite'
import { Section } from '@/components/layout/Section'
import { Container } from '@/components/layout/Container'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Button } from '@/components/ui/Button'
import { Reveal } from '@/components/motion/Reveal'
import { Stagger } from '@/components/motion/Stagger'
import { ParallaxImage } from '@/components/media/ParallaxImage'
import { AlbumScroll } from '@/components/sections/xplore/AlbumScroll'
import { CityCard } from '@/components/cards/CityCard'

const CarteParcours = lazy(() =>
  import('@/components/xplore/CarteParcours').then((m) => ({ default: m.CarteParcours })),
)

/**
 * Page publique d'un projet (contrat 1.15.0 § 32.5). Les données viennent de la page assemblée
 * par l'API ; le `template` du projet choisit les blocs, et aucun texte n'est inventé pour
 * remplacer un bloc vide. Les trois pages historiques gardent leur adresse, mais tout nouveau
 * projet obtient sa page à `/projets/{slug}`.
 */
export default function ProjetPage() {
  const { slug } = useParams()
  const { l } = useLangue()
  const page = slug ? pageProjet(slug) : null

  useSeo({
    title: page ? `${page.projet.titre} · Edja` : 'Projet introuvable · Edja',
    description: page?.projet.accroche || undefined,
    indexable: Boolean(page),
  })

  if (!page) {
    return (
      <Section tone="light" padded={false} className="pt-32 pb-20 lg:pt-44 lg:pb-28">
        <Container className="max-w-3xl space-y-6">
          <h1 className="font-display uppercase text-display-lg">
            {l({ fr: 'Projet introuvable', en: 'Project not found' })}
          </h1>
          <Button to="/histoires" variant="dark">
            {l({ fr: 'Toutes les histoires', en: 'All stories' })}
          </Button>
        </Container>
      </Section>
    )
  }

  const { projet, episodes, destinations, villes, entrees, partenaires } = page
  // Aucun visuel inventé : si le projet n'a ni bandeau ni affiche, la page n'en affiche pas.
  const bandeau = projet.bandeau || projet.image
  const guides = episodes.filter((e) => e.guide)
  const sansContenu =
    episodes.length === 0 && entrees.length === 0 && villes.length === 0
  // Pastille du bandeau : un chiffre calculé sur les contenus du projet, jamais une mention
  // éditoriale inventée (X'PLORE affiche « Saison 1 · Six épisodes de 26 minutes »).
  const leBandeau =
    projet.template === 'film'
      ? `${episodes.length} épisode${episodes.length > 1 ? 's' : ''}`
      : projet.template === 'programme'
        ? `${villes.length} escale${villes.length > 1 ? 's' : ''}`
        : `${entrees.length} entrée${entrees.length > 1 ? 's' : ''}`

  return (
    <>
      {/* Même grammaire que X'PLORE : l'introduction se lit d'abord, le grand bandeau
          panoramique arrive juste après, avec son dégradé vers le bas de la section. */}
      <Section tone="dark" container={false} padded={false} className="pt-32 pb-20 lg:pt-44 lg:pb-28">
        <Container className="max-w-3xl space-y-6">
          <Eyebrow tone="dark">{projet.categorie || projet.format}</Eyebrow>
          <h1 className="font-display uppercase text-display-lg text-cream-100">{projet.titre}</h1>
          {projet.citation ? (
            <Reveal delay={0.1}>
              <blockquote className="border-l-2 border-gold-400 pl-6 font-quote italic leading-snug text-heading-sm text-cream-100 sm:text-heading-md">
                « {projet.citation} »
              </blockquote>
            </Reveal>
          ) : null}
          {projet.accroche ? (
            <Reveal delay={0.18}>
              <p className="max-w-2xl text-body-lg text-cream-100/70">{projet.accroche}</p>
            </Reveal>
          ) : null}
        </Container>

        {bandeau ? (
          <div className="relative mt-12">
            <ParallaxImage
              src={bandeau}
              alt={projet.titre}
              range={8}
              priority
              // Cadre haut : le bandeau occupe tout l'écran sur desktop, 70 % sur mobile.
              className="h-[70svh] lg:h-svh"
              // Assez de débord pour que le parallaxe ne laisse jamais de vide dans le cadre.
              imgClassName="scale-[1.25]"
            />
            <div aria-hidden className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-night-900/90 to-transparent" />
            {episodes.length + villes.length + entrees.length > 0 ? (
              <span className="label-caps absolute bottom-5 left-5 z-10 flex items-center gap-2 rounded-full bg-night-900/85 px-4 py-2 text-cream-100 backdrop-blur-sm lg:bottom-8 lg:left-10">
                <span aria-hidden className="size-1.5 rounded-full bg-gold-400" />
                {leBandeau}
              </span>
            ) : null}
          </div>
        ) : null}
      </Section>

      {sansContenu ? (
        <Section tone="light">
          <Container className="max-w-3xl space-y-3">
            <h2 className="font-display uppercase text-heading-md">
              {l({ fr: 'Bientôt disponible', en: 'Coming soon' })}
            </h2>
            <p className="max-w-2xl text-body text-ink-700">
              {l({
                fr: 'Les contenus de ce projet sont en cours de préparation. Ils seront publiés ici dès que la maison les aura validés.',
                en: 'This project’s content is being prepared. It will be published here once the house has validated it.',
              })}
            </p>
          </Container>
        </Section>
      ) : null}

      {projet.template === 'film' ? (
        <>
          {destinations.length > 0 ? (
            <Section tone="light">
              <Container className="space-y-8">
                <Eyebrow>{l({ fr: 'La carte', en: 'The map' })}</Eyebrow>
                <Suspense fallback={<div className="min-h-96" aria-busy="true" />}>
                  <CarteParcours etapes={destinations} />
                </Suspense>
              </Container>
            </Section>
          ) : null}

          {episodes.length > 0 ? (
            <>
              <Section tone="dark" className="pb-0">
                <Container>
                  <h2 className="label-caps text-cream-100/70">
                    {l({ fr: 'Les épisodes', en: 'Episodes' })}
                  </h2>
                </Container>
              </Section>
              {/* Le même album en panneaux plein écran que X'PLORE, alimenté par les
                  épisodes du projet — pas des cartes réduites. */}
              <AlbumScroll episodes={episodes} />
            </>
          ) : null}

          {guides.length > 0 ? (
            <Section tone="light">
              <Container className="space-y-4">
                <Eyebrow>{l({ fr: 'Guides à télécharger', en: 'Downloadable guides' })}</Eyebrow>
                <ul className="flex flex-wrap gap-3">
                  {guides.map((episode) => (
                    <li key={episode.slug}>
                      <a
                        href={episode.guide}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex min-h-11 items-center rounded-full border border-sand-300 px-4 text-caption font-semibold text-ink-900 hover:bg-sand-200"
                      >
                        {episode.titre}
                      </a>
                    </li>
                  ))}
                </ul>
              </Container>
            </Section>
          ) : null}
        </>
      ) : null}

      {projet.template === 'programme' ? (
        <>
          {villes.length > 0 ? (
            <Section tone="dark">
              <Container className="space-y-8">
                {/* Titre de section en h2 : les cartes de ville portent des h3. */}
                <h2 className="label-caps text-cream-100/70">
                  {l({ fr: 'Les escales', en: 'The stops' })}
                </h2>
                <Stagger className="grid gap-12 sm:grid-cols-3">
                  {villes.map((ville, index) => (
                    <CityCard key={ville.nom} city={ville} index={index} />
                  ))}
                </Stagger>
              </Container>
            </Section>
          ) : null}
          {partenaires.length > 0 ? (
            <Section tone="light">
              <Container className="space-y-4">
                <Eyebrow>{l({ fr: 'Partenaires', en: 'Partners' })}</Eyebrow>
                <ul className="flex flex-wrap gap-3">
                  {partenaires.map((partenaire) => (
                    <li
                      key={partenaire.nom}
                      className="rounded-full border border-sand-300 px-4 py-2 text-caption font-semibold text-ink-900"
                    >
                      {partenaire.nom}
                    </li>
                  ))}
                </ul>
              </Container>
            </Section>
          ) : null}
        </>
      ) : null}

      {projet.template === 'bibliotheque' ? (
        <Section tone="light">
          <Container className="space-y-10">
            <Eyebrow>{l({ fr: 'La bibliothèque', en: 'The library' })}</Eyebrow>
            {entrees.length > 0 ? (
              <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {entrees.map((entree) => (
                  <Reveal key={entree.slug}>
                    <article className="flex h-full flex-col gap-4 rounded-xl border border-sand-200 bg-sand-50 p-6">
                      <div className="space-y-2">
                        <p className="label-caps text-ink-500">{entree.categorie}</p>
                        <h2 className="font-display uppercase text-heading-sm text-ink-900">
                          {entree.titre}
                        </h2>
                        {entree.epoque ? (
                          <p className="text-caption text-ink-500">{entree.epoque}</p>
                        ) : null}
                        {entree.fiabilite ? (
                          <p className="label-caps inline-flex rounded-full bg-sand-200/70 px-3 py-1 text-ink-700">
                            {l(libelleFiabilite(entree.fiabilite))}
                          </p>
                        ) : null}
                      </div>
                      {entree.texte ? (
                        <p className="text-body text-ink-700">{entree.texte}</p>
                      ) : null}
                      {entree.sources.length > 0 ? (
                        <div className="space-y-1 border-t border-sand-200 pt-3">
                          <p className="label-caps text-ink-500">
                            {l({ fr: 'Sources', en: 'Sources' })}
                          </p>
                          <ul className="list-disc space-y-1 pl-5 text-caption text-ink-700">
                            {entree.sources.map((source) => (
                              <li key={source}>{source}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </article>
                  </Reveal>
                ))}
              </Stagger>
            ) : null}
            <div className="rounded-xl border border-sand-200 bg-sand-100 p-8">
              <h2 className="font-display uppercase text-heading-md">Rigueur éditoriale</h2>
              <p className="mt-3 max-w-2xl text-body text-ink-700">
                {l({
                  fr: 'Chaque entrée cite ses sources et distingue l’histoire documentée, la mémoire orale et l’interprétation.',
                  en: 'Every entry cites its sources and distinguishes documented history, oral memory and interpretation.',
                })}
              </p>
            </div>
          </Container>
        </Section>
      ) : null}
    </>
  )
}
