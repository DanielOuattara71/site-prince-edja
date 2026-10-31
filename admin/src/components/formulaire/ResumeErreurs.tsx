import { CircleAlert } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { CLASSES_LIEN } from '@/components/ui/classes'
import { t } from '@/i18n/fr'
import type { ErreurListee } from '@/lib/formulaires'

/**
 * Résumé des erreurs en tête de formulaire (section 10) : il reçoit le focus à chaque
 * soumission refusée, et chaque ligne mène au champ concerné (dont l'`id` est le chemin).
 *
 * @example
 * <ResumeErreurs erreurs={listerErreurs(formState.errors)} tentative={formState.submitCount} />
 */
export function ResumeErreurs({
  erreurs,
  tentative,
  titre = t('formulaire.resumeTitre'),
}: {
  erreurs: ErreurListee[]
  /** Change à chaque soumission (`formState.submitCount`) : déclenche la prise de focus. */
  tentative: number
  titre?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const nombre = erreurs.length

  useEffect(() => {
    if (tentative > 0 && nombre > 0) ref.current?.focus()
  }, [tentative, nombre])

  if (nombre === 0) return null

  const allerAuChamp = (champ: string) => {
    const cible = document.getElementById(champ) ?? document.getElementsByName(champ)[0]
    cible?.focus()
    cible?.scrollIntoView?.({ block: 'center' })
  }

  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="alert"
      className="space-y-2 rounded-md border-2 border-clay-700 bg-sand-50 p-4 focus:outline-none focus-visible:outline-2"
    >
      <p className="flex items-center gap-2 text-body font-semibold text-clay-700">
        <CircleAlert aria-hidden className="size-5 shrink-0" />
        {titre}
      </p>
      <ul className="list-disc space-y-1 pl-6 text-body">
        {erreurs.map((erreur, index) => (
          <li key={`${erreur.champ}-${index}`}>
            {erreur.champ ? (
              <a
                href={`#${erreur.champ}`}
                className={CLASSES_LIEN}
                onClick={(evenement) => {
                  evenement.preventDefault()
                  allerAuChamp(erreur.champ)
                }}
              >
                {erreur.message}
              </a>
            ) : (
              <span className="text-ink-900">{erreur.message}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
