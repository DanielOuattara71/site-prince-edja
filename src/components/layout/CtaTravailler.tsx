import { Link } from 'react-router'
import { CTA_PRINCIPAL } from '@/data/navigation'
import { useLangue } from '@/i18n/contexteLangue'
import { cn } from '@/lib/cn'

interface Props {
  className?: string
  /** Version compacte de l'en-tête, où la place est comptée. */
  compact?: boolean
  /** Fond de la surface hôte. Sur nuit, le plein encre se confond avec son
   *  support : `ink-900` (#1c140d) et `night-900` (#14100b) ne different que de
   *  7 % de luminosité, le bouton y devient invisible. */
  tone?: 'clair' | 'sombre'
}

/**
 * L'action principale du site : « Travailler avec Prince ».
 *
 * Un seul composant, parce que le bouton apparaît à l'identique dans l'en-tête et
 * dans le menu plein écran. Le dupliquer garantissait qu'un des deux finisse repeint
 * ou redimensionné sans l'autre.
 *
 * Plein encre sur fond clair, plein crème sur fond nuit : la terracotta reste un
 * accent (soulignement du lien actif, anneau de focus), jamais la couleur du bouton.
 * Aucun effet magnétique ici, le cahier des charges interdit les animations gadget.
 */
export function CtaTravailler({ className, compact = false, tone = 'clair' }: Props) {
  const { l } = useLangue()

  return (
    <Link
      to={CTA_PRINCIPAL.to}
      className={cn(
        'inline-flex min-h-11 shrink-0 items-center justify-center rounded-md font-semibold transition-colors duration-(--d-fast) focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-clay-600',
        tone === 'sombre'
          ? 'bg-cream-100 text-ink-900 hover:bg-sand-100'
          : 'bg-ink-900 text-cream-100 hover:bg-ink-700',
        compact ? 'px-4 text-caption' : 'px-6 text-button',
        className,
      )}
    >
      {l(CTA_PRINCIPAL.libelle)}
    </Link>
  )
}
