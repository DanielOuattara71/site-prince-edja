import { LANGUES } from '@/data/navigation'
import { useLangue } from '@/i18n/contexteLangue'
import { cn } from '@/lib/cn'

interface Props {
  /** Fond de la surface hôte. Le sélecteur vit sur tous les fonds du site : barre
   *  ivoire, overlay et pied de page nuit. Sans ce réglage, la palette crème/or du
   *  mode sombre reste invisible sur sable. */
  tone?: 'sombre' | 'clair'
  className?: string
}

/**
 * Sélecteur de langue.
 *
 * Deux boutons avec `aria-pressed`, pas un `<select>` : deux options ne méritent pas
 * un menu déroulant, et l'état actif est annoncé d'un coup. Le libellé accessible dit
 * l'action (« Passer en English »), car c'est elle que la personne va effectuer.
 */
export function LangueSwitcher({ tone = 'sombre', className }: Props) {
  const { langue, definirLangue, t, afficherLangue } = useLangue()
  const sombre = tone === 'sombre'

  return (
    <div
      role="group"
      aria-label={t('langue.etiquette')}
      className={cn('inline-flex items-center gap-1', className)}
    >
      {LANGUES.map((entree) => {
        const actif = entree.code === langue
        // Or sur fond clair : 1.9:1, interdit. Là-bas l'actif passe en terracotta,
        // l'inactif en ink-500, le pas le plus clair qui tienne sur tous les sables.
        const etat = actif
          ? sombre
            ? 'text-gold-400'
            : 'text-clay-600'
          : sombre
            ? 'text-cream-100/55 hover:text-cream-100'
            : 'text-ink-500 hover:text-ink-900'
        return (
          <button
            key={entree.code}
            type="button"
            lang={entree.code}
            aria-pressed={actif}
            aria-label={afficherLangue(entree.libelle)}
            onClick={() => definirLangue(entree.code)}
            className={cn(
              'min-h-11 rounded-full px-3 text-caption font-semibold tracking-wide transition-colors duration-(--d-fast)',
              etat,
            )}
          >
            {entree.court}
          </button>
        )
      })}
    </div>
  )
}
