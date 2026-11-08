import type { PressItem } from '@/types'
import { PRESS } from '@/acces/preuves'
import { useSeo } from '@/hooks/useSeo'
import { Section } from '@/components/layout/Section'
import { Container } from '@/components/layout/Container'
import { Reveal } from '@/components/motion/Reveal'
import { Stagger } from '@/components/motion/Stagger'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Button } from '@/components/ui/Button'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { DistinctionsCarousel } from '@/components/sections/about/DistinctionsCarousel'
import { AfricanPattern } from '@/components/motifs/AfricanPattern'

/**
 * Kit presse du CDC. Rien n'est rédigé ici : la maison fournit les textes et les fichiers, et
 * chaque bloc apparaît dès qu'il a un contenu (au branchement, ces listes viendront de l'admin).
 */
const BIOS: { titre: string; aide: string; texte: string | null }[] = [
  { titre: 'Bio 50 mots', aide: 'Pour un générique ou un carton.', texte: null },
  { titre: 'Bio 150 mots', aide: 'Pour un article ou une fiche festival.', texte: null },
  { titre: 'Bio longue', aide: 'Pour un dossier de presse complet.', texte: null },
]

const ELEMENTS_MARQUE: { nom: string; fichier: string | null }[] = [
  { nom: 'Portraits HD', fichier: null },
  { nom: 'Logos', fichier: null },
  { nom: 'Éléments de marque', fichier: null },
]

/** Médias, panels, conférences : date et support, aucune entrée sans source. */
const APPARITIONS: { titre: string; support: string; date: string }[] = []

interface PressCardProps {
  item: PressItem
  index: number
}

function PressCard({ item, index }: PressCardProps) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noreferrer"
      className="group grid grid-cols-[auto_1fr] items-start gap-x-6 gap-y-2 border-t border-sand-200 py-8 transition-colors duration-(--d-base) hover:border-clay-500/70"
    >
      <span aria-hidden className="font-display text-heading-sm text-clay-600">
        {String(index + 1).padStart(2, '0')}
      </span>
      <div className="min-w-0">
        <p className="label-caps text-ink-500">
          {item.source} · {item.date}
        </p>
        <h3 className="mt-2 font-display uppercase text-heading-sm text-ink-900 transition-colors duration-(--d-base) group-hover:text-clay-600 sm:text-heading-md">
          {item.titre}
        </h3>
        <p className="mt-2 max-w-xl text-body text-ink-500">{item.resume}</p>
      </div>
    </a>
  )
}

export default function PressPage() {
  useSeo({
    title: 'Médias & Presse · Prince Edja',
    description:
      'Interviews, portraits et distinctions : TV5MONDE, Fraternité Matin, Ministère du Tourisme, Afrique Magazine et plus.',
  })

  return (
    <>
      <Section
        tone="light"
        padded={false}
        className="relative isolate overflow-hidden pt-32 pb-20 lg:pt-44 lg:pb-28"
      >
        {/* Spirale dans la marge droite, plus basse que les anneaux du Journal :
            même registre, composition différente. */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <AfricanPattern
            motif="spiral-02"
            opacite={0.04}
            className="-right-20 top-40 hidden h-72 w-72 lg:block"
          />
        </div>

        <Container>
          <Breadcrumb className="mb-8" />

        <div className="max-w-3xl space-y-6">
          <Eyebrow>Revue de presse</Eyebrow>
          <h1 className="font-display uppercase text-display-lg">
            Médias &amp; presse<span aria-hidden className="text-clay-500">.</span>
          </h1>
          <p className="max-w-2xl text-body-lg text-ink-500">
            Interviews, portraits, distinctions et récits autour du travail de Prince Edja.
          </p>
        </div>

        <div className="mt-20 border-b border-sand-200">
          <Stagger>
            {PRESS.map((item, index) => (
              <PressCard key={item.url} item={item} index={index} />
            ))}
          </Stagger>
          </div>
        </Container>
      </Section>

    {/* Les distinctions vivent ici, et nulle part ailleurs : « Presse & distinctions »
        est une seule entrée de navigation, elle couvre les deux. Hors du Container, sa
        piste touche les bords de la fenêtre comme le carrousel de la boutique. */}
    <DistinctionsCarousel
      titre="Des moments qui comptent"
      lead="Distinctions et moments forts du parcours."
    />

    <Section tone="light" className="bg-sand-150">
      <Container>
        {/* Bios presse, éléments de marque, apparitions : chaque bloc n'apparaît qu'avec
            du contenu fourni par la maison. Des cadres « à fournir » étaient des textes
            d'atelier (audit V2-03, décision § 8.5). */}
        {BIOS.some((bio) => bio.texte) && (
          <div className="mb-20 space-y-8">
            <div className="space-y-2">
              <Eyebrow>Bios presse</Eyebrow>
              <h2 className="font-display uppercase text-display-lg">
                Trois longueurs<span aria-hidden className="text-clay-500">.</span>
              </h2>
            </div>
            <Stagger className="grid gap-6 lg:grid-cols-3">
              {BIOS.filter((bio) => bio.texte).map((bio) => (
                <div key={bio.titre} className="rounded-xl border border-sand-300 p-6">
                  <h3 className="font-display uppercase text-heading-sm text-ink-900">
                    {bio.titre}
                  </h3>
                  <p className="mt-2 text-caption text-ink-500">{bio.aide}</p>
                  <p className="mt-4 text-body text-ink-700">{bio.texte}</p>
                </div>
              ))}
            </Stagger>
          </div>
        )}

        {ELEMENTS_MARQUE.some((element) => element.fichier) && (
          <div className="mb-20 space-y-8">
            <div className="space-y-2">
              <Eyebrow>Éléments de marque</Eyebrow>
              <h2 className="font-display uppercase text-display-lg">
                Portraits, logos, éléments<span aria-hidden className="text-clay-500">.</span>
              </h2>
            </div>
            <ul className="flex flex-wrap gap-3">
              {ELEMENTS_MARQUE.map((element) =>
                element.fichier ? (
                  <li key={element.nom}>
                    <Button href={element.fichier} external variant="ghost-dark">
                      {element.nom}
                    </Button>
                  </li>
                ) : null,
              )}
            </ul>
          </div>
        )}

        {APPARITIONS.length > 0 && (
          <div className="mb-20 space-y-8">
            <div className="space-y-2">
              <Eyebrow>Apparitions</Eyebrow>
              <h2 className="font-display uppercase text-display-lg">
                Médias, panels, conférences<span aria-hidden className="text-clay-500">.</span>
              </h2>
            </div>
            <ul className="border-b border-sand-200">
              {APPARITIONS.map((apparition) => (
                <li
                  key={`${apparition.date}-${apparition.titre}`}
                  className="border-t border-sand-200 py-5"
                >
                  <p className="label-caps text-ink-500">
                    {apparition.support} · {apparition.date}
                  </p>
                  <p className="mt-1 text-body text-ink-900">{apparition.titre}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Reveal>
          <div className="grain flex flex-col items-start justify-between gap-8 rounded-xl bg-night-800 p-10 text-cream-100 sm:flex-row sm:items-center lg:p-12">
            <div className="max-w-xl space-y-3">
              <p className="label-caps text-gold-400">Presse & programmation</p>
              <h2 className="font-display uppercase text-heading-md">
                Interviews, festivals et interventions
                <span aria-hidden className="text-clay-500">.</span>
              </h2>
              <p className="text-body text-cream-100/70">
                Plateaux, portraits, accréditations et demande d’images : l’équipe revient vers
                vous rapidement.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              {/* Press kit : un bouton s'ajoute ici quand le fichier existe. */}
              <Button
                href="mailto:contact@ohenetour.com?subject=Demande%20m%C3%A9dia%20-%20Prince%20Edja"
                variant="primary"
              >
                Contacter l’équipe
              </Button>
          </div>
        </div>
      </Reveal>
      </Container>
    </Section>
    </>
  )
}
