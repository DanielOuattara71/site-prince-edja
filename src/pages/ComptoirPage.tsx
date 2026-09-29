import { Navigate, useParams } from 'react-router'
import { COMPTOIRS } from '@/data/comptoirs'
import { cn } from '@/lib/cn'
import { galerieDisponible, themeDeComptoir } from '@/lib/themeComptoir'
import { BIJOUX } from '@/data/content'
import { marche, piecesDemo } from '@/data/produits'
import { useSeo } from '@/hooks/useSeo'
import { Comptoir } from '@/components/market/Comptoir'
import { SectionMarker } from '@/components/ui/SectionMarker'
import { Container } from '@/components/layout/Container'
import { Vitrine } from '@/components/market/Vitrine'
import { Rail } from '@/components/market/Rail'
import { Chapiteau } from '@/components/market/Chapiteau'
import { Button } from '@/components/ui/Button'
import { ArrowLink } from '@/components/ui/ArrowLink'
import { formatChapitre } from '@/lib/format'

/**
 * Un comptoir : sol, accent, motif, régie.
 *
 * Le Chapiteau épinglé de 110 vh arrive au Lot 5. Ici on pose le **seuil** — le sol
 * change, le nom s'annonce, et on sait déjà si le comptoir est ouvert ou non.
 * Aucune donnée inventée : un comptoir sans pièces dit « en ouverture », il ne
 * montre pas de faux inventaire.
 */
export default function ComptoirPage() {
  const { comptoir: slug } = useParams<{ comptoir: string }>()
  const comptoir = COMPTOIRS.find((c) => c.slug === slug)

  useSeo({
    title: comptoir
      ? `${comptoir.nom} — Le Marché | Prince Edja`
      : 'Comptoir introuvable — Prince Edja',
    description: comptoir?.intention,
  })

  if (!comptoir) return <Navigate to="/boutique" replace />

  const theme = themeDeComptoir(comptoir.theme)
  // La régie affichée est celle qui **existe** : un thème configuré en `tranches` ou
  // `masonry` reçoit la vitrine, et l'étiquette de section doit dire la vitrine.
  const galerie = galerieDisponible(theme)
  const position = COMPTOIRS.findIndex((c) => c.slug === comptoir.slug)
  const sombre = comptoir.theme === 'a-porter' || comptoir.theme === 'tisse'
  const ouvert = comptoir.nbPieces > 0
  const demo = piecesDemo(comptoir.slug)

  return (
    <Comptoir slug={comptoir.theme}>
      {/* Le seuil : Chapiteau, puis la vitrine. */}
      <Chapiteau
        numero={comptoir.numero}
        nom={comptoir.nom}
        intention={comptoir.intention}
        motif={theme.motif}
        accent="var(--c-accent)"
        position={position}
        total={COMPTOIRS.length}
      />

      <section className="pt-16 pb-20 lg:pt-24">
        <Container>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <span className="data-mono text-xs text-[var(--c-texte-doux)]">
              {formatChapitre(position, COMPTOIRS.length)}
            </span>
            {/* L'état du comptoir se lit avant de se lire : pastille pleine quand il est
                ouvert, simple bague quand il ne l'est pas. L'or reste un remplissage. */}
            <span className="label-caps inline-flex items-center gap-2 text-[var(--c-texte-doux)]">
              <span
                aria-hidden
                className={cn(
                  'size-1.5 rounded-pill',
                  ouvert ? 'bg-[var(--c-accent)]' : 'border border-[var(--c-trait)]',
                )}
              />
              {ouvert ? `${comptoir.nbPieces} pièces` : 'en ouverture'}
            </span>
            <ArrowLink to="/boutique" tone={sombre ? 'light' : 'dark'}>
              Tous les comptoirs
            </ArrowLink>
          </div>
        </Container>
      </section>

      {ouvert ? (
        <section className="pb-24 lg:pb-32">
          <Container>
            <SectionMarker
              eyebrow={galerie === 'rail' ? 'Le rail' : 'La vitrine'}
              tone={sombre ? 'sombre' : 'clair'}
            />

            {/*
              La régie vient du thème du comptoir, pas d'un test sur le slug.
              C'est ce qui rend le système générique : ouvrir un cinquième comptoir
              avec une autre régie ne demande aucune modification de cette page.
            */}
            {galerie === 'rail' ? (
              <Rail
                className="mt-12"
                pieces={demo.map((p) => ({
                  slug: p.slug,
                  nom: p.nom,
                  repere: p.repere,
                  image: p.image,
                  prix: p.prix,
                  prixConfirme: p.prixConfirme,
                  // Ces pièces sont des placeholders : elles ne sont pas dans `BIJOUX`,
                  // donc pas de fiche. Le lien resterait vide jusqu'au backend.
                  lien: null,
                }))}
              />
            ) : (
              <Vitrine
                className="mt-12"
                lien={(s) => `/boutique/${comptoir.slug}/${s}`}
                pieces={BIJOUX.map((b) => {
                  const m = marche(b.slug)
                  return {
                    slug: b.slug,
                    nom: b.nom,
                    culture: b.culture,
                    histoire: b.histoire,
                    image: b.image,
                    prix: m.prix,
                    prixConfirme: m.prixConfirme,
                    reference: m.reference,
                  }
                })}
              />
            )}
          </Container>
        </section>
      ) : (
        <section className="pb-24 lg:pb-32">
          <Container>
            <div className="max-w-2xl space-y-6">
              <SectionMarker eyebrow="Ce comptoir n'est pas encore ouvert" tone={sombre ? 'sombre' : 'clair'} />
              <p className="text-body-lg text-[var(--c-texte-doux)]">
                Les pièces de ce comptoir sont en fabrication. Écris-nous ce que tu cherches :
                atelier, matière, symbole, prix — on te répond avec ce qui existe, et ce qui peut
                être fait.
              </p>
              <Button to="/contact" variant={sombre ? 'ghost-light' : 'dark'}>
                Décrire une pièce
              </Button>
            </div>
          </Container>
        </section>
      )}
    </Comptoir>
  )
}
