import { SITE } from '@/acces/site'
import { useLangue } from '@/i18n/contexteLangue'
import { cn } from '@/lib/cn'
import { Container } from '@/components/layout/Container'
import { StatItem } from '@/components/ui/StatItem'

/**
 * Preuves chiffrées du hero.
 *
 * Les cinq chiffres du CDC (communauté, pays, distinctions, expérience, portée) sont
 * lus dans `SITE.stats`, rendus administrables par le panneau Identité de l'admin. Un
 * chiffre absent reste `null` : il n'est pas affiché (ni nombre inventé, ni mention
 * « À fournir », texte d'atelier — audit V2-03, décision § 8.5), et revient dès qu'il est saisi.
 */
const STATS = SITE.stats.filter((stat) => stat.value !== null)

export function Preuves() {
  const { t } = useLangue()

  if (STATS.length === 0) return null

  return (
    <section aria-label={t('preuves.etiquette')} className="border-b border-sand-200 bg-sand-50">
      <Container className="py-12 lg:py-16">
        <div
          className={cn(
            'grid grid-cols-2 gap-x-6 gap-y-10',
            STATS.length >= 5 ? 'sm:grid-cols-3 lg:grid-cols-5' : 'lg:grid-cols-4',
          )}
        >
          {STATS.map((stat) => (
            <StatItem
              key={stat.label}
              value={stat.value}
              suffix={stat.suffix}
              label={stat.label}
              date={stat.date}
            />
          ))}
        </div>
      </Container>
    </section>
  )
}
