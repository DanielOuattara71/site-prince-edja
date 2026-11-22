import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { bijoux } from '@/api/endpoints/boutique'
import type { ResumeBijou } from '@/api/schemas/boutique'
import type { StatutContenu } from '@/api/schemas/communs'
import { useSession } from '@/auth/contexte-session'
import { peut } from '@/auth/permissions'
import { Bouton } from '@/components/ui/Bouton'
import { Confirmation } from '@/components/ui/Confirmation'
import { EtatErreur, EtatVide } from '@/components/ui/Etats'
import { FilAriane } from '@/components/layout/FilAriane'
import { TitrePage } from '@/components/layout/TitrePage'
import { Select } from '@/components/ui/Select'
import { Squelette } from '@/components/ui/Squelette'
import { IndicateurAFournir } from '@/components/ui/IndicateurAFournir'
import { PastilleStatut } from '@/components/ui/PastilleStatut'
import MiniatureProduit from '@/components/apercu/MiniatureProduit'
import { useNotifications } from '@/components/retours/contexte-notifications'
import { useCategories } from '@/features/categories/useCategories'
import { t } from '@/i18n/fr'
import { cn } from '@/lib/cn'
import { messageErreur } from '@/lib/message-erreur'
import { etatAffiche } from '@/lib/statuts'

/**
 * Grille des bijoux (contrat § 10) : chaque pièce est une carte visuelle — affiche, numéro,
 * nom, statut, catégorie et prix. Filtres, pagination et suppression groupée restent tersebut
 * de la liste tabulaire ; seule la présentation change, les données et l'API sont intactes.
 */
const TAILLES = [8, 12, 16, 24] as const
const TAILLE_DEFAUT = 12
const STATUTS: StatutContenu[] = ['brouillon', 'en_relecture', 'publie', 'archive']

export default function ListeBijoux() {
  const { moi } = useSession()
  const client = useQueryClient()
  const notifier = useNotifications()
  const [adresse, setAdresse] = useSearchParams()
  const [recherche, setRecherche] = useState(adresse.get('q') ?? '')
  const [selection, setSelection] = useState<string[]>([])
  const [suppression, setSuppression] = useState<ResumeBijou | null>(null)
  const minuterie = useRef<number | undefined>(undefined)

  const page = Math.max(1, Number(adresse.get('page') ?? '1') || 1)
  const tailleCandidate = Number(adresse.get('taille'))
  const pageSize = TAILLES.includes(tailleCandidate as (typeof TAILLES)[number])
    ? tailleCandidate
    : TAILLE_DEFAUT
  const statut = (adresse.get('statut') as StatutContenu | null) ?? null
  const categorie = adresse.get('categorie') ?? ''
  const prixConfirme = adresse.get('prixConfirme') ?? ''
  const visible = adresse.get('visible') ?? ''
  const tri = adresse.get('tri') ?? '-modifieLe'
  const filtresActifs = ['q', 'statut', 'categorie', 'prixConfirme', 'visible', 'tri'].some((cle) =>
    adresse.has(cle),
  )

  const listeCategories = useCategories('produit')
  const nomsCategories = new Map(
    (listeCategories.data?.items ?? []).map((c) => [
      c.id,
      c.traductions.fr?.nom ?? c.traductions.en?.nom ?? '',
    ]),
  )

  const liste = useQuery({
    queryKey: ['bijoux', 'liste', { page, pageSize, q: adresse.get('q'), statut, categorie, prixConfirme, visible, tri }],
    queryFn: () =>
      bijoux.lister(
        { page, pageSize, tri, ...(adresse.get('q') ? { q: adresse.get('q') ?? '' } : {}) },
        undefined,
        {
          ...(statut ? { statut } : {}),
          ...(categorie ? { categorie } : {}),
          ...(prixConfirme ? { prixConfirme } : {}),
          ...(visible ? { visible } : {}),
        },
      ),
    placeholderData: (precedent) => precedent,
  })

  const donnees = (liste.data?.items ?? []) as ResumeBijou[]
  const total = liste.data?.total ?? 0
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const debut = total === 0 ? 0 : Math.min(total, (page - 1) * pageSize + 1)
  const fin = Math.min(total, page * pageSize)
  const peutSupprimer = peut(moi?.compte, 'supprimer', 'bijoux')

  useEffect(() => () => window.clearTimeout(minuterie.current), [])

  const regler = (cle: string, valeur: string | null) => {
    const suivante = new URLSearchParams(adresse)
    if (valeur) suivante.set(cle, valeur)
    else suivante.delete(cle)
    if (cle !== 'page') suivante.delete('page')
    setAdresse(suivante, { replace: true })
    setSelection([])
  }
  const saisir = (valeur: string) => {
    setRecherche(valeur)
    window.clearTimeout(minuterie.current)
    minuterie.current = window.setTimeout(() => regler('q', valeur.trim() || null), 300)
  }
  const changerPage = (cible: number) => {
    const suivante = new URLSearchParams(adresse)
    suivante.delete('page')
    if (cible > 1) suivante.set('page', String(cible))
    setAdresse(suivante, { replace: true })
    setSelection([])
  }
  const pagesAAfficher = (): number[] => {
    const debutBloc = Math.max(1, Math.min(page - 2, pages - 4))
    const finBloc = Math.min(pages, debutBloc + 4)
    return Array.from({ length: finBloc - debutBloc + 1 }, (_, i) => debutBloc + i)
  }
  const basculer = (id: string) =>
    setSelection((actuels) =>
      actuels.includes(id) ? actuels.filter((x) => x !== id) : [...actuels, id],
    )

  const supprimer = () => {
    if (!suppression) return
    bijoux.supprimer(suppression.id, suppression.version).then(
      () => {
        setSuppression(null)
        setSelection((actuels) => actuels.filter((id) => id !== suppression.id))
        notifier.succes(t('liste.elementsTraites'))
        void client.invalidateQueries({ queryKey: ['bijoux'] })
      },
      (erreur: unknown) => {
        setSuppression(null)
        notifier.erreur(messageErreur(erreur))
      },
    )
  }

  const supprimerSelection = () => {
    const cibles = donnees.filter((b) => selection.includes(b.id))
    if (cibles.length === 0) return
    void Promise.all(cibles.map((b) => bijoux.supprimer(b.id, b.version))).then(
      () => {
        notifier.succes(t('liste.elementsTraites'))
        setSelection([])
        void client.invalidateQueries({ queryKey: ['bijoux'] })
      },
      (erreur: unknown) => notifier.erreur(messageErreur(erreur)),
    )
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <FilAriane elements={[{ libelle: t('menu.bijoux') }]} />
          <TitrePage titre={t('menu.bijoux')}>{t('menu.bijoux')}</TitrePage>
        </div>
        <Link
          to="/bijoux/nouveau"
          className="inline-flex min-h-11 items-center gap-2 rounded-md bg-clay-600 px-4 text-button font-semibold text-cream-100 hover:bg-clay-700"
        >
          {t('bijou.nouveau')}
        </Link>
      </div>

      <div className="space-y-4 rounded-md border border-sand-200 bg-sand-100 p-4">
        <label className="block space-y-2">
          <span className="label-caps text-ink-700">{t('liste.rechercher')}</span>
          <input
            type="search"
            value={recherche}
            onChange={(evenement) => saisir(evenement.target.value)}
            placeholder={t('liste.rechercher')}
            className="min-h-11 w-full rounded-md border border-ink-500 bg-sand-50 px-3 text-body text-ink-900"
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Select
            libelle={t('liste.statut')}
            value={statut ?? ''}
            onChange={(evenement) => regler('statut', evenement.target.value || null)}
            options={[
              { valeur: '', libelle: t('liste.tous') },
              ...STATUTS.map((s) => ({ valeur: s, libelle: t(`statut.${s}` as never) })),
            ]}
          />
          <Select
            libelle={t('bijou.categorie')}
            value={categorie}
            onChange={(evenement) => regler('categorie', evenement.target.value || null)}
            options={[
              { valeur: '', libelle: t('liste.tous') },
              ...[...nomsCategories].map(([valeur, libelle]) => ({ valeur, libelle })),
            ]}
          />
          <Select
            libelle={t('bijou.prix')}
            value={prixConfirme}
            onChange={(evenement) => regler('prixConfirme', evenement.target.value || null)}
            options={[
              { valeur: '', libelle: t('liste.tous') },
              { valeur: 'true', libelle: t('bijou.prixConfirme') },
              { valeur: 'false', libelle: t('bijou.surDemande') },
            ]}
          />
          <Select
            libelle={t('bijou.visible')}
            value={visible}
            onChange={(evenement) => regler('visible', evenement.target.value || null)}
            options={[
              { valeur: '', libelle: t('liste.tous') },
              { valeur: 'true', libelle: 'Oui' },
              { valeur: 'false', libelle: 'Non' },
            ]}
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Select
            libelle={t('article.tri')}
            value={tri}
            onChange={(evenement) => regler('tri', evenement.target.value)}
            options={[
              { valeur: '-modifieLe', libelle: t('article.triRecent') },
              { valeur: 'modifieLe', libelle: t('article.triAncien') },
              { valeur: 'numero', libelle: t('bijou.numero') },
              { valeur: 'titre', libelle: t('article.triTitre') },
            ]}
          />
          {filtresActifs ? (
            <Bouton
              variante="secondaire"
              onClick={() => {
                setRecherche('')
                setAdresse(new URLSearchParams(), { replace: true })
                setSelection([])
              }}
            >
              {t('liste.effacerFiltres')}
            </Bouton>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-caption text-ink-700" aria-live="polite">
          <span className="tnum">
            {debut}–{fin} {t('tableau.sur')} {total}
          </span>
        </p>
        {selection.length > 0 && peutSupprimer ? (
          <Bouton variante="secondaire" onClick={supprimerSelection}>
            {t('liste.supprimer')} ({selection.length})
          </Bouton>
        ) : null}
      </div>

      {liste.isPending ? (
        <Squelette lignes={6} />
      ) : liste.isError ? (
        <EtatErreur erreur={liste.error} surReessai={() => void liste.refetch()} />
      ) : donnees.length === 0 ? (
        <EtatVide
          titre={filtresActifs ? t('article.aucunResultat') : t('liste.vide')}
          texte={filtresActifs ? t('liste.aucunResultatTexte') : undefined}
        />
      ) : (
        <ul
          aria-label={t('menu.bijoux')}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {donnees.map((bijou) => {
            const etat = bijou.statut ? etatAffiche(bijou.statut, bijou.publieLe) : null
            return (
              <li
                key={bijou.id}
                className="flex h-full flex-col overflow-hidden rounded-xl border border-sand-200 bg-sand-50"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-sand-100">
                  <Link
                    to={`/bijoux/${bijou.id}`}
                    aria-label={`${t('tableau.ouvrir')} ${bijou.titre || t('bijou.sansNom')}`}
                    className="block h-full w-full"
                  >
                    <MiniatureProduit
                      imageId={bijou.imageId ?? null}
                      alt={bijou.titre}
                      className="size-full rounded-none border-0"
                    />
                  </Link>
                  <span className="label-caps absolute left-2 top-2 rounded-full bg-night-900/85 px-3 py-1 text-cream-100">
                    {bijou.numero}
                  </span>
                  {peutSupprimer ? (
                    <input
                      type="checkbox"
                      aria-label={`${t('tableau.selectionner')} ${bijou.titre}`}
                      checked={selection.includes(bijou.id)}
                      onChange={() => basculer(bijou.id)}
                      className="absolute right-2 top-2 size-5 accent-clay-600"
                    />
                  ) : null}
                </div>
                <div className="flex flex-1 flex-col gap-3 p-4">
                  <div className="space-y-1">
                    <Link
                      to={`/bijoux/${bijou.id}`}
                      className="font-display uppercase text-heading-sm text-ink-900 hover:text-clay-700"
                    >
                      {bijou.titre || t('bijou.sansNom')}
                    </Link>
                    <p className="text-caption text-ink-700">
                      {nomsCategories.get(bijou.categorieId) ?? '—'}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {etat ? <PastilleStatut etat={etat} /> : null}
                    <IndicateurAFournir champs={bijou.champsAFournir} />
                  </div>
                  <p className="label-caps mt-auto flex items-center justify-between pt-2 text-ink-500">
                    <span>{bijou.prixConfirme ? t('bijou.prixConfirme') : t('bijou.surDemande')}</span>
                    <span className="tnum">
                      {bijou.nombreVariantes} {bijou.nombreVariantes > 1 ? t('livre.variantes').toLowerCase() : 'variante'}
                    </span>
                  </p>
                  <div className="flex items-center justify-between border-t border-sand-200 pt-3">
                    <Link
                      to={`/bijoux/${bijou.id}`}
                      className="inline-flex min-h-9 items-center text-caption font-semibold text-clay-700 underline underline-offset-4"
                    >
                      {t('tableau.ouvrir')}
                    </Link>
                    {peutSupprimer ? (
                      <button
                        type="button"
                        onClick={() => setSuppression(bijou)}
                        className="inline-flex min-h-9 items-center rounded-md px-2 text-caption font-semibold text-ink-500 hover:bg-sand-200"
                      >
                        {t('liste.supprimer')}
                      </button>
                    ) : null}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {total > 0 ? (
        <nav className="flex flex-wrap items-center justify-between gap-3" aria-label={t('tableau.pagination')}>
          <div className="flex items-center gap-2">
            <Bouton variante="secondaire" disabled={page <= 1} onClick={() => changerPage(page - 1)}>
              {t('tableau.precedente')}
            </Bouton>
            <div className="flex items-center gap-1">
              {pagesAAfficher().map((cible) => (
                <button
                  key={cible}
                  type="button"
                  aria-current={cible === page ? 'page' : undefined}
                  onClick={() => changerPage(cible)}
                  className={cn(
                    'size-11 rounded-md text-caption font-semibold',
                    cible === page ? 'bg-clay-600 text-cream-100' : 'text-ink-900 hover:bg-sand-200',
                  )}
                >
                  {cible}
                </button>
              ))}
            </div>
            <Bouton variante="secondaire" disabled={page >= pages} onClick={() => changerPage(page + 1)}>
              {t('tableau.suivante')}
            </Bouton>
          </div>
          <Select
            libelle={t('tableau.parPage')}
            value={String(pageSize)}
            onChange={(evenement) => regler('taille', evenement.target.value)}
            options={TAILLES.map((taille) => ({ valeur: String(taille), libelle: String(taille) }))}
          />
        </nav>
      ) : null}

      {suppression ? (
        <Confirmation
          ouverte
          titre={t('liste.supprimerTitre')}
          objet={suppression.titre || t('bijou.sansNom')}
          consequence={t('liste.supprimerTexte')}
          libelleConfirmer={t('liste.supprimer')}
          danger
          enCours={false}
          surConfirmer={supprimer}
          surAnnuler={() => setSuppression(null)}
        />
      ) : null}
    </section>
  )
}
