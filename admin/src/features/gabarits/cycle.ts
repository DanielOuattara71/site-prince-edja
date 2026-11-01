import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { aLeCode, estErreurApi, manquantsDe } from '@/api/erreurs'
import type { DemandeTransition, StatutContenu } from '@/api/schemas/communs'
import { useNotifications } from '@/components/retours/contexte-notifications'
import { t, type CleTraduction } from '@/i18n/fr'
import { messageErreur } from '@/lib/message-erreur'
import { CIBLE_ACTION, type ActionStatut } from '@/lib/statuts'

/**
 * Cycle de vie d'un contenu depuis un formulaire (contrat § 7.3), commun à toutes les familles.
 *
 * - « Publier » depuis un brouillon enchaîne soumettre puis publier (le contrat l'admet) ; si
 *   le second appel échoue, le contenu reste en relecture et l'erreur est dite.
 * - Un `422 RG-03` donne la liste des manques, que le formulaire rend cliquable (RG-03).
 * - Une transition qui reconstruit le site renvoie un `publicationId`, que l'écran suit (RG-19).
 * - `preparer` enregistre d'abord les modifications en cours : on publie ce qu'on voit.
 */
export interface Manquant {
  champ: string
  langue?: string | undefined
  message: string
}

interface ContenuCycle {
  id: string
  statut: StatutContenu
  version: number
}

export function useCycleContenu<C extends ContenuCycle>({
  ressource,
  transition,
  preparer,
  surContenu,
}: {
  ressource: string
  transition: (
    id: string,
    demande: DemandeTransition,
  ) => Promise<{ contenu: unknown; publicationId: string | null }>
  /** Enregistre si besoin, et renvoie le contenu à jour (ou `null` si l'enregistrement a échoué). */
  preparer: () => Promise<C | null>
  surContenu: (contenu: C) => void
}) {
  const client = useQueryClient()
  const notifier = useNotifications()
  const [enCours, setEnCours] = useState<ActionStatut | null>(null)
  const [manquants, setManquants] = useState<Manquant[]>([])
  const [publicationId, setPublicationId] = useState<string | null>(null)

  const passer = async (contenu: C, vers: StatutContenu, extra: Partial<DemandeTransition>) => {
    const reponse = await transition(contenu.id, { vers, version: contenu.version, ...extra })
    const suivant = reponse.contenu as C
    surContenu(suivant)
    if (reponse.publicationId) setPublicationId(reponse.publicationId)
    return suivant
  }

  async function executer(
    action: ActionStatut,
    options: { motif?: string; programmeLe?: string } = {},
  ): Promise<boolean> {
    setEnCours(action)
    setManquants([])
    try {
      let contenu = await preparer()
      if (!contenu) return false
      if (action === 'publier' && contenu.statut === 'brouillon') {
        contenu = await passer(contenu, 'en_relecture', {})
      }
      await passer(contenu, CIBLE_ACTION[action], {
        ...(action === 'refuser' && options.motif ? { motif: options.motif } : {}),
        ...(action === 'publier' && options.programmeLe
          ? { programmeLe: options.programmeLe }
          : {}),
      })
      notifier.succes(t(`cycle.succes.${action}` as CleTraduction))
      await client.invalidateQueries({ queryKey: [ressource, 'liste'] })
      return true
    } catch (erreur) {
      if (aLeCode(erreur, 'RG-03')) {
        setManquants(manquantsDe(erreur))
        notifier.erreur(t('cycle.manquants'))
      } else {
        notifier.erreur(messageErreur(erreur), estErreurApi(erreur) ? erreur.requeteId : undefined)
      }
      return false
    } finally {
      setEnCours(null)
    }
  }

  return { executer, enCours, manquants, publicationId, effacerManquants: () => setManquants([]) }
}
