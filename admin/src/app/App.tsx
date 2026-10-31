import { QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { RouterProvider } from 'react-router'
import { creerClientRequetes } from '@/app/requetes'
import { creerRouteur } from '@/app/routeur'
import { FournisseurSession } from '@/auth/FournisseurSession'
import { FournisseurNotifications } from '@/components/retours/FournisseurNotifications'

/**
 * Racine : cache des données serveur, session, notifications, puis routeur. Le routeur et
 * le client sont créés une fois par montage (et non au chargement du module), pour que
 * chaque test parte d'un état neuf.
 */
export function App() {
  const [client] = useState(creerClientRequetes)
  const [routeur] = useState(creerRouteur)

  return (
    <QueryClientProvider client={client}>
      <FournisseurSession>
        <FournisseurNotifications>
          <RouterProvider router={routeur} />
        </FournisseurNotifications>
      </FournisseurSession>
    </QueryClientProvider>
  )
}
