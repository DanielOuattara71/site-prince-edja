import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowUpDown, CircleAlert, ImageOff, Tags } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { medias } from '@/api/endpoints/contenus'
import { nombreEpisodesDeProjet } from '@/api/erreurs'
import { cles } from '@/api/cles'
import { projets } from '@/api/endpoints/editorial'
import type { ResumeContenu } from '@/api/schemas/communs'
import { useSession } from '@/auth/contexte-session'
import { peut } from '@/auth/permissions'
import { Bouton } from '@/components/ui/Bouton'
import { Confirmation } from '@/components/ui/Confirmation'
import { EtatErreur, EtatVide } from '@/components/ui/Etats'
import { FilAriane } from '@/components/layout/FilAriane'
import { TitrePage } from '@/components/layout/TitrePage'
import { ListeOrdonnable } from '@/components/listes/ListeOrdonnable'
import { Select } from '@/components/ui/Select'
import { PastilleStatut } from '@/components/ui/PastilleStatut'
import { Squelette } from '@/components/ui/Squelette'
import { useNotifications } from '@/components/retours/contexte-notifications'
import { CLASSES_LIEN } from '@/components/ui/classes'
import { t } from '@/i18n/fr'
import { formaterDate } from '@/lib/dates'
import { messageErreur } from '@/lib/message-erreur'
import { etatAffiche } from '@/lib/statuts'
import { TEMPLATES, type TemplateProjet } from '@/lib/templates'
import { useCategories, nomCategorie } from '@/features/categories/useCategories'
import CartesCreationProjets from '@/features/projets/CartesCreationProjets'
import { cn } from '@/lib/cn'

/** Projets — grille de cartes avec photo d'affiche (contrat 1.8.0) : photo, titre, résumé, catégorie,
 * template et statut, recherche + filtres, pagination serveur (8/12/16/24). */
const TAILLES = [8, 12, 16, 24] as const
const TAILLE_DEFAUT = 12

type Ligne = ResumeContenu & {
  categorie?: string | null
  avancement?: string | null
  format?: string | null
  template?: string | null
  nombreEpisodes?: number
  accroche?: string | null
  creeLe?: string
}

type StatutsProjet = 'brouillon' | 'en_relecture' | 'publie' | 'archive'

export default function ListeProjets() {
  const { moi } = useSession()
  const client = useQueryClient()
  const notifier = useNotifications()
  const [adresse, setAdresse] = useSearchParams()
  const [recherche, setRecherche] = useState(adresse.get('q') ?? '')
  const [suppression, setSuppression] = useState<Ligne | null>(null)
  /** RG-32 reçu après une tentative de suppression : le projet garde ses épisodes. */
  const [rg32, setRg32] = useState<{ nombre: number; id: string; titre: string } | null>(null)
  const [ordreOuvert, setOrdreOuvert] = useState(false)

  const page = Math.max(1, Number(adresse.get('page') ?? '1') || 1)
  const tailleCandidate = Number(adresse.get('taille'))
  const pageSize =
    TAILLES.includes(tailleCandidate as (typeof TAILLES)[number]) ? tailleCandidate : TAILLE_DEFAUT
  const statut = (adresse.get('statut') as StatutsProjet | null) ?? null
  const categorie = adresse.get('categorie') ?? ''
  const avancement = adresse.get('avancement') ?? ''
  const template = (adresse.get('template') ?? '') as TemplateProjet | ''
  const tri = adresse.get('tri') ?? '-modifieLe'

  const liste = useQuery({
    queryKey: ['projets', 'liste', { page, pageSize, q: adresse.get('q'), statut, categorie, avancement, template, tri }],
    queryFn: () =>
      projets.lister({
        page,
        pageSize,
        tri,
        ...(adresse.get('q') ? { q: adresse.get('q') ?? '' } : {}),
        ...(statut ? { statut } : {}),
        ...(categorie ? { categorie } : {}),
        ...(avancement ? { avancement: avancement as never } : {}),
        ...(template ? { template: template as never } : {}),
        ...(adresse.get('format') ? { format: adresse.get('format') ?? '' } : {}),
      }),
    placeholderData: (precedent) => precedent,
  })

  const donnees = (liste.data?.items ?? []) as unknown as Ligne[]
  const total = liste.data?.total ?? 0
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const debutRange = total === 0 ? 0 : Math.min(total, (page - 1) * pageSize + 1)
  const finRange = Math.min(total, page * pageSize)

  // Résolution des affiches depuis la médiathèque (une requête par image, cachées).
  const images = useQueries({
    queries: donnees.map((Projet) => ({
      queryKey: cles.media(Projet.imageId ?? ''),
      queryFn: () => medias.lire(Projet.imageId ?? ''),
      enabled: Boolean(Projet.imageId),
      staleTime: 60_000,
    })),
  })
  const indexImages = new Map(donnees.map((p, i) => [p.id, images[i]?.data]))

  const minuterie = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(minuterie.current), [])

  const regler = (cle: string, valeur: string | null) => {
    const suivante = new URLSearchParams(adresse)
    if (valeur) suivante.set(cle, valeur)
    else suivante.delete(cle)
    if (cle !== 'page') suivante.delete('page')
    setAdresse(suivante, { replace: true })
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
  }
  const pagesAAfficher = (): number[] => {
    const debut = Math.max(1, Math.min(page - 2, pages - 4))
    const fin = Math.min(pages, debut + 4)
    return Array.from({ length: fin - debut + 1 }, (_, i) => debut + i)
  }

  // Ordre d'affichage sur le site (Section 9) : panneau repliable avec alternative clavier.
  const ordre = useQuery({
    queryKey: ['projets', 'liste', 'ordre'],
    queryFn: () => projets.lister({ pageSize: 100, tri: 'ordre' }),
    enabled: ordreOuvert,
  })
  const ordonner = useMutation({
    mutationFn: (ids: string[]) => projets.ordonner(ids),
    onSuccess: () => notifier.succes(t('ordre.enregistre')),
    onError: (erreur) => notifier.erreur(messageErreur(erreur)),
    onSettled: () => client.invalidateQueries({ queryKey: ['projets'] }),
  })

  const supprimer = () => {
    if (!suppression) return
    projets.supprimer(suppression.id, suppression.version).then(
      () => {
        setSuppression(null)
        notifier.succes(t('projet.supprime'))
        void client.invalidateQueries({ queryKey: ['projets'] })
      },
      (erreur: unknown) => {
        const target = suppression
        setSuppression(null)
        const nombre = nombreEpisodesDeProjet(erreur)
        if (nombre !== null) {
          setRg32({
            nombre,
            id: target.id,
            titre: target.titre || t('declaratif.sansTitre'),
          })
          return
        }
        notifier.erreur(messageErreur(erreur))
      },
    )
  }

  const peutSupprimer = peut(moi?.compte, 'supprimer', 'projets')
  const creerVisible = peut(moi?.compte, 'creer', 'projets')
  const categoriesProjet = useCategories('projet')
  const filtresActifs =
    ['q', 'statut', 'categorie', 'avancement', 'format', 'template', 'tri'].some((cle) =>
      adresse.has(cle),
    )

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <FilAriane elements={[{ libelle: t('projet.liste') }]} />
          <TitrePage titre={t('projet.liste')}>{t('projet.liste')}</TitrePage>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {peut(moi?.compte, 'modifier', 'categories') ? (
            <Link
              to="/projets/categories"
              className="inline-flex min-h-11 items-center gap-2 rounded-md border border-sand-300 px-3 text-button font-semibold text-ink-900 hover:bg-sand-200"
            >
              <Tags aria-hidden className="size-4" />
              {t('projet.gererCategories')}
            </Link>
          ) : null}
          {peut(moi?.compte, 'ordonner', 'projets') ? (
            <Bouton variante="secondaire" aria-expanded={ordreOuvert} onClick={() => setOrdreOuvert((v) => !v)}>
              <ArrowUpDown aria-hidden className="size-4" />
              {ordreOuvert ? t('ordre.fermer') : t('ordre.ouvrir')}
            </Bouton>
          ) : null}
          {creerVisible ? (
            <Link
              to={template ? `/projets/nouveau?template=${encodeURIComponent(template)}` : '/projets/nouveau'}
              className="inline-flex min-h-11 items-center gap-2 rounded-md bg-clay-600 px-4 text-button font-semibold text-cream-100 hover:bg-clay-700"
            >
              {t('projet.nouveau')}
            </Link>
          ) : null}
        </div>
      </div>

      <CartesCreationProjets />

      {ordreOuvert && ordre.data ? (
        <div className="space-y-2 rounded-md border border-sand-200 bg-sand-50 p-4">
          <p className="label-caps text-ink-700">{t('ordre.titre')}</p>
          <ListeOrdonnable
            libelle={t('ordre.titre')}
            elements={ordre.data.items}
            cle={(o) => o.id}
            nom={(o) => o.titre || t('declaratif.sansTitre')}
            desactivee={ordonner.isPending}
            surOrdre={(nouveaux) => ordonner.mutate(nouveaux.map((p) => p.id))}
          />
        </div>
      ) : ordreOuvert && ordre.isPending ? (
        <Squelette lignes={3} />
      ) : null}

      {rg32 ? (
        <div
          role="alert"
          aria-label={t('projet.rg32Titre')}
          className="space-y-2 rounded-md border border-clay-700 bg-sand-100 px-5 py-4"
        >
          <p className="flex items-center gap-2 text-body font-semibold text-clay-700">
            <CircleAlert aria-hidden className="size-5 shrink-0" />
            {t('projet.rg32Titre')}
          </p>
          <p className="text-body text-ink-900">
            {t('projet.rg32Corps')
              .replace('{objet}', rg32.titre)
              .replace('{nombre}', String(rg32.nombre))
              .replace(
                '{episodes}',
                rg32.nombre > 1 ? t('projet.episodesCourtsP') : t('projet.episodesCourts'),
              )}
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link to={`/episodes?projetId=${encodeURIComponent(rg32.id)}`} className={CLASSES_LIEN}>
              {t('projet.rg32VoirEpisodes')}
            </Link>
            <Bouton variante="secondaire" onClick={() => setRg32(null)}>
              {t('projet.rg32Fermer')}
            </Bouton>
          </div>
        </div>
      ) : null}

      {/* Recherche et filtres */}
      <div className="flex flex-wrap items-end gap-3 rounded-md border border-sand-200 bg-sand-100 p-4">
        <div className="flex min-w-64 flex-1 items-end gap-2">
          <label className="min-w-0 flex-1">
            <span className="sr-only">{t('liste.rechercher')}</span>
            <input
              type="search"
              name="q"
              value={recherche}
              onChange={(evenement) => saisir(evenement.target.value)}
              placeholder={t('liste.rechercher')}
              className="min-h-11 w-full rounded-md border border-ink-500 bg-sand-50 px-3 text-body text-ink-900"
            />
          </label>
        </div>
        <Select
          libelle={t('projet.categorie')}
          value={categorie}
          onChange={(evenement) => regler('categorie', evenement.target.value || null)}
          options={[
            { valeur: '', libelle: t('liste.tous') },
            ...(categoriesProjet.data?.items ?? []).map((c) => ({
              valeur: c.id,
              libelle: nomCategorie(c),
            })),
          ]}
        />
        <Select
          libelle={t('projet.avancement')}
          value={avancement}
          onChange={(evenement) => regler('avancement', evenement.target.value || null)}
          options={[
            { valeur: '', libelle: t('liste.tous') },
            { valeur: 'en_preparation', libelle: t('projet.en_preparation') },
            { valeur: 'en_production', libelle: t('projet.en_production') },
            { valeur: 'disponible', libelle: t('projet.disponible') },
          ]}
        />
        <Select
          libelle={t('projet.format')}
          value={(adresse.get('format') ?? '') as string}
          onChange={(evenement) => regler('format', evenement.target.value || null)}
          options={[
            { valeur: '', libelle: t('liste.tous') },
            { valeur: 'Documentaire', libelle: 'Documentaire' },
            { valeur: 'Série', libelle: 'Série' },
            { valeur: 'Émission', libelle: 'Émission' },
            { valeur: 'Archive', libelle: 'Archive' },
          ]}
        />
        <Select
          libelle={t('projet.template')}
          value={template}
          onChange={(evenement) => regler('template', evenement.target.value || null)}
          options={[
            { valeur: '', libelle: t('liste.tous') },
            { valeur: 'film', libelle: TEMPLATES.film.titre },
            { valeur: 'programme', libelle: TEMPLATES.programme.titre },
            { valeur: 'bibliotheque', libelle: TEMPLATES.bibliotheque.titre },
          ]}
        />
        <Select
          libelle={t('liste.statut')}
          value={statut ?? ''}
          onChange={(evenement) => regler('statut', evenement.target.value || null)}
          options={[
            { valeur: '', libelle: t('liste.tous') },
            { valeur: 'brouillon', libelle: t('statut.brouillon') },
            { valeur: 'en_relecture', libelle: t('statut.en_relecture') },
            { valeur: 'publie', libelle: t('statut.publie') },
            { valeur: 'archive', libelle: t('statut.archive') },
          ]}
        />
        <Select
          libelle={t('article.tri')}
          value={tri}
          onChange={(evenement) => regler('tri', evenement.target.value)}
          options={[
            { valeur: '-modifieLe', libelle: t('article.triRecent') },
            { valeur: 'modifieLe', libelle: t('article.triAncien') },
            { valeur: '-publieLe', libelle: t('article.triRecent') },
            { valeur: 'publieLe', libelle: t('article.triAncien') },
            { valeur: 'ordre', libelle: t('ordre.titre') },
            { valeur: 'titre', libelle: t('article.triTitre') },
          ]}
        />
        {filtresActifs ? (
          <Bouton
            variante="secondaire"
            onClick={() => {
              const suivante = new URLSearchParams()
              const tpl = adresse.get('template')
              if (tpl) suivante.set('template', tpl)
              setRecherche('')
              setAdresse(suivante, { replace: true })
            }}
          >
            {t('liste.effacerFiltres')}
          </Bouton>
        ) : null}
      </div>

      {liste.isPending ? (
        <Squelette lignes={6} />
      ) : liste.isError ? (
        <EtatErreur erreur={liste.error} surReessai={() => void liste.refetch()} />
      ) : total === 0 ? (
        <EtatVide
          titre={filtresActifs ? t('article.aucunResultat') : t('projet.premier')}
          texte={filtresActifs ? t('liste.aucunResultatTexte') : t('projet.premierIntro')}
          action={
            !filtresActifs && creerVisible ? (
              <Link
                to={template ? `/projets/nouveau?template=${encodeURIComponent(template)}` : '/projets/nouveau'}
                className="inline-flex min-h-11 items-center gap-2 rounded-md bg-clay-600 px-4 text-button font-semibold text-cream-100 hover:bg-clay-700"
              >
                {t('projet.nouveau')}
              </Link>
            ) : undefined
          }
        />
      ) : (
        <>
          <ul className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {donnees.map((projet) => {
              const media = indexImages.get(projet.id)
              const imageUrl = media?.declinaisons[0]?.url ?? media?.url ?? null
              const etat = projet.statut ? etatAffiche(projet.statut, projet.publieLe) : null
              return (
                <li
                  key={projet.id}
                  className="flex flex-col gap-2 rounded-xl border border-sand-200 bg-sand-50 p-2"
                >
                  <Link to={`/projets/${projet.id}`} className="group flex flex-1 flex-col gap-2">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={media?.traductions.fr?.texteAlt ?? ''}
                        loading="lazy"
                        decoding="async"
                        className="aspect-[4/3] w-full rounded-xl bg-sand-200 object-cover transition-transform duration-(--d-fast) group-hover:scale-[1.02] group-focus-visible:scale-[1.02]"
                      />
                    ) : (
                      <span className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-sand-300 bg-sand-100 p-4 text-center">
                        <ImageOff aria-hidden className="size-10 text-ink-500" />
                        <span className="text-caption font-semibold text-ink-700">
                          {t('projet.afficheManquante')}
                        </span>
                        <span className="text-caption text-clay-700 underline underline-offset-4">
                          {t('projet.afficheManquanteAjout')}
                        </span>
                      </span>
                    )}
                    <span className="line-clamp-2 min-h-12 text-body font-semibold text-ink-900 group-hover:underline">
                      {projet.titre || t('declaratif.sansTitre')}
                    </span>
                    {projet.accroche ? (
                      <span className="line-clamp-1 text-caption text-ink-700">
                        {projet.accroche}
                      </span>
                    ) : null}
                  </Link>
                  <div className="flex flex-wrap items-center gap-2 text-caption text-ink-700">
                    {etat ? <PastilleStatut etat={etat} /> : null}
                    {projet.categorie ? (
                      <span className="rounded-full border border-sand-300 px-2 text-ink-700">
                        {projet.categorie}
                      </span>
                    ) : null}
                    {typeof projet.nombreEpisodes === 'number' ? (
                      <span>
                        {projet.nombreEpisodes}{' '}
                        {projet.nombreEpisodes > 1 ? t('projet.episodesCourtsP') : t('projet.episodesCourts')}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-sand-200 pt-2">
                    <span className="text-caption text-ink-700">
                      {typeof projet.creeLe === 'string'
                        ? `${t('projet.creeLe')} ${formaterDate(projet.creeLe)}`
                        : ''}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      <Link
                        to={`/projets/${projet.id}`}
                        className="inline-flex min-h-9 items-center rounded-md px-2 text-caption font-semibold text-clay-700 underline underline-offset-4"
                      >
                        {t('tableau.ouvrir')}
                      </Link>
                      {peutSupprimer ? (
                        <button
                          type="button"
                          onClick={() => setSuppression(projet)}
                          className="inline-flex min-h-9 items-center rounded-md px-2 text-caption font-semibold text-ink-500 hover:bg-sand-200"
                        >
                          {t('projet.supprimer')}
                        </button>
                      ) : null}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>

          {/* Pagination */}
          <nav
            className="flex flex-wrap items-center justify-between gap-3"
            aria-label={t('tableau.pagination')}
          >
            <p className="text-caption text-ink-700" aria-live="polite">
              <span className="tnum">
                {debutRange}–{finRange} {t('tableau.sur')} {total}
              </span>{' '}
              {total > 1 ? t('hub.projets') : t('hub.projet')}
            </p>
            <div className="flex items-center gap-2">
              <Bouton variante="secondaire" disabled={page <= 1} onClick={() => changerPage(page - 1)}>
                {t('tableau.precedente')}
              </Bouton>
              <div className="flex items-center gap-1" aria-label={t('tableau.pagination')}>
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
              libelle={t('hub.projetsParPage')}
              value={String(pageSize)}
              onChange={(evenement) => regler('taille', evenement.target.value)}
              options={TAILLES.map((taille) => ({
                valeur: String(taille),
                libelle: String(taille),
              }))}
            />
          </nav>
        </>
      )}

      {suppression ? (
        <Confirmation
          ouverte
          titre={t('projet.supprimerTitre')}
          objet={suppression.titre || t('declaratif.sansTitre')}
          consequence={t('projet.supprimerTexte')}
          libelleConfirmer={t('projet.supprimer')}
          danger
          enCours={false}
          surConfirmer={supprimer}
          surAnnuler={() => setSuppression(null)}
        />
      ) : null}
    </section>
  )
}
