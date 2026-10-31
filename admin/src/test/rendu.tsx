import { QueryClientProvider, type QueryClient } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import type { ReactNode } from 'react'
import { createMemoryRouter, RouterProvider, type RouteObject } from 'react-router'
import { creerClientRequetes } from '@/app/requetes'
import { FournisseurSession } from '@/auth/FournisseurSession'
import { FournisseurNotifications } from '@/components/retours/FournisseurNotifications'
import { connecter, type RoleEssai } from '@/test/faux-serveur'

/**
 * Rend un composant transverse avec le vrai entourage de l'admin : cache des requêtes (et sa
 * gestion du `401`), session lue au faux serveur, notifications et routeur de données
 * (nécessaire à `useBlocker` et aux liens). `routes` ajoute des pages voisines.
 */
export async function rendreAvecSession(
  element: ReactNode,
  { role = 'admin', routes = [] }: { role?: RoleEssai | null; routes?: RouteObject[] } = {},
): Promise<ReturnType<typeof render> & { client: QueryClient }> {
  if (role) await connecter(role)
  const client = creerClientRequetes()
  const routeur = createMemoryRouter([{ path: '/', element }, ...routes], { initialEntries: ['/'] })
  const rendu = render(
    <QueryClientProvider client={client}>
      <FournisseurSession>
        <FournisseurNotifications>
          <RouterProvider router={routeur} />
        </FournisseurNotifications>
      </FournisseurSession>
    </QueryClientProvider>,
  )
  return { ...rendu, client }
}
