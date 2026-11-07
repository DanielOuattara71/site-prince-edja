import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Download, Plus, SlidersHorizontal, X } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router'
import { cles } from '@/api/cles'
import { tags as apiTags } from '@/api/endpoints/contenus'
import type { Langue, Page, ParametresListe, StatutContenu } from '@/api/schemas/communs'
import { STATUTS_CONTENU } from '@/api/schemas/communs'
import { useSession } from '@/auth/contexte-session'
import type { CompteDroits } from '@/auth/permissions'
import { FilAriane, type ElementFilAriane } from '@/components/layout/FilAriane'
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
import { numeroPage, TAILLES_PAGE, taillePage } from '@/lib/pagination'

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

/** Pause de saisie avant que la recherche parte (U4). */
const DELAI_RECHERCHE = 300

export function ListePage<T extends { id: string; version?: number; titre?: string }>({
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
  statuts,
  exporter,
  triParDefaut,
  filAriane = [],
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
  /** Filtre de statut propres à la ressource (`messages`, `abonnes`…) ; par défaut les contenus. */
  statuts?: readonly string[]
  /** Filtre par créateur (section 10), masqué tant que `multiVendeurs` est faux. */
  filtreCreateur?: boolean
  avecTags?: boolean
  /** Bloc propre à la famille, sous le titre (ordre d'affichage, par exemple). */
  complement?: ReactNode
  /** Export du filtre courant (par exemple le CSV des abonnés). */
  exporter?: (parametres: ParametresListe) => Promise<string>
  /** Tri par défaut d'une liste sans tri choisi (`-creeLe`, par exemple). */
  triParDefaut?: string
  /** Écrans parents dans le fil d'Ariane (le hub Projets pour ses listes). */
  filAriane?: ElementFilAriane[]
}) {
  const { moi } = useSession()
  const client = useQueryClient()
  const notifier = useNotifications()
  const [adresse, setAdresse] = useSearchParams()
  const [recherche, setRecherche] = useState(adresse.get('q') ?? '')
  const [selection, setSelection] = useState<string[]>([])
  const [actionDemandee, setActionDemandee] = useState<ActionGroupee<T> | null>(null)
  const [enCours, setEnCours] = useState(false)

  // Retour arrière ou lien partagé : le champ suit l'adresse (ajustement pendant le rendu).
  const qAdresse = adresse.get('q') ?? ''
  const [qVu, setQVu] = useState(qAdresse)
  if (qVu !== qAdresse) {
    setQVu(qAdresse)
    setRecherche(qAdresse)
  }
  const minuterie = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(minuterie.current), [])

  const statut = adresse.get('statut')
  const traduction = adresse.get('traduction')
  const taille = taillePage(adresse.get('taille'))
  const parametres: ParametresListe = {
    page: numeroPage(adresse.get('page')),
    pageSize: taille,
    ...(adresse.get('tri') ? { tri: adresse.get('tri') ?? '' } : {}),
    ...(adresse.get('q') ? { q: adresse.get('q') ?? '' } : {}),
    ...(statut && (STATUTS_CONTENU as readonly string[]).includes(statut)
      ? { statut: statut as StatutContenu }
      : {}),
    ...(traduction?.startsWith('sans-') ? { sansLangue: traduction.slice(5) as Langue } : {}),
    ...(traduction?.startsWith('avec-') ? { langue: traduction.slice(5) as Langue } : {}),
    ...(adresse.get('tag') ? { tag: [adresse.get('tag') ?? ''] } : {}),
    ...(adresse.get('aFournir') === 'true' ? { aFournir: true } : {}),
    ...(statut && (statuts ?? STATUTS_CONTENU).includes(statut)
      ? { statut: statut as StatutContenu }
      : {}),
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

  /**
   * Change un paramètre de l'adresse ; tout changement de filtre, de tri ou de taille ramène à
   * la première page. La page 1 n'est jamais écrite dans l'adresse.
   */
  const regler = (cle: string, valeur: string | null) => {
    setAdresse(
      (actuelle) => {
        const suivante = new URLSearchParams(actuelle)
        if (valeur && !(cle === 'page' && valeur === '1')) suivante.set(cle, valeur)
        else suivante.delete(cle)
        if (cle !== 'page') suivante.delete('page')
        return suivante
      },
      { replace: true },
    )
    setSelection([])
  }

  /** Recherche instantanée (U4) : l'adresse suit la saisie après 300 ms de pause. */
  const saisir = (valeur: string) => {
    setRecherche(valeur)
    window.clearTimeout(minuterie.current)
    minuterie.current = window.setTimeout(() => regler('q', valeur.trim() || null), DELAI_RECHERCHE)
  }

  const chercher = (evenement: FormEvent) => {
    evenement.preventDefault()
    window.clearTimeout(minuterie.current)
    regler('q', recherche.trim() || null)
  }

  const effacerFiltres = () => {
    window.clearTimeout(minuterie.current)
    setRecherche('')
    setAdresse(
      (actuelle) => {
        const suivante = new URLSearchParams()
        for (const cle of ['tri', 'taille']) {
          const valeur = actuelle.get(cle)
          if (valeur) suivante.set(cle, valeur)
        }
        return suivante
      },
      { replace: true },
    )
    setSelection([])
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
  // Trois filtres au plus en vue (U4) : statut, catégorie ou type, langue. Le reste est replié.
  const [filtrePrincipal, ...autresFiltres] = filtres
  const clesRepliees = [
    'tag',
    'aFournir',
    ...autresFiltres.map((f) => f.cle),
    ...(filtreCreateur ? ['createur'] : []),
  ]
  const nombreReplies = clesRepliees.filter((cle) => adresse.has(cle)).length
  const selectFiltre = (filtre: FiltreListe) => (
    <Select
      key={filtre.cle}
      libelle={filtre.libelle}
      value={adresse.get(filtre.cle) ?? ''}
      onChange={(evenement) => regler(filtre.cle, evenement.target.value || null)}
      options={[{ valeur: '', libelle: t('liste.tous') }, ...filtre.options]}
    />
  )
  const triTrie = adresse.get('tri') ?? triParDefaut ?? '-modifieLe'

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <FilAriane elements={[...filAriane, { libelle: titre }]} />
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
        {exporter ? (
          <Bouton
            variante="secondaire"
            onClick={() => void exporter(parametres)}
            className="inline-flex min-h-11 items-center gap-2 rounded-md border border-sand-200 px-4 text-button font-semibold text-ink-900 hover:bg-sand-100"
          >
            <Download aria-hidden className="size-4" />
            {t('liste.exporter')}
          </Bouton>
        ) : null}
      </div>

      {complement}

      <div className="flex flex-wrap items-end gap-3 rounded-md border border-sand-200 bg-sand-100 p-4">
        <search className="flex min-w-0 flex-1 basis-64 items-end gap-2">
          <form onSubmit={chercher} className="flex flex-1 items-end gap-2">
            <Champ
              type="search"
              libelle={t('liste.rechercher')}
              aide={t('liste.rechercheInstantanee')}
              value={recherche}
              onChange={(evenement) => saisir(evenement.target.value)}
              className="flex-1"
            />
          </form>
        </search>
        <Select
          libelle={t('liste.statut')}
          value={statut ?? ''}
          onChange={(evenement) => regler('statut', evenement.target.value || null)}
          options={[
            { valeur: '', libelle: t('liste.tous') },
            ...(statuts ?? STATUTS_CONTENU).map((s) => ({
              valeur: s,
              libelle: t(`statut.${s}` as CleTraduction),
            })),
          ]}
        />
        {filtrePrincipal ? selectFiltre(filtrePrincipal) : null}
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
        <details className="w-full" open={nombreReplies > 0 || undefined}>
          <summary className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-md px-2 text-button font-semibold text-ink-900 hover:bg-sand-200">
            <SlidersHorizontal aria-hidden className="size-4" />
            {t('liste.plusDeFiltres')}
            {nombreReplies > 0 ? ` (${nombreReplies})` : ''}
          </summary>
          <div className="mt-3 flex flex-wrap items-end gap-3">
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
            {autresFiltres.map(selectFiltre)}
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
        </details>
        {filtresActifs ? (
          <Bouton variante="secondaire" onClick={effacerFiltres}>
            <X aria-hidden className="size-4" />
            {t('liste.effacerFiltres')}
          </Bouton>
        ) : null}
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
        libelleLigne={(ligne) => ligne.titre ?? ''}
        etat={requete.isPending ? 'chargement' : requete.isError ? 'erreur' : 'pret'}
        erreur={requete.error}
        surReessai={() => void requete.refetch()}
        total={requete.data?.total ?? 0}
        page={parametres.page ?? 1}
        pageSize={taille}
        surPage={(page) => regler('page', String(page))}
        surTaille={(n) => regler('taille', n === TAILLES_PAGE[0] ? null : String(n))}
        tri={triTrie}
        surTri={(tri) => regler('tri', tri)}
        preferences={ressource}
        {...(visibles.length > 0 ? { selection, surSelection: setSelection } : {})}
        vide={
          <EtatVide
            titre={filtresActifs ? t('liste.aucunResultat') : t('liste.vide')}
            texte={filtresActifs ? t('liste.aucunResultatTexte') : undefined}
            action={
              filtresActifs ? (
                <Bouton variante="secondaire" onClick={effacerFiltres}>
                  {t('liste.effacerFiltres')}
                </Bouton>
              ) : creer ? (
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
