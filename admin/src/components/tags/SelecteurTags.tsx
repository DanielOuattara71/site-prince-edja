import { useQueries } from '@tanstack/react-query'
import { cles } from '@/api/cles'
import { tags } from '@/api/endpoints/contenus'
import type { Tag, TypeTag } from '@/api/schemas/tags'
import { Case } from '@/components/ui/Case'
import { MessageErreurChamp } from '@/components/ui/EnveloppeChamp'
import { EtatErreur } from '@/components/ui/Etats'
import { Squelette } from '@/components/ui/Squelette'
import { t, type CleTraduction } from '@/i18n/fr'

/**
 * Tags d'un contenu, par groupe (section 10). Avec `exigerFormat`, l'absence de tag de
 * format est signalée **avant l'envoi** (RG-06) ; le serveur la refuse de toute façon.
 * Un tag sans libellé français s'affiche par son code : rien n'est inventé.
 *
 * L'`id` du groupe est `tagIds` : le résumé d'erreurs y mène.
 *
 * @example
 * <Controller control={control} name="tagIds" render={({ field }) => (
 *   <SelecteurTags valeur={field.value} surChange={field.onChange} exigerFormat
 *     afficherErreur={formState.isSubmitted} />
 * )} />
 */
const TYPES_PAR_DEFAUT: TypeTag[] = ['format', 'pays', 'theme', 'projet']

export function SelecteurTags({
  valeur,
  surChange,
  types = TYPES_PAR_DEFAUT,
  exigerFormat = false,
  afficherErreur = false,
  erreur,
}: {
  valeur: string[]
  surChange: (ids: string[]) => void
  types?: TypeTag[]
  exigerFormat?: boolean
  /** Montre l'erreur RG-06 (après une première soumission, par exemple). */
  afficherErreur?: boolean
  /** Erreur venue du serveur ou du schéma du formulaire. */
  erreur?: string | undefined
}) {
  const requetes = useQueries({
    queries: types.map((type) => ({
      queryKey: cles.tagsParType(type),
      queryFn: () => tags.listerParType(type),
      staleTime: 60_000,
    })),
  })

  const formats = requetes[types.indexOf('format')]?.data?.items ?? []
  const sansFormat =
    exigerFormat &&
    requetes.every((r) => r.isSuccess) &&
    !formats.some((tag) => valeur.includes(tag.id))
  const message = erreur ?? (afficherErreur && sansFormat ? t('tags.formatRequis') : undefined)

  const basculer = (id: string) =>
    surChange(valeur.includes(id) ? valeur.filter((v) => v !== id) : [...valeur, id])

  return (
    <fieldset
      id="tagIds"
      tabIndex={-1}
      aria-describedby={message ? 'tagIds-erreur' : undefined}
      className="space-y-4 focus:outline-none"
    >
      <legend className="text-body font-semibold text-ink-900">
        {t('tags.titre')}
        {exigerFormat ? (
          <span className="ml-1 text-caption font-normal text-ink-700">{t('tags.aideFormat')}</span>
        ) : null}
      </legend>
      <div className="grid gap-4 sm:grid-cols-2">
        {types.map((type, index) => {
          const requete = requetes[index]
          return (
            <fieldset key={type} className="space-y-1 rounded-md border border-sand-200 p-3">
              <legend className="label-caps px-1 text-ink-700">
                {t(`tags.type.${type}` as CleTraduction)}
              </legend>
              {!requete || requete.isPending ? (
                <Squelette lignes={2} />
              ) : requete.isError ? (
                <EtatErreur erreur={requete.error} surReessai={() => void requete.refetch()} />
              ) : requete.data.items.length === 0 ? (
                <p className="text-caption text-ink-700">{t('tags.aucun')}</p>
              ) : (
                requete.data.items.map((tag: Tag) => (
                  <Case
                    key={tag.id}
                    libelle={tag.traductions.fr?.libelle ?? tag.code}
                    checked={valeur.includes(tag.id)}
                    onChange={() => basculer(tag.id)}
                  />
                ))
              )}
            </fieldset>
          )
        })}
      </div>
      {message ? <MessageErreurChamp id="tagIds-erreur">{message}</MessageErreurChamp> : null}
    </fieldset>
  )
}
