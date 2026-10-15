import { Link, useParams } from 'react-router'
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
import { Reveal } from '@/components/motion/Reveal'
import { formatFCFA } from '@/lib/format'

const SPECS_A_FOURNIR = [
  'Matières',
  'Dimensions',
  'Fabrication',
  'Entretien',
  'Origine',
]

const LIVRAISON_A_FOURNIR = [
  'Délais et zones desservies',
  'Frais de livraison',
  'Retours et échanges',
  'Taxes et douanes',
]

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
  const liees = PIECES.filter(
    (piece) => piece.slug !== objet.slug && piece.culture === objet.culture,
  ).slice(0, 3)

  return (
    <Section tone="light" padded={false} className="pt-32 pb-20 lg:pt-44 lg:pb-28">
      <Container className="space-y-12">
        <Breadcrumb titreFinal={objet.nom} />

        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          {/* 7/12 : la pièce est le sujet, pas un aperçu posé à côté du texte. Sa
              galerie vit sous elle, dans la même colonne visuelle. */}
          <div className="space-y-2 lg:col-span-7">
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

          {/* 5/12 : la colonne se lit comme une fiche, pas comme une suite de blocs
              indifférenciés — l'action d'abord, le récit ensuite, les
              caractéristiques à la fin. */}
          <div className="space-y-8 lg:col-span-5">
            <div className="space-y-4">
              <Eyebrow num={objet.numero}>Collection TRIBE</Eyebrow>
              <h1 className="font-display uppercase text-display-lg">{objet.nom}</h1>

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

              <div className="flex flex-wrap gap-2">
                <Tag tone="sage">{objet.culture}</Tag>
                <Tag>Collection TRIBE</Tag>
                {commerce?.edition && (
                  <Tag>
                    Édition {commerce.edition.numero}/{commerce.edition.total}
                  </Tag>
                )}
              </div>
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

            {/* Le récit, une seule fois. La même phrase était répétée plus bas à une
                autre taille : écrite deux fois, elle ne se relit pas, elle s'ignore. */}
            <div className="space-y-3 border-t border-sand-200 pt-6">
              <p className="label-caps text-clay-600">L'histoire</p>
              <p className="text-body-lg text-ink-700">{objet.histoire}</p>
              <p className="text-caption text-ink-500">
                {l({
                  fr: 'Origine, symbole, usage et contexte culturel sont à compléter avec la maison. Une provenance inventée engagerait la maison.',
                  en: 'Origin, symbol, use and cultural context are to be completed with the house. An invented provenance would commit the house.',
                })}
              </p>
            </div>

            {/* Créateur (T-213) */}
            <div className="space-y-2 border-t border-sand-200 pt-6">
              <p className="label-caps text-ink-500">Créateur</p>
              {commerce?.createur ? (
                <div className="text-body text-ink-700">
                  <p className="font-semibold">{commerce.createur.nom}</p>
                  <p>
                    {[commerce.createur.ville, commerce.createur.pays].filter(Boolean).join(' · ')}
                  </p>
                  <p>{commerce.createur.bio}</p>
                </div>
              ) : (
                <p className="text-body text-ink-500">
                  {l({
                    fr: 'Nom, pays, ville et bio du créateur à fournir.',
                    en: 'Creator name, country, city and bio to be provided.',
                  })}
                </p>
              )}
            </div>

            {/* Fiche technique (T-214) : lignes de définition plutôt que puces. Une
                fiche se lit en colonnes « intitulé / valeur », pas en liste à plat. */}
            <div className="space-y-3 border-t border-sand-200 pt-6">
              <p className="label-caps text-ink-500">Fiche technique</p>
              <dl className="divide-y divide-sand-200">
                {SPECS_A_FOURNIR.map((spec) => (
                  <div key={spec} className="flex items-baseline justify-between gap-4 py-2.5">
                    <dt className="text-body text-ink-700">{spec}</dt>
                    <dd className="text-caption text-ink-500">{t('preuves.aFournir')}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Livraison et réassurance ne faisaient qu'un (T-215, T-216) : deux blocs
                d'attente séparés donnaient l'impression d'un dossier vide. */}
            <div className="space-y-3 border-t border-sand-200 pt-6">
              <p className="label-caps text-ink-500">Livraison &amp; réassurance</p>
              <dl className="divide-y divide-sand-200">
                {LIVRAISON_A_FOURNIR.map((ligne) => (
                  <div key={ligne} className="flex items-baseline justify-between gap-4 py-2.5">
                    <dt className="text-body text-ink-700">{ligne}</dt>
                    <dd className="text-caption text-ink-500">{t('preuves.aFournir')}</dd>
                  </div>
                ))}
              </dl>
              <p className="text-caption text-ink-500">
                {l({
                  fr: 'Paiement sécurisé, délais, contact et politique de retour : contenus à fournir avant l’ouverture de la vente en ligne.',
                  en: 'Secure payment, lead times, contact and return policy: content to be provided before online sales open.',
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Cross-sell (T-217) : par culture, le seul rapprochement sûr des données. */}
        {liees.length > 0 && (
          <Reveal>
            <div className="space-y-8 border-t border-sand-200 pt-10">
              <div className="space-y-2">
                <Eyebrow num="01">À découvrir</Eyebrow>
                <h2 className="font-display uppercase text-display-lg">
                  Dans la même culture
                  <span aria-hidden className="text-clay-500">.</span>
                </h2>
              </div>
              <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {liees.map((piece) => (
                  <li key={piece.slug}>
                    <Link
                      to={`/boutique/${piece.slug}`}
                      className="group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-clay-600"
                    >
                      <LazyImage
                        src={piece.image}
                        alt={piece.nom}
                        ratio="4/5"
                        className="overflow-hidden rounded-md bg-sand-200 transition-transform duration-[700ms] ease-expo group-hover:scale-[1.03]"
                      />
                      <p className="label-caps mt-3 px-1 text-ink-900">{piece.nom}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        )}
      </Container>
    </Section>
  )
}
