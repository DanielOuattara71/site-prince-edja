import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import { cles } from '@/api/cles'
import { site } from '@/api/endpoints/contenus'
import { publicationTerminee } from '@/api/schemas/site'
import { Alerte } from '@/components/ui/Alerte'
import { t } from '@/i18n/fr'

/**
 * Suivi d'une reconstruction après une publication (RG-19, D-23) : « Site en cours de mise à
 * jour », puis le résultat. Un échec ne défait rien : le contenu reste publié, seul le site
 * n'est pas encore à jour, et le bandeau le dit.
 */
const MESSAGES: Record<string, string> = {
  WEBHOOK_ABSENT: 'Aucun service de reconstruction n’est configuré pour cet environnement.',
  DELAI_DEPASSE: 'Le site n’a pas confirmé sa mise à jour dans les 15 minutes.',
}

export function SuiviPublication({ publicationId }: { publicationId: string }) {
  const requete = useQuery({
    queryKey: cles.publication(publicationId),
    queryFn: () => site.publication(publicationId),
    refetchInterval: (requeteCourante) => {
      const donnees = requeteCourante.state.data
      return donnees && publicationTerminee(donnees) ? false : 3000
    },
  })
  const publication = requete.data
  if (!publication) return null

  if (publication.etat === 'reussie') {
    return <Alerte ton="succes">{t('suivi.reussie')}</Alerte>
  }
  if (publication.etat === 'echec') {
    const motif = publication.messageErreur ?? ''
    const message =
      MESSAGES[motif] ?? (motif.startsWith('WEBHOOK_EN_ECHEC') ? t('suivi.webhook') : motif)
    return (
      <Alerte ton="erreur">
        <p className="font-semibold">{t('suivi.echec')}</p>
        {message ? <p>{message}</p> : null}
        <p>
          {t('suivi.contenuGarde')}{' '}
          <Link to="/publication" className="font-semibold underline underline-offset-4">
            {t('suivi.relancer')}
          </Link>
        </p>
      </Alerte>
    )
  }
  return <Alerte>{t('suivi.enCours')}</Alerte>
}
