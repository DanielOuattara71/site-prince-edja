import {
  Award,
  Clapperboard,
  Gem,
  Images,
  Inbox,
  LayoutDashboard,
  Newspaper,
  Settings,
  Wrench,
  type LucideIcon,
} from 'lucide-react'
import { peut, type Action, type CompteDroits, type Ressource } from '@/auth/permissions'
import { t, type CleTraduction } from '@/i18n/fr'

/**
 * Menu de l'administration : neuf entrées, déclarées **ici seulement** (PROMPT-CORRECTION
 * § 5.1, ECRANS-ADMIN § 0.1). La barre latérale, le tiroir mobile, la barre d'onglets
 * (`GroupeEcrans`) et les routes lisent tous ce fichier.
 *
 * Chaque onglet déclare la ressource et l'action qui le rendent visible : le filtre passe par
 * `peut()`, jamais par un test de rôle écrit ici. Un onglet refusé n'est pas affiché ; une
 * entrée sans onglet visible non plus. `visibilite` ajoute une condition propre à l'entrée
 * (ex. la Boîte de réception reste hors de l'espace vendeur, ECRANS § 0.5).
 *
 * Les adresses des écrans ne changent pas : une entrée pointe vers son premier onglet visible.
 */
export interface Onglet {
  libelle: string
  chemin: string
  ressource: Ressource
  action: Action
}

/** Quatre blocs du menu (U1) ; le tableau de bord est au-dessus, hors bloc. */
export type BlocMenu = 'contenus' | 'boutique' | 'public' | 'reglages'

export interface EntreeMenu {
  cle: string
  libelle: string
  icone: LucideIcon
  bloc: BlocMenu | null
  onglets: Onglet[]
  /** Faux pour une entrée sans barre d'onglets (Journal, hub Projets, tableau de bord). */
  barreOnglets: boolean
  visibilite?: { ressource: Ressource; action: Action }
}

const onglet = (
  cle: CleTraduction,
  chemin: string,
  ressource: Ressource,
  action: Action = 'lire',
): Onglet => ({ libelle: t(cle), chemin, ressource, action })

export const MENU: EntreeMenu[] = [
  {
    cle: 'tableau-de-bord',
    libelle: t('menu.tableauDeBord'),
    icone: LayoutDashboard,
    bloc: null,
    barreOnglets: false,
    onglets: [onglet('menu.tableauDeBord', '/', 'tableau-de-bord')],
  },
  {
    cle: 'journal',
    libelle: t('menu.journal'),
    icone: Newspaper,
    bloc: 'contenus',
    barreOnglets: false,
    onglets: [onglet('menu.articles', '/articles', 'articles')],
  },
  {
    // Hub (ECRANS § 3.1) : pas de barre d'onglets, les listes s'ouvrent depuis les cartes.
    cle: 'projets',
    libelle: t('menu.projets'),
    icone: Clapperboard,
    bloc: 'contenus',
    barreOnglets: false,
    visibilite: { ressource: 'projets', action: 'lire' },
    onglets: [
      onglet('menu.projets', '/projets', 'projets'),
      onglet('menu.episodes', '/episodes', 'episodes'),
      onglet('menu.destinations', '/destinations', 'destinations'),
      onglet('menu.guides', '/guides', 'medias'),
      onglet('menu.villes', '/villes', 'villes'),
      onglet('menu.archive', '/archive', 'archive'),
    ],
  },
  {
    cle: 'boutique',
    libelle: t('menu.boutique'),
    icone: Gem,
    bloc: 'boutique',
    barreOnglets: true,
    onglets: [
      onglet('menu.bijoux', '/bijoux', 'bijoux'),
      onglet('menu.livres', '/livres', 'livres'),
      onglet('menu.categories', '/categories', 'categories', 'modifier'),
      // `creer` : réservé aux admins ; masqué pour l'éditeur et le vendeur (ECRANS § 4).
      onglet('menu.createurs', '/createurs', 'createurs', 'creer'),
    ],
  },
  {
    cle: 'mediatheque',
    libelle: t('menu.mediatheque'),
    icone: Images,
    bloc: 'public',
    barreOnglets: true,
    onglets: [
      onglet('menu.tousFichiers', '/medias', 'medias'),
      onglet('menu.surLeSite', '/galerie', 'galerie'),
    ],
  },
  {
    cle: 'preuves',
    libelle: t('menu.preuves'),
    icone: Award,
    bloc: 'public',
    barreOnglets: true,
    onglets: [
      onglet('menu.audience', '/audience', 'audience'),
      onglet('menu.distinctions', '/distinctions', 'distinctions'),
      onglet('menu.presse', '/presse', 'presse'),
      onglet('menu.partenaires', '/partenaires', 'partenaires'),
    ],
  },
  {
    cle: 'reception',
    libelle: t('menu.reception'),
    icone: Inbox,
    bloc: 'public',
    barreOnglets: true,
    visibilite: { ressource: 'messages', action: 'lire' },
    onglets: [
      onglet('menu.messages', '/messages', 'messages'),
      onglet('menu.demandes', '/demandes', 'demandes'),
      onglet('menu.abonnes', '/abonnes', 'abonnes'),
    ],
  },
  {
    cle: 'reglages',
    libelle: t('menu.reglages'),
    icone: Settings,
    bloc: 'reglages',
    barreOnglets: true,
    visibilite: { ressource: 'parametres', action: 'lire' },
    onglets: [
      onglet('menu.parametres', '/parametres', 'parametres'),
      onglet('menu.pagesLegales', '/pages-legales', 'pages-legales', 'modifier'),
      onglet('menu.tags', '/tags', 'tags', 'creer'),
    ],
  },
  {
    cle: 'technique',
    libelle: t('menu.technique'),
    icone: Wrench,
    bloc: 'reglages',
    barreOnglets: true,
    onglets: [
      onglet('menu.publication', '/publication', 'site', 'reconstruire'),
      onglet('menu.activite', '/activite', 'journal'),
      onglet('menu.comptes', '/comptes', 'comptes'),
    ],
  },
]

export const BLOCS: BlocMenu[] = ['contenus', 'boutique', 'public', 'reglages']

/** Tous les onglets, à plat (routes, liens vers une ressource). */
export const ONGLETS: Onglet[] = MENU.flatMap((entree) => entree.onglets)

/** Onglet d'une ressource (lien « utilisé dans » de la médiathèque). */
export function cheminDeRessource(ressource: string): string | undefined {
  return ONGLETS.find((o) => o.ressource === ressource)?.chemin
}

export interface EntreeVisible extends EntreeMenu {
  /** Onglets que ce compte peut ouvrir ; le premier donne l'adresse de l'entrée. */
  visibles: Onglet[]
  chemin: string
}

/** Entrées du menu que ce compte voit, avec leurs onglets visibles. */
export function entreesVisibles(compte: CompteDroits | null | undefined): EntreeVisible[] {
  return MENU.flatMap((entree) => {
    if (entree.visibilite && !peut(compte, entree.visibilite.action, entree.visibilite.ressource))
      return []
    const visibles = entree.onglets.filter((o) => peut(compte, o.action, o.ressource))
    const premier = visibles[0]
    return premier ? [{ ...entree, visibles, chemin: premier.chemin }] : []
  })
}

/** Un chemin appartient à un onglet s'il est cet onglet ou l'une de ses pages (`/bijoux/12`). */
export function dansOnglet(chemin: string, pathname: string): boolean {
  if (chemin === '/') return pathname === '/'
  return pathname === chemin || pathname.startsWith(`${chemin}/`)
}

/** Entrée du menu qui contient cette adresse (pour surligner l'entrée et ses onglets). */
export function entreeDe(pathname: string): EntreeMenu | undefined {
  return MENU.find((entree) => entree.onglets.some((o) => dansOnglet(o.chemin, pathname)))
}
