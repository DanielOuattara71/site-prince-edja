import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { PROJETS, FILTRES_PROJETS, type Projet } from '@/data/projets'
import { useSeo } from '@/hooks/useSeo'
import { useLangue } from '@/i18n/contexteLangue'
import { Section } from '@/components/layout/Section'
import { Container } from '@/components/layout/Container'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Reveal } from '@/components/motion/Reveal'
import { Stagger } from '@/components/motion/Stagger'
import { LazyImage } from '@/components/media/LazyImage'
import { cn } from '@/lib/cn'

/** Correspondance entre les filtres du CDC et les données du projet. */
function correspond(projet: Projet, filtre: string): boolean {
  switch (filtre) {
    case 'Documentaires':
    case 'Séries':
      return projet.format === filtre.slice(0, -1) || projet.format === 'Émission'
    case 'Histoire':
      return projet.theme.includes('Histoire') || projet.theme.includes('Mémoire')
    case 'Patrimoine':
      return projet.theme.includes('Patrimoine')
    case 'Tourisme':
      return projet.theme.includes('Gastronomie') || projet.theme.includes('Littoral')
    case 'En production':
      // Le libellé vient du CDC, mais aucun projet ne porte ce statut exact : les
      // statuts réels sont « disponible » (publié) et « en préparation » (en cours).
      // Le filtre répond donc « ce qui est en train de se faire », sinon il ne
      // retournait jamais rien.
      return projet.statut === 'en préparation'
    case 'Archives':
      return projet.format === 'Archive'
    default:
      return false
  }
}

function CarteProjet({ projet }: { projet: Projet }) {
  const { l } = useLangue()

  return (
    <article className="group flex h-full flex-col">
      <Link
        to={projet.aFournir ? '/histoires' : (projet.route ?? `/xplore/${projet.slug}`)}
        className="flex h-full flex-col focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-clay-600"
      >
        <div className="relative aspect-4/5 overflow-hidden rounded-md bg-sand-200">
          {projet.image ? (
            <LazyImage
              src={projet.image}
              alt={projet.titre}
              ratio="4/5"
              className="h-full w-full object-cover transition-transform duration-[700ms] ease-expo group-hover:scale-[1.03]"
            />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="label-caps px-6 text-center text-ink-500">
                {l({ fr: 'Visuel à fournir', en: 'Visual to be provided' })}
              </span>
            </span>
          )}
          {projet.aFournir && (
            <span className="label-caps absolute left-3 top-3 rounded-full bg-night-900/85 px-3 py-1.5 text-cream-100">
              {l({ fr: 'À fournir', en: 'To be provided' })}
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
      </Link>
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
  const visibles = filtre ? autres.filter((projet) => correspond(projet, filtre)) : autres

  return (
    <>
      <Section tone="dark" padded={false} className="relative pt-32 pb-20 lg:pt-44 lg:pb-28">
        <Container className="space-y-6">
          <Eyebrow num="01" tone="dark">
            Projets &amp; histoires
          </Eyebrow>
          <h1 className="font-display uppercase text-display-lg text-cream-100">
            Des histoires qui voyagent
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
            {FILTRES_PROJETS.map((nom) => (
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

          <Stagger className="grid grid-cols-2 gap-1 sm:grid-cols-3">
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
