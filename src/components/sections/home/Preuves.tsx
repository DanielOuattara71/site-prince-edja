import { SITE } from '@/data/site'
import { useLangue } from '@/i18n/contexteLangue'
import { Container } from '@/components/layout/Container'
import { StatItem } from '@/components/ui/StatItem'

/**
 * Preuves chiffrées du hero.
 *
 * Les cinq chiffres du CDC (communauté, pays, distinctions, expérience, portée) sont
 * lus dans `SITE.stats`, rendus administrables par le panneau Identité de l'admin. Un
 * chiffre absent reste `null` et sa date de validation aussi : le bloc affiche alors la
 * mention d'attente au lieu d'un nombre inventé.
 */
export function Preuves() {
  const { t } = useLangue()

  return (
    <section aria-label={t('preuves.etiquette')} className="border-b border-sand-200 bg-sand-50">
      <Container className="py-12 lg:py-16">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
          {SITE.stats.map((stat) => (
            <StatItem
              key={stat.label}
              value={stat.value}
              suffix={stat.suffix}
              label={stat.label}
              date={stat.date}
              aFournir={t('preuves.aFournir')}
            />
          ))}
        </div>
      </Container>
    </section>
  )
}
