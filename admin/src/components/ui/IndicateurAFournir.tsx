import { allerAuChamp } from '@/components/formulaire/aller-au-champ'
import { CLASSES_LIEN } from '@/components/ui/classes'
import { PastilleStatut } from '@/components/ui/PastilleStatut'
import { t } from '@/i18n/fr'
import { libelleChamp } from '@/lib/traductions'

/**
 * Ce qui reste « à compléter » (`champsAFournir`, § 7.6) : pastille, compteur et, en mode
 * détaillé, la liste des champs. Dans un formulaire (`versChamp`), chaque ligne est un lien
 * qui place le curseur sur le champ (U7, ECRANS § 0.3). Ne propose **jamais** de valeur à la
 * place du client : vide n'est pas zéro. Rien n'est rendu quand tout est fourni.
 *
 * @example
 * <IndicateurAFournir champs={article.champsAFournir} libelles={{ extrait: 'Résumé' }} detail />
 */
export function IndicateurAFournir({
  champs,
  libelles,
  detail = false,
  versChamp,
}: {
  champs: string[]
  libelles?: Record<string, string>
  detail?: boolean
  /** Champ du formulaire vers lequel mène chaque ligne ; absent = liste simple. */
  versChamp?: (chemin: string) => string
}) {
  if (champs.length === 0) return null
  const pastille = <PastilleStatut etat="a_fournir" complement={String(champs.length)} />
  if (!detail) return pastille

  return (
    <div className="space-y-2 rounded-md border border-dashed border-clay-600 bg-sand-50 p-4">
      {pastille}
      <p className="text-body text-ink-900">
        {versChamp ? t('aFournir.ilManque') : t('aFournir.intro')}
      </p>
      <ul className="list-disc space-y-0.5 pl-5 text-body text-ink-700">
        {champs.map((chemin) => (
          <li key={chemin}>
            {versChamp ? (
              <a
                href={`#${versChamp(chemin)}`}
                className={CLASSES_LIEN}
                onClick={(evenement) => {
                  evenement.preventDefault()
                  allerAuChamp(versChamp(chemin))
                }}
              >
                {libelleChamp(chemin, libelles)}
              </a>
            ) : (
              libelleChamp(chemin, libelles)
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
