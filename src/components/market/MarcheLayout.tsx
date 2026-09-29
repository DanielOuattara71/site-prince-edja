import { useState } from 'react'
import { Outlet } from 'react-router'
import { DockComptoirs } from '@/components/market/DockComptoirs'
import { TiroirSelection } from '@/components/market/TiroirSelection'
import { useSelection } from '@/lib/selection'

/**
 * Layout du marché : `/boutique`, `/boutique/:comptoir` et `/boutique/:comptoir/:piece`
 * partagent le dock et le tiroir de sélection.
 *
 * Le dock est monté ici, une seule fois, plutôt que dans chaque page : c'est lui qui
 * tient le plan du marché, et il doit survivre à la navigation entre comptoirs.
 */
export function MarcheLayout() {
  const selection = useSelection()
  const [tiroir, setTiroir] = useState(false)

  return (
    <>
      <DockComptoirs totalSelection={selection.total} onOuvrirSelection={() => setTiroir(true)} />
      <TiroirSelection
        lignes={selection.lignes}
        ouvert={tiroir}
        onClose={() => setTiroir(false)}
        onRetirer={selection.retirer}
        onQuantite={selection.definirQuantite}
        onVider={selection.vider}
      />
      <Outlet />
    </>
  )
}

