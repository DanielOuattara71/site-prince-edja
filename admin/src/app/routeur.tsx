import type { ComponentType } from 'react'
import { createBrowserRouter, Outlet, type RouteObject } from 'react-router'
import { EnPreparation } from '@/app/EnPreparation'
import { VersActivite } from '@/app/VersActivite'
import { ErreurInattendue, Introuvable } from '@/app/pages-erreur'
import { RouteAutorisee, RouteProtegee, RoutePublique } from '@/auth/gardes'
import { Coque } from '@/components/layout/Coque'
import { GroupeEcrans } from '@/components/layout/GroupeEcrans'
import { ONGLETS, type Onglet } from '@/components/layout/navigation'
import { Squelette } from '@/components/ui/Squelette'

/** Une route par onglet du menu (le tableau de bord est la route d'index). */
const ROUTES_ONGLETS: Onglet[] = [
  ...new Map(ONGLETS.filter((o) => o.chemin !== '/').map((o) => [o.chemin, o])).values(),
]
/** Écrans livrés, par entrée du menu : liste, création, fiche (gabarit de la section 9). */
function ecransContenu(charger: {
  liste: () => Promise<{ default: ComponentType }>
  formulaire: () => Promise<{ default: ComponentType }>
}): RouteObject[] {
  return [
    { index: true, lazy: async () => ({ Component: (await charger.liste()).default }) },
    { path: 'nouveau', lazy: async () => ({ Component: (await charger.formulaire()).default }) },
    { path: ':id', lazy: async () => ({ Component: (await charger.formulaire()).default }) },
    { path: '*', element: <Introuvable /> },
  ]
}

/**
 * Écrans livrés, par adresse. Seules les adresses d'un onglet du menu deviennent des routes :
 * les écrans retirés en C2 (univers, jalons, offres, études de cas, pages, navigation, textes
 * d'interface, motifs de contact) restent déclarés ici, sans route, jusqu'à la décision C9.
 */
const ECRANS_LIVRES: Record<string, RouteObject[]> = {
  '/articles': ecransContenu({
    liste: () => import('@/features/articles/ListeArticles'),
    formulaire: () => import('@/features/articles/FormulaireArticle'),
  }),
  '/episodes': ecransContenu({
    liste: async () => ({ default: (await import('@/features/editorial/ecrans')).ListeEpisodes }),
    formulaire: async () => ({
      default: (await import('@/features/editorial/ecrans')).FormulaireEpisode,
    }),
  }),
  // Projets : le hub à la racine (ECRANS § 3.1), la liste un niveau plus bas.
  '/projets': [
    {
      index: true,
      lazy: async () => ({ Component: (await import('@/features/projets/HubProjets')).default }),
    },
    {
      path: 'liste',
      lazy: async () => ({
        Component: (await import('@/features/editorial/ecrans')).ListeProjets,
      }),
    },
    ...ecransContenu({
      liste: async () => ({ default: (await import('@/features/editorial/ecrans')).ListeProjets }),
      formulaire: async () => ({
        default: (await import('@/features/editorial/ecrans')).FormulaireProjet,
      }),
    }).slice(1),
  ],
  '/livres': ecransContenu({
    liste: async () => ({ default: (await import('@/features/editorial/ecrans')).ListeLivres }),
    formulaire: async () => ({
      default: (await import('@/features/editorial/ecrans')).FormulaireLivre,
    }),
  }),
  '/guides': [
    {
      index: true,
      lazy: async () => ({ Component: (await import('@/features/projets/GuidesPdf')).default }),
    },
    { path: '*', element: <Introuvable /> },
  ],
  '/villes': ecransContenu({
    liste: async () => ({ default: (await import('@/features/editorial/ecrans')).ListeVilles }),
    formulaire: async () => ({
      default: (await import('@/features/editorial/ecrans')).FormulaireVille,
    }),
  }),
  '/destinations': ecransContenu({
    liste: async () => ({
      default: (await import('@/features/editorial/ecrans')).ListeDestinations,
    }),
    formulaire: async () => ({
      default: (await import('@/features/editorial/ecrans')).FormulaireDestination,
    }),
  }),
  '/archive': ecransContenu({
    liste: async () => ({ default: (await import('@/features/editorial/ecrans')).ListeArchive }),
    formulaire: async () => ({
      default: (await import('@/features/editorial/ecrans')).FormulaireArchive,
    }),
  }),
  '/distinctions': ecransContenu({
    liste: async () => ({
      default: (await import('@/features/editorial/ecrans')).ListeDistinctions,
    }),
    formulaire: async () => ({
      default: (await import('@/features/editorial/ecrans')).FormulaireDistinctions,
    }),
  }),
  '/presse': ecransContenu({
    liste: async () => ({ default: (await import('@/features/editorial/ecrans')).ListePresse }),
    formulaire: async () => ({
      default: (await import('@/features/editorial/ecrans')).FormulairePresse,
    }),
  }),
  '/univers': ecransContenu({
    liste: async () => ({ default: (await import('@/features/editorial/ecrans')).ListeUnivers }),
    formulaire: async () => ({
      default: (await import('@/features/editorial/ecrans')).FormulaireUnivers,
    }),
  }),
  '/jalons': ecransContenu({
    liste: async () => ({ default: (await import('@/features/editorial/ecrans')).ListeJalons }),
    formulaire: async () => ({
      default: (await import('@/features/editorial/ecrans')).FormulaireJalons,
    }),
  }),
  '/offres': ecransContenu({
    liste: async () => ({ default: (await import('@/features/editorial/ecrans')).ListeOffres }),
    formulaire: async () => ({
      default: (await import('@/features/editorial/ecrans')).FormulaireOffres,
    }),
  }),
  // Pages fixes : ensemble fermé, pas d'écran « nouveau » (§ 9.15).
  '/pages': [
    {
      index: true,
      lazy: async () => ({ Component: (await import('@/features/editorial/ecrans')).ListePages }),
    },
    {
      path: ':id',
      lazy: async () => ({
        Component: (await import('@/features/editorial/ecrans')).FormulairePages,
      }),
    },
    { path: '*', element: <Introuvable /> },
  ],
  '/createurs': ecransContenu({
    liste: () => import('@/features/createurs/ListeCreateurs'),
    formulaire: () => import('@/features/createurs/FormulaireCreateur'),
  }),
  '/bijoux': ecransContenu({
    liste: () => import('@/features/bijoux/ListeBijoux'),
    formulaire: () => import('@/features/bijoux/FormulaireBijou'),
  }),
  // Catégories : un seul écran, liste ordonnable et dialogue de saisie.
  '/tags': [
    {
      index: true,
      lazy: async () => ({
        Component: (await import('@/features/tags/ListeTags')).default,
      }),
    },
    { path: '*', element: <Introuvable /> },
  ],
  '/categories': [
    {
      index: true,
      lazy: async () => ({
        Component: (await import('@/features/categories/Categories')).default,
      }),
    },
    { path: '*', element: <Introuvable /> },
  ],
  // Médiathèque : l'envoi se fait depuis la grille, il n'y a pas d'écran « nouveau ».
  '/medias': [
    {
      index: true,
      lazy: async () => ({
        Component: (await import('@/features/medias/Mediatheque')).default,
      }),
    },
    {
      path: ':id',
      lazy: async () => ({ Component: (await import('@/features/medias/FicheMedia')).default }),
    },
    { path: '*', element: <Introuvable /> },
  ],
  // Étape 8 — boîtes de réception et newsletter : listes opérationnelles, pas d'écran « nouveau ».
  '/messages': [
    {
      index: true,
      lazy: async () => ({
        Component: (await import('@/features/audience/ListeMessages')).default,
      }),
    },
  ],
  '/demandes': [
    {
      index: true,
      lazy: async () => ({
        Component: (await import('@/features/audience/ListeDemandes')).default,
      }),
    },
  ],
  '/abonnes': [
    {
      index: true,
      lazy: async () => ({
        Component: (await import('@/features/audience/ListeAbonnes')).default,
      }),
    },
  ],
  // Étape 9 — technique : publication, journal, comptes.
  '/publication': [
    {
      index: true,
      lazy: async () => ({
        Component: (await import('@/features/publication/SuiviSite')).default,
      }),
    },
    { path: '*', element: <Introuvable /> },
  ],
  '/activite': [
    {
      index: true,
      lazy: async () => ({
        Component: (await import('@/features/journal/ListeJournal')).default,
      }),
    },
    { path: '*', element: <Introuvable /> },
  ],
  '/comptes': [
    {
      index: true,
      lazy: async () => ({
        Component: (await import('@/features/comptes/ListeComptes')).default,
      }),
    },
    { path: '*', element: <Introuvable /> },
  ],
  // Lot 4 — familles éditoriales livrées (§ 9.9, § 9.13 à 9.16) : liste, création, fiche.
  // Médiathèque › Sur le site (ECRANS § 5.2) : photos fixes et galeries ; les fiches restent.
  '/galerie': ecransContenu({
    liste: () => import('@/features/medias/SurLeSite'),
    formulaire: async () => ({
      default: (await import('@/features/editorial/ecrans')).FormulaireGalerie,
    }),
  }),
  '/etudes-cas': ecransContenu({
    liste: async () => ({ default: (await import('@/features/editorial/ecrans')).ListeEtudesCas }),
    formulaire: async () => ({
      default: (await import('@/features/editorial/ecrans')).FormulaireEtudeCas,
    }),
  }),
  '/partenaires': ecransContenu({
    liste: async () => ({
      default: (await import('@/features/editorial/ecrans')).ListePartenaires,
    }),
    formulaire: async () => ({
      default: (await import('@/features/editorial/ecrans')).FormulairePartenaire,
    }),
  }),
  // Pages légales : ensemble fermé, pas d’écran « nouveau » (§ 9.16).
  '/pages-legales': [
    {
      index: true,
      lazy: async () => ({
        Component: (await import('@/features/editorial/ecrans')).ListePagesLegales,
      }),
    },
    {
      path: ':id',
      lazy: async () => ({
        Component: (await import('@/features/editorial/ecrans')).FormulairePageLegale,
      }),
    },
    { path: '*', element: <Introuvable /> },
  ],
  // Réglages et lecture : écrans singletons (§ 13.2 à 13.6).
  '/audience': [
    {
      index: true,
      lazy: async () => ({
        Component: (await import('@/features/audience/ChiffresAudience')).default,
      }),
    },
    { path: '*', element: <Introuvable /> },
  ],
  '/parametres': [
    {
      index: true,
      lazy: async () => ({ Component: (await import('@/features/reglages/Parametres')).default }),
    },
    { path: '*', element: <Introuvable /> },
  ],
  '/navigation': [
    {
      index: true,
      lazy: async () => ({ Component: (await import('@/features/reglages/Navigation')).default }),
    },
    { path: '*', element: <Introuvable /> },
  ],
  '/textes-interface': [
    {
      index: true,
      lazy: async () => ({
        Component: (await import('@/features/reglages/TextesInterface')).default,
      }),
    },
    { path: '*', element: <Introuvable /> },
  ],
  '/motifs-contact': [
    {
      index: true,
      lazy: async () => ({ Component: (await import('@/features/contact/MotifsContact')).default }),
    },
    { path: '*', element: <Introuvable /> },
  ],
}

/**
 * Routes de l'admin (section 6 et 9 ; adresses : D-06). Chaque page se charge à la
 * demande (`lazy`). Les écrans des étapes suivantes affichent « en préparation ».
 */
const routes: RouteObject[] = [
  {
    errorElement: <ErreurInattendue />,
    // Affiché le temps que la première page paresseuse se charge.
    hydrateFallbackElement: <Squelette plein />,
    children: [
      {
        element: <RoutePublique />,
        children: [
          {
            path: '/connexion',
            lazy: async () => ({ Component: (await import('@/features/acces/Connexion')).default }),
          },
          {
            path: '/mot-de-passe-oublie',
            lazy: async () => ({
              Component: (await import('@/features/acces/MotDePasseOublie')).default,
            }),
          },
        ],
      },
      {
        path: '/definir-mot-de-passe',
        lazy: async () => ({
          Component: (await import('@/features/acces/DefinirMotDePasse')).default,
        }),
      },
      {
        element: <RouteProtegee />,
        children: [
          {
            path: '/changer-mot-de-passe',
            lazy: async () => ({
              Component: (await import('@/features/acces/ChangerMotDePasse')).default,
            }),
          },
          {
            element: <Coque />,
            children: [
              {
                index: true,
                lazy: async () => ({
                  Component: (await import('@/features/tableau-de-bord/TableauDeBord')).default,
                }),
              },
              {
                path: '/profil',
                lazy: async () => ({
                  Component: (await import('@/features/profil/Profil')).default,
                }),
              },
              // Vitrine des composants : développement seulement, absente du build (étape 3).
              // La vitrine des composants (`/composants`) est retirée des routes (C2) ; le
              // fichier reste jusqu'à C9 (docs/ELEMENTS-RETIRES.md).
              ...ROUTES_ONGLETS.map((onglet): RouteObject => {
                const ecrans = ECRANS_LIVRES[onglet.chemin]
                return {
                  path: onglet.chemin,
                  element: (
                    <RouteAutorisee action={onglet.action} ressource={onglet.ressource}>
                      <GroupeEcrans />
                      {ecrans ? <Outlet /> : <EnPreparation libelle={onglet.libelle} />}
                    </RouteAutorisee>
                  ),
                  children: ecrans ?? [{ path: '*', element: null }],
                }
              }),
              // Ancienne adresse du journal d'audit (PROMPT-CORRECTION § 5.5).
              { path: '/journal/*', element: <VersActivite /> },
              { path: '*', element: <Introuvable /> },
            ],
          },
        ],
      },
    ],
  },
]

export function creerRouteur() {
  return createBrowserRouter(routes, { basename: import.meta.env.BASE_URL })
}
