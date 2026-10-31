import { useEffect } from 'react'
import { useBlocker } from 'react-router'
import { Confirmation } from '@/components/ui/Confirmation'
import { t } from '@/i18n/fr'

/**
 * Bloque la sortie d'un formulaire modifié (section 10) : navigation dans l'admin (boîte de
 * confirmation) et fermeture ou rechargement de l'onglet (alerte native du navigateur).
 * À placer dans le formulaire, avec `actif` = « modifié et non enregistré ».
 *
 * @example
 * const { formState } = useForm(…)
 * <AvertissementSortie actif={formState.isDirty && !enregistrement.isPending} />
 */
export function AvertissementSortie({ actif }: { actif: boolean }) {
  const blocage = useBlocker(
    ({ currentLocation, nextLocation }) =>
      actif && currentLocation.pathname !== nextLocation.pathname,
  )

  useEffect(() => {
    if (!actif) return
    const surDepart = (evenement: BeforeUnloadEvent) => {
      evenement.preventDefault()
    }
    window.addEventListener('beforeunload', surDepart)
    return () => window.removeEventListener('beforeunload', surDepart)
  }, [actif])

  return (
    <Confirmation
      ouverte={blocage.state === 'blocked'}
      titre={t('sortie.titre')}
      consequence={t('sortie.texte')}
      libelleConfirmer={t('sortie.quitter')}
      libelleAnnuler={t('sortie.rester')}
      danger
      surConfirmer={() => blocage.proceed?.()}
      surAnnuler={() => blocage.reset?.()}
    />
  )
}
