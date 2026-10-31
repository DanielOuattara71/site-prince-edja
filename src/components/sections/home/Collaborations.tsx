import { Section } from '@/components/layout/Section'
import { Marquee } from '@/components/motion/Marquee'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { PARTENAIRES, type Partenaire } from '@/data/collaborations'
import { useLangue } from '@/i18n/contexteLangue'

/** w-44 (176 px) + mr-8 (32 px) : largeur d'une tuile et de son écart en piste. */
const PAS_TUILE = 208
/** Tuiles de repli tant qu'aucun partenaire n'est renseigné. */
const REPLIS = 8
/** Chaque demi-piste doit dépasser la plus large fenêtre courante (~3 840 px) :
    c'est le rythme du cycle qui garantit un défilement sans vide. */
const TUILES_MIN = 20
/** Vitesse de défilement, en pixels par seconde. */
const VITESSE = 60

/**
 * Collaborations de la page d'accueil : un ruban déroulant de tuiles
 * « logo + nom », sur la mécanique partagée de `Marquee` (piste dupliquée,
 * translation de -50 %).
 *
 * La liste des partenaires (`src/data/collaborations.ts`) est volontairement
 * vide tant qu'aucun nom n'est validé : des tuiles « à fournir » gardent le
 * rythme du ruban en attendant les vraies entrées.
 */
export function Collaborations() {
  const { t } = useLangue()

  const base: (Partenaire | null)[] =
    PARTENAIRES.length > 0 ? PARTENAIRES : Array.from({ length: REPLIS }, () => null)
  const repetitions = Math.ceil(TUILES_MIN / base.length)
  // La durée suit la longueur de piste : la vitesse reste constante quand la
  // liste s'étoffe, au lieu de s'accélérer à chaque ajout.
  const duration = Math.round((repetitions * base.length * PAS_TUILE) / VITESSE)

  return (
    <Section tone="light" container={false}>
      {/* Section bord à bord : sans le `max-w-7xl` du Container, le titre s'aligne
          aux bords de la fenêtre — plus large que le reste du site, sur demande. */}
      <div className="px-5 sm:px-8">
        <SectionHeading
          className="max-w-none"
          eyebrow="Ils ont travaillé avec Prince"
          title={
            <>
              Collaboration
              <span aria-hidden className="text-clay-500">.</span>
            </>
          }
          lead="PROPOSITION à valider : trois études de cas, du brief au résultat."
        />
      </div>

      {/* Ruban pleine largeur : la marge du Container casserait l'effet de
          défilement continu. */}
      <div className="mt-16">
        <Marquee duration={duration}>
          {Array.from({ length: repetitions * base.length }, (_, index) => {
            const partenaire = base[index % base.length]
            return (
              <div
                key={index}
                className="mr-8 flex w-44 shrink-0 flex-col items-center gap-3 rounded-xl border border-sand-200 bg-sand-50 px-4 py-6"
              >
                <span className="flex w-full items-center justify-center">
                  {partenaire?.logo ? (
                    <img
                      src={partenaire.logo}
                      alt=""
                      className="h-10 w-auto max-w-full object-contain"
                    />
                  ) : (
                    <span className="label-caps text-center text-ink-500">
                      {t('collab.logoAFournir')}
                    </span>
                  )}
                </span>
                {partenaire ? (
                  <span className="font-display text-center text-caption uppercase text-ink-900">
                    {partenaire.nom}
                  </span>
                ) : (
                  <span className="label-caps text-center text-ink-500">
                    {t('collab.nomAFournir')}
                  </span>
                )}
              </div>
            )
          })}
        </Marquee>
      </div>
    </Section>
  )
}
