import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import { CircleAlert, FileText, ImageOff } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { articles, medias } from '@/api/endpoints/contenus'
import type { ResumeContenu } from '@/api/schemas/communs'
import { cles } from '@/api/cles'
import { useSession } from '@/auth/contexte-session'
import { peut } from '@/auth/permissions'
import { Confirmation } from '@/components/ui/Confirmation'
import { EtatErreur, EtatVide } from '@/components/ui/Etats'
import { Bouton } from '@/components/ui/Bouton'
import { FilAriane } from '@/components/layout/FilAriane'
import { TitrePage } from '@/components/layout/TitrePage'
import { PastilleStatut } from '@/components/ui/PastilleStatut'
import { Champ } from '@/components/ui/Champ'
import { Select } from '@/components/ui/Select'
import { Squelette } from '@/components/ui/Squelette'
import { useNotifications } from '@/components/retours/contexte-notifications'
import { nomCategorie, useCategories } from '@/features/categories/useCategories'
import { t } from '@/i18n/fr'
import { formaterDate } from '@/lib/dates'
import { messageErreur } from '@/lib/message-erreur'
import { etatAffiche } from '@/lib/statuts'
import { cn } from '@/lib/cn'

/** Journal — grille de cartes des articles : recherche, filtres, pagination (serveur) et
 * pagination moderne. Suit le gabarit de la médiathèque plutôt que le gabarit tableau. */
const TAILLES = [8, 12, 16, 24] as const
const TAILLE_DEFAUT = 12

type Ligne = ResumeContenu
type StatutsArticle = 'brouillon' | 'en_relecture' | 'publie' | 'archive'

export default function ListeArticles() {
  const { moi } = useSession()
  const client = useQueryClient()
  const notifier = useNotifications()
  const [adresse, setAdresse] = useSearchParams()
  const [recherche, setRecherche] = useState(adresse.get('q') ?? '')
  const minuterie = useRef<number | undefined>(undefined)
  const [suppression, setSuppression] = useState<Ligne | null>(null)

  const page = Math.max(1, Number(adresse.get('page') ?? '1') || 1)
  // Coupe la minuterie de recherche au démontage : un « q » tardif ne ressuscite pas une page vide.
  useEffect(() => () => window.clearTimeout(minuterie.current), [])
  const tailleCandidate = Number(adresse.get('taille'))
  const pageSize =
    TAILLES.includes(tailleCandidate as (typeof TAILLES)[number]) ? tailleCandidate : TAILLE_DEFAUT
  const statut = (adresse.get('statut') as StatutsArticle | null) ?? null
  const categorieFiltre = adresse.get('categorie') ?? ''
  const tri = adresse.get('tri') ?? '-modifieLe'
  const parametres = {
    page,
    pageSize,
    ...(adresse.get('q') ? { q: adresse.get('q') ?? '' } : {}),
    ...(statut ? { statut } : {}),
    ...(categorieFiltre ? { categorie: categorieFiltre } : {}),
    ...(tri ? { tri } : {}),
  }
  // Le filtre propre à la famille passe dans les filtres brutes, comme le gabarit de liste accepte.
  const propres: Record<string, string | undefined> = categorieFiltre ? { categorie: categorieFiltre } : {}

  const liste = useQuery({
    queryKey: ['articles', 'liste', parametres],
    queryFn: () => articles.lister(parametres, undefined, propres),
    placeholderData: (precedent) => precedent,
  })

  const donnees = liste.data?.items ?? []
  const total = liste.data?.total ?? 0
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const debutRange = total === 0 ? 0 : Math.min(total, (page - 1) * pageSize + 1)
  const finRange = Math.min(total, page * pageSize)

  const images = useQueries({
    queries: donnees.map((article) => ({
      queryKey: cles.media(article.imageId ?? ''),
      queryFn: () => medias.lire(article.imageId ?? ''),
      enabled: Boolean(article.imageId),
      staleTime: 60_000,
    })),
  })
  const indexImages = new Map(donnees.map((article, rang) => [article.id, images[rang]?.data]))

  const regler = (cle: string, valeur: string | null) => {
    const suivante = new URLSearchParams(adresse)
    if (valeur) suivante.set(cle, valeur)
    else suivante.delete(cle)
    if (cle !== 'page') suivante.delete('page')
    setAdresse(suivante, { replace: true })
  }

  /** Recherche instantanée 300 ms après la saisie — on ne fait pas attendre l'utilisateur. */
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

  const transitionner = useMutation({
    mutationFn: ({
      id,
      vers,
      version,
    }: {
      id: string
      vers: 'brouillon' | 'en_relecture' | 'publie'
      version: number
    }) => articles.transition(id, { vers, version }),
    onSuccess: () => client.invalidateQueries({ queryKey: ['articles'] }),
    onError: (erreur) => notifier.erreur(messageErreur(erreur)),
  })

  const publierOuDepublier = (ligne: Ligne) => {
    if (ligne.statut === 'publie') {
      transitionner.mutate({ id: ligne.id, vers: 'brouillon', version: ligne.version })
      return
    }
    if (ligne.statut === 'brouillon') {
      transitionner.mutate({ id: ligne.id, vers: 'en_relecture', version: ligne.version })
      return
    }
    transitionner.mutate({ id: ligne.id, vers: 'publie', version: ligne.version })
  }

  const supprimer = () => {
    if (!suppression) return
    articles.supprimer(suppression.id, suppression.version).then(
      () => {
        const supprime = suppression
        setSuppression(null)
        void notifier.succes(t('article.supprime'))
        void client.invalidateQueries({ queryKey: ['articles', 'liste'] })
        void client.invalidateQueries({ queryKey: ['articles'] })
        void supprime
      },
      (erreur: unknown) => {
        setSuppression(null)
        notifier.erreur(messageErreur(erreur as Error))
      },
    )
  }

  const peutPublier = peut(moi?.compte, 'publier', 'articles')
  const peutSupprimer = peut(moi?.compte, 'supprimer', 'articles')
  const creerVisible = peut(moi?.compte, 'creer', 'articles')
  const categoriesArticle = useCategories('article')
  const filtresActifs = ['q', 'statut', 'categorie', 'tri'].some((cle) => adresse.has(cle))

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <FilAriane elements={[{ libelle: t('menu.articles') }]} />
          <TitrePage titre={t('menu.articles')}>{t('menu.articles')}</TitrePage>
        </div>
        {creerVisible ? (
          <Link
            to="/articles/nouveau"
            className="inline-flex min-h-11 items-center gap-2 rounded-md bg-clay-600 px-4 text-button font-semibold text-cream-100 hover:bg-clay-700"
          >
            {t('article.nouveau')}
          </Link>
        ) : null}
      </div>

      {/* Recherche et filtres */}
      <div className="flex flex-wrap items-end gap-3 rounded-md border border-sand-200 bg-sand-100 p-4">
        <div className="flex min-w-64 flex-1 items-end gap-2">
          <Champ
            type="search"
            libelle={t('liste.rechercher')}
            value={recherche}
            onChange={(evenement) => saisir(evenement.target.value)}
            className="flex-1"
          />
        </div>
        <Select
          libelle={t('article.categorie')}
          value={categorieFiltre}
          onChange={(evenement) => regler('categorie', evenement.target.value || null)}
          options={[
            { valeur: '', libelle: t('liste.tous') },
            ...(categoriesArticle.data?.items ?? []).map((cat) => ({
              valeur: nomCategorie(cat),
              libelle: nomCategorie(cat),
            })),
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
            { valeur: 'titre', libelle: t('article.triTitre') },
          ]}
        />
        {filtresActifs ? (
          <Bouton
            variante="secondaire"
            onClick={() => {
              const suivante = new URLSearchParams()
              for (const cle of ['tri', 'taille']) {
                const valeur = adresse.get(cle)
                if (valeur) suivante.set(cle, valeur)
              }
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
          titre={filtresActifs ? t('article.aucunResultat') : t('article.premier')}
          texte={filtresActifs ? t('liste.aucunResultatTexte') : t('article.premierIntro')}
          action={
            !filtresActifs && creerVisible ? (
              <Link
                to="/articles/nouveau"
                className="inline-flex min-h-11 items-center gap-2 rounded-md bg-clay-600 px-4 text-button font-semibold text-cream-100 hover:bg-clay-700"
              >
                {t('article.nouveau')}
              </Link>
            ) : undefined
          }
        />
      ) : (
        <>
          {/* Grille de cartes */}
          <ul className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {donnees.map((article) => {
              const media = indexImages.get(article.id)
              const imageUrl = media?.declinaisons[0]?.url ?? media?.url ?? null
              const etat = article.statut ? etatAffiche(article.statut, article.publieLe) : null
              return (
                <li
                  key={article.id}
                  className="flex flex-col gap-2 rounded-md border border-sand-200 bg-sand-50 p-2"
                >
                  <Link to={`/articles/${article.id}`} className="group flex flex-1 flex-col gap-2">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={media?.traductions.fr?.texteAlt ?? ''}
                        loading="lazy"
                        decoding="async"
                        className="aspect-[4/3] w-full rounded-md bg-sand-200 object-cover"
                      />
                    ) : (
                      <span className="flex aspect-[4/3] w-full items-center justify-center rounded-md bg-sand-100 text-ink-500">
                        <ImageOff aria-hidden className="size-10" />
                      </span>
                    )}
                    <span className="line-clamp-2 min-h-12 text-body font-semibold text-ink-900 group-hover:underline">
                      {article.titre || t('article.sansTitre')}
                    </span>
                    <span className="line-clamp-2 min-h-7 text-caption text-ink-700">
                      {article.extrait ?? t('article.extraitAbsent')}
                    </span>
                  </Link>
                  <div className="flex flex-wrap items-center gap-2 text-caption text-ink-700">
                    {etat ? <PastilleStatut etat={etat} /> : null}
                    {article.categorie ? (
                      <span className="rounded-full border border-sand-300 px-2 font-semibold text-ink-700">
                        {article.categorie}
                      </span>
                    ) : null}
                    {article.pdfId ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-sand-300 px-2 font-semibold text-ink-700">
                        <FileText aria-hidden className="size-3.5" />
                        {t('article.pdfJoint')}
                      </span>
                    ) : null}
                    {article.champsAFournir.length > 0 ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-clay-600/50 px-2 font-semibold text-clay-700">
                        <CircleAlert aria-hidden className="size-3.5" />
                        {t('article.aCompleter').replace('{nombre}', String(article.champsAFournir.length))}
                      </span>
                    ) : null}
                    <span className="tnum ml-auto text-ink-500">
                      {article.publieLe
                        ? `${t('article.publieLe')} ${formaterDate(article.publieLe)}`
                        : `${t('article.modifierLe')} ${formaterDate(article.modifieLe)}`}
                    </span>
                  </div>
                  <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-sand-200 pt-2">
                    <Link
                      to={`/articles/${article.id}`}
                      className="inline-flex min-h-11 items-center rounded-md px-3 text-caption font-semibold text-clay-700 underline underline-offset-4"
                    >
                      {t('tableau.ouvrir')}
                    </Link>
                    {peutPublier ? (
                      <button
                        type="button"
                        onClick={() => publierOuDepublier(article)}
                        disabled={transitionner.isPending}
                        className="inline-flex min-h-11 items-center rounded-md border border-sand-300 bg-transparent px-3 text-caption font-semibold text-ink-900 hover:bg-sand-200 disabled:opacity-50"
                      >
                        {article.statut === 'publie' ? t('article.depublier') : t('article.publier')}
                      </button>
                    ) : null}
                    {peutSupprimer ? (
                      <button
                        type="button"
                        onClick={() => setSuppression(article)}
                        className="inline-flex min-h-11 items-center rounded-md px-3 text-caption font-semibold text-ink-700 hover:bg-sand-200"
                      >
                        {t('article.supprimer')}
                      </button>
                    ) : null}
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
              {total > 1 ? t('article.total') : t('article.total')}
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
              libelle={t('article.tirage')}
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
          titre={t('article.supprimerTitre')}
          objet={suppression.titre || t('article.sansTitre')}
          consequence={t('article.supprimerTexte')}
          libelleConfirmer={t('article.supprimer')}
          danger
          enCours={false}
          surConfirmer={supprimer}
          surAnnuler={() => setSuppression(null)}
        />
      ) : null}
    </section>
  )
}
