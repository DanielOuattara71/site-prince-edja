import type { Action, Ressource } from '@/auth/permissions'
import { t, type CleTraduction } from '@/i18n/fr'

/**
 * Menu de l'administration : une seule source pour la barre latérale, le tiroir mobile et
 * les routes. Chaque entrée déclare la ressource et l'action qui la rendent visibles :
 * le filtre passe par `peut()`, jamais par un test de rôle écrit ici (section 8).
 *
 * `etape` = étape du prompt admin qui livre l'écran ; avant elle, la route affiche
 * « écran en préparation ». Adresses : section 9 du prompt (décision D-06).
 */
export interface EntreeMenu {
  libelle: string
  chemin: string
  ressource: Ressource
  action: Action
  etape: number
}

export interface GroupeMenu {
  titre: string
  entrees: EntreeMenu[]
}

function entree(
  cle: CleTraduction,
  chemin: string,
  ressource: Ressource,
  etape: number,
  action: Action = 'lire',
): EntreeMenu {
  return { libelle: t(cle), chemin, ressource, action, etape }
}

export const MENU: GroupeMenu[] = [
  {
    titre: t('menu.groupe.contenus'),
    entrees: [
      entree('menu.articles', '/articles', 'articles', 4),
      entree('menu.episodes', '/episodes', 'episodes', 6),
      entree('menu.projets', '/projets', 'projets', 6),
      entree('menu.villes', '/villes', 'villes', 6),
      entree('menu.destinations', '/destinations', 'destinations', 6),
      entree('menu.archive', '/archive', 'archive', 7),
      entree('menu.distinctions', '/distinctions', 'distinctions', 7),
      entree('menu.presse', '/presse', 'presse', 7),
      entree('menu.galerie', '/galerie', 'galerie', 7),
      entree('menu.univers', '/univers', 'univers', 7),
      entree('menu.jalons', '/jalons', 'jalons', 7),
      entree('menu.offres', '/offres', 'offres', 7),
      entree('menu.etudesCas', '/etudes-cas', 'etudes-cas', 7),
      entree('menu.partenaires', '/partenaires', 'partenaires', 7),
      entree('menu.pages', '/pages', 'pages', 7),
    ],
  },
  {
    titre: t('menu.groupe.boutique'),
    entrees: [
      entree('menu.bijoux', '/bijoux', 'bijoux', 6),
      entree('menu.categories', '/categories', 'categories', 6, 'modifier'),
      entree('menu.createurs', '/createurs', 'createurs', 6, 'modifier'),
    ],
  },
  {
    titre: t('menu.groupe.bibliotheque'),
    entrees: [
      entree('menu.medias', '/medias', 'medias', 5),
      entree('menu.tags', '/tags', 'tags', 7, 'creer'),
    ],
  },
  {
    titre: t('menu.groupe.public'),
    entrees: [
      entree('menu.messages', '/messages', 'messages', 8),
      entree('menu.demandes', '/demandes', 'demandes', 8),
      entree('menu.abonnes', '/abonnes', 'abonnes', 8),
    ],
  },
  {
    titre: t('menu.groupe.reglages'),
    entrees: [
      entree('menu.parametres', '/parametres', 'parametres', 8),
      entree('menu.audience', '/audience', 'audience', 8),
      entree('menu.navigation', '/navigation', 'navigation', 8),
      entree('menu.textesInterface', '/textes-interface', 'textes-interface', 8),
      entree('menu.motifsContact', '/motifs-contact', 'motifs-contact', 8),
      entree('menu.pagesLegales', '/pages-legales', 'pages-legales', 8, 'modifier'),
    ],
  },
  {
    titre: t('menu.groupe.technique'),
    entrees: [
      entree('menu.publication', '/publication', 'site', 9, 'reconstruire'),
      entree('menu.journal', '/journal', 'journal', 9),
      entree('menu.comptes', '/comptes', 'comptes', 9),
    ],
  },
]

export const ENTREES_MENU: EntreeMenu[] = MENU.flatMap((groupe) => groupe.entrees)
