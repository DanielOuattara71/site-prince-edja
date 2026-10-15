import { useCallback, useEffect, useMemo, useState } from 'react'
import { createContext, useContext } from 'react'
import type { Bijou } from '@/types'

/**
 * Demande de pièces, en mode « sur demande ».
 *
 * Le CDC laisse ouvert le choix entre vente directe et demande (décision D4). En
 * attendant, la collection ne porte aucun prix validé : le visiteur constitue une
 * sélection et l'envoie à la maison, qui répond avec les disponibilités et les montants.
 * Aucun paiement n'est simulé, aucune expédition n'est promise.
 */

const CLE_STOCKAGE = 'pe_demande_pieces'

interface ContexteDemande {
  pieces: Bijou[]
  nombre: number
  present: (slug: string) => boolean
  basculer: (bijou: Bijou) => void
  retirer: (slug: string) => void
  vider: () => void
}

const Contexte = createContext<ContexteDemande | null>(null)

export function FournisseurDemande({ children }: { children: React.ReactNode }) {
  const [pieces, setPieces] = useState<Bijou[]>(() => {
    try {
      const brutes = window.localStorage.getItem(CLE_STOCKAGE)
      return brutes ? (JSON.parse(brutes) as Bijou[]) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(CLE_STOCKAGE, JSON.stringify(pieces))
    } catch {
      /* Stockage indisponible : la sélection reste valable le temps de la session. */
    }
  }, [pieces])

  const basculer = useCallback((bijou: Bijou) => {
    setPieces((actuelles) =>
      actuelles.some((piece) => piece.slug === bijou.slug)
        ? actuelles.filter((piece) => piece.slug !== bijou.slug)
        : [...actuelles, bijou],
    )
  }, [])

  const valeur = useMemo<ContexteDemande>(
    () => ({
      pieces,
      nombre: pieces.length,
      present: (slug) => pieces.some((piece) => piece.slug === slug),
      basculer,
      retirer: (slug) => setPieces((actuelles) => actuelles.filter((p) => p.slug !== slug)),
      vider: () => setPieces([]),
    }),
    [pieces, basculer],
  )

  return <Contexte.Provider value={valeur}>{children}</Contexte.Provider>
}

export function useDemande(): ContexteDemande {
  const contexte = useContext(Contexte)
  if (!contexte) {
    throw new Error('useDemande doit être utilisé dans FournisseurDemande.')
  }
  return contexte
}

/** Sujet de l'email de demande, lisible par la maison. */
export function sujetDemande(pieces: Bijou[]): string {
  if (pieces.length === 0) return 'Demande d’informations · Edja Shop'
  const noms = pieces.map((piece) => piece.nom).join(', ')
  return `Demande de devis · ${noms}`
}

/** Ouverture du client de messagerie avec la sélection prête à envoyer. */
export function envoyerDemande(pieces: Bijou[], email: string) {
  const lignes = pieces.map((piece) => `- ${piece.nom} (réf. ${piece.numero})`).join('\n')
  const corps = encodeURIComponent(
    `Bonjour,\n\nJe souhaite obtenir des informations sur les pièces suivantes :\n${lignes || '- (aucune pièce sélectionnée)'}\n\nMerci d'indiquer les disponibilités, les matières et les délais.\n\n`,
  )
  window.location.href = `mailto:${email}?subject=${encodeURIComponent(sujetDemande(pieces))}&body=${corps}`
}
