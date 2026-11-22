import { ArrowRight, Plus } from 'lucide-react'
import { Link } from 'react-router'
import { useSession } from '@/auth/contexte-session'
import { peut } from '@/auth/permissions'
import { t } from '@/i18n/fr'
import { cn } from '@/lib/cn'

/**
 * Les deux points d'entrée de création (ECRANS § 3.1) : « Créer un projet » (contenu, affiche,
 * format, template) et « Créer un épisode » (affiche, synopsis, vidéo, destination). Ils sont
 * affichés en tête de la liste `/projets` — chaque carte n'apparaît que si le rôle peut créer
 * la ressource correspondante.
 */
const CARTE =
  'group flex rounded-xl border border-sand-200 bg-sand-50 transition-colors duration-(--d-fast) hover:border-clay-600 hover:bg-sand-100'

export default function CartesCreationProjets() {
  const { moi } = useSession()
  const peutFaire = (ressource: 'projets' | 'episodes') => peut(moi?.compte, 'creer', ressource)

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {peutFaire('projets') ? (
        <CarteCreation
          chemin="/projets/nouveau"
          titre={t('hub.creerProjet')}
          sousTitre={t('hub.creerProjetSous')}
        />
      ) : null}
      {peutFaire('episodes') ? (
        <CarteCreation
          chemin="/episodes/nouveau"
          titre={t('hub.creerEpisode')}
          sousTitre={t('hub.creerEpisodeSous')}
        />
      ) : null}
    </div>
  )
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
