import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Alerte } from '@/components/ui/Alerte'
import { Bouton } from '@/components/ui/Bouton'
import { EtatErreur } from '@/components/ui/Etats'
import { Squelette } from '@/components/ui/Squelette'
import { TitrePage } from '@/components/layout/TitrePage'
import { SuiviPublication } from '@/features/gabarits/SuiviPublication'
import { lireTableauDeBord, site } from '@/api/endpoints/contenus'
import { t } from '@/i18n/fr'

/**
 * Écran « Publication du site » (étape 9) : l’état de la dernière reconstruction, son suivi
 * (RG-19) puis la relance. `POST /site/reconstruire` déclare une nouvelle mise à jour du site ;
 * le suivi poll jusqu’à l’état `reussie` ou `echec`.
 */
export default function SuiviSite() {
  const requete = useQuery({ queryKey: ['tableau-de-bord'], queryFn: lireTableauDeBord })
  const client = useQueryClient()
  const reconstituer = useMutation({
    mutationFn: site.reconstruire,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['site'] })
      void client.invalidateQueries({ queryKey: ['tableau-de-bord'] })
    },
  })

  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <TitrePage titre={t('menu.publication')}>{t('menu.publication')}</TitrePage>
        {requete.isPending ? <Squelette lignes={3} /> : null}
      </div>

      {requete.isError ? (
        <EtatErreur erreur={requete.error} surReessai={() => void requete.refetch()} />
      ) : requete.data ? (
        requete.data.derniereReconstruction ? (
          <SuiviPublication publicationId={requete.data.derniereReconstruction.id} />
        ) : (
          <Alerte ton="info">{t('accueil.aucuneReconstruction')}</Alerte>
        )
      ) : null}

      <div className="space-y-3">
        <Bouton onClick={() => reconstituer.mutate()} disabled={reconstituer.isPending}>
          {reconstituer.isPending ? t('publication.reconstruireEnCours') : t('suivi.relancer')}
        </Bouton>
      </div>
    </section>
  )
}
