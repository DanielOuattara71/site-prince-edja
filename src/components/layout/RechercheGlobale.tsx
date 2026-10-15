import { useCallback, useEffect, useState } from 'react'
import { lazy, Suspense } from 'react'
import { Search } from 'lucide-react'
import { useLangue } from '@/i18n/contexteLangue'
import { cn } from '@/lib/cn'

/**
 * Déclencheur de la recherche globale.
 *
 * Concentre volontairement le strict nécessaire : le bouton, le raccourci clavier et
 * l'état d'ouverture. Le panneau, et avec lui l'index, est chargé en `lazy` : visiter
 * le site ne doit pas payer le coût d'un moteur de recherche que l'on n'ouvre pas.
 */
const PanneauRecherche = lazy(() => import('@/components/layout/PanneauRecherche'))

interface RechercheGlobaleProps {
  tone?: 'sombre' | 'clair'
  className?: string
}

export function RechercheGlobale({ tone = 'sombre', className }: RechercheGlobaleProps) {
  const [ouvert, setOuvert] = useState(false)
  const { t } = useLangue()

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOuvert(true)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  const fermer = useCallback(() => setOuvert(false), [])

  return (
    <>
      <button
        type="button"
        onClick={() => setOuvert(true)}
        aria-label={t('recherche.ouvrir')}
        aria-haspopup="dialog"
        className={cn(
          'inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-caption font-semibold transition-colors duration-(--d-fast)',
          tone === 'sombre'
            ? 'border-cream-100/40 text-cream-100 hover:bg-cream-100 hover:text-ink-900'
            : 'border-ink-900/30 text-ink-900 hover:bg-ink-900 hover:text-cream-100',
          className,
        )}
      >
        <Search aria-hidden className="size-4" />
        <span className="hidden lg:inline">{t('recherche.declencheur')}</span>
        <kbd aria-hidden className="hidden text-caption opacity-60 xl:inline">
          ⌘K
        </kbd>
      </button>

      {ouvert && (
        <Suspense fallback={null}>
          <PanneauRecherche ouvert={ouvert} onClose={fermer} />
        </Suspense>
      )}
    </>
  )
}
