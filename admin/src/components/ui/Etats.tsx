import { CircleAlert, Inbox, RotateCcw } from 'lucide-react'
import type { ReactNode } from 'react'
import { estErreurApi } from '@/api/erreurs'
import { Bouton } from '@/components/ui/Bouton'
import { t } from '@/i18n/fr'
import { messageErreur } from '@/lib/message-erreur'

/**
 * États vide et en erreur d'une liste ou d'un détail (section 10). Avec `Squelette`, ce sont
 * les trois états de tout écran qui charge des données.
 *
 * @example
 * if (requete.isPending) return <Squelette />
 * if (requete.isError) return <EtatErreur erreur={requete.error} surReessai={() => void requete.refetch()} />
 * if (requete.data.total === 0) return <EtatVide titre="Aucun article" action={<Bouton>Créer</Bouton>} />
 */
export function EtatVide({
  titre,
  texte,
  action,
}: {
  titre: string
  texte?: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-md border border-dashed border-sand-300 bg-sand-50 px-6 py-10 text-center">
      <Inbox aria-hidden className="size-8 text-ink-500" />
      <p className="text-body-lg font-semibold text-ink-900">{titre}</p>
      {texte ? <p className="max-w-prose text-body text-ink-700">{texte}</p> : null}
      {action}
    </div>
  )
}

/** Erreur de chargement : message clair et référence de la requête pour le support (D-17). */
export function EtatErreur({
  erreur,
  titre = t('erreur.chargement'),
  surReessai,
}: {
  erreur: unknown
  titre?: string
  surReessai?: () => void
}) {
  const reference = estErreurApi(erreur) ? erreur.requeteId : undefined
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-3 rounded-md border border-clay-700 bg-sand-100 px-5 py-4"
    >
      <p className="flex items-center gap-2 text-body font-semibold text-clay-700">
        <CircleAlert aria-hidden className="size-5 shrink-0" />
        {titre}
      </p>
      <p className="text-body text-ink-900">{messageErreur(erreur)}</p>
      {reference ? (
        <p className="text-caption text-ink-700">
          {t('erreur.reference')} : <code className="font-mono">{reference}</code>
        </p>
      ) : null}
      {surReessai ? (
        <Bouton variante="secondaire" onClick={surReessai}>
          <RotateCcw aria-hidden className="size-4" />
          {t('erreur.reessayer')}
        </Bouton>
      ) : null}
    </div>
  )
}
