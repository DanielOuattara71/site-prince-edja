import { t } from '@/i18n/fr'
import { cn } from '@/lib/cn'

/** État de chargement : des barres neutres, annoncées une fois aux lecteurs d'écran. */
export function Squelette({ lignes = 3, plein = false }: { lignes?: number; plein?: boolean }) {
  return (
    <output
      aria-live="polite"
      className={cn(
        'block space-y-3',
        plein && 'mx-auto flex min-h-svh max-w-md flex-col justify-center px-5',
      )}
    >
      <span className="sr-only">{t('chargement')}</span>
      {Array.from({ length: lignes }, (_, index) => (
        <span
          key={index}
          aria-hidden
          className="block h-4 animate-pulse rounded-md bg-sand-200 motion-reduce:animate-none"
          style={{ width: `${90 - index * 15}%` }}
        />
      ))}
    </output>
  )
}
