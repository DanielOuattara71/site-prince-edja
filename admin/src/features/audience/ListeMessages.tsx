import { useState } from 'react'
import { messages } from '@/api/endpoints/audience'
import type { Message, StatutMessage } from '@/api/schemas/audience'
import { peut } from '@/auth/permissions'
import type { Colonne } from '@/components/listes/TableauDonnees'
import { ListePage } from '@/features/gabarits/ListePage'
import FicheMessage from '@/features/audience/FicheMessage'
import { t, type CleTraduction } from '@/i18n/fr'
import type { Page, ParametresListe } from '@/api/schemas/communs'
import { formaterDate } from '@/lib/dates'

/**
 * Écran `/messages` — boîte de réception (contrat § 12.1) : les messages et les demandes de
 * contact / de collaboration arrivent ici. La liste porte le statut, la pièce lue et la date ;
 * les notes internes et le passage de statut passent par la modification.
 */

/** Une ligne de liste : l'objet de l'audience, avec son titre d'affichage. */
export type LigneMessage = Message & { titre: string }

const COLONNES: Colonne<LigneMessage>[] = [
  {
    id: 'message',
    entete: t('liste.message'),
    principale: true,
    cellule: (m) => (
      <div className="min-w-0">
        <p className="truncate font-semibold text-ink-900">{m.nom ?? m.email}</p>
        <p className="truncate text-caption text-ink-500">{m.email}</p>
        {m.message ? <p className="truncate text-body text-ink-700">{m.message}</p> : null}
      </div>
    ),
  },
  {
    id: 'statut',
    entete: t('liste.statut'),
    cellule: (m) => (
      <span className="font-semibold text-ink-900">{t(`statut.${m.statut}` as CleTraduction)}</span>
    ),
  },
  {
    id: 'creeLe',
    entete: t('liste.modifieLe'),
    tri: 'creeLe',
    cellule: (m) => formaterDate(m.creeLe),
  },
]

/** La cellule « message » ouvre le panneau ; définie en dehors du composant (props explicites). */
function CelluleMessage({
  m,
  surOuvrir,
}: {
  m: LigneMessage
  surOuvrir: (m: LigneMessage) => void
}) {
  return (
    <button
      type="button"
      onClick={() => surOuvrir(m)}
      className="block w-full rounded-md text-left transition-colors duration-(--d-fast) hover:bg-sand-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clay-600"
      aria-label={`${t('messages.ouvrir')} : ${m.nom ?? m.email}`}
    >
      <p className="truncate font-semibold text-ink-900">{m.nom ?? m.email}</p>
      <p className="truncate text-caption text-ink-500">{m.email}</p>
      {m.message ? <p className="truncate text-body text-ink-700">{m.message}</p> : null}
    </button>
  )
}

export default function ListeMessages() {
  const [messageOuvert, setMessageOuvert] = useState<LigneMessage | null>(null)
  const charger = async (parametres: ParametresListe): Promise<Page<LigneMessage>> => {
    const page = await messages.lister({
      page: parametres.page,
      pageSize: parametres.pageSize,
      tri: parametres.tri as '-creeLe' | undefined,
      q: parametres.q,
      statut: parametres.statut as StatutMessage | undefined,
    })
    return { ...page, items: page.items.map((m) => ({ ...m, titre: m.nom ?? m.email })) }
  }

  const colonnes: Colonne<LigneMessage>[] = COLONNES.map((colonne) =>
    colonne.id === 'message'
      ? {
          ...colonne,
          cellule: (m) => CelluleMessage({ m, surOuvrir: setMessageOuvert }),
        }
      : colonne,
  )

  return (
    <>
      <ListePage<LigneMessage>
        titre={t('menu.messages')}
        ressource="messages"
        colonnes={colonnes}
        charger={charger}
        triParDefaut="-creeLe"
        statuts={['non_lu', 'lu', 'traite', 'archive']}
        actionsGroupees={[
          {
            id: 'supprimer',
            libelle: t('liste.supprimer'),
            danger: true,
            autorisee: (compte) => peut(compte, 'supprimer', 'messages'),
            executer: (m) => messages.supprimer(m.id, m.version),
            confirmation: {
              titre: t('liste.supprimerTitre'),
              consequence: t('liste.supprimerTexte'),
            },
          },
        ]}
      />
      {messageOuvert ? (
        <FicheMessage message={messageOuvert} surFermer={() => setMessageOuvert(null)} />
      ) : null}
    </>
  )
}
