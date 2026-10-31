import { useMemo, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { PIECES, CATEGORIES_SHOP } from '@/data/shop'
import { useDemande } from '@/lib/demande'
import { useLangue } from '@/i18n/contexteLangue'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { BijouCard } from '@/components/cards/BijouCard'
import { ALT_TEST_CARTE, VISUEL_TEST_CARTE } from '@/lib/visuels'

/**
 * Catalogue de la boutique avec les filtres utiles aujourd'hui : catégorie et
 * recherche.
 *
 * Le tri et la disponibilité ont été retirés : toutes les pièces sont disponibles
 * et les prix ne sont pas renseignés, donc ces contrôles ne filtraient rien.
 */
export function FiltresCatalogue() {
  const { t, l } = useLangue()
  const { present } = useDemande()
  const [categorie, setCategorie] = useState<string>('toutes')
  const [recherche, setRecherche] = useState('')

  const filtreActif = categorie !== 'toutes' || recherche.trim() !== ''

  const reinitialiser = () => {
    setCategorie('toutes')
    setRecherche('')
  }

  // Catégories réellement présentes : les sept autres familles du CDC attendent leurs
  // produits. Les proposer à la sélection renvoyait « aucune pièce » sur sept options.
  const categoriesPresents = useMemo(
    () => CATEGORIES_SHOP.filter((nom) => PIECES.some((piece) => piece.commerce?.categorie === nom)),
    [],
  )

  const visibles = useMemo(() => {
    return PIECES.filter((piece) => {
      if (categorie !== 'toutes' && piece.commerce?.categorie !== categorie) return false
      if (recherche.trim() !== '') {
        const cible = `${piece.nom} ${piece.culture} ${piece.histoire}`.toLowerCase()
        if (!cible.includes(recherche.trim().toLowerCase())) return false
      }
      return true
    })
  }, [categorie, recherche])

  return (
    <section id="catalogue" aria-label={t('catalogue.titre')} className="scroll-mt-24 space-y-10">
      <div className="space-y-6">
        <Eyebrow>{l({ fr: 'Le catalogue', en: 'The catalogue' })}</Eyebrow>
        <h2 className="font-display uppercase text-display-lg">
          L'univers de la mode et de la culture à votre porte
          <span aria-hidden className="text-clay-500">.</span>
        </h2>
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
        {/* Select natif habillé : la flèche système est retirée (appearance-none)
            pour qu'elle ne fasse pas double emploi avec la chevron maison ; la
            largeur minimale empêche la pastille de sauter à chaque catégorie. */}
        <div className="relative min-w-44">
          <select
            id="catalogue-categorie"
            value={categorie}
            onChange={(evenement) => setCategorie(evenement.target.value)}
            className="min-h-11 w-full cursor-pointer appearance-none rounded-full border border-sand-300 bg-transparent pl-5 pr-11 text-caption text-ink-900 transition-colors duration-(--d-fast) hover:bg-sand-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clay-600"
          >
            <option value="toutes">{t('catalogue.toutesCategories')}</option>
            {categoriesPresents.map((nom) => (
              <option key={nom} value={nom}>
                {nom}
              </option>
            ))}
          </select>
          <ChevronDown
            aria-hidden
            className="pointer-events-none absolute top-1/2 right-5 size-4 -translate-y-1/2 text-ink-700"
          />
        </div>

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

      {visibles.some((piece) => present(piece.slug)) && (
        <p className="text-caption text-clay-600">{t('catalogue.selectionActive')}</p>
      )}

      <div className="grid grid-cols-2 gap-1 sm:grid-cols-3">
        {visibles.map((piece) => (
          <BijouCard
            key={piece.slug}
            bijou={piece}
            image={VISUEL_TEST_CARTE}
            imageAlt={ALT_TEST_CARTE}
          />
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
