import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { History } from 'lucide-react'
import { useState } from 'react'
import { cles } from '@/api/cles'
import { versions } from '@/api/endpoints/versions'
import type { RessourceVersionnee } from '@/api/schemas/versions'
import { useSession } from '@/auth/contexte-session'
import { peut } from '@/auth/permissions'
import { useNotifications } from '@/components/retours/contexte-notifications'
import { Alerte } from '@/components/ui/Alerte'
import { Bouton } from '@/components/ui/Bouton'
import { Confirmation } from '@/components/ui/Confirmation'
import { EtatErreur, EtatVide } from '@/components/ui/Etats'
import { Squelette } from '@/components/ui/Squelette'
import { t } from '@/i18n/fr'
import { cn } from '@/lib/cn'
import { comparer } from '@/lib/comparer'
import { formaterDateHeure } from '@/lib/dates'
import { messageErreur } from '@/lib/message-erreur'
import { libelleChamp } from '@/lib/traductions'

/**
 * Historique des versions d'un objet (section 10, § 14.2) : liste, comparaison simple avec
 * la version actuelle, restauration **confirmée**. Restaurer crée une nouvelle version
 * (l'historique n'est jamais réécrit) et ne change pas le statut. Admin seulement.
 *
 * @example
 * <HistoriqueVersions ressource="articles" id={article.id} actuel={article}
 *   versionCourante={article.version} titre={article.traductions.fr?.titre ?? ''}
 *   surRestauration={() => void requete.refetch()} />
 */
export function HistoriqueVersions({
  ressource,
  id,
  actuel,
  versionCourante,
  titre,
  libelles,
  surRestauration,
}: {
  ressource: RessourceVersionnee
  id: string
  /** Objet tel qu'il est aujourd'hui, pour la comparaison. */
  actuel: unknown
  versionCourante: number
  /** Nom de l'objet, repris par la confirmation. */
  titre: string
  libelles?: Record<string, string>
  surRestauration: (objet: unknown) => void
}) {
  const { moi } = useSession()
  const notifier = useNotifications()
  const client = useQueryClient()
  const [choisie, setChoisie] = useState<number | null>(null)
  const [confirmer, setConfirmer] = useState(false)

  const liste = useQuery({
    queryKey: cles.versions(ressource, id),
    queryFn: () => versions.lister(ressource, id),
  })
  const instantane = useQuery({
    queryKey: cles.version(ressource, id, choisie ?? 0),
    queryFn: () => versions.lire(ressource, id, choisie ?? 0),
    enabled: choisie !== null && choisie !== versionCourante,
  })
  const restauration = useMutation({
    mutationFn: (version: number) =>
      versions.restaurer({ ressource, id, version, versionCourante }),
    onSuccess: (objet, version) => {
      setConfirmer(false)
      setChoisie(null)
      void client.invalidateQueries({ queryKey: cles.versions(ressource, id) })
      notifier.succes(`${t('versions.restauree')} ${version}.`)
      surRestauration(objet)
    },
  })

  const peutRestaurer = peut(moi?.compte, 'restaurer', ressource)
  const differences = instantane.data ? comparer(instantane.data.instantane, actuel) : []

  return (
    <section aria-labelledby={`historique-${id}`} className="space-y-4">
      <h2
        id={`historique-${id}`}
        className="flex items-center gap-2 font-display text-heading-sm uppercase"
      >
        <History aria-hidden className="size-5" />
        {t('versions.titre')}
      </h2>

      {liste.isPending ? (
        <Squelette />
      ) : liste.isError ? (
        <EtatErreur erreur={liste.error} surReessai={() => void liste.refetch()} />
      ) : liste.data.length === 0 ? (
        <EtatVide titre={t('versions.aucune')} />
      ) : (
        <ol className="divide-y divide-sand-200 rounded-md border border-sand-200">
          {liste.data.map((entree) => {
            const courante = entree.version === versionCourante
            return (
              <li
                key={entree.version}
                className="flex flex-wrap items-center justify-between gap-2 px-3 py-2"
              >
                <div>
                  <p className="text-body font-semibold text-ink-900">
                    {t('versions.version')} {entree.version}
                    {courante ? (
                      <span className="ml-2 rounded-full bg-sand-200 px-2 text-caption">
                        {t('versions.actuelle')}
                      </span>
                    ) : null}
                  </p>
                  <p className="text-caption text-ink-700">
                    {formaterDateHeure(entree.creeLe)} ·{' '}
                    {entree.creePar?.nom ?? t('versions.systeme')} · {entree.action}
                  </p>
                </div>
                {!courante ? (
                  <Bouton
                    variante={choisie === entree.version ? 'primaire' : 'secondaire'}
                    aria-pressed={choisie === entree.version}
                    onClick={() => setChoisie(choisie === entree.version ? null : entree.version)}
                  >
                    {t('versions.comparer')}
                  </Bouton>
                ) : null}
              </li>
            )
          })}
        </ol>
      )}

      {choisie !== null && choisie !== versionCourante ? (
        <div className="space-y-3 rounded-md border border-sand-200 bg-sand-50 p-4">
          <h3 className="text-body font-semibold">
            {t('versions.version')} {choisie} → {t('versions.actuelle')}
          </h3>
          {instantane.isPending ? (
            <Squelette lignes={2} />
          ) : instantane.isError ? (
            <EtatErreur erreur={instantane.error} />
          ) : differences.length === 0 ? (
            <p className="text-body text-ink-700">{t('versions.identique')}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-body">
                <caption className="sr-only">
                  {t('versions.differences')} {choisie}
                </caption>
                <thead>
                  <tr className="text-caption text-ink-700">
                    <th scope="col" className="py-1 pr-3">
                      {t('versions.champ')}
                    </th>
                    <th scope="col" className="py-1 pr-3">
                      {t('versions.version')} {choisie}
                    </th>
                    <th scope="col" className="py-1">
                      {t('versions.actuelle')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {differences.map((difference) => (
                    <tr key={difference.chemin} className="border-t border-sand-200 align-top">
                      <th scope="row" className="py-2 pr-3 font-semibold">
                        {libelleChamp(difference.chemin, libelles)}
                      </th>
                      <td
                        className={cn('py-2 pr-3 text-ink-700', 'line-through decoration-ink-500')}
                      >
                        {difference.avant}
                      </td>
                      <td className="py-2 text-ink-900">{difference.apres}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {peutRestaurer ? (
            <Bouton variante="secondaire" onClick={() => setConfirmer(true)}>
              {t('versions.restaurer')} {choisie}
            </Bouton>
          ) : null}
          {restauration.isError ? (
            <Alerte ton="erreur">{messageErreur(restauration.error)}</Alerte>
          ) : null}
        </div>
      ) : null}

      <Confirmation
        ouverte={confirmer}
        titre={`${t('versions.restaurer')} ${choisie ?? ''}`}
        objet={titre}
        consequence={t('versions.consequence')}
        libelleConfirmer={t('versions.confirmer')}
        enCours={restauration.isPending}
        surConfirmer={() => choisie !== null && restauration.mutate(choisie)}
        surAnnuler={() => setConfirmer(false)}
      />
    </section>
  )
}
