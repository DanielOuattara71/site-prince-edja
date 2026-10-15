import { useMemo, useState } from 'react'
import { PIECES, CATEGORIES_SHOP } from '@/data/shop'
import { useDemande } from '@/lib/demande'
import { useLangue } from '@/i18n/contexteLangue'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { BijouCard } from '@/components/cards/BijouCard'
import { cn } from '@/lib/cn'

type Tri = 'numero' | 'prix-croissant' | 'prix-decroissant'

/**
 * Catalogue de la boutique avec les filtres du CDC : catégorie, prix, origine,
 * créateur et disponibilité.
 *
 * Origine et créateur sont volontairement absents des filtres actifs : `BIJOUX` ne
 * porte ni `pays` ni `theme` remplis, faute de source. Ils sont listés pour que la
 * bascle se fasse le jour où les données arrivent, pas pour donner l'illusion d'un
 * choix.
 */
export function FiltresCatalogue() {
  const { t, l } = useLangue()
  const { present } = useDemande()
  const [categorie, setCategorie] = useState<string>('toutes')
  const [disponibilite, setDisponibilite] = useState<'toutes' | 'disponibles'>('toutes')
  const [tri, setTri] = useState<Tri>('numero')
  const [recherche, setRecherche] = useState('')

  const filtreActif =
    categorie !== 'toutes' || disponibilite !== 'toutes' || tri !== 'numero' || recherche.trim() !== ''

  const reinitialiser = () => {
    setCategorie('toutes')
    setDisponibilite('toutes')
    setTri('numero')
    setRecherche('')
  }

  // Catégories réellement présentes : les sept autres familles du CDC attendent leurs
  // produits. Les proposer à la sélection renvoyait « aucune pièce » sur sept options.
  const categoriesPresents = useMemo(
    () => CATEGORIES_SHOP.filter((nom) => PIECES.some((piece) => piece.commerce?.categorie === nom)),
    [],
  )

  const visibles = useMemo(() => {
    const liste = PIECES.filter((piece) => {
      if (categorie !== 'toutes' && piece.commerce?.categorie !== categorie) return false
      if (disponibilite === 'disponibles' && piece.commerce?.disponible === false) return false
      if (recherche.trim() !== '') {
        const cible = `${piece.nom} ${piece.culture} ${piece.histoire}`.toLowerCase()
        if (!cible.includes(recherche.trim().toLowerCase())) return false
      }
      return true
    })

    if (tri === 'prix-croissant') {
      return [...liste].sort(
        (a, b) => (a.commerce?.prix ?? Infinity) - (b.commerce?.prix ?? Infinity),
      )
    }
    if (tri === 'prix-decroissant') {
      return [...liste].sort((a, b) => (b.commerce?.prix ?? 0) - (a.commerce?.prix ?? 0))
    }
    return liste
  }, [categorie, disponibilite, tri, recherche])

  return (
    <section aria-label={t('catalogue.titre')} className="space-y-10">
      <div className="space-y-6">
        <Eyebrow num="02">La galerie</Eyebrow>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="font-display uppercase text-display-lg">
            Les {PIECES.length} pièces
            <span aria-hidden className="text-clay-500">.</span>
          </h2>
          <p className="max-w-md text-body text-ink-500">
            {l({
              fr: 'La collection se vend sur demande : constituez votre sélection, la maison répond avec les disponibilités et les délais.',
              en: 'The collection is sold on request: build your selection, the house replies with availability and lead times.',
            })}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="sr-only" htmlFor="catalogue-recherche">
          {t('catalogue.recherche')}
        </label>
        <input
          id="catalogue-recherche"
          value={recherche}
          onChange={(evenement) => setRecherche(evenement.target.value)}
          placeholder={t('catalogue.recherche')}
          className="min-h-11 w-full max-w-xs rounded-full border border-sand-300 bg-transparent px-5 text-caption text-ink-900 placeholder:text-ink-500"
        />

        <label className="sr-only" htmlFor="catalogue-categorie">
          {t('catalogue.categorie')}
        </label>
        <select
          id="catalogue-categorie"
          value={categorie}
          onChange={(evenement) => setCategorie(evenement.target.value)}
          className="min-h-11 rounded-full border border-sand-300 bg-transparent px-5 text-caption text-ink-900"
        >
          <option value="toutes">{t('catalogue.toutesCategories')}</option>
          {categoriesPresents.map((nom) => (
            <option key={nom} value={nom}>
              {nom}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() =>
            setDisponibilite((actuel) => (actuel === 'toutes' ? 'disponibles' : 'toutes'))
          }
          aria-pressed={disponibilite === 'disponibles'}
          className={cn(
            'min-h-11 rounded-full border px-5 text-caption font-semibold transition-colors duration-(--d-fast)',
            disponibilite === 'disponibles'
              ? 'border-night-900 bg-night-900 text-cream-100'
              : 'border-sand-300 text-ink-700 hover:bg-sand-200',
          )}
        >
          {t('catalogue.disponibles')}
        </button>

        <label className="sr-only" htmlFor="catalogue-tri">
          {t('catalogue.tri')}
        </label>
        <select
          id="catalogue-tri"
          value={tri}
          onChange={(evenement) => setTri(evenement.target.value as Tri)}
          className="min-h-11 rounded-full border border-sand-300 bg-transparent px-5 text-caption text-ink-900"
        >
          <option value="numero">{t('catalogue.triNumero')}</option>
          <option value="prix-croissant">{t('catalogue.triPrixCroissant')}</option>
          <option value="prix-decroissant">{t('catalogue.triPrixDecroissant')}</option>
        </select>

        {/* Compteur annoncé : filtrer change la liste sans bruit, un lecteur d'écran
            ne l'apprendrait jamais. */}
        <span role="status" aria-live="polite" className="text-caption text-ink-500">
          {visibles.length} / {PIECES.length}
        </span>

        {filtreActif && (
          <button
            type="button"
            onClick={reinitialiser}
            className="inline-flex min-h-11 items-center rounded-full border border-sand-300 px-4 text-caption font-semibold text-ink-700 transition-colors duration-(--d-fast) hover:bg-sand-200"
          >
            {t('catalogue.reinitialiser')}
          </button>
        )}
      </div>

      {/* Origine et créateur : les données n'existent pas encore, les filtres restent
          annoncés plutôt que factices. */}
      <p className="text-caption text-ink-500">
        {l({
          fr: 'Filtres à activer dès que les données existent : origine, créateur. Ils ne sont pas branchés faute de source.',
          en: 'Filters to activate once data exists: origin, creator. They are not wired up for lack of a source.',
        })}
        {' '}
        {visibles.some((piece) => present(piece.slug)) && (
          <span className="text-clay-600">{t('catalogue.selectionActive')}</span>
        )}
      </p>

      <div className="grid grid-cols-2 gap-1 sm:grid-cols-3">
        {visibles.map((piece) => (
          <BijouCard key={piece.slug} bijou={piece} />
        ))}
      </div>

      {visibles.length === 0 && (
        <p role="status" className="text-body text-ink-500">
          {t('catalogue.aucunResultat')}
        </p>
      )}
    </section>
  )
}
