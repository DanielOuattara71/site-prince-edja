import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient, type QueryKey } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { useForm, type DefaultValues, type FieldValues, type Resolver } from 'react-hook-form'
import { useNavigate } from 'react-router'
import type { z } from 'zod'
import { aLeCode, estErreurApi } from '@/api/erreurs'
import type { DemandeTransition, StatutContenu } from '@/api/schemas/communs'
import { useSession } from '@/auth/contexte-session'
import { peut, type RessourceContenu } from '@/auth/permissions'
import type { EtatEnregistrement } from '@/components/formulaire/BarreStatut'
import { useNotifications } from '@/components/retours/contexte-notifications'
import { useCycleContenu } from '@/features/gabarits/cycle'
import { t } from '@/i18n/fr'
import { maintenantIso } from '@/lib/dates'
import { rattacherErreursServeur } from '@/lib/formulaires'
import { messageErreur } from '@/lib/message-erreur'
import type { ActionStatut } from '@/lib/statuts'

/**
 * Contrôleur du gabarit de formulaire (section 9), commun à toutes les familles : enregistrement
 * manuel et automatique (30 s), refus du serveur rattachés aux champs, cycle de vie. La mise en
 * page est dans `editeur.tsx` (D-57).
 */
const AUTOMATIQUE_MS = 30_000

export interface ContenuEditable {
  id: string
  statut: StatutContenu
  version: number
  publieLe: string | null
  champsAFournir: string[]
  dernierMotifRefus: string | null
  createurId?: string | null | undefined
}

export interface OptionsEditeur<C extends ContenuEditable, V extends FieldValues> {
  ressource: RessourceContenu
  /** Adresse de la liste (`/bijoux`) ; la fiche créée devient `/bijoux/:id`. */
  chemin: string
  initial: C | null
  surCree?: ((id: string) => void) | undefined
  schema: z.ZodType
  valeursDepuis: (contenu: C) => V
  valeursVides: () => V
  /** Chemins des champs, pour rattacher les `422` du serveur (D-44). */
  champs: readonly string[]
  creer: (valeurs: V) => Promise<C>
  modifier: (valeurs: V, contenu: C) => Promise<C>
  transition: (
    id: string,
    demande: DemandeTransition,
  ) => Promise<{ contenu: unknown; publicationId: string | null }>
  cle: (id: string) => QueryKey
}

export function useEditeurContenu<C extends ContenuEditable, V extends FieldValues>(
  options: OptionsEditeur<C, V>,
) {
  const { ressource, chemin, initial, surCree, schema, valeursDepuis, champs, cle } = options
  const { moi } = useSession()
  const compte = moi?.compte
  const client = useQueryClient()
  const navigate = useNavigate()
  const notifier = useNotifications()
  const [contenu, setContenu] = useState<C | null>(initial)
  const [enregistrement, setEnregistrement] = useState<EtatEnregistrement>('enregistre')
  /** Heure du dernier enregistrement réussi (U6). */
  const [enregistreA, setEnregistreA] = useState<string | null>(null)
  /** Conflit de version (409) : la fenêtre « Quelqu'un a modifié ce contenu » (ECRANS § 0.3). */
  const [conflit, setConflit] = useState(false)
  const [enregistrant, setEnregistrant] = useState(false)
  const [suggestion, setSuggestion] = useState<{ champ: string; valeur: string } | null>(null)
  const [orphelines, setOrphelines] = useState<{ champ: string; message: string }[]>([])
  const [refus, setRefus] = useState(false)
  const [programmeLe, setProgrammeLe] = useState('')
  const [tentative, setTentative] = useState(0)

  const formulaire = useForm<V>({
    defaultValues: (initial ? valeursDepuis(initial) : options.valeursVides()) as DefaultValues<V>,
    resolver: zodResolver(schema as never) as unknown as Resolver<V>,
  })
  const { formState, getValues, handleSubmit, reset, setError } = formulaire

  // Premier enregistrement : l'adresse devient celle du contenu, après le rendu où le
  // formulaire est redevenu propre (sinon l'avertissement de sortie bloquerait ce changement).
  const nouveauId = !initial && contenu ? contenu.id : null
  useEffect(() => {
    if (!nouveauId) return
    surCree?.(nouveauId)
    void navigate(`${chemin}/${nouveauId}`, { replace: true })
  }, [nouveauId, navigate, surCree, chemin])

  const objet = contenu
    ? { statut: contenu.statut, ...(contenu.createurId ? { createurId: contenu.createurId } : {}) }
    : undefined
  const modifiable = contenu
    ? peut(compte, 'modifier', ressource, objet)
    : peut(compte, 'creer', ressource)
  const etatEnregistrement: EtatEnregistrement = enregistrant
    ? 'en_cours'
    : enregistrement === 'erreur'
      ? 'erreur'
      : formState.isDirty || !contenu
        ? 'modifie'
        : 'enregistre'

  /** Le serveur a renvoyé une nouvelle version : fiche, cache et formulaire suivent. */
  const appliquer = (suivant: C) => {
    setContenu(suivant)
    client.setQueryData(cle(suivant.id), suivant)
    reset(valeursDepuis(suivant))
  }

  /**
   * Nouvelle lecture sans toucher au formulaire : une écriture annexe (variante d'un bijou) ne
   * change pas la version du contenu, et ne doit pas effacer une saisie en cours (B-41).
   */
  const rafraichir = (suivant: C) => {
    setContenu(suivant)
    client.setQueryData(cle(suivant.id), suivant)
  }

  /** Conflit de version : reprend la version du serveur ; la saisie locale est remplacée. */
  const recharger = async () => {
    if (!contenu) return
    await client.refetchQueries({ queryKey: cle(contenu.id), exact: true })
    const frais = client.getQueryData<C>(cle(contenu.id))
    if (frais) appliquer(frais)
    setConflit(false)
    setEnregistrement('enregistre')
  }

  async function enregistrer(valeurs: V, silencieux = false): Promise<C | null> {
    setEnregistrant(true)
    setSuggestion(null)
    setOrphelines([])
    try {
      const resultat = contenu
        ? await options.modifier(valeurs, contenu)
        : await options.creer(valeurs)
      appliquer(resultat)
      void client.invalidateQueries({ queryKey: [ressource, 'liste'] })
      setEnregistrement('enregistre')
      setEnregistreA(maintenantIso())
      if (!silencieux) notifier.succes(t('formulaire.enregistre'))
      return resultat
    } catch (erreur) {
      setEnregistrement('erreur')
      const restantes = rattacherErreursServeur(erreur, setError, champs)
      if (aLeCode(erreur, 'RG-04')) {
        const details = erreur.details as { suggestion?: unknown } | undefined
        if (typeof details?.suggestion === 'string' && erreur.champ) {
          setSuggestion({ champ: erreur.champ, valeur: details.suggestion })
        }
      }
      if (aLeCode(erreur, 'VERSION_PERIMEE')) {
        setConflit(true)
      } else if (restantes.length > 0 || !estErreurApi(erreur) || erreur.status !== 422) {
        if (!silencieux) {
          notifier.erreur(
            messageErreur(erreur),
            estErreurApi(erreur) ? erreur.requeteId : undefined,
          )
        }
        setOrphelines(restantes)
      }
      setTentative((n) => n + 1)
      return null
    } finally {
      setEnregistrant(false)
    }
  }

  const soumettre = handleSubmit(
    (valeurs) => enregistrer(valeurs),
    () => setTentative((n) => n + 1),
  )

  /** Enregistre si nécessaire avant une transition : on publie ce qu'on voit. */
  const preparer = () =>
    new Promise<C | null>((resoudre) => {
      if (contenu && !formState.isDirty) {
        resoudre(contenu)
        return
      }
      void handleSubmit(
        async (valeurs) => resoudre(await enregistrer(valeurs, true)),
        () => {
          setTentative((n) => n + 1)
          resoudre(null)
        },
      )()
    })

  const cycle = useCycleContenu<C>({
    ressource,
    transition: options.transition,
    preparer,
    surContenu: appliquer,
  })

  // Les manques du serveur ouvrent le résumé d'erreurs (RG-03) : ajustement pendant le rendu.
  const [manquantsVus, setManquantsVus] = useState(cycle.manquants)
  if (manquantsVus !== cycle.manquants) {
    setManquantsVus(cycle.manquants)
    if (cycle.manquants.length > 0) setTentative((n) => n + 1)
  }

  // Brouillon automatique (section 9) : seulement un brouillon modifié, valide, modifiable.
  const etat = useRef({ contenu, dirty: formState.isDirty, enregistrant, modifiable, enregistrer })
  useEffect(() => {
    etat.current = { contenu, dirty: formState.isDirty, enregistrant, modifiable, enregistrer }
  })
  useEffect(() => {
    const minuterie = setInterval(() => {
      const courant = etat.current
      if (!courant.contenu || courant.contenu.statut !== 'brouillon' || !courant.dirty) return
      if (courant.enregistrant || !courant.modifiable) return
      if (schema.safeParse(getValues()).success) void courant.enregistrer(getValues(), true)
    }, AUTOMATIQUE_MS)
    return () => clearInterval(minuterie)
  }, [getValues, schema])

  const action = (choisie: ActionStatut) => {
    if (choisie === 'refuser') {
      setRefus(true)
      return
    }
    const date =
      choisie === 'publier' && programmeLe
        ? new Date(`${programmeLe}:00Z`).toISOString()
        : undefined
    void cycle.executer(choisie, date ? { programmeLe: date } : {}).then((ok) => {
      if (ok && choisie === 'publier') setProgrammeLe('')
    })
  }

  return {
    ressource,
    formulaire,
    contenu,
    appliquer,
    rafraichir,
    modifiable,
    admin: peut(compte, 'publier', ressource),
    etatEnregistrement,
    enregistreA,
    conflit,
    fermerConflit: () => setConflit(false),
    recharger,
    enregistrant,
    soumettre,
    suggestion,
    effacerSuggestion: () => setSuggestion(null),
    orphelines,
    tentative,
    cycle,
    action,
    refus,
    setRefus,
    programmeLe,
    setProgrammeLe,
  }
}

export type Editeur<C extends ContenuEditable, V extends FieldValues> = ReturnType<
  typeof useEditeurContenu<C, V>
>
