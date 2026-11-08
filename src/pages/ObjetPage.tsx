import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { ArrowLeft, ArrowRight, Minus, Plus } from 'lucide-react'
import { useSeo } from '@/hooks/useSeo'
import { descriptionObjet } from '@/lib/descriptions'
import { LIVRES, PIECES } from '@/acces/boutique'
import { useDemande } from '@/lib/demande'
import { useLangue } from '@/i18n/contexteLangue'
import { Section } from '@/components/layout/Section'
import { Container } from '@/components/layout/Container'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Button } from '@/components/ui/Button'
import { LazyImage } from '@/components/media/LazyImage'
import { AfricanPattern } from '@/components/motifs/AfricanPattern'
import { Reveal } from '@/components/motion/Reveal'
import { formatFCFA } from '@/lib/format'

/**
 * Fiche produit de la collection TRIBE.
 *
 * Maquette retenue « le carnet réordonné » : la phrase « chaque produit doit
 * raconter son histoire » structure la page.
 *
 * 1. Le fil d'Ariane a cédé la place au retour au catalogue : la colonne de gauche
 *    accueille le regard (galerie défilante), la colonne de droite porte le récit.
 * 2. La scène sombre du récit a laissé place à l'ivoire : le produit raconte, le
 *    décor reste sobre — le texte devient l'image.
 * 3. La fiche de vente se lit comme une éditoriale : retour, titre, prix, histoire,
 *    quantité — puis l'attente ou la commande.
 * 4. Le récit enchaîne par numéro (« précédente / suivante ») : la collection se
 *    lit comme un album, la culture reste en étiquette.
 */
export default function ObjetPage() {
  const { objet: slug } = useParams<{ objet: string }>()
  // Les livres sont des produits d'Edja Shop comme les bijoux : leur carte mène ici aussi.
  const collection = PIECES.some((item) => item.slug === slug) ? PIECES : LIVRES
  const objet = collection.find((item) => item.slug === slug)
  const { t, l } = useLangue()
  const { present, basculer } = useDemande()
  const choisi = objet ? present(objet.slug) : false

  const [quantite, setQuantite] = useState(1)
  const diminuer = () => setQuantite((actuelle) => Math.max(1, actuelle - 1))
  const augmenter = () => setQuantite((actuelle) => Math.min(9, actuelle + 1))

  useSeo({
    title: objet ? `${objet.nom} · Edja Shop` : 'Objet introuvable · Edja Shop',
    description: objet ? descriptionObjet(objet) : undefined,
  })

  if (!objet) {
    return (
      <Section tone="light" padded={false} className="pt-32 pb-20 lg:pt-44 lg:pb-28">
        <Container>
          <div className="space-y-4">
            <h1 className="font-display uppercase text-display-lg">Objet introuvable.</h1>
            <Button to="/boutique" variant="dark">
              Retour à la collection
            </Button>
          </div>
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
  // Un livre enchaîne sur les livres, un bijou sur les bijoux.
  const parNumero = [...collection].sort((a, b) => a.numero.localeCompare(b.numero))
  const position = parNumero.findIndex((piece) => piece.slug === objet.slug)
  const precedente = parNumero[(position - 1 + parNumero.length) % parNumero.length]
  const suivante = parNumero[(position + 1) % parNumero.length]

  // Le module d'attente ne tient la place que pendant l'absence : il s'efface
  // dès que la maison fournit prix confirmé, créateur ou matières.
  const ficheAttendue =
    !commerce?.prixConfirme && !commerce?.createur && !(commerce?.matieres?.length ?? 0)

  const visuels = [objet.image, ...galerie]

  return (
    <>
      {/* Le récit. L'ivoire accueille la lecture : la pièce raconte, la maison
          pose le décor. Plus de scène sombre — le texte devient l'image. */}
      <Section tone="light" padded={false} container={false} className="pt-28 pb-40">
        <div className="px-4">
          <div className="grid gap-6 lg:grid-cols-16">
            {/* La galerie : le regard du visiteur. Mobile, rangée carrée qui
                défile ; bureau, colonne portrait qui défile. */}
            <div className="col-span-16 lg:col-span-9">
              <div className="scrollbar-hidden flex w-full gap-6 overflow-x-auto px-4 lg:flex-col lg:px-0">
                {visuels.map((src, index) => (
                  <LazyImage
                    key={src}
                    src={src}
                    alt={
                      index === 0
                        ? `${objet.nom}, pièce d’Edja Shop`
                        : `${objet.nom}, visuel supplémentaire`
                    }
                    className="w-[85vw] shrink-0 aspect-square lg:w-full lg:aspect-[9/12]"
                  />
                ))}
              </div>
            </div>

            {/* La colonne du récit : le récit d'abord, l'action ensuite — tout ce
                qui sert la décision tient dans cette colonne. */}
            <div className="col-span-16 lg:col-span-7">
              <div className="lg:sticky lg:top-28">
                <Link
                  to="/boutique"
                  className="group mb-4 flex min-h-11 w-fit items-center gap-1 tracking-tight text-current"
                >
                  <ArrowLeft
                    aria-hidden
                    className="mr-2 size-4 shrink-0 transition-transform duration-100 group-active:-translate-x-1"
                  />
                  {l({ fr: 'Retour à Edja Shop', en: 'Back to Edja Shop' })}
                </Link>

                <Eyebrow tone="light" num={objet.numero}>
                  Edja Shop · {objet.culture}
                </Eyebrow>

                <h1 className="mb-5 font-display uppercase text-display-lg leading-[0.92] text-ink-900">
                  {objet.nom}
                  <span aria-hidden className="text-clay-500">
                    .
                  </span>
                </h1>

                <p className="mb-5 text-3xl md:mb-4 md:text-5xl">
                  {prix != null && commerce?.prixConfirme ? (
                    promo ? (
                      <>
                        <span className="text-ink-500 line-through">{formatFCFA(ancienPrix)}</span>{' '}
                        <span className="text-promo-500">{formatFCFA(prix)}</span>
                      </>
                    ) : (
                      <span className="text-ink-500">{formatFCFA(prix)}</span>
                    )
                  ) : (
                    <span className="text-ink-500">{t('demande.surDemande')}</span>
                  )}
                </p>

                <p className="mb-8 max-w-3xl font-quote text-3xl italic leading-snug text-ink-700 md:text-5xl">
                  {objet.histoire}
                </p>

                <div className="mb-8 flex items-center border-current py-4 md:border-b-2 text-2xl md:text-4xl text-ink-900">
                  <button
                    type="button"
                    onClick={diminuer}
                    disabled={quantite <= 1}
                    aria-label={l({ fr: 'Diminuer la quantité', en: 'Decrease quantity' })}
                    className="inline-flex min-h-11 items-center transition-all duration-100 hover:opacity-80 active:scale-90 pr-4 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Minus aria-hidden className="size-9" />
                  </button>
                  {/* Annoncée à chaque changement : les boutons seuls ne disent pas le résultat. */}
                  <span aria-live="polite" className="min-w-10 text-center md:min-w-16">
                    <span className="sr-only">{l({ fr: 'Quantité : ', en: 'Quantity: ' })}</span>
                    {quantite}
                  </span>
                  <button
                    type="button"
                    onClick={augmenter}
                    aria-label={l({ fr: 'Augmenter la quantité', en: 'Increase quantity' })}
                    className="inline-flex min-h-11 items-center transition-all duration-100 hover:opacity-80 active:scale-90 pl-4"
                  >
                    <Plus aria-hidden className="size-9" />
                  </button>
                </div>

                {/* L'action. La règle d'honnêteté dure : sans prix confirmé, sans
                    matière, sans créateur, la commande cède la place à la promesse. */}
                {ficheAttendue ? (
                  <div className="relative isolate overflow-hidden rounded-xl border border-sand-300 bg-sand-100">
                    <AfricanPattern
                      motif="cauri-africain"
                      opacite={0.07}
                      className="-bottom-8 -right-8 h-32 w-44"
                    />
                    <div className="relative z-10 space-y-3 p-6">
                      <p className="label-caps text-clay-600">
                        {l({
                          fr: 'La fiche arrive de l’atelier',
                          en: 'The specs card arrives from the workshop',
                        })}
                      </p>
                      <p className="text-body text-ink-700">
                        {l({
                          fr: 'Matières, dimensions, entretien, origine, créateur, délais, frais, retours et taxes : rien n’est affiché tant que la maison ne l’a pas fourni et validé — une provenance inventée engagerait la maison.',
                          en: 'Materials, dimensions, care, origin, maker, lead times, fees, returns and taxes: nothing is displayed until the house provides and validates it — an invented provenance would commit the house.',
                        })}
                      </p>
                      <Link
                        to="/contact"
                        className="inline-flex min-h-11 items-center text-caption font-semibold text-clay-600 underline-offset-4 transition-colors hover:text-clay-700 hover:underline"
                      >
                        {l({
                          fr: 'Poser une question sur cette pièce',
                          en: 'Ask about this piece',
                        })}
                      </Link>
                    </div>
                  </div>
                ) : commerce?.disponible === false ? (
                  <div className="md:mt-8">
                    <p className="pointer-events-none text-4xl font-light text-promo-500 line-through decoration-2">
                      {l({ fr: 'Rupture de stock', en: 'Sold out' })}
                    </p>
                  </div>
                ) : (
                  <Button
                    variant="primary"
                    magnetic={false}
                    className="w-full"
                    onClick={() => basculer(objet)}
                  >
                    {choisi ? t('demande.retirer') : t('carte.ajouter')}
                  </Button>
                )}

                {/* Le créateur, quand il existe : il rejoint le récit, jamais les
                    « à fournir ». */}
                {commerce?.createur && (
                  <div className="space-y-2 border-t border-sand-200 pt-6">
                    <p className="label-caps text-ink-500">{l({ fr: 'Créateur', en: 'Maker' })}</p>
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
          </div>
        </div>
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
                  <Eyebrow>
                    {l({ fr: 'La collection se lit', en: 'The collection reads on' })}
                  </Eyebrow>
                  <h2 className="font-display uppercase text-display-lg">
                    {l({ fr: 'Le récit continue', en: 'The story goes on' })}
                    <span aria-hidden className="text-clay-500">
                      .
                    </span>
                  </h2>
                </div>

                <ul className="grid gap-2 sm:grid-cols-2">
                  {[
                    {
                      piece: precedente,
                      signe: 'left' as const,
                      libelle: { fr: 'Précédente', en: 'Previous' },
                    },
                    {
                      piece: suivante,
                      signe: 'right' as const,
                      libelle: { fr: 'Suivante', en: 'Next' },
                    },
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
                          className={
                            signe === 'left'
                              ? '-bottom-8 -left-8 h-24 w-32'
                              : '-bottom-8 -right-8 h-24 w-32'
                          }
                        />
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
                          <span aria-hidden className="font-display text-display-lg text-sand-300">
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
