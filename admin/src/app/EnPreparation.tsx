import { TitrePage } from '@/components/layout/TitrePage'
import { t } from '@/i18n/fr'

/** Écran prévu mais pas encore livré : il le dit, sans rien simuler (D-24). */
export function EnPreparation({ libelle }: { libelle: string }) {
  return (
    <section className="space-y-3">
      <TitrePage titre={libelle}>{libelle}</TitrePage>
      <p className="text-body-lg text-ink-700">{t('enPreparation.texte')}</p>
    </section>
  )
}
