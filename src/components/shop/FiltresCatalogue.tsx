import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { useSearchParams } from 'react-router'
import { useDemande } from '@/lib/demande'
import { useLangue } from '@/i18n/contexteLangue'
import type { CleTraduction } from '@/i18n/dictionnaire'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Pagination } from '@/components/ui/Pagination'
import { BijouCard } from '@/components/cards/BijouCard'
import { CarteLivre } from '@/components/shop/SectionLivres'
import { ALT_TEST_CARTE, VISUEL_TEST_CARTE } from '@/lib/visuels'
import { useCorrigerPage, useEcranLarge, usePagination } from '@/hooks/usePagination'
import {
  obtenirProduits,
  TAILLE_PAGE,
  TAILLE_PAGE_LARGE,
  TRIS,
  type Tri,
  type TypeProduit,
} from '@/lib/catalogue'

/**
 * Catalogue de la boutique (SCHEMAS § 12.2) : bijoux et livres, filtrés, triés et **paginés**.
 *
 * - Filtres (type, catégorie, disponibilité, créateur, recherche), tri et page vivent dans
 *   l'adresse (`/boutique?type=livre&categorie=…&tri=…&page=2`) : partageable, et le bouton
 *   Retour fonctionne. Tout changement de filtre ou de tri revient à la page 1.
 * - 12 produits par page, 24 sur un écran d'au moins 1536 px.
 * - Au changement de page : retour en haut de la grille, focus sur le titre de la liste, annonce
 *   vocale « Page 2 sur 3 ».
 * - Les produits viennent de `obtenirProduits` (même forme que l'API publique) : le jour du
 *   branchement (mission 3), ce composant ne change pas.
 *
 * Le filtre « créateur » n'apparaît que si au moins un produit a un créateur renseigné : aucun
 * n'en a aujourd'hui, et une liste vide ne filtrerait rien.
 */
const TYPES: TypeProduit[] = ['bijou', 'livre']
const CLES_FILTRES = ['type', 'categorie', 'disponible', 'createur', 'q'] as const

function SelectPilule({
  id,
  libelle,
  value,
  onChange,
  children,
}: {
  id: string
  libelle: string
  value: string
  onChange: (valeur: string) => void
  children: ReactNode
}) {
  return (
    <div className="relative min-w-44">
      <label className="sr-only" htmlFor={id}>
        {libelle}
      </label>
      <select
        id={id}
        value={value}
        onChange={(evenement) => onChange(evenement.target.value)}
        className="min-h-11 w-full cursor-pointer appearance-none rounded-full border border-sand-300 bg-transparent pl-5 pr-11 text-caption text-ink-900 transition-colors duration-(--d-fast) hover:bg-sand-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clay-600"
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-5 size-4 -translate-y-1/2 text-ink-700"
      />
    </div>
  )
}

export function FiltresCatalogue() {
  const { t, l } = useLangue()
  const { present } = useDemande()
  const [params, setParams] = useSearchParams()
  const { page, recherchePage } = usePagination()
  const ecranLarge = useEcranLarge()

  // Seules les valeurs connues sont lues : une adresse fantaisiste ne casse rien.
  const typeLu = params.get('type')
  const type = TYPES.includes(typeLu as TypeProduit) ? (typeLu as TypeProduit) : null
  const triLu = params.get('tri')
  const tri: Tri = TRIS.includes(triLu as Tri) ? (triLu as Tri) : 'nouveautes'
  const categorie = params.get('categorie')
  const createur = params.get('createur')
  const disponible = params.get('disponible') === '1'
  const q = params.get('q') ?? ''

  const resultat = obtenirProduits({
    type,
    categorie,
    createur,
    disponible,
    q,
    tri,
    page,
    pageSize: ecranLarge ? TAILLE_PAGE_LARGE : TAILLE_PAGE,
  })
  useCorrigerPage(resultat.page)

  /** Un filtre ou le tri change : retour à la page 1. La saisie de recherche remplace l'historique. */
  const regler = (cle: string, valeur: string | null, remplacer = false) =>
    setParams(
      (actuelle) => {
        const suivante = new URLSearchParams(actuelle)
        if (valeur) suivante.set(cle, valeur)
        else suivante.delete(cle)
        suivante.delete('page')
        return suivante
      },
      { replace: remplacer, preventScrollReset: true },
    )

  const effacer = () =>
    setParams(
      (actuelle) => {
        const suivante = new URLSearchParams(actuelle)
        for (const cle of [...CLES_FILTRES, 'page']) suivante.delete(cle)
        return suivante
      },
      { preventScrollReset: true },
    )

  const filtreActif = CLES_FILTRES.some((cle) => params.has(cle))

  // Annonce de la page (ajustement pendant le rendu) ; retour en haut et focus après coup.
  const resume = `${t('pagination.page')} ${resultat.page} ${t('pagination.sur')} ${resultat.totalPages}`
  const [pageVue, setPageVue] = useState(resultat.page)
  const [annonce, setAnnonce] = useState('')
  if (pageVue !== resultat.page) {
    setPageVue(resultat.page)
    setAnnonce(resume)
  }
  const titreListe = useRef<HTMLHeadingElement>(null)
  const premierRendu = useRef(true)
  useEffect(() => {
    if (premierRendu.current) {
      premierRendu.current = false
      return
    }
    const titre = titreListe.current
    if (!titre) return
    const reduit = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    titre.scrollIntoView?.({ block: 'start', behavior: reduit ? 'auto' : 'smooth' })
    titre.focus({ preventScroll: true })
  }, [resultat.page])

  const compteur = `${resultat.total} ${resultat.total > 1 ? t('catalogue.produits') : t('catalogue.produit')}`

  return (
    <section id="catalogue" aria-label={t('catalogue.titre')} className="scroll-mt-24 space-y-10">
      <div className="space-y-6">
        <Eyebrow>{l({ fr: 'Le catalogue', en: 'The catalogue' })}</Eyebrow>
        <h2 className="font-display uppercase text-display-lg">
          L'univers de la mode et de la culture à votre porte
          <span aria-hidden className="text-clay-500">
            .
          </span>
        </h2>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="sr-only" htmlFor="catalogue-recherche">
          {t('catalogue.recherche')}
        </label>
        <input
          id="catalogue-recherche"
          type="search"
          value={q}
          onChange={(evenement) => regler('q', evenement.target.value || null, true)}
          placeholder={t('catalogue.recherche')}
          className="min-h-11 w-full max-w-xs rounded-full border border-sand-300 bg-transparent px-5 text-caption text-ink-900 placeholder:text-ink-500"
        />

        <SelectPilule
          id="catalogue-type"
          libelle={t('catalogue.type')}
          value={type ?? ''}
          onChange={(v) => regler('type', v || null)}
        >
          <option value="">{t('catalogue.tousTypes')}</option>
          <option value="bijou">{t('catalogue.bijoux')}</option>
          <option value="livre">{t('catalogue.livres')}</option>
        </SelectPilule>

        <SelectPilule
          id="catalogue-categorie"
          libelle={t('catalogue.categorie')}
          value={categorie ?? ''}
          onChange={(v) => regler('categorie', v || null)}
        >
          <option value="">{t('catalogue.toutesCategories')}</option>
          {resultat.categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.nom} ({c.compte})
            </option>
          ))}
        </SelectPilule>

        {resultat.createurs.length > 0 ? (
          <SelectPilule
            id="catalogue-createur"
            libelle={t('catalogue.createur')}
            value={createur ?? ''}
            onChange={(v) => regler('createur', v || null)}
          >
            <option value="">{t('catalogue.tousCreateurs')}</option>
            {resultat.createurs.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.nom}
              </option>
            ))}
          </SelectPilule>
        ) : null}

        <SelectPilule
          id="catalogue-tri"
          libelle={t('catalogue.tri')}
          value={tri}
          onChange={(v) => regler('tri', v === 'nouveautes' ? null : v)}
        >
          {TRIS.map((valeur) => (
            <option key={valeur} value={valeur}>
              {t(`catalogue.tri.${valeur}` as CleTraduction)}
            </option>
          ))}
        </SelectPilule>

        <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-sand-300 px-4 text-caption text-ink-900 hover:bg-sand-200 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-clay-600">
          <input
            type="checkbox"
            checked={disponible}
            onChange={(evenement) => regler('disponible', evenement.target.checked ? '1' : null)}
            className="size-4 accent-clay-600"
          />
          {t('catalogue.disponibles')}
        </label>

        {filtreActif && (
          <button
            type="button"
            onClick={effacer}
            className="inline-flex min-h-11 items-center rounded-full border border-sand-300 px-4 text-caption font-semibold text-ink-700 transition-colors duration-(--d-fast) hover:bg-sand-200"
          >
            {t('catalogue.effacer')}
          </button>
        )}
      </div>

      {resultat.items.some((p) => present(p.produit.slug)) && (
        <p className="text-caption text-clay-600">{t('catalogue.selectionActive')}</p>
      )}

      <div className="space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3
            ref={titreListe}
            tabIndex={-1}
            className="scroll-mt-28 label-caps text-ink-700 focus:outline-none"
          >
            {t('catalogue.liste')} · {compteur}
          </h3>
          {resultat.total > 0 ? <p className="text-caption text-ink-500">{resume}</p> : null}
        </div>
        <p aria-live="polite" className="sr-only">
          {annonce}
        </p>

        {resultat.total === 0 ? (
          <div role="status" className="space-y-4 py-10">
            <p className="text-body text-ink-700">{t('catalogue.aucunProduit')}</p>
            {filtreActif ? (
              <button
                type="button"
                onClick={effacer}
                className="inline-flex min-h-11 items-center rounded-full border border-sand-300 px-4 text-caption font-semibold text-ink-900 hover:bg-sand-200"
              >
                {t('catalogue.effacer')}
              </button>
            ) : null}
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-1 sm:grid-cols-3">
            {resultat.items.map((p) => (
              <li key={p.id}>
                {p.type === 'livre' ? (
                  <CarteLivre livre={p.produit} />
                ) : (
                  <BijouCard
                    bijou={p.produit}
                    image={VISUEL_TEST_CARTE}
                    imageAlt={ALT_TEST_CARTE}
                  />
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <Pagination
        page={resultat.page}
        totalPages={resultat.totalPages}
        recherchePage={recherchePage}
      />
    </section>
  )
}
