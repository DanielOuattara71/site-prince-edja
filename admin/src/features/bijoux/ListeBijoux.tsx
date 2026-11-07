import { Link } from 'react-router'
import { bijoux } from '@/api/endpoints/boutique'
import type { ResumeBijou } from '@/api/schemas/boutique'
import { peut } from '@/auth/permissions'
import type { Colonne } from '@/components/listes/TableauDonnees'
import { CLASSES_LIEN } from '@/components/ui/classes'
import { IndicateurAFournir } from '@/components/ui/IndicateurAFournir'
import { PastilleStatut } from '@/components/ui/PastilleStatut'
import { ListePage } from '@/features/gabarits/ListePage'
import { useCategories } from '@/features/categories/useCategories'
import { t } from '@/i18n/fr'
import { formaterDate } from '@/lib/dates'
import { etatAffiche } from '@/lib/statuts'

/**
 * Liste des bijoux (section 9) : numéro, nom, statut, catégorie, prix confirmé ou « sur
 * demande ». Le filtre par créateur reste masqué tant que `multiVendeurs` est faux.
 */
function colonnesBijoux(nomsCategories: Map<string, string>): Colonne<ResumeBijou>[] {
  return [
    {
      id: 'numero',
      entete: t('bijou.numero'),
      tri: 'numero',
      cellule: (b) => b.numero,
    },
    {
      id: 'titre',
      entete: t('bijou.nom'),
      principale: true,
      cellule: (b) => (
        <Link to={`/bijoux/${b.id}`} className={CLASSES_LIEN}>
          {b.titre || t('bijou.sansNom')}
        </Link>
      ),
    },
    {
      id: 'statut',
      entete: t('liste.statut'),
      cellule: (b) => (
        <span className="flex flex-wrap gap-1">
          {b.statut ? <PastilleStatut etat={etatAffiche(b.statut, b.publieLe)} /> : null}
          <IndicateurAFournir champs={b.champsAFournir} />
        </span>
      ),
    },
    {
      id: 'categorie',
      entete: t('bijou.categorie'),
      masquable: true,
      cellule: (b) => nomsCategories.get(b.categorieId) ?? '—',
    },
    {
      id: 'prix',
      entete: t('bijou.prix'),
      masquable: true,
      cellule: (b) => (b.prixConfirme ? t('bijou.prixConfirme') : t('bijou.surDemande')),
    },
    {
      id: 'modifieLe',
      entete: t('liste.modifieLe'),
      tri: 'modifieLe',
      masquable: true,
      cellule: (b) => formaterDate(b.modifieLe),
    },
  ]
}

export default function ListeBijoux() {
  const listeCategories = useCategories('produit')
  const nomsCategories = new Map(
    (listeCategories.data?.items ?? []).map((c) => [
      c.id,
      c.traductions.fr?.nom ?? c.traductions.en?.nom ?? '',
    ]),
  )

  const colonnes = colonnesBijoux(nomsCategories)

  return (
    <ListePage
      titre={t('menu.bijoux')}
      ressource="bijoux"
      colonnes={colonnes}
      filtreCreateur
      filtres={[
        {
          cle: 'categorie',
          libelle: t('bijou.categorie'),
          options: [...nomsCategories].map(([valeur, libelle]) => ({ valeur, libelle })),
        },
        {
          cle: 'prixConfirme',
          libelle: t('bijou.prix'),
          options: [
            { valeur: 'true', libelle: t('bijou.prixConfirme') },
            { valeur: 'false', libelle: t('bijou.surDemande') },
          ],
        },
        {
          cle: 'visible',
          libelle: t('bijou.visible'),
          options: [
            { valeur: 'true', libelle: 'Oui' },
            { valeur: 'false', libelle: 'Non' },
          ],
        },
      ]}
      charger={(parametres, propres) => bijoux.lister(parametres, undefined, propres)}
      creer={{ chemin: '/bijoux/nouveau', libelle: t('bijou.nouveau') }}
      actionsGroupees={[
        {
          id: 'supprimer',
          libelle: t('liste.supprimer'),
          danger: true,
          autorisee: (compte) => peut(compte, 'supprimer', 'bijoux'),
          executer: (b) => bijoux.supprimer(b.id, b.version),
          confirmation: {
            titre: t('liste.supprimerTitre'),
            consequence: t('liste.supprimerTexte'),
          },
        },
      ]}
    />
  )
}
