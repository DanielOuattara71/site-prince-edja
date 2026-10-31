import { useId, type ReactNode } from 'react'
import { t } from '@/i18n/fr'
import { cn } from '@/lib/cn'

/**
 * Interrupteur (`role="switch"`) : l'état est dit en texte (« Activé » / « Désactivé ») et par
 * la position du curseur, jamais par la seule couleur. Contrôlé : à brancher sur
 * `Controller` de React Hook Form.
 *
 * @example
 * <Interrupteur libelle="Mettre à la une" actif={aLaUne} surChange={setALaUne} />
 */
export function Interrupteur({
  libelle,
  actif,
  surChange,
  aide,
  desactive = false,
  className,
}: {
  libelle: string
  actif: boolean
  surChange: (actif: boolean) => void
  aide?: ReactNode
  desactive?: boolean
  className?: string
}) {
  const id = useId()
  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex min-h-11 items-center justify-between gap-4">
        <span id={`${id}-libelle`} className="text-body font-semibold text-ink-900">
          {libelle}
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={actif}
          aria-labelledby={`${id}-libelle`}
          aria-describedby={aide ? `${id}-aide` : undefined}
          disabled={desactive}
          onClick={() => surChange(!actif)}
          className="inline-flex min-h-11 items-center gap-3 rounded-md px-1 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span
            aria-hidden
            className={cn(
              'relative inline-block h-6 w-11 rounded-full border transition-colors duration-(--d-fast)',
              actif ? 'border-forest-900 bg-forest-900' : 'border-ink-500 bg-sand-200',
            )}
          >
            <span
              className={cn(
                'absolute top-0.5 size-4.5 rounded-full bg-sand-50 shadow transition-transform duration-(--d-fast) ease-(--ease-expo)',
                actif ? 'translate-x-5.5' : 'translate-x-0.5',
              )}
            />
          </span>
          <span className="w-20 text-left text-caption font-semibold text-ink-900">
            {actif ? t('interrupteur.active') : t('interrupteur.desactive')}
          </span>
        </button>
      </div>
      {aide ? (
        <p id={`${id}-aide`} className="text-caption text-ink-700">
          {aide}
        </p>
      ) : null}
    </div>
  )
}
