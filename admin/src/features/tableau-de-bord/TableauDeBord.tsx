import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import { lireTableauDeBord } from '@/api/endpoints/contenus'
import { useSession } from '@/auth/contexte-session'
import { peut, type CompteDroits } from '@/auth/permissions'
import { EtatErreur } from '@/components/ui/Etats'
import { PastilleStatut } from '@/components/ui/PastilleStatut'
import { TitrePage } from '@/components/layout/TitrePage'
import { CLASSES_LIEN } from '@/components/ui/classes'
import { MessageAccueil } from '@/features/tableau-de-bord/MessageAccueil'
import { Squelette } from '@/components/ui/Squelette'
import { t, type CleTraduction } from '@/i18n/fr'
import { formaterDateHeure } from '@/lib/dates'
import { etatAffiche } from '@/lib/statuts'

/**
 * Tableau de bord, version de l'étape 2 : les compteurs du contrat (§ 16). Les compteurs de
 * messages et de demandes n'apparaissent qu'aux rôles qui peuvent les traiter. La version
 * complète (dernières modifications cliquables, suivi détaillé) arrive à l'étape 9.
 */
export default function TableauDeBord() {
  const { moi } = useSession()
  const requete = useQuery({ queryKey: ['tableau-de-bord'], queryFn: lireTableauDeBord })
  const compte = moi?.compte

  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <TitrePage titre={t('accueil.titre')}>{t('accueil.titre')}</TitrePage>
        {compte ? (
          <p className="text-body-lg text-ink-700">
            {t('accueil.bonjour')} {compte.nom}.
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
          {/* 1. À faire (ECRANS § 1) : cartes cliquables vers la liste déjà filtrée. */}
          <section aria-labelledby="tdb-a-faire" className="space-y-3">
            <h2 id="tdb-a-faire" className="font-display text-heading-sm uppercase text-ink-900">
              {t('accueil.aFaire')}
            </h2>
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <CarteAFaire
                chemin="/articles?statut=en_relecture"
                valeur={requete.data.aRelire}
                libelle={t('accueil.carteRelecture')}
              />
              {peut(compte, 'lire', 'messages') ? (
                <CarteAFaire
                  chemin="/messages?statut=non_lu"
                  valeur={requete.data.messagesNonLus}
                  libelle={t('accueil.carteMessages')}
                />
              ) : null}
              {peut(compte, 'lire', 'demandes') ? (
                <CarteAFaire
                  chemin="/demandes?statut=nouvelle"
                  valeur={requete.data.demandesNouvelles}
                  libelle={t('accueil.carteDemandes')}
                />
              ) : null}
              <CarteAFaire
                chemin="/articles?aFournir=true"
                valeur={requete.data.aFournir}
                libelle={t('accueil.carteACompleter')}
              />
            </ul>
          </section>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* 2. Dernière publication. */}
            <section aria-labelledby="tdb-publication" className="space-y-2">
              <h2
                id="tdb-publication"
                className="font-display text-heading-sm uppercase text-ink-900"
              >
                {t('accueil.reconstruction')}
              </h2>
              <p className="text-body text-ink-700">
                {requete.data.derniereReconstruction
                  ? `${t(`publication.${requete.data.derniereReconstruction.etat}` as CleTraduction)} — ${formaterDateHeure(
                      requete.data.derniereReconstruction.declencheeLe,
                    )}`
                  : t('accueil.aucuneReconstruction')}
              </p>
              {peut(compte, 'lire', 'site') ? (
                <Link
                  to="/publication"
                  className="inline-flex min-h-11 items-center font-semibold text-clay-700 underline underline-offset-4"
                >
                  {t('accueil.voirPublication')}
                </Link>
              ) : null}
            </section>

            {/* 3. Programmé : les cinq prochains contenus. */}
            <section aria-labelledby="tdb-programme" className="space-y-2">
              <h2
                id="tdb-programme"
                className="font-display text-heading-sm uppercase text-ink-900"
              >
                {t('accueil.programme')}
              </h2>
              {(requete.data.programmes ?? []).length === 0 ? (
                <p className="text-body text-ink-700">{t('accueil.rienASignaler')}</p>
              ) : (
                <ul className="space-y-1">
                  {(requete.data.programmes ?? []).map((p) => {
                    const chemin = CHEMIN_MODIFICATION[p.ressource]?.(p.id)
                    const titre = p.titre || t('declaratif.sansTitre')
                    return (
                      <li key={`${p.ressource}-${p.id}`} className="flex flex-wrap gap-x-3">
                        {chemin ? (
                          <Link to={chemin} className={CLASSES_LIEN}>
                            {titre}
                          </Link>
                        ) : (
                          <span className="font-semibold text-ink-900">{titre}</span>
                        )}
                        <span className="text-caption text-ink-700">
                          {formaterDateHeure(p.publieLe)} ({t('barre.fuseau')})
                        </span>
                      </li>
                    )
                  })}
                </ul>
              )}
            </section>
          </div>

          {/* 4. Activité récente : les dix dernières actions (qui, quoi, quand). */}
          <section aria-labelledby="tdb-activite" className="space-y-3">
            <h2 id="tdb-activite" className="font-display text-heading-sm uppercase text-ink-900">
              {t('accueil.dernieresModifications')}
            </h2>
            {requete.data.dernieresModifications.length === 0 ? (
              <p className="text-body text-ink-700">{t('accueil.rienASignaler')}</p>
            ) : (
              <ul className="divide-y divide-sand-200 rounded-md border border-sand-200 bg-sand-100">
                {requete.data.dernieresModifications.map((modification) => {
                  const chemin = CHEMIN_MODIFICATION[modification.ressource]?.(modification.id)
                  const titre = modification.titre || t('declaratif.sansTitre')
                  const contenu = (
                    <>
                      <span className="font-semibold text-ink-900">{titre}</span>
                      <span className="flex flex-wrap items-center gap-2 text-caption text-ink-700">
                        {modification.statut ? (
                          <PastilleStatut etat={etatAffiche(modification.statut, null)} />
                        ) : null}
                        <span>{formaterDateHeure(modification.modifieLe)}</span>
                        <span>{modification.auteur?.nom ?? '—'}</span>
                      </span>
                    </>
                  )
                  return (
                    <li key={`${modification.ressource}-${modification.id}`} className="px-4 py-3">
                      {chemin ? (
                        <Link
                          to={chemin}
                          className="flex min-h-11 flex-col justify-center gap-1 hover:underline"
                        >
                          {contenu}
                        </Link>
                      ) : (
                        <div className="flex min-h-11 flex-col justify-center gap-1">{contenu}</div>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </section>

          {liensAdministration(compte).length > 0 ? (
            <nav aria-labelledby="administration-titre" className="space-y-3">
              <h2
                id="administration-titre"
                className="font-display text-heading-sm uppercase text-ink-900"
              >
                {t('accueil.administration')}
              </h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {liensAdministration(compte).map((lien) => (
                  <li key={lien.chemin}>
                    <Link
                      to={lien.chemin}
                      className="inline-flex min-h-11 items-center rounded-md border border-sand-200 px-4 font-semibold text-ink-900 hover:bg-sand-100"
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

/** Carte « À faire » : le nombre et ce qu'il désigne, un clic mène à la liste filtrée. */
function CarteAFaire({
  chemin,
  valeur,
  libelle,
}: {
  chemin: string
  valeur: number
  libelle: string
}) {
  return (
    <li>
      <Link
        to={chemin}
        className="flex h-full min-h-24 flex-col justify-between gap-2 rounded-xl border border-sand-200 bg-sand-50 p-5 transition-colors duration-(--d-fast) hover:border-clay-600 hover:bg-sand-100"
      >
        <span className="tnum font-display text-heading-md text-ink-900">{valeur}</span>
        <span className="text-body text-ink-700">{libelle}</span>
      </Link>
    </li>
  )
}
