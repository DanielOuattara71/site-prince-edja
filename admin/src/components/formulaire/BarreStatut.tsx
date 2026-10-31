import { CircleAlert, CircleCheck, LoaderCircle, PencilLine } from 'lucide-react'
import type { StatutContenu } from '@/api/schemas/communs'
import { useSession } from '@/auth/contexte-session'
import { peut, type RessourceContenu } from '@/auth/permissions'
import { Bouton, type VarianteBouton } from '@/components/ui/Bouton'
import { IndicateurAFournir } from '@/components/ui/IndicateurAFournir'
import { PastilleStatut } from '@/components/ui/PastilleStatut'
import { t, type CleTraduction } from '@/i18n/fr'
import { formaterDateHeure } from '@/lib/dates'
import { ACTIONS_DEPUIS, etatAffiche, type ActionStatut } from '@/lib/statuts'

/**
 * Barre collée en bas d'un formulaire de contenu (section 10) : statut courant, date de
 * publication programmée (fuseau d'Abidjan, RG-05), état de l'enregistrement, et les seuls
 * boutons que `peut()` autorise (RG-01, RG-02). L'éditeur voit « Soumettre à relecture »,
 * jamais « Publier ». Les appels sont faits par l'écran, qui reçoit l'action choisie.
 *
 * @example
 * <BarreStatut ressource="articles" contenu={article} enregistrement={etat}
 *   surEnregistrer={enregistrer} surAction={(action) => transition(action)} />
 */
export type EtatEnregistrement = 'enregistre' | 'modifie' | 'en_cours' | 'erreur'

interface ContenuBarre {
  statut: StatutContenu
  publieLe: string | null
  champsAFournir: string[]
  createurId?: string | null | undefined
}

const VARIANTE: Record<ActionStatut, VarianteBouton> = {
  soumettre: 'primaire',
  publier: 'primaire',
  refuser: 'secondaire',
  depublier: 'secondaire',
  archiver: 'secondaire',
  desarchiver: 'secondaire',
}

const ICONE_ENREGISTREMENT = {
  enregistre: CircleCheck,
  modifie: PencilLine,
  en_cours: LoaderCircle,
  erreur: CircleAlert,
} as const

export function BarreStatut({
  ressource,
  contenu,
  enregistrement,
  surEnregistrer,
  surAction,
  actionEnCours = null,
}: {
  ressource: RessourceContenu
  /** `null` : contenu pas encore créé (seul « Enregistrer le brouillon » est proposé). */
  contenu: ContenuBarre | null
  enregistrement: EtatEnregistrement
  surEnregistrer: () => void
  surAction: (action: ActionStatut) => void
  actionEnCours?: ActionStatut | 'enregistrer' | null
}) {
  const { moi } = useSession()
  const compte = moi?.compte
  const objet = contenu
    ? { statut: contenu.statut, ...(contenu.createurId ? { createurId: contenu.createurId } : {}) }
    : undefined
  const etat = contenu ? etatAffiche(contenu.statut, contenu.publieLe) : 'brouillon'
  const peutEnregistrer = contenu
    ? peut(compte, 'modifier', ressource, objet)
    : peut(compte, 'creer', ressource)
  const actions = contenu
    ? ACTIONS_DEPUIS[contenu.statut].filter((action) => peut(compte, action, ressource, objet))
    : []
  const occupe = actionEnCours !== null || enregistrement === 'en_cours'
  const IconeEnregistrement = ICONE_ENREGISTREMENT[enregistrement]

  return (
    <div className="sticky bottom-0 z-20 -mx-4 mt-8 border-t border-sand-200 bg-sand-50/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <PastilleStatut etat={etat} />
          {contenu ? <IndicateurAFournir champs={contenu.champsAFournir} /> : null}
          {etat === 'programme' && contenu?.publieLe ? (
            <span className="text-caption text-ink-700">
              {t('barre.programmeLe')} {formaterDateHeure(contenu.publieLe)} ({t('barre.fuseau')})
            </span>
          ) : null}
          <output
            aria-live="polite"
            className="inline-flex items-center gap-1.5 text-caption text-ink-700"
          >
            <IconeEnregistrement
              aria-hidden
              className={
                enregistrement === 'en_cours'
                  ? 'size-4 animate-spin motion-reduce:animate-none'
                  : 'size-4'
              }
            />
            {t(`barre.enregistrement.${enregistrement}` as CleTraduction)}
          </output>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {peutEnregistrer ? (
            <Bouton
              variante={actions.length > 0 ? 'secondaire' : 'primaire'}
              onClick={surEnregistrer}
              disabled={occupe || enregistrement === 'enregistre'}
            >
              {actionEnCours === 'enregistrer'
                ? t('barre.enregistrementEnCours')
                : contenu
                  ? t('barre.enregistrer')
                  : t('barre.enregistrerBrouillon')}
            </Bouton>
          ) : null}
          {actions.map((action) => (
            <Bouton
              key={action}
              variante={VARIANTE[action]}
              onClick={() => surAction(action)}
              disabled={occupe}
            >
              {actionEnCours === action
                ? t('barre.actionEnCours')
                : t(`barre.action.${action}` as CleTraduction)}
            </Bouton>
          ))}
        </div>
      </div>
    </div>
  )
}
