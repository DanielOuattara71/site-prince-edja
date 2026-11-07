import type { Compte, Role, StatutContenu } from '@/api/schemas/communs'

/**
 * `peut(compte, action, ressource, objet?)` — le seul endroit où un rôle est testé
 * (section 12 du prompt admin). Reflet du tableau de droits de `docs/CONTRAT-API.md` § 5 :
 * le serveur fait foi, l'interface ne propose jamais une action qu'il refuserait.
 *
 * Sans `objet`, la fonction répond à « ce rôle peut-il, en général, faire cela ? » (menus,
 * boutons de création). Avec un objet, elle tient compte de son statut et de son créateur.
 */

export type Action =
  | 'lire'
  | 'creer'
  | 'modifier'
  | 'supprimer'
  | 'soumettre'
  | 'publier'
  | 'refuser'
  | 'depublier'
  | 'archiver'
  | 'desarchiver'
  | 'ordonner'
  | 'restaurer'
  | 'confirmer_prix'
  | 'exporter'
  | 'modifier_hero'
  | 'basculer_interrupteur'
  | 'reconstruire'

/** Ressources soumises au cycle de vie éditorial (§ 7.1). */
export const RESSOURCES_CONTENU = [
  'articles',
  'episodes',
  'projets',
  'villes',
  'destinations',
  'archive',
  'distinctions',
  'presse',
  'galerie',
  'univers',
  'jalons',
  'offres',
  'etudes-cas',
  'partenaires',
  'pages',
  'pages-legales',
  'bijoux',
  'createurs',
  'livres',
] as const
export type RessourceContenu = (typeof RESSOURCES_CONTENU)[number]

export type Ressource =
  | RessourceContenu
  | 'medias'
  | 'tags'
  | 'categories'
  | 'messages'
  | 'demandes'
  | 'abonnes'
  | 'identite'
  | 'audience'
  | 'parametres'
  | 'navigation'
  | 'textes-interface'
  | 'motifs-contact'
  | 'site'
  | 'journal'
  | 'comptes'
  | 'tableau-de-bord'
  /** Photos fixes du site (PROMPT-CORRECTION § 7.3) : lecture équipe, modification admin (E4). */
  | 'emplacements-photos'

/** Ce que `peut` lit d'un objet. Tous les champs sont facultatifs. */
export interface ObjetCible {
  id?: string
  statut?: StatutContenu | null
  createurId?: string | null
  /** Pour les comptes : le rôle du compte visé, ou du compte à créer. */
  role?: Role
}

export type CompteDroits = Pick<Compte, 'id' | 'role' | 'actif' | 'createurId'>

const RANG: Record<Exclude<Role, 'vendeur'>, number> = { editeur: 1, admin: 2, super_admin: 3 }

/** Ressources qu'un vendeur peut atteindre, et seulement pour son créateur (RG-22). */
const RESSOURCES_VENDEUR: readonly Ressource[] = [
  'bijoux',
  'medias',
  'createurs',
  'demandes',
  'livres',
]

/** Transitions réservées aux admins (RG-02, § 7.3). */
const ACTIONS_ADMIN_CONTENU: readonly Action[] = [
  'publier',
  'refuser',
  'depublier',
  'archiver',
  'desarchiver',
  'supprimer',
  'restaurer',
]

/** Réglages, audience et boîtes de réception : admin et plus (§ 5). */
const RESSOURCES_ADMIN: readonly Ressource[] = [
  'tags',
  'categories',
  'messages',
  'demandes',
  'abonnes',
  'identite',
  'audience',
  'parametres',
  'navigation',
  'textes-interface',
  'motifs-contact',
]

function estContenu(ressource: Ressource): ressource is RessourceContenu {
  return (RESSOURCES_CONTENU as readonly string[]).includes(ressource)
}

export function peut(
  compte: CompteDroits | null | undefined,
  action: Action,
  ressource: Ressource,
  objet?: ObjetCible,
): boolean {
  if (!compte || !compte.actif) return false
  if (compte.role === 'vendeur') return peutVendeur(compte, action, ressource, objet)

  const rang = RANG[compte.role]
  const admin = rang >= RANG.admin
  const superAdmin = rang >= RANG.super_admin

  switch (ressource) {
    case 'tableau-de-bord':
      return action === 'lire'

    case 'medias':
      if (action === 'lire' || action === 'creer' || action === 'modifier') return true
      return action === 'supprimer' && admin

    case 'emplacements-photos':
      // Un éditeur consulte ; seul un administrateur change une photo fixe (ECRANS E4, par défaut).
      if (action === 'lire') return true
      return action === 'modifier' && admin

    case 'site':
      if (action === 'lire') return true
      return action === 'reconstruire' && admin

    case 'journal':
      if (action === 'lire') return admin
      return action === 'exporter' && superAdmin

    case 'comptes':
      return peutSurCompte(compte, rang, action, objet)

    case 'parametres':
      if (action === 'basculer_interrupteur') return superAdmin
      return (action === 'lire' || action === 'modifier') && admin

    case 'identite':
      if (action === 'modifier_hero') return admin
      return (action === 'lire' || action === 'modifier' || action === 'restaurer') && admin

    default:
      break
  }

  // Les éditeurs lisent les tags, les catégories et les créateurs pour les choisir.
  if ((ressource === 'tags' || ressource === 'categories') && action === 'lire') return true
  if ((RESSOURCES_ADMIN as readonly string[]).includes(ressource)) return admin

  if (estContenu(ressource)) return peutSurContenu(admin, action, ressource, objet)
  return false
}

function peutSurContenu(
  admin: boolean,
  action: Action,
  ressource: RessourceContenu,
  objet: ObjetCible | undefined,
): boolean {
  // Créateurs : les éditeurs les lisent (sélecteur), seuls les admins les gèrent (§ 5).
  if (ressource === 'createurs' && action !== 'lire') return admin
  // Pages fixes et pages légales : ensembles fermés, ni créées ni supprimées (§ 9.15).
  if ((ressource === 'pages' || ressource === 'pages-legales') && action === 'creer') return false
  if ((ressource === 'pages' || ressource === 'pages-legales') && action === 'supprimer') {
    return false
  }

  switch (action) {
    case 'lire':
    case 'creer':
    case 'soumettre':
      return true
    case 'modifier':
      // Un éditeur ne modifie qu'un brouillon ; un contenu archivé se désarchive d'abord (§ 7.4).
      if (objet?.statut === 'archive') return false
      return admin || objet?.statut === undefined || objet.statut === 'brouillon'
    case 'ordonner':
      return admin
    case 'confirmer_prix':
      return admin && (ressource === 'bijoux' || ressource === 'livres')
    default:
      return admin && ACTIONS_ADMIN_CONTENU.includes(action)
  }
}

function peutSurCompte(
  compte: CompteDroits,
  rang: number,
  action: Action,
  objet: ObjetCible | undefined,
): boolean {
  if (rang < RANG.admin) return false
  if (action === 'lire') return true
  if (action !== 'creer' && action !== 'modifier') return false
  // Un admin ne gère que des comptes éditeur ; seul un super-admin gère les admins (RG-16).
  if (rang < RANG.super_admin && objet?.role !== undefined && objet.role !== 'editeur') {
    return false
  }
  // Personne ne modifie son propre rôle ni ne se désactive : le profil passe ailleurs (RG-16).
  if (action === 'modifier' && objet?.id === compte.id) return false
  // Pas de compte vendeur dans cette version (§ 17).
  return objet?.role !== 'vendeur'
}

function peutVendeur(
  compte: CompteDroits,
  action: Action,
  ressource: Ressource,
  objet: ObjetCible | undefined,
): boolean {
  if (!compte.createurId || !RESSOURCES_VENDEUR.includes(ressource)) return false
  if (objet?.createurId !== undefined && objet.createurId !== compte.createurId) return false

  // Le vendeur ne publie jamais (RG-23) et ne gère que sa page créateur.
  const autorisees: readonly Action[] =
    ressource === 'createurs'
      ? ['lire', 'modifier', 'soumettre']
      : ressource === 'demandes'
        ? ['lire', 'modifier']
        : ['lire', 'creer', 'modifier', 'soumettre']
  if (!autorisees.includes(action)) return false
  // Un produit publié reste modifiable : le serveur le renvoie en relecture (RG-23).
  if (action === 'modifier' && objet?.statut !== undefined && objet.statut !== null) {
    return objet.statut === 'brouillon' || objet.statut === 'publie'
  }
  return true
}
