import { demandes } from '@/api/endpoints/audience'
import type { Demande, StatutDemande } from '@/api/schemas/audience'
import { peut } from '@/auth/permissions'
import type { Colonne } from '@/components/listes/TableauDonnees'
import { ListePage } from '@/features/gabarits/ListePage'
import { t, type CleTraduction } from '@/i18n/fr'
import type { Page, ParametresListe } from '@/api/schemas/communs'
import { formaterDate } from '@/lib/dates'

/** Une ligne de liste : la demande, avec ses pièces et son titre d'affichage. */
export type LigneDemande = Demande & { titre: string }

const COLONNES: Colonne<LigneDemande>[] = [
  {
    id: 'demande',
    entete: t('liste.demande'),
    principale: true,
    cellule: (d) => (
      <div className="min-w-0">
        <p className="truncate font-semibold text-ink-900">{d.nom}</p>
        <p className="truncate text-caption text-ink-500">{d.email}</p>
        {d.lignes.length > 0 ? (
          <p className="truncate text-body text-ink-700">
            {d.lignes.map((l) => l.libelle).join(', ')}
          </p>
        ) : null}
      </div>
    ),
  },
  {
    id: 'statut',
    entete: t('liste.statut'),
    cellule: (d) => (
      <span className="font-semibold text-ink-900">{t(`statut.${d.statut}` as CleTraduction)}</span>
    ),
  },
  {
    id: 'creeLe',
    entete: t('liste.modifieLe'),
    tri: 'creeLe',
    cellule: (d) => formaterDate(d.creeLe),
  },
]

export default function ListeDemandes() {
  const charger = async (
    parametres: ParametresListe,
    propres: Record<string, string | undefined>,
  ): Promise<Page<LigneDemande>> => {
    const page = await demandes.lister({
      page: parametres.page,
      pageSize: parametres.pageSize,
      statut: parametres.statut as StatutDemande | undefined,
      createur: propres.createur,
      q: parametres.q,
    })
    return { ...page, items: page.items.map((d) => ({ ...d, titre: d.nom })) }
  }

  return (
    <ListePage<LigneDemande>
      titre={t('menu.demandes')}
      ressource="demandes"
      colonnes={COLONNES}
      charger={charger}
      triParDefaut="-creeLe"
      statuts={['nouvelle', 'en_cours', 'conclue', 'annulee']}
      filtreCreateur
      actionsGroupees={[
        {
          id: 'enCours',
          libelle: t('demande.actionEnCours'),
          autorisee: (compte) => peut(compte, 'modifier', 'demandes'),
          executer: async (d) => {
            if (d.statut !== 'nouvelle') {
              throw new Error('Seule une demande nouvelle peut être prise en charge.')
            }
            await demandes.modifier(d.id, { statut: 'en_cours', version: d.version })
          },
          confirmation: {
            titre: t('demande.actionEnCoursTitre'),
            consequence: t('demande.actionEnCoursTexte'),
          },
        },
      ]}
    />
  )
}
