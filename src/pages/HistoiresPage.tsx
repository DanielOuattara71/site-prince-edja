import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { PROJETS, type Projet } from '@/data/projets'
import { categoriesAffichees } from '@/lib/categories'
import { useSeo } from '@/hooks/useSeo'
import { useLangue } from '@/i18n/contexteLangue'
import { Section } from '@/components/layout/Section'
import { Container } from '@/components/layout/Container'
import { Reveal } from '@/components/motion/Reveal'
import { Stagger } from '@/components/motion/Stagger'
import { LazyImage } from '@/components/media/LazyImage'
import { ParallaxImage } from '@/components/media/ParallaxImage'
import { cn } from '@/lib/cn'

/**
 * Photo du hero : le panorama « Contemplation sur la vallée dorée », servi à deux
 * largeurs (téléphone 1200, grand écran 1920). Visuel de cette page seule — le hero
 * d'accueil garde son portrait, et rien dans `SITE` ne bouge.
 */
const HERO_HISTOIRES = `${import.meta.env.BASE_URL}images/hero/contemplation-sur-la-vallee-doree.jpg`
const HERO_HISTOIRES_SRCSET = `${import.meta.env.BASE_URL}images/hero/contemplation-sur-la-vallee-doree-1200.jpg 1200w, ${import.meta.env.BASE_URL}images/hero/contemplation-sur-la-vallee-doree.jpg 1920w`

/**
 * Filtres : les catégories de projets créées dans l'admin, visibles et non vides (règle du
 * client, 06/11/2026). Elles remplacent les sept filtres écrits en dur et leurs correspondances
 * à la main (format, thème, statut mêlés).
 */
const CATEGORIES_PROJETS = categoriesAffichees(
  'projet',
  PROJETS.map((projet) => projet.categorie),
)

function CarteProjet({ projet }: { projet: Projet }) {
  const { l } = useLangue()

  /** Un projet sans contenu n'a pas de fiche : la carte reste une annonce informative,
   *  sans lien mort qui rechargerait cette même page. */
  const interactif = !projet.aFournir

  const corps = (
    <>
      <div className="relative aspect-4/5 overflow-hidden rounded-md bg-sand-200">
        {projet.image ? (
          <LazyImage
            src={projet.image}
            alt={projet.titre}
            ratio="4/5"
            className="h-full w-full object-cover transition-transform duration-[700ms] ease-expo group-hover:scale-[1.03]"
          />
        ) : null}
        {/* Projet annoncé, sans fiche encore : mention sobre « À venir » (décision § 8.5) ;
            « À fournir » et « Visuel à fournir » étaient des textes d'atelier. */}
        {projet.aFournir && (
          <span className="label-caps absolute left-3 top-3 rounded-full bg-night-900/85 px-3 py-1.5 text-cream-100">
            {l({ fr: 'À venir', en: 'Coming soon' })}
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-1 flex-col px-3 pb-2">
        <h3 className="font-display uppercase text-heading-sm text-ink-900 transition-colors duration-(--d-base) group-hover:text-clay-600">
          {projet.titre}
        </h3>
        <p className="mt-2 text-body text-ink-500">{projet.accroche}</p>
        <p className="label-caps mt-auto pt-4 text-ink-500">
          {[projet.format, projet.annee, projet.pays[0], projet.statut]
            .filter(Boolean)
            .join(' · ')}
        </p>
      </div>
    </>
  )

  return (
    <article className={cn('flex h-full flex-col', interactif && 'group')}>
      {interactif ? (
        <Link
          to={projet.route ?? `/xplore/${projet.slug}`}
          className="flex h-full flex-col focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-clay-600"
        >
          {corps}
        </Link>
      ) : (
        <div className="flex h-full flex-col">{corps}</div>
      )}
    </article>
  )
}

export default function HistoiresPage() {
  const { t, l } = useLangue()
  const [filtre, setFiltre] = useState<string | null>(null)

  useSeo({
    title: 'Histoires · La plateforme documentaire · Prince Edja',
    description:
      'Documentaires, séries, histoire, patrimoine, tourisme et archives : les projets de Prince Edja, du terrain à l’écran.',
  })

  const aLaUne = PROJETS.find((projet) => !projet.aFournir)
  // La une est filtrée avec les autres, et retirée de la grille seulement quand aucun
  // filtre n'est actif. L'exclure en permanence figeait au-dessus de la liste des
  // projets qui auraient dû y apparaître.
  const autres = useMemo(
    () => PROJETS.filter((projet) => filtre || projet.slug !== aLaUne?.slug),
    [aLaUne?.slug, filtre],
  )
  const visibles = filtre ? autres.filter((projet) => projet.categorie === filtre) : autres

  return (
    <>
      <Section
        tone="dark"
        padded={false}
        className="relative isolate overflow-hidden pt-32 pb-20 lg:pt-44 lg:pb-28"
      >
        {/* Photo panoramique : la moitié droite du hero, bord gauche dissous dans la
            nuit. Le fondu part de la gauche du bloc photo — aucune frontière nette
            entre la nuit du titre et le lever de soleil. */}
        <div aria-hidden className="absolute inset-y-0 right-0 w-full lg:w-[58%]">
          <ParallaxImage
            src={HERO_HISTOIRES}
            srcSet={HERO_HISTOIRES_SRCSET}
            sizes="(min-width: 1024px) 58vw, 100vw"
            alt=""
            priority
            range={6}
            className="h-full w-full"
            imgClassName="object-[10%_50%]"
          />
          <div className="overlay-hero-lateral absolute inset-0" />
          {/* Sous lg, le texte couvre toute la largeur : un voile simple fonce la
              photo, le dégradé latéral seul ne suffit pas pour le titre. */}
          <div className="absolute inset-0 bg-night-900/60 lg:hidden" />
        </div>

        <Container className="relative z-10 space-y-6">
          <h1 className="font-display uppercase text-display-lg text-cream-100">
            Des histoires
            <br />
            qui voyagent
            <span aria-hidden className="text-clay-500">.</span>
          </h1>
          <p className="max-w-2xl text-body-lg text-cream-100/75">
            Films, séries, archives et mémoires : la plateforme documentaire de Prince Edja.
          </p>
        </Container>
      </Section>

      {aLaUne && (
        <Section tone="light" className="bg-sand-150">
          <Container>
            <Reveal>
              <p className="label-caps mb-6 text-clay-600">{t('histoires.aLaUne')}</p>
              <Link
                to={aLaUne.route ?? `/xplore/${aLaUne.slug}`}
                className="group grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-16 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-clay-600"
              >
                <div className="lg:col-span-7">
                  <LazyImage
                    src={aLaUne.image}
                    alt={aLaUne.titre}
                    ratio="16/10"
                    className="overflow-hidden rounded-md bg-sand-200"
                  />
                </div>
                <div className="space-y-5 lg:col-span-5">
                  <h2 className="font-display uppercase text-display-lg leading-[0.95]">
                    {aLaUne.titre}
                  </h2>
                  <p className="max-w-xl text-body-lg text-ink-700">{aLaUne.accroche}</p>
                  <p className="label-caps text-ink-500">
                    {[aLaUne.format, aLaUne.annee, aLaUne.pays[0]]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                  <span className="group inline-flex items-center gap-2 text-button font-semibold text-clay-600">
                    {l({ fr: 'Voir le projet', en: 'View project' })}
                  </span>
                </div>
              </Link>
            </Reveal>
          </Container>
        </Section>
      )}

      <Section tone="light">
        <Container className="space-y-10">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFiltre(null)}
              aria-pressed={filtre === null}
              className={cn(
                'min-h-11 rounded-full border px-4 text-caption font-semibold transition-colors duration-(--d-fast)',
                filtre === null
                  ? 'border-night-900 bg-night-900 text-cream-100'
                  : 'border-sand-300 text-ink-700 hover:bg-sand-200',
              )}
            >
              {l({ fr: 'Tous les projets', en: 'All projects' })}
            </button>
            {CATEGORIES_PROJETS.map(({ nom }) => (
              <button
                key={nom}
                type="button"
                onClick={() => setFiltre(nom === filtre ? null : nom)}
                aria-pressed={filtre === nom}
                className={cn(
                  'min-h-11 rounded-full border px-4 text-caption font-semibold transition-colors duration-(--d-fast)',
                  filtre === nom
                    ? 'border-night-900 bg-night-900 text-cream-100'
                    : 'border-sand-300 text-ink-700 hover:bg-sand-200',
                )}
              >
                {nom}
              </button>
            ))}
          </div>

          {/* Remontée à chaque changement de filtre : Stagger ne révèle ses enfants
              qu'une seule fois (whileInView + once). Sans remontée, les emplacements
              qui apparaissent après le premier déclenchement héritent de `hidden`
              (opacity: 0) et restent à jamais invisibles. */}
          <Stagger key={filtre ?? 'tous-les-projets'} className="grid grid-cols-2 gap-1 sm:grid-cols-3">
            {visibles.map((projet) => (
              <CarteProjet key={projet.slug} projet={projet} />
            ))}
          </Stagger>

          {visibles.length === 0 && (
            <p className="text-body text-ink-500">
              {l({
                fr: 'Aucun projet dans ce filtre pour l’instant.',
                en: 'No project in this filter yet.',
              })}
            </p>
          )}

          <div className="rounded-xl border border-dashed border-sand-300 p-8 text-center">
            <p className="font-display uppercase text-heading-sm text-ink-900">
              Festivals, prix et diffusions
            </p>
            <p className="mx-auto mt-2 max-w-xl text-body text-ink-500">
              {l({
                fr: 'Sélections, récompenses et dates de projection seront fournies par la maison puis validées. Aucune n’est avancée ici.',
                en: 'Selections, awards and screening dates will be provided by the house and then validated. None are listed here.',
              })}
            </p>
          </div>
        </Container>
      </Section>
    </>
  )
}
