import type { ComponentType } from 'react'
import { createBrowserRouter, Outlet, type RouteObject } from 'react-router'
import { EnPreparation } from '@/app/EnPreparation'
import { ErreurInattendue, Introuvable } from '@/app/pages-erreur'
import { RouteAutorisee, RouteProtegee, RoutePublique } from '@/auth/gardes'
import { Coque } from '@/components/layout/Coque'
import { ENTREES_MENU } from '@/components/layout/navigation'
import { Squelette } from '@/components/ui/Squelette'

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
  '/projets': ecransContenu({
    liste: async () => ({ default: (await import('@/features/editorial/ecrans')).ListeProjets }),
    formulaire: async () => ({
      default: (await import('@/features/editorial/ecrans')).FormulaireProjet,
    }),
  }),
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
              // Vitrine des composants : développement seulement, absente du build (étape 3).
              ...(import.meta.env.DEV
                ? [
                    {
                      path: '/composants',
                      lazy: async () => ({
                        Component: (await import('@/features/demo/Composants')).default,
                      }),
                    },
                  ]
                : []),
              ...ENTREES_MENU.map((entree): RouteObject => {
                const ecrans = ECRANS_LIVRES[entree.chemin]
                return {
                  path: entree.chemin,
                  element: (
                    <RouteAutorisee action={entree.action} ressource={entree.ressource}>
                      {ecrans ? <Outlet /> : <EnPreparation entree={entree} />}
                    </RouteAutorisee>
                  ),
                  children: ecrans ?? [{ path: '*', element: null }],
                }
              }),
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
