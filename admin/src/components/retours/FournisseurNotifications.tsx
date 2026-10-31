import { CircleAlert, CircleCheck, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  ContexteNotifications,
  DUREE_SUCCES_MS,
  type Notification,
  type ValeurNotifications,
} from '@/components/retours/contexte-notifications'
import { t } from '@/i18n/fr'

/**
 * Zone de notifications (section 10) : deux régions vivantes **présentes dès le départ**
 * (un lecteur d'écran n'annonce pas une région créée en même temps que son contenu) —
 * polie pour les succès, assertive pour les erreurs. Seuls les succès disparaissent seuls.
 *
 * @example
 * const notifier = useNotifications()
 * notifier.succes('Article enregistré.')
 * notifier.erreur(messageErreur(erreur), erreur.requeteId)
 */
export function FournisseurNotifications({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const prochainId = useRef(1)
  const minuteries = useRef(new Map<number, ReturnType<typeof setTimeout>>())

  const retirer = useCallback((id: number) => {
    clearTimeout(minuteries.current.get(id))
    minuteries.current.delete(id)
    setNotifications((liste) => liste.filter((notification) => notification.id !== id))
  }, [])

  const ajouter = useCallback(
    (ton: Notification['ton'], message: string, reference?: string) => {
      const id = prochainId.current++
      setNotifications((liste) => [...liste, { id, ton, message, reference }])
      if (ton === 'succes') {
        minuteries.current.set(
          id,
          setTimeout(() => retirer(id), DUREE_SUCCES_MS),
        )
      }
    },
    [retirer],
  )

  useEffect(() => {
    const enCours = minuteries.current
    return () => {
      for (const minuterie of enCours.values()) clearTimeout(minuterie)
    }
  }, [])

  const valeur = useMemo<ValeurNotifications>(
    () => ({
      succes: (message) => ajouter('succes', message),
      erreur: (message, reference) => ajouter('erreur', message, reference),
      retirer,
    }),
    [ajouter, retirer],
  )

  const region = (ton: Notification['ton']) =>
    notifications
      .filter((notification) => notification.ton === ton)
      .map((notification) => (
        <Carte key={notification.id} notification={notification} surFermeture={retirer} />
      ))

  return (
    <ContexteNotifications.Provider value={valeur}>
      {children}
      <div className="pointer-events-none fixed inset-x-4 bottom-4 z-70 flex flex-col items-end gap-2 sm:left-auto sm:w-96">
        <output aria-live="polite" className="contents">
          {region('succes')}
        </output>
        <div role="alert" aria-live="assertive" className="contents">
          {region('erreur')}
        </div>
      </div>
    </ContexteNotifications.Provider>
  )
}

function Carte({
  notification,
  surFermeture,
}: {
  notification: Notification
  surFermeture: (id: number) => void
}) {
  const erreur = notification.ton === 'erreur'
  const Icone = erreur ? CircleAlert : CircleCheck
  return (
    <div
      className={
        erreur
          ? 'pointer-events-auto flex w-full items-start gap-3 rounded-md border border-clay-700 bg-sand-50 p-3 text-clay-700 shadow-lg'
          : 'pointer-events-auto flex w-full items-start gap-3 rounded-md border border-forest-900 bg-sage-100 p-3 text-forest-900 shadow-lg'
      }
    >
      <Icone aria-hidden className="mt-0.5 size-5 shrink-0" />
      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-body font-semibold">{notification.message}</p>
        {notification.reference ? (
          <p className="text-caption text-ink-700">
            {t('erreur.reference')} : <code className="font-mono">{notification.reference}</code>
          </p>
        ) : null}
      </div>
      <button
        type="button"
        onClick={() => surFermeture(notification.id)}
        className="-m-1 inline-flex size-11 shrink-0 items-center justify-center rounded-md text-ink-900 hover:bg-sand-100"
      >
        <X aria-hidden className="size-4" />
        <span className="sr-only">{t('notification.fermer')}</span>
      </button>
    </div>
  )
}
