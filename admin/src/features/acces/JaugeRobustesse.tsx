import { noterMotDePasse } from '@/lib/robustesse'
import { t, type CleTraduction } from '@/i18n/fr'
import { cn } from '@/lib/cn'

const LIBELLES: CleTraduction[] = [
  'robustesse.faible',
  'robustesse.faible',
  'robustesse.moyenne',
  'robustesse.bonne',
  'robustesse.excellente',
]

/**
 * Jauge de robustesse (RG-18) : barre **et** libellé, jamais la couleur seule. Un `<meter>`
 * natif porte la valeur pour les technologies d'assistance ; les barres sont décoratives.
 */
export function JaugeRobustesse({ motDePasse }: { motDePasse: string }) {
  const niveau = noterMotDePasse(motDePasse)
  const libelle = t(LIBELLES[niveau] ?? 'robustesse.faible')
  return (
    <div className="space-y-1">
      <meter
        className="sr-only"
        min={0}
        max={4}
        value={niveau}
        aria-label={t('robustesse.libelle')}
        aria-valuetext={libelle}
      />
      <div aria-hidden className="flex gap-1">
        {[1, 2, 3, 4].map((pas) => (
          <span
            key={pas}
            className={cn(
              'h-1.5 flex-1 rounded-full',
              pas <= niveau ? (niveau >= 3 ? 'bg-forest-900' : 'bg-clay-600') : 'bg-sand-200',
            )}
          />
        ))}
      </div>
      {motDePasse ? (
        <p className="text-caption text-ink-700" aria-live="polite">
          {t('robustesse.libelle')} : <strong>{libelle}</strong>
        </p>
      ) : null}
    </div>
  )
}
