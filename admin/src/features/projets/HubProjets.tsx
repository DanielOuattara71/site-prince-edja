import { useQueries } from '@tanstack/react-query'
import { ArrowRight, FileText, Film, Landmark, MapPin, Plus, UtensilsCrossed } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { medias } from '@/api/endpoints/contenus'
import { archive, destinations, episodes, projets, villes } from '@/api/endpoints/editorial'
import { useSession } from '@/auth/contexte-session'
import { peut, type Action, type Ressource } from '@/auth/permissions'
import { TitrePage } from '@/components/layout/TitrePage'
import { t } from '@/i18n/fr'
import { cn } from '@/lib/cn'
import { TEMPLATES, TEMPLATES_PROJET } from '@/lib/templates'

/**
 * Hub « Projets » (ECRANS § 3.1, photo de référence) : deux cartes de création, le bloc
 * « Moteur de rendu public » (les trois templates choisis par projet, plus le template unique
 * d'épisode) et le bloc « Données partagées ». Aucune autre zone. Les libellés sont repris tels
 * quels, dont le mot « Template ». Chaque carte et puce porte un compteur discret.
 *
 * Puces Villes et Archive : absentes de la photo, ajoutées par défaut (ECRANS E1, à valider).
 */
const CARTE =
  'group flex rounded-xl border border-sand-200 bg-sand-50 transition-colors duration-(--d-fast) hover:border-clay-600 hover:bg-sand-100'

export default function HubProjets() {
  const { moi } = useSession()
  const compte = moi?.compte
  const peutFaire = (action: Action, ressource: Ressource) => peut(compte, action, ressource)

  // Un compteur par carte : le total d'une liste filtrée (une ligne demandée suffit).
  const requetes = useQueries({
    queries: [
      ...TEMPLATES_PROJET.map((template) => ({
        queryKey: ['projets', 'liste', 'hub', template],
        queryFn: () => projets.lister({ pageSize: 1 }, undefined, { template }),
      })),
      { queryKey: ['episodes', 'liste', 'hub'], queryFn: () => episodes.lister({ pageSize: 1 }) },
      {
        queryKey: ['destinations', 'liste', 'hub'],
        queryFn: () => destinations.lister({ pageSize: 1 }),
      },
      {
        queryKey: ['medias', 'liste', 'hub-pdf'],
        queryFn: () => medias.lister({ pageSize: 1, mime: 'pdf' }),
      },
      { queryKey: ['villes', 'liste', 'hub'], queryFn: () => villes.lister({ pageSize: 1 }) },
      { queryKey: ['archive', 'liste', 'hub'], queryFn: () => archive.lister({ pageSize: 1 }) },
    ],
  })
  const total = (rang: number) => requetes[rang]?.data?.total
  const [rEpisodes, rDestinations, rGuides, rVilles, rArchive] = [3, 4, 5, 6, 7]

  return (
    <section className="space-y-10">
      <div>
        <TitrePage titre={t('hub.titre')}>{t('hub.titre')}</TitrePage>
        <p className="mt-2 max-w-3xl text-body-lg text-ink-700">{t('hub.sousTitre')}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {peutFaire('creer', 'projets') ? (
          <CarteCreation
            chemin="/projets/nouveau"
            titre={t('hub.creerProjet')}
            sousTitre={t('hub.creerProjetSous')}
          />
        ) : null}
        {peutFaire('creer', 'episodes') ? (
          <CarteCreation
            chemin="/episodes/nouveau"
            titre={t('hub.creerEpisode')}
            sousTitre={t('hub.creerEpisodeSous')}
          />
        ) : null}
      </div>

      <section aria-labelledby="hub-moteur" className="space-y-4">
        <div>
          <h2 id="hub-moteur" className="font-display text-heading-sm uppercase text-ink-900">
            {t('hub.moteur')}
          </h2>
          <p className="text-body text-ink-700">{t('hub.moteurLegende')}</p>
        </div>
        <ul className="grid gap-4 md:grid-cols-3">
          {TEMPLATES_PROJET.map((template, rang) => (
            <li key={template}>
              <CarteTemplate
                chemin={`/projets/liste?template=${template}`}
                titre={TEMPLATES[template].titre}
                sousTitre={TEMPLATES[template].usage}
                etiquette={TEMPLATES[template].reference}
                compteur={libelleCompteur(total(rang), 'hub.projet', 'hub.projets')}
              />
            </li>
          ))}
          <li className="md:col-span-3">
            <CarteTemplate
              chemin="/episodes"
              titre={t('template.episode')}
              sousTitre={t('template.episodeSousTitre')}
              etiquette={t('template.episodeEtiquette')}
              compteur={libelleCompteur(total(rEpisodes), 'hub.episode', 'hub.episodes')}
              icone={<Film aria-hidden className="size-5" />}
            />
          </li>
        </ul>
        <p className="text-caption text-ink-700">{t('hub.nonEditable')}</p>
      </section>

      <section aria-labelledby="hub-donnees" className="space-y-4">
        <div>
          <h2 id="hub-donnees" className="font-display text-heading-sm uppercase text-ink-900">
            {t('hub.donnees')}
          </h2>
          <p className="text-body text-ink-700">{t('hub.donneesLegende')}</p>
        </div>
        <ul className="flex flex-wrap gap-3">
          <Puce
            chemin="/destinations"
            libelle={t('menu.destinations')}
            nombre={total(rDestinations)}
            icone={<MapPin aria-hidden className="size-4" />}
          />
          <Puce
            chemin="/guides"
            libelle={t('menu.guides')}
            nombre={total(rGuides)}
            icone={<FileText aria-hidden className="size-4" />}
          />
          <Puce
            chemin="/villes"
            libelle={t('menu.villes')}
            nombre={total(rVilles)}
            icone={<UtensilsCrossed aria-hidden className="size-4" />}
          />
          <Puce
            chemin="/archive"
            libelle={t('hub.archive')}
            nombre={total(rArchive)}
            icone={<Landmark aria-hidden className="size-4" />}
          />
        </ul>
      </section>
    </section>
  )
}

function libelleCompteur(
  n: number | undefined,
  un: 'hub.projet' | 'hub.episode',
  plusieurs: 'hub.projets' | 'hub.episodes',
) {
  if (n === undefined) return '…'
  return `${n} ${n > 1 ? t(plusieurs) : t(un)}`
}

function CarteCreation({
  chemin,
  titre,
  sousTitre,
}: {
  chemin: string
  titre: string
  sousTitre: string
}) {
  return (
    <Link to={chemin} className={cn(CARTE, 'min-h-28 items-center gap-4 p-5')}>
      <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-clay-600 text-cream-100">
        <Plus aria-hidden className="size-6" />
      </span>
      <span className="flex-1">
        <span className="block font-display text-heading-sm uppercase text-ink-900">{titre}</span>
        <span className="block text-body text-ink-700">{sousTitre}</span>
      </span>
      <ArrowRight
        aria-hidden
        className="size-5 shrink-0 text-ink-700 transition-transform duration-(--d-fast) group-hover:translate-x-1 motion-reduce:transition-none"
      />
    </Link>
  )
}

function CarteTemplate({
  chemin,
  titre,
  sousTitre,
  etiquette,
  compteur,
  icone,
}: {
  chemin: string
  titre: string
  sousTitre?: string
  etiquette: string
  compteur: string
  icone?: ReactNode
}) {
  return (
    <Link to={chemin} className={cn(CARTE, 'h-full min-h-28 flex-col justify-between gap-3 p-5')}>
      <span className="flex items-start justify-between gap-3">
        <span>
          <span className="flex items-center gap-2 text-body-lg font-semibold text-ink-900">
            {icone}
            {titre}
          </span>
          {sousTitre ? <span className="block text-body text-ink-700">{sousTitre}</span> : null}
        </span>
        <span className="tnum shrink-0 text-caption text-ink-700">{compteur}</span>
      </span>
      <span className="self-start whitespace-nowrap rounded-full border border-sand-300 px-3 py-1 text-caption font-semibold text-ink-700">
        {etiquette}
      </span>
    </Link>
  )
}

function Puce({
  chemin,
  libelle,
  nombre,
  icone,
}: {
  chemin: string
  libelle: string
  nombre: number | undefined
  icone: ReactNode
}) {
  return (
    <li>
      <Link
        to={chemin}
        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-sand-300 bg-sand-50 px-4 text-button font-semibold text-ink-900 transition-colors duration-(--d-fast) hover:border-clay-600 hover:bg-sand-100"
      >
        {icone}
        {libelle}
        <span className="tnum font-normal text-ink-700">{nombre ?? '…'}</span>
      </Link>
    </li>
  )
}
