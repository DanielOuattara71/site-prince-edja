import { useQuery } from '@tanstack/react-query'
import { lireTableauDeBord } from '@/api/endpoints/contenus'
import { estErreurApi } from '@/api/erreurs'
import { useSession } from '@/auth/contexte-session'
import { peut } from '@/auth/permissions'
import { TitrePage } from '@/components/layout/TitrePage'
import { Alerte } from '@/components/ui/Alerte'
import { Bouton } from '@/components/ui/Bouton'
import { Squelette } from '@/components/ui/Squelette'
import { t, type CleTraduction } from '@/i18n/fr'

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

      {requete.isPending ? <Squelette lignes={4} /> : null}

      {requete.isError ? (
        <Alerte ton="erreur">
          <p>{t('erreur.500.texte')}</p>
          {estErreurApi(requete.error) && requete.error.requeteId ? (
            <p className="text-caption">
              {t('erreur.reference')} : {requete.error.requeteId}
            </p>
          ) : null}
          <Bouton variante="secondaire" onClick={() => void requete.refetch()}>
            {t('erreur.reessayer')}
          </Bouton>
        </Alerte>
      ) : null}

      {requete.data ? (
        <>
          <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <Compteur libelle={t('accueil.aRelire')} valeur={requete.data.aRelire} />
            <Compteur libelle={t('accueil.brouillons')} valeur={requete.data.brouillons} />
            <Compteur libelle={t('accueil.aFournir')} valeur={requete.data.aFournir} />
            {peut(compte, 'lire', 'messages') ? (
              <Compteur libelle={t('accueil.messages')} valeur={requete.data.messagesNonLus} />
            ) : null}
            {peut(compte, 'lire', 'demandes') ? (
              <Compteur libelle={t('accueil.demandes')} valeur={requete.data.demandesNouvelles} />
            ) : null}
          </dl>

          <div className="space-y-2">
            <h2 className="font-display text-heading-sm uppercase text-ink-900">
              {t('accueil.reconstruction')}
            </h2>
            <p className="text-body text-ink-700">
              {requete.data.derniereReconstruction
                ? `${t(`publication.${requete.data.derniereReconstruction.etat}` as CleTraduction)} — ${new Date(
                    requete.data.derniereReconstruction.declencheeLe,
                  ).toLocaleString('fr-FR', { timeZone: 'Africa/Abidjan' })}`
                : t('accueil.aucuneReconstruction')}
            </p>
          </div>
        </>
      ) : null}
    </section>
  )
}

function Compteur({ libelle, valeur }: { libelle: string; valeur: number }) {
  return (
    <div className="rounded-md border border-sand-200 bg-sand-100 p-5">
      <dt className="text-body text-ink-700">{libelle}</dt>
      <dd className="mt-1 font-display text-heading-md text-ink-900 tnum">{valeur}</dd>
    </div>
  )
}
