import { Link, useParams } from 'react-router'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useSeo } from '@/hooks/useSeo'
import { PIECES } from '@/data/shop'
import { useDemande } from '@/lib/demande'
import { useLangue } from '@/i18n/contexteLangue'
import { Section } from '@/components/layout/Section'
import { Container } from '@/components/layout/Container'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Button } from '@/components/ui/Button'
import { LazyImage } from '@/components/media/LazyImage'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { Tag } from '@/components/ui/Tag'
import { AfricanPattern } from '@/components/motifs/AfricanPattern'
import { Reveal } from '@/components/motion/Reveal'
import { formatFCFA } from '@/lib/format'

/**
 * Fiche produit de la collection TRIBE.
 *
 * Maquette retenue « le carnet réordonné » : la phrase « chaque produit raconte
 * son histoire » structure la page.
 *
 * 1. Le fil d'Ariane vit dans une bande claire fine, avant la scène.
 * 2. La scène du récit est sombre : tant que la photographie manque, **le récit
 *    est l'image** — le numéro en or, la phrase d'histoire en serif italique, le
 *    sceau cauri posé en accent. Les assiettes « IMAGE À VENIR » ne dominent plus
 *    la page.
 * 3. La fiche de vente garde ses bras %(photo 7 / actions 5), mais l'empilement de
 *    onze lignes « À fournir » cède à un seul module d'attente designé : la
 *    règle d'honnêteté est là, une fois, et s'efface quand les données arrivent.
 * 4. Le récit enchaîne par numéro (« précédente / suivante ») : la collection se
 *    lit comme un album, la culture reste en étiquette.
 */
export default function ObjetPage() {
  const { objet: slug } = useParams<{ objet: string }>()
  const objet = PIECES.find((item) => item.slug === slug)
  const { t, l } = useLangue()
  const { present, basculer } = useDemande()
  const choisi = objet ? present(objet.slug) : false

  useSeo({
    title: objet ? `${objet.nom} · Collection TRIBE · Edja Shop` : 'Objet introuvable · Edja Shop',
    description: objet?.histoire,
  })

  if (!objet) {
    return (
      <Section tone="light" padded={false} className="pt-32 pb-20 lg:pt-44 lg:pb-28">
        <Container className="space-y-4">
          <h1 className="font-display uppercase text-display-lg">Objet introuvable.</h1>
          <Button to="/boutique" variant="dark">
            Retour à la collection
          </Button>
        </Container>
      </Section>
    )
  }

  const commerce = objet.commerce
  const prix = commerce?.prix ?? null
  const ancienPrix = commerce?.ancienPrix ?? null
  const promo = prix != null && ancienPrix != null && ancienPrix > prix
  const galerie = commerce?.galerie ?? []

  // Le fil du récit suit l'ordre des numéros ('01' → '10' se classe sans conversion),
  // et tourne en boucle : la dernière pièce ramène à la première, comme un album.
  const parNumero = [...PIECES].sort((a, b) => a.numero.localeCompare(b.numero))
  const position = parNumero.findIndex((piece) => piece.slug === objet.slug)
  const precedente = parNumero[(position - 1 + parNumero.length) % parNumero.length]
  const suivante = parNumero[(position + 1) % parNumero.length]

  // Le module d'attente ne tient la place que pendant l'absence : il s'efface
  // dès que la maison fournit prix confirmé, créateur ou matières.
  const ficheAttendue =
    !commerce?.prixConfirme && !commerce?.createur && !(commerce?.matieres?.length ?? 0)

  return (
    <>
      {/* Le fil d'Ariane garde ses couleurs claires : il vit sur une bande sable
          fine, avant d'entrer dans la scène sombre du récit. */}
      <Section tone="light" padded={false} className="bg-sand-50 pt-28 pb-6 lg:pt-32">
        <Container>
          <Breadcrumb titreFinal={objet.nom} />
        </Container>
      </Section>

      {/* La scène du récit. Tant qu'aucune photographie n'existe, la pièce est
          son texte : le numéro (or sur nuit, 8,4:1), le nom en Anton, la phrase
          d'histoire en serif italique. Les motifs fournis accompagnent, le cauri
          scelle — le même accrochage que sur l'espace vert de la boutique. */}
      <Section tone="dark" padded={false} className="relative isolate overflow-hidden bg-forest-950">
        <AfricanPattern
          motif="linear-01"
          couleur="var(--color-cream-100)"
          opacite={0.06}
          className="-right-24 -top-24 h-80 w-80"
        />
        <AfricanPattern
          motif="cauri-africain"
          couleur="var(--color-cream-100)"
          opacite={0.12}
          className="right-8 bottom-8 hidden h-28 w-40 lg:block xl:right-12 xl:bottom-12 xl:h-40 xl:w-56"
        />
        <Container className="relative z-10 flex min-h-[48svh] flex-col justify-end pb-12 pt-20 lg:min-h-[70svh] lg:pb-24 lg:pt-24">
          <div className="max-w-4xl space-y-5">
            <Eyebrow tone="dark" num={objet.numero}>
              Collection TRIBE · {objet.culture}
            </Eyebrow>
            <h1 className="font-display uppercase text-display-lg leading-[0.92] text-cream-100 lg:text-display-xl">
              {objet.nom}
              <span aria-hidden className="text-clay-500">.</span>
            </h1>
            <p className="max-w-3xl font-quote text-heading-md italic text-cream-100/85">
              {objet.histoire}
            </p>
          </div>
        </Container>
      </Section>

      {/* La fiche de vente : photo 7 / actions 5. Le récit a déjà ouvert la page,
          la colonne droite ne porte donc plus que ce qui sert la décision : prix,
          catégories, actions, et le module d'attente du lot commerce. */}
      <Section tone="light">
        <Container className="space-y-12">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            {/* 7/12 sur desktop : la pièce garde la moitié gauche. Sur mobile,
                les actions passent AVANT l'assiette (order-1/2) : le héros-récit
                suivi de la grande assiette retardaient l'achat d'un écran de
                trop — la règle du héros est de ne pas cacher la suite. */}
            <div className="order-2 space-y-2 lg:order-1 lg:col-span-7">
              <LazyImage
                src={objet.image}
                alt={`${objet.nom}, pièce de la collection TRIBE`}
                ratio="4/5"
                className="overflow-hidden rounded-md bg-sand-200"
              />

              {/* Galerie : les visuels supplémentaires existent dans le modèle, les
                  photos restent à fournir. */}
              {galerie.length > 0 ? (
                <div className="grid grid-cols-4 gap-2">
                  {galerie.map((visuel) => (
                    <LazyImage
                      key={visuel}
                      src={visuel}
                      alt={`${objet.nom}, visuel supplémentaire`}
                      ratio="1/1"
                      className="overflow-hidden rounded-md bg-sand-200"
                    />
                  ))}
                </div>
              ) : (
                <p className="px-1 py-3 text-caption text-ink-500">
                  {l({
                    fr: 'Galerie à fournir : 5 à 8 visuels par pièce, avec zoom.',
                    en: 'Gallery to be provided: 5 to 8 visuals per piece, with zoom.',
                  })}
                </p>
              )}
            </div>

            {/* 5/12 : l'action d'abord, l'attente ensuite — tout ce qui sert la
                décision tient dans cette colonne. */}
            <div className="order-1 space-y-8 lg:order-2 lg:col-span-5">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Tag tone="sage">{objet.culture}</Tag>
                  <Tag>Collection TRIBE</Tag>
                  {commerce?.edition && (
                    <Tag>
                      Édition {commerce.edition.numero}/{commerce.edition.total}
                    </Tag>
                  )}
                </div>

                {/* Prix : affiché seulement s'il est confirmé. Sinon « sur demande ». */}
                <p className="flex items-baseline gap-2 text-caption font-light">
                  {prix != null && commerce?.prixConfirme ? (
                    promo ? (
                      <>
                        <span className="text-ink-500 line-through">{formatFCFA(ancienPrix)}</span>
                        <span className="text-promo-500">{formatFCFA(prix)}</span>
                      </>
                    ) : (
                      <span className="text-ink-500">{formatFCFA(prix)}</span>
                    )
                  ) : (
                    <span className="text-ink-500">{t('demande.surDemande')}</span>
                  )}
                </p>
              </div>

              {/* Pleine largeur et empilées : la première action garde la priorité
                  visuelle sans partager la ligne, sur mobile comme sur desktop. */}
              <div className="space-y-3">
                <Button
                  variant="primary"
                  magnetic={false}
                  className="w-full"
                  onClick={() => basculer(objet)}
                >
                  {choisi ? t('demande.retirer') : t('carte.ajouter')}
                </Button>
                <Button to="/contact" variant="ghost-dark" className="w-full">
                  {l({ fr: 'Poser une question', en: 'Ask a question' })}
                </Button>
              </div>

              {/* Le module d'attente. Un seul bloc designé remplace les onze lignes
                  « À fournir » : la règle d'honnêteté est énoncée une fois, avec le
                  sceau. Les données réelles (créateur, edition, matières) le
                  dépècent quand la maison les fournit. */}
              {ficheAttendue && (
                <div className="relative isolate overflow-hidden rounded-xl border border-sand-300 bg-sand-100">
                  <AfricanPattern
                    motif="cauri-africain"
                    opacite={0.07}
                    className="-bottom-8 -right-8 h-32 w-44"
                  />
                  <div className="relative z-10 space-y-3 p-6">
                    <p className="label-caps text-clay-600">
                      {l({ fr: 'La fiche arrive de l’atelier', en: 'The specs card arrives from the workshop' })}
                    </p>
                    <p className="text-body text-ink-700">
                      {l({
                        fr: 'Matières, dimensions, entretien, origine, créateur, délais, frais, retours et taxes : rien n’est affiché tant que la maison ne l’a pas fourni et validé — une provenance inventée engagerait la maison.',
                        en: 'Materials, dimensions, care, origin, maker, lead times, fees, returns and taxes: nothing is displayed until the house provides and validates it — an invented provenance would commit the house.',
                      })}
                    </p>
                    <Link
                      to="/contact"
                      className="inline-flex items-center text-caption font-semibold text-clay-600 underline-offset-4 transition-colors hover:text-clay-700 hover:underline"
                    >
                      {l({ fr: 'Poser une question sur cette pièce', en: 'Ask about this piece' })}
                    </Link>
                  </div>
                </div>
              )}

              {/* Le créateur, quand il existe : il rejoint le récit, jamais les
                  « à fournir ». */}
              {commerce?.createur && (
                <div className="space-y-2 border-t border-sand-200 pt-6">
                  <p className="label-caps text-ink-500">
                    {l({ fr: 'Créateur', en: 'Maker' })}
                  </p>
                  <div className="text-body text-ink-700">
                    <p className="font-semibold">{commerce.createur.nom}</p>
                    <p>
                      {[commerce.createur.ville, commerce.createur.pays]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                    <p>{commerce.createur.bio}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Container>
      </Section>

      {/* Le fil du récit : la collection se lit comme un album. La « même culture »
          plaidait par catégorie ; le numéro plaid par voisinage, l'histoire se
          continue à la pièce suivante. */}
      {parNumero.length > 1 && (
        <Reveal>
          <Section tone="light" padded={false} className="pb-24">
            <Container>
              <div className="space-y-8 border-t border-sand-200 pt-10">
                <div className="space-y-2">
                  <Eyebrow>{l({ fr: 'La collection se lit', en: 'The collection reads on' })}</Eyebrow>
                  <h2 className="font-display uppercase text-display-lg">
                    {l({ fr: 'Le récit continue', en: 'The story goes on' })}
                    <span aria-hidden className="text-clay-500">.</span>
                  </h2>
                </div>

                <ul className="grid gap-2 sm:grid-cols-2">
                  {[
                    { piece: precedente, signe: 'left' as const, libelle: { fr: 'Précédente', en: 'Previous' } },
                    { piece: suivante, signe: 'right' as const, libelle: { fr: 'Suivante', en: 'Next' } },
                  ].map(({ piece, signe, libelle }) => (
                    <li key={piece.slug}>
                      <Link
                        to={`/boutique/${piece.slug}`}
                        aria-label={`${l(libelle)} : pièce ${piece.numero}, ${piece.nom}`}
                        className="group relative isolate flex flex-col gap-5 overflow-hidden rounded-xl border border-sand-200 bg-sand-50 px-6 py-8 transition-colors duration-(--d-base) hover:bg-sand-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-clay-600"
                      >
                        <AfricanPattern
                          motif="cauri-africain"
                          opacite={0.07}
                          className={signe === 'left' ? '-bottom-8 -left-8 h-24 w-32' : '-bottom-8 -right-8 h-24 w-32'}
                        />
                        {/* Numéro fantôme en sable : décoratif et répété dans
                            l'aria-label, il se permet même le contraste doux. */}
                        <div className="relative z-10 flex items-center justify-between gap-4">
                          <span className="label-caps flex items-center gap-2 text-ink-500">
                            {signe === 'left' && (
                              <ArrowLeft aria-hidden className="size-4 shrink-0" />
                            )}
                            <span>{l(libelle)}</span>
                            {signe === 'right' && (
                              <ArrowRight aria-hidden className="size-4 shrink-0" />
                            )}
                          </span>
                          <span
                            aria-hidden
                            className="font-display text-display-lg text-sand-300"
                          >
                            {piece.numero}
                          </span>
                        </div>
                        <p className="relative z-10 font-display uppercase text-display-lg leading-none text-ink-900">
                          {piece.nom}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </Container>
          </Section>
        </Reveal>
      )}
    </>
  )
}
