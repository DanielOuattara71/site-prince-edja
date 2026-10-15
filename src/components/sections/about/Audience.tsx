import { AUDIENCE, AUDIENCE_PROFILS } from '@/data/audience'
import { Section } from '@/components/layout/Section'
import { Container } from '@/components/layout/Container'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { formatNombre } from '@/lib/format'

const A_FOURNIR = 'À fournir'

/**
 * Audience de Prince Edja (CDC T-120).
 *
 * Plateformes, tailles, portée, géographies, profils, impressions et engagement. Les
 * chiffres non fournis restent vides plutôt que plausibles, et leur date de validation
 * s'affiche à côté d'eux.
 */
export function Audience() {
  return (
    <Section tone="light" className="scroll-mt-32" id="audience">
      <Container className="space-y-12">
        <div className="space-y-2">
          <Eyebrow num="04">L’audience</Eyebrow>
          <h2 className="font-display uppercase text-display-lg">
            Qui écoute<span aria-hidden className="text-clay-500">.</span>
          </h2>
          <p className="max-w-2xl text-body text-ink-500">
            Plateformes, tailles, géographies, profils, portée, impressions et engagement.
            Les chiffres non fournis restent vides plutôt que plausibles.
          </p>
        </div>

        <table className="w-full border-t border-sand-200 text-left">
          <thead>
            <tr className="label-caps text-ink-500">
              <th scope="col" className="py-3 pr-4">
                Plateforme
              </th>
              <th scope="col" className="py-3 pr-4">
                Abonnés
              </th>
              <th scope="col" className="py-3 pr-4">
                Portée mensuelle
              </th>
              <th scope="col" className="py-3">
                Validé le
              </th>
            </tr>
          </thead>
          <tbody>
            {AUDIENCE.map((ligne) => (
              <tr key={ligne.plateforme} className="border-t border-sand-200">
                <td className="py-4 pr-4 text-body text-ink-900">{ligne.plateforme}</td>
                <td className="py-4 pr-4 text-body text-ink-500 tnum">
                  {ligne.taille === null ? A_FOURNIR : formatNombre(ligne.taille)}
                </td>
                <td className="py-4 pr-4 text-body text-ink-500 tnum">
                  {ligne.portee === null ? A_FOURNIR : formatNombre(ligne.portee)}
                </td>
                <td className="py-4 text-caption text-ink-500">{ligne.date ?? A_FOURNIR}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <dl className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {AUDIENCE_PROFILS.map((profil) => (
            <div key={profil.label} className="border-t border-sand-200 pt-4">
              <dt className="label-caps text-ink-500">{profil.label}</dt>
              <dd className="mt-1 text-body text-ink-900">{profil.valeur ?? A_FOURNIR}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </Section>
  )
}
