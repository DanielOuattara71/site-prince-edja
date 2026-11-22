import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import { ImageOff, Plus } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { medias } from '@/api/endpoints/contenus'
import type { ResumeContenu } from '@/api/schemas/communs'
import { cles } from '@/api/cles'
import { episodes } from '@/api/endpoints/editorial'
import { useSession } from '@/auth/contexte-session'
import { peut } from '@/auth/permissions'
import { EtatErreur } from '@/components/ui/Etats'
import { Confirmation } from '@/components/ui/Confirmation'
import { IndicateurAFournir } from '@/components/ui/IndicateurAFournir'
import { PastilleStatut } from '@/components/ui/PastilleStatut'
import { Squelette } from '@/components/ui/Squelette'
import { useNotifications } from '@/components/retours/contexte-notifications'
import type { ContenuDeclaratif } from '@/features/gabarits/declaratif'
import { t } from '@/i18n/fr'
import { messageErreur } from '@/lib/message-erreur'
import { etatAffiche } from '@/lib/statuts'
import { templateDe } from '@/lib/templates'

/**
 * Épisodes d'un projet (contrat 1.8.0) : vue en cartes visuelles, une affiche par épisode,
 * numéro, titre, résumé, statut. Actions : modifier, Supprimer (confirmation).
 * « Ajouter un épisode » crée l'épisode dans ce projet **uniquement pour le template Film** :
 * Programme et Bibliothèque ont d'autres unités de contenu (D-95), sinon l'épisode créé serait
 * invisible sur la page publique et bloquerait à tort la suppression du projet (RG-32).
 */

type ResumeEpisode = ResumeContenu & {
  numero?: string | null
  projetId?: string | null
  dureeMinutes?: number | null
  destination?: string | null
  illustrationIds?: string[]
  pitch?: string | null
}

export function EpisodesDuProjet({ contenu }: { contenu: ContenuDeclaratif | null }) {
  const { moi } = useSession()
  const client = useQueryClient()
  const notifier = useNotifications()
  const id = contenu?.id
  const template = templateDe({
    template: contenu?.['template'],
    format: contenu?.['format'],
  })
  const [suppression, setSuppression] = useState<ResumeEpisode | null>(null)

  const liste = useQuery({
    queryKey: ['episodes', 'liste', 'projet', id],
    queryFn: () => episodes.lister({ pageSize: 100, tri: 'numero' }, undefined, { projetId: id }),
    enabled: Boolean(id) && template === 'film',
  })

  const items = (liste.data?.items as ResumeEpisode[] | undefined) ?? []

  // Résolution des affiches (une requête par image, cachées par id).
  const images = useQueries({
    queries: items.map((episode) => ({
      queryKey: cles.media(episode.imageId ?? ''),
      queryFn: () => medias.lire(episode.imageId ?? ''),
      enabled: Boolean(episode.imageId),
      staleTime: 60_000,
    })),
  })
  const indexImages = new Map(items.map((episode, i) => [episode.id, images[i]?.data]))

  const supprimer = useMutation({
    mutationFn: (episode: ResumeEpisode) => episodes.supprimer(episode.id, episode.version),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['episodes'] })
      void client.invalidateQueries({ queryKey: ['projets', 'liste'] })
      setSuppression(null)
      notifier.succes(t('episode.supprime'))
    },
    onError: (erreur) => {
      setSuppression(null)
      notifier.erreur(messageErreur(erreur))
    },
  })

  const peutSupprimer = peut(moi?.compte, 'supprimer', 'episodes')

  // Tous les hooks sont appelés avant ce retour : le template est verrouillé après la création,
  // mais passer de l'aperçu à un projet enregistré ne doit pas changer le nombre de hooks.
  if (template !== 'film') return <UniteDuProjet template={template} id={id} />

  return (
    <section
      aria-labelledby="episodes-du-projet"
      className="space-y-4 rounded-xl border border-sand-200 bg-sand-100 p-4"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="episodes-du-projet" className="font-display text-heading-sm uppercase text-ink-900">
            {t('projet.episodesDuProjet')}
          </h2>
          {id ? (
            <p className="mt-1 text-caption text-ink-700">
              {items.length > 0
                ? `${items.length} ${items.length > 1 ? t('projet.episodesCourtsP') : t('projet.episodesCourts')}`
                : t('projet.episodesApresCreation')}
            </p>
          ) : null}
        </div>
        {id ? (
          <Link
            to={`/episodes/nouveau?projetId=${encodeURIComponent(id)}`}
            className="inline-flex min-h-11 items-center gap-2 rounded-md bg-clay-600 px-4 text-button font-semibold text-cream-100 hover:bg-clay-700"
          >
            <Plus aria-hidden className="size-4" />
            {t('episode.ajouter')}
          </Link>
        ) : null}
      </div>

      {!id ? (
        <p className="text-body text-ink-700">{t('projet.episodesApresCreation')}</p>
      ) : liste.isPending ? (
        <Squelette lignes={2} />
      ) : liste.isError ? (
        <EtatErreur erreur={liste.error} surReessai={() => void liste.refetch()} />
      ) : items.length === 0 ? (
        <p className="text-body text-ink-700">{t('projet.episodesAucun')}</p>
      ) : (
        <ul className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 lg:grid-cols-3">
          {items.map((episode) => {
            const media = indexImages.get(episode.id)
            const imageUrl = media?.declinaisons[0]?.url ?? media?.url ?? null
            const etat = episode.statut ? etatAffiche(episode.statut, episode.publieLe) : null
            return (
              <li
                key={episode.id}
                className="flex flex-col gap-2 rounded-md border border-sand-200 bg-sand-50 p-2"
              >
                <Link
                  to={`/episodes/${episode.id}`}
                  className="group flex flex-1 flex-col gap-2"
                  aria-label={`${t('episode.lire')} : ${episode.titre ?? t('declaratif.sansTitre')}`}
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={media?.traductions.fr?.texteAlt ?? ''}
                      loading="lazy"
                      decoding="async"
                      className="aspect-[16/10] w-full rounded-md bg-sand-200 object-cover"
                    />
                  ) : (
                    <span className="flex aspect-[16/10] w-full items-center justify-center rounded-md bg-sand-100 text-ink-500">
                      <ImageOff aria-hidden className="size-8" />
                    </span>
                  )}
                  <span className="flex items-center gap-3">
                    <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-md border border-sand-300 bg-sand-100 text-caption font-semibold tnum text-ink-900">
                      {(episode.numero ?? '').trim() || '—'}
                    </span>
                    <span className="min-w-0">
                      <span className="line-clamp-2 block min-h-7 text-body font-semibold text-ink-900 group-hover:underline">
                        {episode.titre || t('declaratif.sansTitre')}
                      </span>
                      {episode.pitch ? (
                        <span className="line-clamp-1 block text-caption text-ink-700">
                          {episode.pitch}
                        </span>
                      ) : null}
                    </span>
                  </span>
                </Link>
                <div className="flex flex-wrap items-center gap-2 text-caption text-ink-700">
                  {etat ? <PastilleStatut etat={etat} /> : null}
                  {typeof episode.dureeMinutes === 'number' ? (
                    <span className="tnum">{episode.dureeMinutes} min</span>
                  ) : null}
                  {episode.destination ? (
                    <>
                      <span aria-hidden>·</span>
                      <span>{episode.destination}</span>
                    </>
                  ) : null}
                  <IndicateurAFournir champs={episode.champsAFournir} />
                </div>
                <div className="flex flex-wrap items-center gap-1 border-t border-sand-200 pt-2">
                  <Link
                    to={`/episodes/${episode.id}`}
                    className="inline-flex min-h-9 items-center rounded-md px-2 text-caption font-semibold text-clay-700 underline underline-offset-4"
                  >
                    {t('tableau.ouvrir')}
                  </Link>
                  {peutSupprimer ? (
                    <button
                      type="button"
                      onClick={() => setSuppression(episode)}
                      className="inline-flex min-h-9 items-center rounded-md px-2 text-caption font-semibold text-ink-500 hover:bg-sand-200"
                    >
                      {t('episode.supprimer')}
                    </button>
                  ) : null}
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {suppression ? (
        <Confirmation
          ouverte
          titre={t('episode.supprimerTitre')}
          objet={suppression.titre || t('declaratif.sansTitre')}
          consequence={t('episode.supprimerTexte')}
          libelleConfirmer={t('episode.supprimer')}
          danger
          enCours={supprimer.isPending}
          surConfirmer={() => supprimer.mutate(suppression)}
          surAnnuler={() => setSuppression(null)}
        />
      ) : null}
    </section>
  )
}

/** Bloc de substitution pour les templates qui ne rendent pas d'épisodes (D-95). */
function UniteDuProjet({
  template,
  id,
}: {
  template: 'programme' | 'bibliotheque'
  id: string | undefined
}) {
  const bibliotheque = template === 'bibliotheque'
  return (
    <section
      aria-labelledby="unite-du-projet"
      className="space-y-3 rounded-xl border border-sand-200 bg-sand-100 p-4"
    >
      <h2 id="unite-du-projet" className="font-display text-heading-sm uppercase text-ink-900">
        {bibliotheque ? t('projet.uniteArchive') : t('projet.uniteProgramme')}
      </h2>
      <p className="text-body text-ink-700">
        {bibliotheque ? t('projet.uniteArchiveTexte') : t('projet.uniteProgrammeTexte')}
      </p>
      <Link
        to={
          bibliotheque
            ? id
              ? `/archive/nouveau?projetId=${encodeURIComponent(id)}`
              : '/archive'
            : '/villes'
        }
        className="inline-flex min-h-11 items-center text-caption font-semibold text-clay-700 underline-offset-4 hover:underline"
      >
        {bibliotheque ? t('archive.nouvelle') : t('menu.villes')}
      </Link>
    </section>
  )
}
