import { useState } from 'react'
import { Link } from 'react-router'
import type { Bijou } from '@/types'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { AfricanPattern } from '@/components/motifs/AfricanPattern'
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
 *
 * La carte se comporte comme les cartes du catalogue (`BijouCard`) : l'image et le
 * nom mènent à la fiche produit — un porté sans issue serait une impasse.
 */
function Portee({ bijou }: { bijou: Bijou }) {
  const [replie, setReplie] = useState(false)

  return (
    <figure className="group">
      <Link
        to={`/boutique/${bijou.slug}`}
        aria-label={`Voir la fiche produit de ${bijou.nom}`}
        className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-clay-600"
      >
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
      </Link>
      <figcaption className="mt-3 pl-4">
        {/* `caption` et non `11px` : sous 12px, la légende devient illisible, surtout
            en capitales espacées. Le nom est un second lien vers la même fiche — même
            comportement que le titre d'une carte catalogue. */}
        <Link
          to={`/boutique/${bijou.slug}`}
          className="block w-fit text-caption uppercase leading-none tracking-[0.18em] text-ink-900 transition-colors duration-(--d-base) group-hover:text-clay-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clay-600"
        >
          {bijou.nom}
        </Link>
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
    <Section tone="light" className="relative isolate overflow-hidden bg-sand-150">
      {/* Les anneaux renvoient aux bijoux eux-mêmes, dans le vide à droite du
          titre. Assez loin des visuels de porté pour ne pas les concurrencer. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <AfricanPattern
          motif="circulaire-03"
          opacite={0.045}
          className="-right-24 -top-16 hidden h-80 w-80 lg:block"
        />
        {/* Le cauri clôt la composition dans la marge basse-gauche : monnaie
            d'échange d'hier, il signe la marche de la pièce vers la personne. */}
        <AfricanPattern
          motif="cauri-africain"
          opacite={0.05}
          className="-bottom-24 -left-20 hidden h-72 w-80 lg:block"
        />
      </div>

      <Container className="max-w-none space-y-12 px-4 sm:px-6">
        <div className="max-w-2xl space-y-4">
          <Eyebrow>Le porté</Eyebrow>
          <h2 className="font-display uppercase text-display-lg">
            Ce que la pièce devient sur vous
            <span aria-hidden className="text-clay-500">
              .
            </span>
          </h2>
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
