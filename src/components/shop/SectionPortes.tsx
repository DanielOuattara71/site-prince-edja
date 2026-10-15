import { useState } from 'react'
import type { Bijou } from '@/types'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { visuelPiece, visuelPorte } from '@/lib/visuels'

/**
 * Emplacement d'un porté.
 *
 * La photographie n'existe pas encore : on demande celle prévue au nom convenu, et au
 * premier échec on se replie sur le visuel de la pièce. Le composant ne ment donc pas
 * sur ce qu'il montre : le texte alternatif le dit quand il montre un fond neutre.
 *
 * Déposer `images/boutique/portes/<slug>.jpg` suffit à faire apparaître la vraie
 * photo : aucun code ni aucune donnée à changer.
 */
function Portee({ bijou }: { bijou: Bijou }) {
  const [replie, setReplie] = useState(false)

  return (
    <figure className="group">
      <div className="overflow-hidden bg-sand-200">
        <img
          src={replie ? visuelPiece(bijou.slug) : visuelPorte(bijou.slug)}
          alt={
            replie
              ? `Visuel de la pièce ${bijou.nom}, photographie de porté à venir`
              : `${bijou.nom} portée, culture ${bijou.culture}`
          }
          loading="lazy"
          decoding="async"
          onError={() => setReplie(true)}
          className="aspect-4/5 h-full w-full object-cover transition-transform duration-(--d-reveal) ease-expo group-hover:scale-[1.03]"
        />
      </div>
      <figcaption className="mt-3 pl-4">
        {/* `caption` et non `11px` : sous 12px, la légende devient illisible, surtout
            en capitales espacées. */}
        <p className="text-caption uppercase leading-none tracking-[0.18em] text-ink-900">
          {bijou.nom}
        </p>
        <p className="mt-1.5 text-caption uppercase tracking-[0.18em] text-ink-500">
          {bijou.culture}
        </p>
      </figcaption>
    </figure>
  )
}

/**
 * Section « porté ».
 *
 * La collection se vend autant par ce qu'elle devient sur un corps que par l'objet
 * seul. Les emplacements sont posés maintenant, à la taille et au cadrage exacts des
 * futures photographies, pour que la mise en page ne bouge pas le jour où elles
 * arrivent.
 */
export function SectionPortes({ pieces }: { pieces: Bijou[] }) {
  return (
    <Section tone="light" className="bg-sand-150">
      <Container className="max-w-none space-y-12 px-4 sm:px-6">
        <div className="max-w-2xl space-y-4">
          <Eyebrow num="04">Le porté</Eyebrow>
          <h2 className="font-display uppercase text-display-lg">
            Ce que la pièce devient sur vous
            <span aria-hidden className="text-clay-500">.</span>
          </h2>
          <p className="text-body-lg text-ink-500">
            Un symbole se lit dans le geste qui le porte. Les photographies de porté
            arrivent ; en attendant, chaque pièce est montrée sur fond neutre, à la
            taille qu'occupera son portrait.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-1 sm:grid-cols-3">
          {pieces.map((bijou) => (
            <Portee key={bijou.slug} bijou={bijou} />
          ))}
        </div>
      </Container>
    </Section>
  )
}
