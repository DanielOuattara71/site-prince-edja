import type { PressItem } from '@/types'
import { PRESS } from '@/data/content'
import { useSeo } from '@/hooks/useSeo'
import { Section } from '@/components/layout/Section'
import { Container } from '@/components/layout/Container'
import { Reveal } from '@/components/motion/Reveal'
import { Stagger } from '@/components/motion/Stagger'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { DistinctionsCarousel } from '@/components/sections/about/DistinctionsCarousel'

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
      className="group grid grid-cols-[auto_1fr_auto] items-start gap-x-6 gap-y-2 border-t border-sand-200 py-8 transition-colors duration-(--d-base) hover:border-clay-500/70"
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
      <ArrowUpRight
        aria-hidden
        className="size-5 -translate-x-1 translate-y-1 text-clay-500 opacity-0 transition-all duration-(--d-base) ease-expo group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
      />
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
      <Section tone="light" padded={false} className="pt-32 pb-20 lg:pt-44 lg:pb-28">
        <Container>
          <Breadcrumb className="mb-8" />

        <div className="max-w-3xl space-y-6">
          <Eyebrow num="01">Revue de presse</Eyebrow>
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
      lead="Photos et récits de moments forts, templates remplaçables depuis l'espace admin."
    />

    <Section tone="light" className="bg-sand-150">
      <Container>
        {/* Bios presse : les trois longueurs du CDC. Aucun texte n'est rédigé ici, la
            maison les fournit. */}
        <div className="mt-20 space-y-8">
          <div className="space-y-2">
            <Eyebrow num="03">Bios presse</Eyebrow>
            <h2 className="font-display uppercase text-display-lg">
              Trois longueurs<span aria-hidden className="text-clay-500">.</span>
            </h2>
          </div>
          <Stagger className="grid gap-6 lg:grid-cols-3">
            {[
              { titre: 'Bio 50 mots', aide: 'Pour un générique ou un carton.' },
              { titre: 'Bio 150 mots', aide: 'Pour un article ou une fiche festival.' },
              { titre: 'Bio longue', aide: 'Pour un dossier de presse complet.' },
            ].map((bio) => (
              <div key={bio.titre} className="rounded-xl border border-dashed border-sand-300 p-6">
                <h3 className="font-display uppercase text-heading-sm text-ink-900">
                  {bio.titre}
                </h3>
                <p className="mt-2 text-body text-ink-500">{bio.aide}</p>
                <p className="label-caps mt-4 text-ink-500">Texte à fournir</p>
              </div>
            ))}
          </Stagger>
        </div>

        {/* Éléments de marque : portraits HD, logos, éléments. Fichiers à fournir. */}
        <div className="mt-20 space-y-8">
          <div className="space-y-2">
            <Eyebrow num="04">Éléments de marque</Eyebrow>
            <h2 className="font-display uppercase text-display-lg">
              Portraits, logos, éléments<span aria-hidden className="text-clay-500">.</span>
            </h2>
          </div>
          <Stagger className="grid gap-6 sm:grid-cols-3">
            {['Portraits HD', 'Logos', 'Éléments de marque'].map((element) => (
              <div
                key={element}
                className="flex aspect-4/5 items-center justify-center rounded-xl border border-dashed border-sand-300 bg-sand-100"
              >
                <p className="label-caps px-6 text-center text-ink-500">{element} · à fournir</p>
              </div>
            ))}
          </Stagger>
        </div>

        {/* Apparitions : médias, panels, conférences. Données à fournir. */}
        <div className="mt-20 space-y-8">
          <div className="space-y-2">
            <Eyebrow num="05">Apparitions</Eyebrow>
            <h2 className="font-display uppercase text-display-lg">
              Médias, panels, conférences<span aria-hidden className="text-clay-500">.</span>
            </h2>
            <p className="max-w-2xl text-body text-ink-500">
              Aucune apparition n'est encore recensée. La liste se remplira depuis l'admin,
              avec la date et le support.
            </p>
          </div>
          <p className="rounded-xl border border-dashed border-sand-300 p-8 text-center text-body text-ink-500">
            Liste à fournir
          </p>
        </div>

        <Reveal className="mt-20">
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
              <span className="inline-flex min-h-11 items-center rounded-full border border-cream-100/25 px-5 text-caption text-cream-100/70">
                Press kit · fichier à fournir
              </span>
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
