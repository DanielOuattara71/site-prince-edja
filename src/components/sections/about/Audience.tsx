import { AUDIENCE, AUDIENCE_PROFILS } from '@/acces/preuves'
import { Section } from '@/components/layout/Section'
import { Container } from '@/components/layout/Container'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { formatNombre } from '@/lib/format'

/** Cellule sans chiffre validé : un tiret sobre à l'œil, une phrase pour les lecteurs d'écran. */
function NonCommunique() {
  return (
    <>
      <span aria-hidden>—</span>
      <span className="sr-only">non communiqué</span>
    </>
  )
}

// N'apparaît que ce qui porte au moins un chiffre : une ligne ou un profil entièrement vide
// affichait « À fournir », un texte d'atelier (audit V2-03, décision § 8.5).
const LIGNES = AUDIENCE.filter((ligne) => ligne.taille !== null || ligne.portee !== null)
const PROFILS = AUDIENCE_PROFILS.filter((profil) => profil.valeur !== null)

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
          <Eyebrow>L’audience</Eyebrow>
          <h2 className="font-display uppercase text-display-lg">
            Qui écoute
            <span aria-hidden className="text-clay-500">
              .
            </span>
          </h2>
        </div>

        {/* Cadre défilant : à 390 px la colonne « Validé le » débordait de la page
            (audit V2-07). Focusable pour qu'on le fasse défiler au clavier. */}
        {LIGNES.length > 0 && (
          <div
            role="region"
            aria-label="Audience par plateforme"
            tabIndex={0}
            // `relative` : le texte `sr-only` des cellules vides est positionné en absolu ;
            // sans ancêtre positionné, il sortait du cadre et élargissait la page à 390 px.
            className="relative overflow-x-auto"
          >
            <table className="w-full min-w-xl border-t border-sand-200 text-left">
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
                {LIGNES.map((ligne) => (
                  <tr key={ligne.plateforme} className="border-t border-sand-200">
                    <td className="py-4 pr-4 text-body text-ink-900">{ligne.plateforme}</td>
                    <td className="py-4 pr-4 text-body text-ink-500 tnum">
                      {ligne.taille === null ? <NonCommunique /> : formatNombre(ligne.taille)}
                    </td>
                    <td className="py-4 pr-4 text-body text-ink-500 tnum">
                      {ligne.portee === null ? <NonCommunique /> : formatNombre(ligne.portee)}
                    </td>
                    <td className="py-4 text-caption text-ink-500">
                      {ligne.date ?? <NonCommunique />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {PROFILS.length > 0 && (
          <dl className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PROFILS.map((profil) => (
              <div key={profil.label} className="border-t border-sand-200 pt-4">
                <dt className="label-caps text-ink-500">{profil.label}</dt>
                <dd className="mt-1 text-body text-ink-900">{profil.valeur}</dd>
              </div>
            ))}
          </dl>
        )}
      </Container>
    </Section>
  )
}
