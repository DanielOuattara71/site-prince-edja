import { useEffect, useMemo, useState } from 'react'
import type { ContextePanier, LignePanier } from './panier-contexte'
import { ContextePanierReact } from './panier-contexte'

/** Fournisseur du panier d'achat — voir `panier-contexte.ts` pour le contrat. */

const CLE_STOCKAGE = 'pe_panier_achat'

export function FournisseurPanier({ children }: { children: React.ReactNode }) {
  const [lignes, setLignes] = useState<LignePanier[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const brut = window.localStorage.getItem(CLE_STOCKAGE)
      return brut ? (JSON.parse(brut) as LignePanier[]) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(CLE_STOCKAGE, JSON.stringify(lignes))
    } catch {
      // Stockage indisponible (navigation privée) : le panier vit en mémoire pour la session.
    }
  }, [lignes])

  const valeur = useMemo<ContextePanier>(
    () => ({
      lignes,
      nombre: lignes.reduce((n, l) => n + l.quantite, 0),
      totalIndicatif: lignes.reduce((total, l) => total + (l.prixIndicatif ?? 0) * l.quantite, 0),
      ajouter: (bijou, quantite, varianteId) => {
        const id = varianteId ?? bijou.commerce?.varianteIds[0]
        if (!id) return
        setLignes((actuelles) => {
          const existante = actuelles.find((l) => l.varianteId === id)
          if (existante) {
            return actuelles.map((l) =>
              l.varianteId === id ? { ...l, quantite: Math.min(99, l.quantite + quantite) } : l,
            )
          }
          return [
            ...actuelles,
            {
              slug: bijou.slug,
              varianteId: id,
              nom: bijou.nom,
              quantite: Math.min(99, Math.max(1, quantite)),
              prixIndicatif: bijou.commerce?.prix ?? null,
              image: bijou.image,
            },
          ]
        })
      },
      retirer: (slug) => setLignes((actuelles) => actuelles.filter((l) => l.slug !== slug)),
      changerQuantite: (slug, quantite) =>
        setLignes((actuelles) =>
          actuelles.map((l) =>
            l.slug === slug ? { ...l, quantite: Math.min(99, Math.max(1, quantite)) } : l,
          ),
        ),
      vider: () => setLignes([]),
    }),
    [lignes],
  )

  return <ContextePanierReact.Provider value={valeur}>{children}</ContextePanierReact.Provider>
}
