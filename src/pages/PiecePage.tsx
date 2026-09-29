import { Navigate, useParams } from 'react-router'
import { useState } from 'react'
import { COMPTOIRS } from '@/data/comptoirs'
import { BIJOUX } from '@/data/content'
import { marche } from '@/data/produits'
import { SITE } from '@/data/site'
import { useSeo } from '@/hooks/useSeo'
import { Comptoir } from '@/components/market/Comptoir'
import { Cartel } from '@/components/ui/Cartel'
import { MediaFrame } from '@/components/media/MediaFrame'
import { PriceTag } from '@/components/ui/PriceTag'
import { SectionMarker } from '@/components/ui/SectionMarker'
import { Container } from '@/components/layout/Container'
import { Reveal } from '@/components/motion/Reveal'
import { Button } from '@/components/ui/Button'
import { ArrowLink } from '@/components/ui/ArrowLink'
import { useSelection } from '@/lib/selection'
import { cn } from '@/lib/cn'

/**
 * LA PIÈCE — `/boutique/:comptoir/:piece`
 *
 * C'est le cartel, pas une fiche catalogue. Le prix est à droite, jamais sous l'image :
 * c'est ce qui distingue un cartel de musée d'une vignette de catalogue.
 *
 * Pas de paiement en ligne : on **réserve**, et la demande part par écrit, référence
 * comprise. Le montant vient de `src/data/produits.ts` et porte sa mention « indicatif »
 * tant qu'il n'est pas confirmé.
 *
 * Aucun champ n'est inventé : une ligne du cartel n'apparaît que si elle est renseignée.
 * `atelier` et `village` restent `null` tant qu'ils n'ont pas été fournis — une fausse
 * provenance sur une pièce publiée engage la maison.
 */
export default function PiecePage() {
  const { comptoir: slugComptoir, piece: slugPiece } = useParams<{
    comptoir: string
    piece: string
  }>()

  const comptoir = COMPTOIRS.find((c) => c.slug === slugComptoir)
  const bijou = BIJOUX.find((b) => b.slug === slugPiece)

  useSeo({
    title: bijou ? `${bijou.nom} — ${bijou.culture} | Prince Edja` : 'Pièce introuvable',
    description: bijou?.histoire,
  })

  // Les hooks viennent AVANT les retours anticipés : un slug invalide ne doit pas
  // faire appeler moins de hooks qu'un slug valide, sinon l'ordre change d'un rendu
  // à l'autre et l'état se mélange.
  const { ajouter } = useSelection()
  const [ajoute, setAjoute] = useState(false)

  if (!comptoir) return <Navigate to="/boutique" replace />
  if (!bijou) return <Navigate to={`/boutique/${comptoir.slug}`} replace />

  const sombre = comptoir.theme === 'a-porter' || comptoir.theme === 'tisse'
  const m = marche(bijou.slug)

  const lignesCartel = [
    { cle: 'Symbole', valeur: bijou.culture },
    { cle: 'Référence', valeur: <span className="data-mono">{m.reference}</span> },
    { cle: 'Matière', valeur: m.matieres.length ? m.matieres.join(', ') : 'À renseigner' },
    { cle: 'Tailles', valeur: m.tailles.length ? m.tailles.join(' · ') : 'À renseigner' },
    ...(m.edition
      ? [
          {
            cle: 'Édition',
            valeur: (
              <span className="data-mono">
                {m.edition.numero} / {m.edition.total}
              </span>
            ),
          },
        ]
      : []),
    { cle: 'Atelier', valeur: m.atelier ?? 'À renseigner' },
    { cle: 'Provenance', valeur: m.village ?? 'À renseigner' },
    ...(m.poids ? [{ cle: 'Poids', valeur: `${m.poids} g` }] : []),
  ]

  // Le mail est pré-rempli : la demande part déjà qualifiée, référence comprise.
  const sujet = encodeURIComponent(`Réservation ${m.reference} — ${bijou.nom}`)
  const corps = encodeURIComponent(
    `Bonjour,\n\nJe souhaite réserver la pièce ${bijou.nom} (${m.reference}).\n\nTaille : \nQuantité : \nVille de livraison : \n\nMerci.`,
  )


  return (
    <Comptoir slug={comptoir.theme}>
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-20">
        <Container>
          <SectionMarker
            num={bijou.numero}
            eyebrow={comptoir.collection ?? 'Pièce du marché'}
            tone={sombre ? 'sombre' : 'clair'}
          />
          <h1 className="mt-6 max-w-3xl font-title text-display-lg leading-[0.98] text-[var(--c-texte)]">
            {bijou.nom}
          </h1>
        </Container>
      </section>

      {/* Deux colonnes : les médias à gauche, le cartel à droite. */}
      <section className="pb-20">
        <Container>
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-7">
              <div className="relative">
                <MediaFrame
                  src={bijou.image}
                  alt={`${bijou.nom} — pièce inspirée de la culture ${bijou.culture}`}
                  ratio="4/5"
                  className="rounded-sharp"
                />
                {/* Le tampon : il ne s'affiche que sur une pièce réellement numérotée.
                    Une pièce sans édition n'a rien à authentifier. */}
                {m.edition && (
                  <span
                    aria-hidden
                    className="absolute right-4 bottom-4 flex size-24 flex-col items-center justify-center rounded-pill bg-[var(--c-accent)] text-center text-[color:var(--c-sol)]"
                    style={{ animation: 'pe-stamp var(--d-fast) ease-out both' }}
                  >
                    <span className="data-mono label-caps leading-none opacity-80">ÉDITION</span>
                    <span className="data-mono mt-1 text-heading-sm leading-none font-semibold">
                      {m.edition.numero}/{m.edition.total}
                    </span>
                    {/* La culture de la pièce, telle qu'elle est en données : pas un signe
                        culturel choisi à la main. Un adinkra posé sur toutes les fiches
                        affirmerait une appartenance que personne n'a validée. */}
                    <span className="data-mono label-caps leading-none opacity-70">
                      {bijou.culture}
                    </span>
                  </span>
                )}
              </div>
            </Reveal>

            <Reveal delay={0.1} className="lg:col-span-5">
              <PriceTag montant={m.prix} size="cartel" />
              <p className="mt-2 text-caption text-[var(--c-texte-doux)]">
                {m.prixConfirme
                  ? 'Toutes taxes comprises · livraison calculée après confirmation'
                  : 'Prix indicatif — hors livraison'}
              </p>

              <Cartel lignes={lignesCartel} tone="comptoir" className="mt-8" />

              <div className="mt-8 flex flex-col items-start gap-4">
                <div className="flex flex-wrap gap-3">
                  <Button
                    href={`mailto:${SITE.email}?subject=${sujet}&body=${corps}`}
                    variant="primary"
                  >
                    Réserver cette pièce
                  </Button>
                  <Button
                    type="button"
                    variant={sombre ? 'ghost-light' : 'ghost-dark'}
                    onClick={() => {
                      ajouter(bijou.slug)
                      setAjoute(true)
                    }}
                  >
                    Ajouter à ma sélection
                  </Button>
                </div>
                <p className="text-caption text-[var(--c-texte-doux)]">
                  Option posée · réponse sous 24 h. Le règlement se fait après confirmation, par
                  Mobile Money, virement ou sur place.
                </p>
                {/* Le retour d'action reste sobre : un point d'or, une phrase posée en 200 ms.
                    L'or ne se lit pas en 13 px (contraste et contrat) ; c'est le point qui
                    porte la couleur, le message reste en couleur de service. */}
                <p
                  aria-live="polite"
                  className="flex items-center gap-2 text-caption text-[var(--c-texte-doux)]"
                >
                  <span
                    aria-hidden
                    className={cn(
                      'size-1.5 shrink-0 rounded-pill bg-[var(--c-accent)] transition-opacity duration-(--d-fast)',
                      ajoute ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  {ajoute ? 'Ajoutée à ta sélection.' : ''}
                </p>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* Le récit : la voix de la pièce, sous la coupe. */}
      <section className="pb-20">
        <Container>
          <div className="max-w-2xl space-y-5">
            <SectionMarker eyebrow="Le récit" tone={sombre ? 'sombre' : 'clair'} />
            <p className="font-quote text-heading-sm italic leading-relaxed text-[var(--c-texte)]">
              {bijou.histoire}
            </p>
          </div>
        </Container>
      </section>

      <section className="pb-24">
        <Container>
          <ArrowLink to={`/boutique/${comptoir.slug}`} tone={sombre ? 'light' : 'dark'}>
            Retour au comptoir {comptoir.nom}
          </ArrowLink>
        </Container>
      </section>
    </Comptoir>
  )
}
