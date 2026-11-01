import { Link } from 'react-router'
import { createurs } from '@/api/endpoints/boutique'
import type { ResumeCreateur } from '@/api/schemas/createurs'
import { useSession } from '@/auth/contexte-session'
import { peut } from '@/auth/permissions'
import type { Colonne } from '@/components/listes/TableauDonnees'
import { CLASSES_LIEN } from '@/components/ui/classes'
import { IndicateurAFournir } from '@/components/ui/IndicateurAFournir'
import { PastilleStatut } from '@/components/ui/PastilleStatut'
import { ListePage } from '@/features/gabarits/ListePage'
import { t } from '@/i18n/fr'
import { formaterDate } from '@/lib/dates'
import { etatAffiche } from '@/lib/statuts'

/**
 * Créateurs (section 9, écran ajouté) : statut de la page, état opérationnel, nombre de
 * produits. Le principal porte la mention « Plateforme ».
 */
const COLONNES: Colonne<ResumeCreateur>[] = [
  {
    id: 'titre',
    entete: t('createurs.nom'),
    tri: 'nom',
    principale: true,
    cellule: (c) => (
      <span className="flex flex-wrap items-center gap-2">
        <Link to={`/createurs/${c.id}`} className={CLASSES_LIEN}>
          {c.titre}
        </Link>
        {c.estPrincipal ? (
          <span className="rounded-full border border-forest-900 px-2 text-caption font-semibold text-forest-900">
            {t('createur.plateforme')}
          </span>
        ) : null}
      </span>
    ),
  },
  {
    id: 'statut',
    entete: t('liste.statut'),
    cellule: (c) => (
      <span className="flex flex-wrap gap-1">
        {c.statut ? <PastilleStatut etat={etatAffiche(c.statut, c.publieLe)} /> : null}
        <IndicateurAFournir champs={c.champsAFournir} />
      </span>
    ),
  },
  {
    id: 'actif',
    entete: t('createurs.etat'),
    cellule: (c) => (c.actif ? t('createurs.actif') : t('createurs.inactif')),
  },
  {
    id: 'bijoux',
    entete: t('createurs.bijoux'),
    masquable: true,
    cellule: (c) => String(c.nombreBijoux ?? 0),
  },
  {
    id: 'modifieLe',
    entete: t('liste.modifieLe'),
    tri: 'modifieLe',
    masquable: true,
    cellule: (c) => formaterDate(c.modifieLe),
  },
]

export default function ListeCreateurs() {
  const { moi } = useSession()
  return (
    <ListePage
      titre={t('menu.createurs')}
      ressource="createurs"
      colonnes={COLONNES}
      avecTags={false}
      filtres={[
        {
          cle: 'actif',
          libelle: t('createurs.etat'),
          options: [
            { valeur: 'true', libelle: t('createurs.actif') },
            { valeur: 'false', libelle: t('createurs.inactif') },
          ],
        },
      ]}
      charger={(parametres, propres) => createurs.lister(parametres, undefined, propres)}
      creer={
        peut(moi?.compte, 'creer', 'createurs')
          ? { chemin: '/createurs/nouveau', libelle: t('createurs.nouveau') }
          : undefined
      }
    />
  )
}
