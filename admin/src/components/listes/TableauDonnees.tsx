import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Columns3 } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { z } from 'zod'
import { Bouton } from '@/components/ui/Bouton'
import { EtatErreur, EtatVide } from '@/components/ui/Etats'
import { Squelette } from '@/components/ui/Squelette'
import { useSession } from '@/auth/contexte-session'
import { t } from '@/i18n/fr'
import { cn } from '@/lib/cn'
import { TAILLES_PAGE } from '@/lib/pagination'
import { ecrirePreference, lirePreference } from '@/lib/preferences'

/**
 * Tableau de données (section 10) : tri et pagination **côté serveur** (le tableau émet,
 * l'écran appelle l'API), sélection multiple, colonnes masquables (mémorisées par poste,
 * D-09), états de chargement, d'erreur et vide. Sous 768 px, chaque ligne devient une carte.
 *
 * La colonne « Créateur » (`colonneCreateur`) n'apparaît qu'en mode multi-vendeurs.
 *
 * @example
 * <TableauDonnees libelle="Articles" colonnes={COLONNES} lignes={requete.data?.items}
 *   cle={(a) => a.id} etat={etatDe(requete)} total={requete.data?.total ?? 0}
 *   page={page} pageSize={20} surPage={setPage} tri={tri} surTri={setTri}
 *   selection={selection} surSelection={setSelection} preferences="articles" />
 */
export interface Colonne<T> {
  id: string
  entete: string
  cellule: (ligne: T) => ReactNode
  /** Nom du champ de tri côté serveur ; absent = colonne non triable. */
  tri?: string
  /** La colonne principale ne se masque pas et sert de titre aux cartes mobiles. */
  principale?: boolean
  masquable?: boolean
  alignement?: 'gauche' | 'droite'
}

export type EtatTableau = 'chargement' | 'erreur' | 'pret'

const colonnesMasqueesSchema = z.array(z.string())

export function TableauDonnees<T>({
  libelle,
  colonnes,
  lignes,
  cle,
  etat,
  erreur,
  surReessai,
  total,
  page,
  pageSize,
  surPage,
  surTaille,
  tri,
  surTri,
  selection,
  surSelection,
  libelleLigne,
  preferences,
  colonneCreateur,
  vide,
}: {
  libelle: string
  colonnes: Colonne<T>[]
  lignes: T[] | undefined
  cle: (ligne: T) => string
  etat: EtatTableau
  erreur?: unknown
  surReessai?: () => void
  total: number
  page: number
  pageSize: number
  surPage: (page: number) => void
  /** Choix de la taille de page (20, 50 ou 100, ECRANS § 0.2) ; absent = taille fixe. */
  surTaille?: (taille: number) => void
  /** `champ` (croissant) ou `-champ` (décroissant), comme le contrat (§ 2). */
  tri?: string
  surTri?: (tri: string) => void
  selection?: string[]
  surSelection?: (ids: string[]) => void
  /** Nom lu par les lecteurs d'écran pour la case de sélection d'une ligne. */
  libelleLigne?: (ligne: T) => string
  /** Clé de mémorisation des colonnes masquées ; absente = rien n'est mémorisé. */
  preferences?: string
  colonneCreateur?: (ligne: T) => ReactNode
  vide?: ReactNode
}) {
  const { moi } = useSession()
  const [masquees, setMasquees] = useState<string[]>(() =>
    preferences ? lirePreference(`colonnes:${preferences}`, colonnesMasqueesSchema, []) : [],
  )

  const toutes: Colonne<T>[] =
    colonneCreateur && moi?.reglages.multiVendeurs
      ? [
          ...colonnes,
          {
            id: 'createur',
            entete: t('tableau.createur'),
            cellule: colonneCreateur,
            masquable: true,
          },
        ]
      : colonnes
  const visibles = toutes.filter((colonne) => colonne.principale || !masquees.includes(colonne.id))
  const principale = toutes.find((colonne) => colonne.principale) ?? toutes[0]

  const basculerColonne = (idColonne: string) => {
    const suivantes = masquees.includes(idColonne)
      ? masquees.filter((c) => c !== idColonne)
      : [...masquees, idColonne]
    setMasquees(suivantes)
    if (preferences) ecrirePreference(`colonnes:${preferences}`, suivantes)
  }

  const idsPage = lignes?.map(cle) ?? []
  const selectionnes = selection ?? []
  const touteLaPage = idsPage.length > 0 && idsPage.every((ligne) => selectionnes.includes(ligne))
  const unePartie = !touteLaPage && idsPage.some((ligne) => selectionnes.includes(ligne))
  const basculerLigne = (idLigne: string) =>
    surSelection?.(
      selectionnes.includes(idLigne)
        ? selectionnes.filter((s) => s !== idLigne)
        : [...selectionnes, idLigne],
    )
  const basculerPage = () =>
    surSelection?.(
      touteLaPage
        ? selectionnes.filter((s) => !idsPage.includes(s))
        : [...new Set([...selectionnes, ...idsPage])],
    )

  const pages = Math.max(1, Math.ceil(total / pageSize))
  const debut = total === 0 ? 0 : (page - 1) * pageSize + 1
  const fin = Math.min(total, page * pageSize)
  const masquables = toutes.filter((colonne) => colonne.masquable && !colonne.principale)

  const triDe = (colonne: Colonne<T>) =>
    tri === colonne.tri ? 'ascending' : tri === `-${colonne.tri}` ? 'descending' : 'none'

  let corps: ReactNode
  if (etat === 'chargement') corps = <Squelette lignes={5} />
  else if (etat === 'erreur')
    corps = <EtatErreur erreur={erreur} {...(surReessai ? { surReessai } : {})} />
  else if (!lignes || lignes.length === 0) corps = vide ?? <EtatVide titre={t('tableau.vide')} />
  else
    corps = (
      <>
        <div className="hidden overflow-x-auto rounded-md border border-sand-200 md:block">
          <table className="w-full border-collapse text-left text-body">
            <caption className="sr-only">{libelle}</caption>
            <thead className="bg-sand-100">
              <tr>
                {surSelection ? (
                  <th scope="col" className="w-12 px-3">
                    <input
                      type="checkbox"
                      aria-label={t('tableau.selectionnerPage')}
                      checked={touteLaPage}
                      ref={(element) => {
                        if (element) element.indeterminate = unePartie
                      }}
                      onChange={basculerPage}
                      className="size-5 accent-clay-600"
                    />
                  </th>
                ) : null}
                {visibles.map((colonne) => (
                  <th
                    key={colonne.id}
                    scope="col"
                    aria-sort={colonne.tri ? triDe(colonne) : undefined}
                    className={cn(
                      'px-3 py-2 text-caption font-semibold text-ink-700',
                      colonne.alignement === 'droite' && 'text-right',
                    )}
                  >
                    {colonne.tri && surTri ? (
                      <BoutonTri colonne={colonne} sens={triDe(colonne)} surTri={surTri} />
                    ) : (
                      colonne.entete
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lignes.map((ligne) => {
                const idLigne = cle(ligne)
                return (
                  <tr key={idLigne} className="border-t border-sand-200 hover:bg-sand-100/60">
                    {surSelection ? (
                      <td className="px-3">
                        <input
                          type="checkbox"
                          aria-label={`${t('tableau.selectionner')} ${libelleLigne?.(ligne) ?? idLigne}`}
                          checked={selectionnes.includes(idLigne)}
                          onChange={() => basculerLigne(idLigne)}
                          className="size-5 accent-clay-600"
                        />
                      </td>
                    ) : null}
                    {visibles.map((colonne) => (
                      <td
                        key={colonne.id}
                        className={cn(
                          'px-3 py-2.5 align-middle text-ink-900',
                          colonne.alignement === 'droite' && 'tnum text-right',
                        )}
                      >
                        {colonne.cellule(ligne)}
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <ul aria-label={libelle} className="space-y-3 md:hidden">
          {lignes.map((ligne) => {
            const idLigne = cle(ligne)
            return (
              <li key={idLigne} className="rounded-md border border-sand-200 bg-sand-50 p-4">
                <div className="flex items-start gap-3">
                  {surSelection ? (
                    <input
                      type="checkbox"
                      aria-label={`${t('tableau.selectionner')} ${libelleLigne?.(ligne) ?? idLigne}`}
                      checked={selectionnes.includes(idLigne)}
                      onChange={() => basculerLigne(idLigne)}
                      className="mt-1 size-5 accent-clay-600"
                    />
                  ) : null}
                  <div className="min-w-0 flex-1 space-y-2">
                    {principale ? (
                      <div className="font-semibold text-ink-900">{principale.cellule(ligne)}</div>
                    ) : null}
                    <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-caption">
                      {visibles
                        .filter((colonne) => colonne !== principale)
                        .map((colonne) => (
                          <div key={colonne.id} className="contents">
                            <dt className="text-ink-700">{colonne.entete}</dt>
                            <dd className="text-ink-900">{colonne.cellule(ligne)}</dd>
                          </div>
                        ))}
                    </dl>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </>
    )

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-caption text-ink-700" aria-live="polite">
          {surSelection && selectionnes.length > 0
            ? `${selectionnes.length} ${t('tableau.selectionnes')} · `
            : ''}
          {etat === 'pret'
            ? `${total} ${total > 1 ? t('tableau.resultats') : t('tableau.resultat')}`
            : ''}
        </p>
        {masquables.length > 0 ? (
          <details className="relative">
            <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-md px-3 text-button font-semibold text-ink-900 hover:bg-sand-100">
              <Columns3 aria-hidden className="size-4" />
              {t('tableau.colonnes')}
            </summary>
            <fieldset className="absolute right-0 z-30 mt-1 w-64 space-y-1 rounded-md border border-sand-200 bg-sand-50 p-3 shadow-lg">
              <legend className="sr-only">{t('tableau.colonnesVisibles')}</legend>
              {masquables.map((colonne) => (
                <label key={colonne.id} className="flex min-h-11 items-center gap-3 text-body">
                  <input
                    type="checkbox"
                    checked={!masquees.includes(colonne.id)}
                    onChange={() => basculerColonne(colonne.id)}
                    className="size-5 accent-clay-600"
                  />
                  {colonne.entete}
                </label>
              ))}
            </fieldset>
          </details>
        ) : null}
      </div>

      {corps}

      {etat === 'pret' && (total > pageSize || (surTaille && total > TAILLES_PAGE[0])) ? (
        <nav
          aria-label={`${t('tableau.pagination')} : ${libelle}`}
          className="flex flex-wrap items-center justify-between gap-2"
        >
          <p className="tnum text-caption text-ink-700">
            {debut}–{fin} {t('tableau.sur')} {total}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {surTaille ? (
              <label className="flex items-center gap-2 text-caption text-ink-700">
                {t('tableau.parPage')}
                <select
                  value={pageSize}
                  onChange={(evenement) => surTaille(Number(evenement.target.value))}
                  className="min-h-11 rounded-md border border-sand-300 bg-sand-50 px-2 text-body text-ink-900"
                >
                  {TAILLES_PAGE.map((taille) => (
                    <option key={taille} value={taille}>
                      {taille}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            <Bouton variante="secondaire" disabled={page <= 1} onClick={() => surPage(page - 1)}>
              <ChevronLeft aria-hidden className="size-4" />
              {t('tableau.precedente')}
            </Bouton>
            <span className="tnum text-caption text-ink-900">
              {t('tableau.page')} {page} / {pages}
            </span>
            <Bouton
              variante="secondaire"
              disabled={page >= pages}
              onClick={() => surPage(page + 1)}
            >
              {t('tableau.suivante')}
              <ChevronRight aria-hidden className="size-4" />
            </Bouton>
          </div>
        </nav>
      ) : null}
    </div>
  )
}

function BoutonTri<T>({
  colonne,
  sens,
  surTri,
}: {
  colonne: Colonne<T>
  sens: 'ascending' | 'descending' | 'none'
  surTri: (tri: string) => void
}) {
  const Icone = sens === 'ascending' ? ArrowUp : sens === 'descending' ? ArrowDown : ArrowUpDown
  return (
    <button
      type="button"
      onClick={() => surTri(sens === 'ascending' ? `-${colonne.tri}` : (colonne.tri ?? ''))}
      className="-mx-2 inline-flex min-h-11 items-center gap-1.5 rounded-md px-2 hover:bg-sand-200"
    >
      {colonne.entete}
      <Icone aria-hidden className="size-3.5" />
      <span className="sr-only">
        {sens === 'ascending' ? t('tableau.triDecroissant') : t('tableau.triCroissant')}
      </span>
    </button>
  )
}
