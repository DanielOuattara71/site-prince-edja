import { useEffect, useRef, type ReactNode } from 'react'
import { t } from '@/i18n/fr'
import { cn } from '@/lib/cn'

/**
 * Titre unique d'une page (section 12) : un seul `h1`, qui met aussi à jour `document.title`
 * et reçoit le focus à l'arrivée sur la page. Le lecteur d'écran annonce ainsi le
 * changement de route, et la navigation au clavier repart du haut du contenu.
 */
export function TitrePage({
  children,
  titre,
  className,
}: {
  children: ReactNode
  titre: string
  className?: string
}) {
  const ref = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    document.title = `${titre} · ${t('app.nom')}`
    ref.current?.focus({ preventScroll: true })
  }, [titre])

  return (
    <h1
      ref={ref}
      tabIndex={-1}
      className={cn(
        'font-display text-heading-md uppercase text-ink-900 focus:outline-none',
        className,
      )}
    >
      {children}
    </h1>
  )
}
