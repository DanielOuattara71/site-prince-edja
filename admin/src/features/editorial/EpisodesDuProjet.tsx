import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { Link } from 'react-router'
import { episodes } from '@/api/endpoints/editorial'
import { CLASSES_LIEN } from '@/components/ui/classes'
import { EtatErreur } from '@/components/ui/Etats'
import { Squelette } from '@/components/ui/Squelette'
import type { ContenuDeclaratif } from '@/features/gabarits/declaratif'
import { t } from '@/i18n/fr'

/**
 * Épisodes d'un projet (ECRANS § 3.3) : liste ordonnée par numéro (RG-32), lien vers chaque
 * épisode et « Créer un épisode dans ce projet » (le projet est prérempli).
 */
export function EpisodesDuProjet({ contenu }: { contenu: ContenuDeclaratif | null }) {
  const id = contenu?.id
  const liste = useQuery({
    queryKey: ['episodes', 'liste', 'projet', id],
    queryFn: () => episodes.lister({ pageSize: 100, tri: 'numero' }, undefined, { projetId: id }),
    enabled: Boolean(id),
  })

  return (
    <section
      aria-labelledby="episodes-du-projet"
      className="space-y-3 rounded-md border border-sand-200 p-4"
    >
      <h2 id="episodes-du-projet" className="text-body font-semibold text-ink-900">
        {t('projet.episodesDuProjet')}
      </h2>
      {!id ? (
        <p className="text-body text-ink-700">{t('projet.episodesApresCreation')}</p>
      ) : liste.isPending ? (
        <Squelette lignes={2} />
      ) : liste.isError ? (
        <EtatErreur erreur={liste.error} surReessai={() => void liste.refetch()} />
      ) : (
        <>
          {liste.data.items.length === 0 ? (
            <p className="text-body text-ink-700">{t('projet.episodesAucun')}</p>
          ) : (
            <ol className="space-y-1">
              {liste.data.items.map((e) => (
                <li key={e.id} className="flex min-h-11 items-center gap-3">
                  <span className="tnum w-12 shrink-0 text-caption text-ink-700">{e.numero}</span>
                  <Link to={`/episodes/${e.id}`} className={CLASSES_LIEN}>
                    {e.titre || t('declaratif.sansTitre')}
                  </Link>
                </li>
              ))}
            </ol>
          )}
          <Link
            to={`/episodes/nouveau?projetId=${encodeURIComponent(id)}`}
            className="inline-flex min-h-11 items-center gap-2 font-semibold text-clay-700 underline underline-offset-4"
          >
            <Plus aria-hidden className="size-4" />
            {t('projet.creerEpisodeIci')}
          </Link>
        </>
      )}
    </section>
  )
}
