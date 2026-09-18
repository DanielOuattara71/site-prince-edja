import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Product } from '@/types'

/* ============================================================
   Panier marketplace — contexte React + persistance localStorage
   ============================================================ */

export interface CartLine {
  slug: string
  nom: string
  image: string
  prix: number
  univers: Product['univers']
  quantite: number
}

interface CartContextValue {
  lines: CartLine[]
  count: number
  total: number
  add: (product: Product, quantite?: number) => void
  remove: (slug: string) => void
  setQuantite: (slug: string, quantite: number) => void
  clear: () => void
}

const STORAGE_KEY = 'pe:panier-v1'

const CartContext = createContext<CartContextValue | null>(null)

function readStoredLines(): CartLine[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as CartLine[]) : []
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(readStoredLines)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines))
    } catch {
      /* stockage indisponible : le panier vit en mémoire */
    }
  }, [lines])

  const add = useCallback((product: Product, quantite = 1) => {
    setLines((current) => {
      const existing = current.find((line) => line.slug === product.slug)
      if (existing) {
        return current.map((line) =>
          line.slug === product.slug
            ? { ...line, quantite: line.quantite + quantite }
            : line,
        )
      }
      return [
        ...current,
        {
          slug: product.slug,
          nom: product.nom,
          image: product.image,
          prix: product.prix,
          univers: product.univers,
          quantite,
        },
      ]
    })
  }, [])

  const remove = useCallback((slug: string) => {
    setLines((current) => current.filter((line) => line.slug !== slug))
  }, [])

  const setQuantite = useCallback((slug: string, quantite: number) => {
    setLines((current) =>
      quantite <= 0
        ? current.filter((line) => line.slug !== slug)
        : current.map((line) => (line.slug === slug ? { ...line, quantite } : line)),
    )
  }, [])

  const clear = useCallback(() => setLines([]), [])

  const value = useMemo<CartContextValue>(() => {
    const count = lines.reduce((sum, line) => sum + line.quantite, 0)
    const total = lines.reduce((sum, line) => sum + line.quantite * line.prix, 0)
    return { lines, count, total, add, remove, setQuantite, clear }
  }, [lines, add, remove, setQuantite, clear])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart doit être utilisé à l’intérieur de <CartProvider>')
  }
  return context
}