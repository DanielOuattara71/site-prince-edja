import { PastilleStatut } from '@/components/ui/PastilleStatut'
import { t } from '@/i18n/fr'
import { libelleChamp } from '@/lib/traductions'

/**
 * Ce que le client doit encore fournir (`champsAFournir`, § 7.6) : pastille, compteur et,
 * en mode détaillé, la liste des champs. Ne propose **jamais** de valeur à la place du
 * client : vide n'est pas zéro (section 11). Rien n'est rendu quand tout est fourni.
 *
 * @example
 * <IndicateurAFournir champs={article.champsAFournir} libelles={{ extrait: 'Résumé' }} detail />
 */
export function IndicateurAFournir({
  champs,
  libelles,
  detail = false,
}: {
  champs: string[]
  libelles?: Record<string, string>
  detail?: boolean
}) {
  if (champs.length === 0) return null
  const pastille = <PastilleStatut etat="a_fournir" complement={String(champs.length)} />
  if (!detail) return pastille

  return (
    <div className="space-y-2 rounded-md border border-dashed border-clay-600 bg-sand-50 p-4">
      {pastille}
      <p className="text-body text-ink-900">{t('aFournir.intro')}</p>
      <ul className="list-disc space-y-0.5 pl-5 text-body text-ink-700">
        {champs.map((chemin) => (
          <li key={chemin}>{libelleChamp(chemin, libelles)}</li>
        ))}
      </ul>
    </div>
  )
}
