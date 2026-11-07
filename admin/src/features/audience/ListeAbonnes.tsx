import { abonnes } from '@/api/endpoints/audience'
import type { Abonne, StatutAbonne } from '@/api/schemas/audience'
import { peut } from '@/auth/permissions'
import type { Colonne } from '@/components/listes/TableauDonnees'
import { ListePage } from '@/features/gabarits/ListePage'
import { t, type CleTraduction } from '@/i18n/fr'
import type { Page, ParametresListe } from '@/api/schemas/communs'
import { formaterDate } from '@/lib/dates'

/** Une ligne de liste : l'abonné, avec son titre d'affichage. */
export type LigneAbonne = Abonne & { titre: string }

const COLONNES: Colonne<LigneAbonne>[] = [
  {
    id: 'abonne',
    entete: t('liste.abonne'),
    principale: true,
    cellule: (a) => (
      <div className="min-w-0">
        <p className="truncate font-semibold text-ink-900">{a.prenom ?? a.email}</p>
        <p className="truncate text-caption text-ink-500">{a.email}</p>
      </div>
    ),
  },
  {
    id: 'statut',
    entete: t('liste.statut'),
    cellule: (a) => (
      <span className="font-semibold text-ink-900">{t(`statut.${a.statut}` as CleTraduction)}</span>
    ),
  },
  {
    id: 'confirmeLe',
    entete: t('liste.modifieLe'),
    tri: 'creeLe',
    cellule: (a) => formaterDate(a.creeLe),
  },
]

export default function ListeAbonnes() {
  const charger = async (parametres: ParametresListe): Promise<Page<LigneAbonne>> => {
    const page = await abonnes.lister({
      page: parametres.page,
      pageSize: parametres.pageSize,
      statut: parametres.statut as StatutAbonne | undefined,
      q: parametres.q,
    })
    return { ...page, items: page.items.map((a) => ({ ...a, titre: a.prenom ?? a.email })) }
  }

  const exporter = async (parametres: ParametresListe): Promise<string> => {
    const reponse = await abonnes.exporterAbonnes({
      page: parametres.page,
      pageSize: parametres.pageSize,
      q: parametres.q,
      statut: parametres.statut as StatutAbonne | undefined,
    })
    return reponse
  }

  return (
    <ListePage<LigneAbonne>
      titre={t('menu.abonnes')}
      ressource="abonnes"
      colonnes={COLONNES}
      charger={charger}
      triParDefaut="-creeLe"
      statuts={['en_attente', 'actif', 'desabonne']}
      actionsGroupees={[
        {
          id: 'supprimer',
          libelle: t('liste.supprimer'),
          danger: true,
          autorisee: (compte) => peut(compte, 'supprimer', 'abonnes'),
          executer: (a) => abonnes.supprimer(a.id),
          confirmation: {
            titre: t('liste.supprimerTitre'),
            consequence: t('liste.supprimerTexte'),
          },
        },
      ]}
      exporter={exporter}
    />
  )
}
