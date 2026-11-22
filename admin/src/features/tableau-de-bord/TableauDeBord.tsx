import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import {
  ArrowRight,
  CircleDashed,
  Inbox,
  Package,
  PencilLine,
  type LucideIcon,
} from 'lucide-react'
import { lireTableauDeBord } from '@/api/endpoints/contenus'
import { useSession } from '@/auth/contexte-session'
import { peut, type CompteDroits } from '@/auth/permissions'
import { EtatErreur } from '@/components/ui/Etats'
import { PastilleStatut } from '@/components/ui/PastilleStatut'
import { TitrePage } from '@/components/layout/TitrePage'
import { MessageAccueil } from '@/features/tableau-de-bord/MessageAccueil'
import { Squelette } from '@/components/ui/Squelette'
import { t } from '@/i18n/fr'
import { formaterDateHeure } from '@/lib/dates'
import { etatAffiche } from '@/lib/statuts'

const PANNEAU = 'rounded-xl border border-sand-200 bg-sand-50'

type CarteFaire = {
  chemin: string
  valeur: number
  libelle: string
  Icone: LucideIcon
}

function CarteAFaire({ chemin, valeur, libelle, Icone }: CarteFaire) {
  return (
    <li>
      <Link
        to={chemin}
        className="group flex h-full min-h-40 flex-col justify-between gap-6 rounded-xl border border-sand-200 bg-sand-50 p-5 transition-colors duration-(--d-fast) hover:border-clay-600 hover:bg-sand-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clay-600"
      >
        <div className="flex items-center justify-between">
          <Icone aria-hidden className="size-5 text-clay-600" />
          <span className="flex items-center gap-1 text-caption font-semibold text-clay-700 opacity-0 transition-opacity duration-(--d-fast) group-hover:opacity-100">
            {t('accueil.voirPublications')}
            <ArrowRight aria-hidden className="size-4" />
          </span>
        </div>
        <div className="space-y-0.5">
          <p className="tnum font-display text-heading-md leading-[0.95] text-ink-900">{valeur}</p>
          <p className="max-w-[16ch] text-caption text-ink-700">{libelle}</p>
        </div>
      </Link>
    </li>
  )
}

function RubanTitre({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="font-display text-heading-sm uppercase tracking-wide text-ink-900"
    >
      {children}
    </h2>
  )
}

export default function TableauDeBord() {
  const { moi } = useSession()
  const requete = useQuery({ queryKey: ['tableau-de-bord'], queryFn: lireTableauDeBord })
  const compte = moi?.compte

  const cartes: CarteFaire[] = []

  if (requete.data && compte) {
    cartes.push({
      chemin: '/articles?statut=en_relecture',
      valeur: requete.data.aRelire,
      libelle: t('accueil.carteRelecture'),
      Icone: PencilLine,
    })
    if (peut(compte, 'lire', 'messages')) {
      cartes.push({
        chemin: '/messages?statut=non_lu',
        valeur: requete.data.messagesNonLus,
        libelle: t('accueil.carteMessages'),
        Icone: Inbox,
      })
    }
    if (peut(compte, 'lire', 'demandes')) {
      cartes.push({
        chemin: '/demandes?statut=nouvelle',
        valeur: requete.data.demandesNouvelles,
        libelle: t('accueil.carteDemandes'),
        Icone: Package,
      })
    }
    cartes.push({
      chemin: '/articles?aFournir=true',
      valeur: requete.data.aFournir,
      libelle: t('accueil.carteACompleter'),
      Icone: CircleDashed,
    })
  }

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <TitrePage titre={t('accueil.titre')}>{t('accueil.titre')}</TitrePage>
        {compte ? (
          <p className="text-body-lg text-ink-700">
            {t('accueil.bonjour')} <span className="font-semibold text-ink-900">{compte.nom}</span>.
          </p>
        ) : null}
      </div>

      {compte ? <MessageAccueil compteId={compte.id} /> : null}

      {requete.isPending ? <Squelette lignes={4} /> : null}

      {requete.isError ? (
        <EtatErreur erreur={requete.error} surReessai={() => void requete.refetch()} />
      ) : null}

      {requete.data ? (
        <>
          {/* 1. À faire — 4 cartes cliquables vers la liste filtrée. */}
          <section aria-labelledby="tdb-a-faire" className="space-y-2.5">
            <RubanTitre id="tdb-a-faire">{t('accueil.aFaire')}</RubanTitre>
            <ul className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
              {cartes.map((carte) => (
                <CarteAFaire key={carte.chemin} {...carte} />
              ))}
            </ul>
          </section>

          {/* 2 + 3. Dernière publication | Programmé, côte à côte sur grand écran. */}
          <div className="grid gap-4 lg:grid-cols-5">
            <section
              aria-labelledby="tdb-publication"
              className={`${PANNEAU} flex flex-col justify-between gap-4 p-5 lg:col-span-2`}
            >
              <div className="space-y-2">
                <RubanTitre id="tdb-publication">{t('accueil.reconstruction')}</RubanTitre>
                {requete.data.derniereReconstruction ? (
                  <PublicationCarte publication={requete.data.derniereReconstruction} />
                ) : (
                  <p className="text-body text-ink-700">{t('accueil.aucuneReconstruction')}</p>
                )}
              </div>
              {peut(compte, 'lire', 'site') ? (
                <Link
                  to="/publication"
                  className="inline-flex min-h-11 w-fit items-center gap-1 font-semibold text-clay-700 underline underline-offset-4 hover:text-clay-700"
                >
                  {t('accueil.voirPublication')}
                  <ArrowRight aria-hidden className="size-4" />
                </Link>
              ) : null}
            </section>

            <section
              aria-labelledby="tdb-programme"
              className={`${PANNEAU} p-5 lg:col-span-3`}
            >
              <RubanTitre id="tdb-programme">{t('accueil.programme')}</RubanTitre>
              {(requete.data.programmes ?? []).length === 0 ? (
                <p className="mt-3 text-body text-ink-700">{t('accueil.rienASignaler')}</p>
              ) : (
                <ul className="mt-3 divide-y divide-sand-200">
                  {(requete.data.programmes ?? []).map((p) => {
                    const chemin = CHEMIN_MODIFICATION[p.ressource]?.(p.id)
                    const titre = p.titre || t('declaratif.sansTitre')
                    const contenu = (
                      <>
                        <span className="min-w-0 flex-1 truncate font-semibold text-ink-900">
                          {titre}
                        </span>
                        <span className="tnum whitespace-nowrap text-caption text-ink-700">
                          {formaterDateHeure(p.publieLe)} ({t('barre.fuseau')})
                        </span>
                      </>
                    )
                    return (
                      <li key={`${p.ressource}-${p.id}`} className="py-2.5">
                        {chemin ? (
                          <Link
                            to={chemin}
                            className="flex min-h-11 items-center justify-between gap-4 rounded-md -mx-2 px-2 transition-colors duration-(--d-fast) hover:bg-sand-100"
                          >
                            {contenu}
                          </Link>
                        ) : (
                          <div className="flex min-h-11 items-center justify-between gap-4">
                            {contenu}
                          </div>
                        )}
                      </li>
                    )
                  })}
                </ul>
              )}
            </section>
          </div>

          {/* 3b. Visites du site (contrat 1.11.0 § 28) — compteur maison, aucune donnée personnelle. */}
          <section aria-labelledby="tdb-visites" className={`${PANNEAU} p-5`}>
            <RubanTitre id="tdb-visites">{t('accueil.visites')}</RubanTitre>
            {requete.data.visitesTotales === undefined ? (
              <p className="mt-3 text-body text-ink-700">{t('accueil.visitesSansApi')}</p>
            ) : (
              <div className="mt-4 flex flex-wrap items-stretch gap-y-4 sm:gap-y-0 sm:divide-x sm:divide-sand-200">
                <MetricBloc valeur={requete.data.visitesTotales} libelle={t('accueil.visitesTotal')} />
                <MetricBloc
                  valeur={requete.data.visitesAujourdhui ?? 0}
                  libelle="aujourd’hui"
                  classes="sm:pl-8"
                />
                <MetricBloc
                  valeur={requete.data.visitesCeMois ?? 0}
                  libelle={t('accueil.visitesMois')}
                  classes="sm:pl-8"
                />
              </div>
            )}
            {(requete.data.topVues ?? []).length > 0 ? (
              <div className="mt-4 border-t border-sand-200 pt-4">
                <p className="label-caps text-ink-700">{t('accueil.visitesTop')}</p>
                <ol className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5">
                  {(requete.data.topVues ?? []).map((p) => (
                    <li key={p.chemin} className="flex items-baseline gap-1.5 text-caption">
                      <span className="tnum font-semibold text-ink-900">{p.total}</span>
                      <code className="font-mono text-ink-900">{p.chemin}</code>
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}
          </section>

          {/* 4. Activité récente : les dix dernières actions, en tableau. */}
          <section aria-labelledby="tdb-activite" className={`${PANNEAU} overflow-hidden`}>
            <div className="flex items-baseline justify-between border-b border-sand-200 px-5 py-4">
              <RubanTitre id="tdb-activite">{t('accueil.dernieresModifications')}</RubanTitre>
              <span className="hidden tnum text-caption text-ink-500 lg:inline">
                {t('accueil.activite10')}
              </span>
            </div>
            {requete.data.dernieresModifications.length === 0 ? (
              <p className="px-5 py-6 text-body text-ink-700">{t('accueil.rienASignaler')}</p>
            ) : (
              <>
                <div
                  aria-hidden
                  className="hidden border-b border-sand-200 bg-sand-100 px-5 py-2 md:grid md:grid-cols-[minmax(0,1fr)_8.5rem_11rem_9rem] md:gap-4"
                >
                  <span className="label-caps text-ink-500">{t('accueil.colContenu')}</span>
                  <span className="label-caps text-ink-500">{t('accueil.colStatut')}</span>
                  <span className="label-caps text-ink-500">{t('accueil.colQuand')}</span>
                  <span className="label-caps text-ink-500">{t('accueil.colAuteur')}</span>
                </div>
                <ul className="divide-y divide-sand-200">
                  {requete.data.dernieresModifications.map((m) => {
                    const chemin = CHEMIN_MODIFICATION[m.ressource]?.(m.id)
                    const titre = m.titre || t('declaratif.sansTitre')
                    const ligne = (
                      <>
                        <span className="min-w-0 truncate font-semibold text-ink-900">{titre}</span>
                        <span className="flex items-center">
                          {m.statut ? (
                            <PastilleStatut etat={etatAffiche(m.statut, null)} />
                          ) : null}
                        </span>
                        <span className="tnum text-caption text-ink-700">
                          {formaterDateHeure(m.modifieLe)}
                        </span>
                        <span className="truncate text-caption text-ink-700">
                          {m.auteur?.nom ?? '—'}
                        </span>
                      </>
                    )
                    return (
                      <li key={`${m.ressource}-${m.id}`}>
                        {chemin ? (
                          <Link
                            to={chemin}
                            className="grid min-h-12 grid-cols-[minmax(0,1fr)_auto] gap-y-1 gap-x-4 px-5 py-3 transition-colors duration-(--d-fast) hover:bg-sand-100 md:grid-cols-[minmax(0,1fr)_8.5rem_11rem_9rem]"
                          >
                            {ligne}
                          </Link>
                        ) : (
                          <div className="grid min-h-12 grid-cols-[minmax(0,1fr)_auto] gap-y-1 gap-x-4 px-5 py-3 md:grid-cols-[minmax(0,1fr)_8.5rem_11rem_9rem]">
                            {ligne}
                          </div>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </>
            )}
          </section>

          {liensAdministration(compte).length > 0 ? (
            <nav aria-labelledby="tdb-administration" className="space-y-2.5">
              <RubanTitre id="tdb-administration">{t('accueil.administration')}</RubanTitre>
              <ul className="flex flex-wrap gap-2">
                {liensAdministration(compte).map((lien) => (
                  <li key={lien.chemin}>
                    <Link
                      to={lien.chemin}
                      className="inline-flex min-h-11 items-center rounded-md border border-sand-200 px-4 font-semibold text-ink-900 transition-colors duration-(--d-fast) hover:bg-sand-100"
                    >
                      {lien.libelle}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}
        </>
      ) : null}
    </section>
  )
}

/** État de la dernière publication, en pastille — jamais la couleur seule. */
function PublicationCarte({
  publication,
}: {
  publication: {
    etat: string
    declencheeLe: string
    messageErreur: string | null
  }
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <PublicationPastille etat={publication.etat} />
      <span className="tnum text-caption text-ink-700">
        {formaterDateHeure(publication.declencheeLe)}
      </span>
    </div>
  )
}

function PublicationPastille({ etat }: { etat: string }) {
  const STYLES: Record<string, { classes: string; libelle: string }> = {
    en_attente: { classes: 'bg-sand-200 text-ink-900 border-sand-200', libelle: t('publication.en_attente') },
    en_cours: { classes: 'bg-gold-300/40 text-ink-900 border-gold-300', libelle: t('publication.en_cours') },
    reussie: { classes: 'bg-sage-100 text-forest-900 border-sage-100', libelle: t('publication.reussie') },
    echec: { classes: 'bg-transparent text-clay-700 border-clay-600', libelle: t('publication.echec') },
  }
  const style = STYLES[etat] ?? STYLES['echec']!
  return (
    <span className={`inline-flex min-h-7 items-center gap-1.5 rounded-full border px-2.5 text-caption font-semibold ${style.classes}`}>
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {style.libelle}
    </span>
  )
}

function MetricBloc({
  valeur,
  libelle,
  classes = '',
}: {
  valeur: number
  libelle: string
  classes?: string
}) {
  return (
    <p className={`flex flex-col gap-0.5 sm:pr-8 ${classes}`}>
      <span className="tnum font-display text-heading-md leading-[0.95] text-ink-900">
        {valeur}
      </span>
      <span className="text-caption text-ink-700">{libelle}</span>
    </p>
  )
}

// Les familles retirées en C2 (univers, jalons, offres, pages) n'ont plus de lien : pas de lien mort.
const CHEMIN_MODIFICATION: Record<string, (id: string) => string> = {
  articles: (id) => `/articles/${id}`,
  episodes: (id) => `/episodes/${id}`,
  projets: (id) => `/projets/${id}`,
  villes: (id) => `/villes/${id}`,
  destinations: (id) => `/destinations/${id}`,
  archive: (id) => `/archive/${id}`,
  distinctions: (id) => `/distinctions/${id}`,
  presse: (id) => `/presse/${id}`,
  bijoux: (id) => `/bijoux/${id}`,
  createurs: (id) => `/createurs/${id}`,
}

function liensAdministration(
  compte: CompteDroits | undefined,
): { chemin: string; libelle: string }[] {
  const liens: { chemin: string; libelle: string }[] = []
  if (peut(compte, 'lire', 'comptes'))
    liens.push({ chemin: '/comptes', libelle: t('menu.comptes') })
  if (peut(compte, 'lire', 'journal'))
    liens.push({ chemin: '/activite', libelle: t('menu.activite') })
  return liens
}
