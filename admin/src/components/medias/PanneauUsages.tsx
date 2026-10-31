import { Link } from 'react-router'
import type { Usage } from '@/api/schemas/communs'
import { ENTREES_MENU } from '@/components/layout/navigation'
import { CLASSES_LIEN } from '@/components/ui/classes'
import { PastilleStatut } from '@/components/ui/PastilleStatut'
import { t } from '@/i18n/fr'

/**
 * Ce qui utilise un média ou un tag (section 10, RG-08) : remplace la suppression quand
 * elle est refusée, et dit pourquoi. Chaque usage mène au contenu concerné. Pour un média,
 * le créateur propriétaire est indiqué en mode multi-vendeurs.
 *
 * @example
 * onError: (erreur) => aLeCode(erreur, 'RG-08') && setUsages(usagesDe(erreur))
 * <PanneauUsages objet="ce média" usages={usages} />
 */
export function PanneauUsages({
  objet,
  usages,
  proprietaire,
}: {
  /** « ce média », « ce tag » : complète la phrase d'explication. */
  objet: string
  usages: Usage[]
  proprietaire?: string | null
}) {
  const cheminDe = (usage: Usage) =>
    ENTREES_MENU.find((entree) => entree.ressource === usage.ressource)?.chemin

  return (
    <section
      aria-label={t('usages.titre')}
      className="space-y-3 rounded-md border border-sand-300 bg-sand-50 p-4"
    >
      <h3 className="label-caps text-ink-700">{t('usages.titre')}</h3>
      {proprietaire ? (
        <p className="text-body text-ink-700">
          {t('usages.proprietaire')} <strong className="text-ink-900">{proprietaire}</strong>
        </p>
      ) : null}
      {usages.length === 0 ? (
        <p className="text-body text-ink-700">{t('usages.aucun')}</p>
      ) : (
        <>
          <p className="text-body text-ink-900">
            {usages.length > 1 ? `${usages.length} ${t('usages.plusieurs')}` : t('usages.un')}{' '}
            {t('usages.explication').replace('{objet}', objet)}
          </p>
          <ul className="divide-y divide-sand-200">
            {usages.map((usage) => {
              const chemin = cheminDe(usage)
              return (
                <li
                  key={`${usage.ressource}-${usage.id}-${usage.champ}`}
                  className="flex flex-wrap items-center justify-between gap-2 py-2"
                >
                  <span className="space-x-2">
                    {chemin ? (
                      <Link to={`${chemin}/${usage.id}`} className={CLASSES_LIEN}>
                        {usage.titre}
                      </Link>
                    ) : (
                      <span className="font-semibold text-ink-900">{usage.titre}</span>
                    )}
                    <span className="text-caption text-ink-700">
                      {t('usages.champ')} : {usage.champ}
                    </span>
                  </span>
                  {usage.statut ? <PastilleStatut etat={usage.statut} /> : null}
                </li>
              )
            })}
          </ul>
        </>
      )}
    </section>
  )
}
