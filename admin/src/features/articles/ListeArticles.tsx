import { Link } from 'react-router'
import { articles } from '@/api/endpoints/contenus'
import type { ResumeContenu } from '@/api/schemas/communs'
import { peut } from '@/auth/permissions'
import type { Colonne } from '@/components/listes/TableauDonnees'
import { CLASSES_LIEN } from '@/components/ui/classes'
import { IndicateurAFournir } from '@/components/ui/IndicateurAFournir'
import { PastilleStatut } from '@/components/ui/PastilleStatut'
import { ListePage } from '@/features/gabarits/ListePage'
import { t } from '@/i18n/fr'
import { formaterDate } from '@/lib/dates'
import { etatAffiche } from '@/lib/statuts'

/** Liste des articles : le gabarit de liste (section 9), décliné. */
const COLONNES: Colonne<ResumeContenu>[] = [
  {
    id: 'titre',
    entete: t('article.titre'),
    tri: 'titre',
    principale: true,
    cellule: (a) => (
      <Link to={`/articles/${a.id}`} className={CLASSES_LIEN}>
        {a.titre || t('article.sansTitre')}
      </Link>
    ),
  },
  {
    id: 'statut',
    entete: t('liste.statut'),
    cellule: (a) => (
      <span className="flex flex-wrap gap-1">
        {a.statut ? <PastilleStatut etat={etatAffiche(a.statut, a.publieLe)} /> : null}
        <IndicateurAFournir champs={a.champsAFournir} />
      </span>
    ),
  },
  {
    id: 'langues',
    entete: t('liste.langues'),
    masquable: true,
    cellule: (a) => (
      <span className="flex gap-1">
        {(['fr', 'en'] as const).map((langue) => (
          <span
            key={langue}
            className={
              a.languesPresentes.includes(langue)
                ? 'rounded-full border border-forest-900 px-2 text-caption font-semibold text-forest-900'
                : 'rounded-full border border-dashed border-sand-300 px-2 text-caption text-ink-500 line-through'
            }
          >
            <span className="sr-only">
              {a.languesPresentes.includes(langue)
                ? t('liste.traduitEn')
                : t('liste.nonTraduitEn')}{' '}
            </span>
            {langue.toUpperCase()}
          </span>
        ))}
      </span>
    ),
  },
  {
    id: 'auteur',
    entete: t('liste.auteur'),
    masquable: true,
    cellule: (a) => a.auteur?.nom ?? '—',
  },
  {
    id: 'modifieLe',
    entete: t('liste.modifieLe'),
    tri: 'modifieLe',
    masquable: true,
    cellule: (a) => formaterDate(a.modifieLe),
  },
]

export default function ListeArticles() {
  return (
    <ListePage
      titre={t('menu.articles')}
      ressource="articles"
      colonnes={COLONNES}
      charger={(parametres) => articles.lister(parametres)}
      creer={{ chemin: '/articles/nouveau', libelle: t('article.nouveau') }}
      actionsGroupees={[
        {
          id: 'supprimer',
          libelle: t('liste.supprimer'),
          danger: true,
          autorisee: (compte) => peut(compte, 'supprimer', 'articles'),
          executer: (a) => articles.supprimer(a.id, a.version),
          confirmation: {
            titre: t('liste.supprimerTitre'),
            consequence: t('liste.supprimerTexte'),
          },
        },
      ]}
    />
  )
}
