import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Search } from 'lucide-react'
import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router'
import { cles } from '@/api/cles'
import { tags as apiTags } from '@/api/endpoints/contenus'
import type { Langue, Page, ParametresListe, StatutContenu } from '@/api/schemas/communs'
import { STATUTS_CONTENU } from '@/api/schemas/communs'
import { useSession } from '@/auth/contexte-session'
import type { CompteDroits } from '@/auth/permissions'
import { FilAriane } from '@/components/layout/FilAriane'
import { TitrePage } from '@/components/layout/TitrePage'
import { TableauDonnees, type Colonne } from '@/components/listes/TableauDonnees'
import { useNotifications } from '@/components/retours/contexte-notifications'
import { Bouton } from '@/components/ui/Bouton'
import { Case } from '@/components/ui/Case'
import { Champ } from '@/components/ui/Champ'
import { Confirmation } from '@/components/ui/Confirmation'
import { EtatVide } from '@/components/ui/Etats'
import { FiltreCreateur } from '@/components/createurs/SelecteurCreateur'
import { Select, type OptionSelect } from '@/components/ui/Select'
import { t, type CleTraduction } from '@/i18n/fr'
import { messageErreur } from '@/lib/message-erreur'

/**
 * Gabarit de liste (section 9) : recherche, filtres (statut, traduction, tag, « à fournir »),
 * tri et pagination **serveur**, sélection multiple et actions groupées filtrées par rôle.
 * L'état vit dans l'adresse : une liste filtrée se partage par un lien et survit au retour.
 *
 * @example
 * <ListePage titre="Articles" ressource="articles" colonnes={COLONNES} charger={articles.lister}
 *   creer={{ chemin: '/articles/nouveau', libelle: 'Nouvel article' }} />
 */
export interface ActionGroupee<T> {
  id: string
  libelle: string
  danger?: boolean
  /** Visible seulement si le rôle peut l'exécuter (section 8). */
  autorisee: (compte: CompteDroits | undefined) => boolean
  executer: (ligne: T) => Promise<unknown>
  confirmation: { titre: string; consequence: string }
}

/** Filtre propre à une ressource (`categorie`, `actif`…), gardé dans l'adresse. */
export interface FiltreListe {
  cle: string
  libelle: string
  options: OptionSelect[]
}

const PAGE = 20

export function ListePage<T extends { id: string; titre: string; version: number }>({
  titre,
  ressource,
  colonnes,
  charger,
  creer,
  actionsGroupees = [],
  filtres = [],
  filtreCreateur = false,
  avecTags = true,
  complement,
}: {
  titre: string
  ressource: string
  colonnes: Colonne<T>[]
  /** Reçoit aussi les valeurs des filtres propres (`filtres`, `createur`). */
  charger: (
    parametres: ParametresListe,
    propres: Record<string, string | undefined>,
  ) => Promise<Page<T>>
  creer?: { chemin: string; libelle: string } | undefined
  actionsGroupees?: ActionGroupee<T>[]
  filtres?: FiltreListe[]
  /** Filtre par créateur (section 10), masqué tant que `multiVendeurs` est faux. */
  filtreCreateur?: boolean
  avecTags?: boolean
  /** Bloc propre à la famille, sous le titre (ordre d'affichage, par exemple). */
  complement?: ReactNode
}) {
  const { moi } = useSession()
  const client = useQueryClient()
  const notifier = useNotifications()
  const [adresse, setAdresse] = useSearchParams()
  const [recherche, setRecherche] = useState(adresse.get('q') ?? '')
  const [selection, setSelection] = useState<string[]>([])
  const [actionDemandee, setActionDemandee] = useState<ActionGroupee<T> | null>(null)
  const [enCours, setEnCours] = useState(false)

  const statut = adresse.get('statut')
  const traduction = adresse.get('traduction')
  const parametres: ParametresListe = {
    page: Number(adresse.get('page') ?? '1') || 1,
    pageSize: PAGE,
    tri: adresse.get('tri') ?? '-modifieLe',
    ...(adresse.get('q') ? { q: adresse.get('q') ?? '' } : {}),
    ...(statut && (STATUTS_CONTENU as readonly string[]).includes(statut)
      ? { statut: statut as StatutContenu }
      : {}),
    ...(traduction?.startsWith('sans-') ? { sansLangue: traduction.slice(5) as Langue } : {}),
    ...(traduction?.startsWith('avec-') ? { langue: traduction.slice(5) as Langue } : {}),
    ...(adresse.get('tag') ? { tag: [adresse.get('tag') ?? ''] } : {}),
    ...(adresse.get('aFournir') === 'true' ? { aFournir: true } : {}),
  }
  const clesPropres = [...filtres.map((f) => f.cle), ...(filtreCreateur ? ['createur'] : [])]
  const propres = Object.fromEntries(
    clesPropres.flatMap((cle) => (adresse.get(cle) ? [[cle, adresse.get(cle) ?? '']] : [])),
  ) as Record<string, string>
  const requete = useQuery({
    queryKey: [ressource, 'liste', parametres, propres],
    queryFn: () => charger(parametres, propres),
    placeholderData: (precedent) => precedent,
  })
  const listeTags = useQuery({
    queryKey: cles.tousLesTags(),
    queryFn: () => apiTags.lister({ pageSize: 100 }),
    staleTime: 60_000,
    enabled: avecTags,
  })

  /** Change un paramètre de l'adresse ; un nouveau filtre ramène à la première page. */
  const regler = (cle: string, valeur: string | null) => {
    const suivante = new URLSearchParams(adresse)
    if (valeur) suivante.set(cle, valeur)
    else suivante.delete(cle)
    if (cle !== 'page') suivante.delete('page')
    setAdresse(suivante, { replace: true })
    setSelection([])
  }

  const chercher = (evenement: FormEvent) => {
    evenement.preventDefault()
    regler('q', recherche.trim() || null)
  }

  const visibles = actionsGroupees.filter((action) => action.autorisee(moi?.compte))
  const lignesChoisies = (requete.data?.items ?? []).filter((ligne) => selection.includes(ligne.id))

  const executer = async (action: ActionGroupee<T>) => {
    setEnCours(true)
    let reussies = 0
    const refus: string[] = []
    // Une à une : chaque objet garde sa version et son refus éventuel (RG-08…).
    for (const ligne of lignesChoisies) {
      try {
        await action.executer(ligne)
        reussies += 1
      } catch (erreur) {
        refus.push(`« ${ligne.titre} » : ${messageErreur(erreur)}`)
      }
    }
    setEnCours(false)
    setActionDemandee(null)
    setSelection([])
    await client.invalidateQueries({ queryKey: [ressource] })
    if (reussies > 0)
      notifier.succes(`${action.libelle} : ${reussies} ${t('liste.elementsTraites')}`)
    for (const message of refus) notifier.erreur(message)
  }

  const filtresActifs = ['q', 'statut', 'traduction', 'tag', 'aFournir', ...clesPropres].some(
    (cle) => adresse.has(cle),
  )

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <FilAriane elements={[{ libelle: titre }]} />
          <TitrePage titre={titre}>{titre}</TitrePage>
        </div>
        {creer ? (
          <Link
            to={creer.chemin}
            className="inline-flex min-h-11 items-center gap-2 rounded-md bg-clay-600 px-4 text-button font-semibold text-cream-100 hover:bg-clay-700"
          >
            <Plus aria-hidden className="size-4" />
            {creer.libelle}
          </Link>
        ) : null}
      </div>

      {complement}

      <div className="flex flex-wrap items-end gap-3 rounded-md border border-sand-200 bg-sand-100 p-4">
        <search className="flex min-w-64 flex-1 items-end gap-2">
          <form onSubmit={chercher} className="flex flex-1 items-end gap-2">
            <Champ
              type="search"
              libelle={t('liste.rechercher')}
              value={recherche}
              onChange={(evenement) => setRecherche(evenement.target.value)}
              className="flex-1"
            />
            <Bouton type="submit" variante="secondaire">
              <Search aria-hidden className="size-4" />
              <span className="sr-only sm:not-sr-only">{t('liste.chercher')}</span>
            </Bouton>
          </form>
        </search>
        <Select
          libelle={t('liste.statut')}
          value={statut ?? ''}
          onChange={(evenement) => regler('statut', evenement.target.value || null)}
          options={[
            { valeur: '', libelle: t('liste.tous') },
            ...STATUTS_CONTENU.map((s) => ({
              valeur: s,
              libelle: t(`statut.${s}` as CleTraduction),
            })),
          ]}
        />
        <Select
          libelle={t('liste.traduction')}
          value={traduction ?? ''}
          onChange={(evenement) => regler('traduction', evenement.target.value || null)}
          options={[
            { valeur: '', libelle: t('liste.toutes') },
            { valeur: 'sans-en', libelle: t('liste.sansEn') },
            { valeur: 'avec-en', libelle: t('liste.avecEn') },
            { valeur: 'sans-fr', libelle: t('liste.sansFr') },
          ]}
        />
        {avecTags ? (
          <Select
            libelle={t('liste.tag')}
            value={adresse.get('tag') ?? ''}
            onChange={(evenement) => regler('tag', evenement.target.value || null)}
            disabled={!listeTags.isSuccess}
            options={[
              { valeur: '', libelle: t('liste.tous') },
              ...(listeTags.data?.items ?? []).map((tag) => ({
                valeur: tag.id,
                libelle: tag.traductions.fr?.libelle ?? tag.code,
              })),
            ]}
          />
        ) : null}
        {filtres.map((filtre) => (
          <Select
            key={filtre.cle}
            libelle={filtre.libelle}
            value={adresse.get(filtre.cle) ?? ''}
            onChange={(evenement) => regler(filtre.cle, evenement.target.value || null)}
            options={[{ valeur: '', libelle: t('liste.tous') }, ...filtre.options]}
          />
        ))}
        {filtreCreateur ? (
          <FiltreCreateur
            valeur={adresse.get('createur') ?? undefined}
            surChange={(id) => regler('createur', id ?? null)}
          />
        ) : null}
        <Case
          libelle={t('liste.aFournirSeulement')}
          checked={adresse.get('aFournir') === 'true'}
          onChange={(evenement) => regler('aFournir', evenement.target.checked ? 'true' : null)}
        />
      </div>

      {visibles.length > 0 && selection.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2" aria-live="polite">
          <span className="text-caption text-ink-700">
            {selection.length} {t('tableau.selectionnes')}
          </span>
          {visibles.map((action) => (
            <Bouton
              key={action.id}
              variante={action.danger ? 'danger' : 'secondaire'}
              onClick={() => setActionDemandee(action)}
            >
              {action.libelle}
            </Bouton>
          ))}
        </div>
      ) : null}

      <TableauDonnees
        libelle={titre}
        colonnes={colonnes}
        lignes={requete.data?.items}
        cle={(ligne) => ligne.id}
        libelleLigne={(ligne) => ligne.titre}
        etat={requete.isPending ? 'chargement' : requete.isError ? 'erreur' : 'pret'}
        erreur={requete.error}
        surReessai={() => void requete.refetch()}
        total={requete.data?.total ?? 0}
        page={parametres.page ?? 1}
        pageSize={PAGE}
        surPage={(page) => regler('page', String(page))}
        tri={parametres.tri ?? '-modifieLe'}
        surTri={(tri) => regler('tri', tri)}
        preferences={ressource}
        {...(visibles.length > 0 ? { selection, surSelection: setSelection } : {})}
        vide={
          <EtatVide
            titre={filtresActifs ? t('liste.aucunResultat') : t('liste.vide')}
            texte={filtresActifs ? t('liste.aucunResultatTexte') : undefined}
            action={
              creer && !filtresActifs ? (
                <Link
                  to={creer.chemin}
                  className="font-semibold text-clay-700 underline underline-offset-4"
                >
                  {creer.libelle}
                </Link>
              ) : undefined
            }
          />
        }
      />

      {actionDemandee ? (
        <Confirmation
          ouverte
          titre={actionDemandee.confirmation.titre}
          nombre={lignesChoisies.length}
          consequence={actionDemandee.confirmation.consequence}
          libelleConfirmer={actionDemandee.libelle}
          danger={actionDemandee.danger ?? false}
          enCours={enCours}
          surConfirmer={() => void executer(actionDemandee)}
          surAnnuler={() => setActionDemandee(null)}
        />
      ) : null}
    </section>
  )
}
