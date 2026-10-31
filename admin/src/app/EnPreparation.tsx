import { TitrePage } from '@/components/layout/TitrePage'
import type { EntreeMenu } from '@/components/layout/navigation'
import { t } from '@/i18n/fr'

/** Écran prévu mais pas encore livré : il le dit, sans rien simuler (D-24). */
export function EnPreparation({ entree }: { entree: EntreeMenu }) {
  return (
    <section className="space-y-3">
      <TitrePage titre={entree.libelle}>{entree.libelle}</TitrePage>
      <p className="text-body-lg text-ink-700">
        {t('enPreparation.texte')} {entree.etape} {t('enPreparation.suite')}
      </p>
    </section>
  )
}
