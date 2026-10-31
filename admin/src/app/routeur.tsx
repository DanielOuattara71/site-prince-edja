import { createBrowserRouter, type RouteObject } from 'react-router'
import { EnPreparation } from '@/app/EnPreparation'
import { ErreurInattendue, Introuvable } from '@/app/pages-erreur'
import { RouteAutorisee, RouteProtegee, RoutePublique } from '@/auth/gardes'
import { Coque } from '@/components/layout/Coque'
import { ENTREES_MENU } from '@/components/layout/navigation'
import { Squelette } from '@/components/ui/Squelette'

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
              ...ENTREES_MENU.map((entree): RouteObject => ({
                path: `${entree.chemin}/*`,
                element: (
                  <RouteAutorisee action={entree.action} ressource={entree.ressource}>
                    <EnPreparation entree={entree} />
                  </RouteAutorisee>
                ),
              })),
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
