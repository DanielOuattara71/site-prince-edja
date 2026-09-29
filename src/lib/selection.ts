import { useCallback, useSyncExternalStore } from 'react'

/**
 * « Ma sélection » — la seule donnée conservée côté navigateur.
 *
 * Ce n'est pas un panier : rien n'est réservé, rien n'est facturé. C'est une liste de
 * pièces dont le visiteur souhaite parler, qui doit survivre à une coupure de connexion
 * et à un retour le lendemain. D'où le `localStorage` — et d'où le fait qu'aucune donnée
 * n'est envoyée nulle part avant que la personne ne le décide.
 *
 * Aucune dépendance à la currency, pas de prix figé : seul le slug est stocké, le prix
 * est relu à chaque affichage depuis `src/data/produits.ts`. Un mock mis à jour ne peut
 * donc pas laisser un ancien prix dans un panier.
 *
 * ⚠️ L'état est **partagé**, pas local : il vit dans ce module et non dans le composant.
 * Trois écrans lisent la même sélection — le dock (le compteur), le tiroir (les lignes)
 * et la page de demande (le récapitulatif). Un `useState` par composant faisait trois
 * vérités : le compteur du dock restait à `00` après un ajout depuis la fiche d'une pièce,
 * parce que le clic et l'affichage ne vivaient pas dans le même arbre. Un magasin externe
 * avec `useSyncExternalStore` règle le problème sans fournisseur à nulle part : quiconque
 * appelle `useSelection()` voit la même liste, immédiatement.
 */

const CLE = 'pe_selection_v1'

export interface LigneSelection {
  slug: string
  quantite: number
  /** Taille choisie, pour les pièces qui en ont. */
  taille: string | null
}

function lire(): LigneSelection[] {
  if (typeof window === 'undefined') return []
  try {
    const brut = window.localStorage.getItem(CLE)
    if (!brut) return []
    const valeur: unknown = JSON.parse(brut)
    if (!Array.isArray(valeur)) return []
    return valeur.filter(
      (l): l is LigneSelection =>
        typeof l === 'object' &&
        l !== null &&
        typeof (l as LigneSelection).slug === 'string' &&
        typeof (l as LigneSelection).quantite === 'number',
    )
  } catch {
    return []
  }
}

function ecrire(lignes: LigneSelection[]): void {
  try {
    window.localStorage.setItem(CLE, JSON.stringify(lignes))
  } catch {
    /* stockage indisponible : la sélection ne survivra pas, mais la page reste utilisable */
  }
}

/* ------------------------------------------------------------------ *
 * Le magasin : une référence, des abonnés, une vérité.
 * ------------------------------------------------------------------ */

const VIDE: LigneSelection[] = []

let lignes: LigneSelection[] = lire()
const ecoutes = new Set<() => void>()

function notifier(): void {
  for (const ecouter of ecoutes) ecouter()
}

function souscrire(ecouter: () => void): () => void {
  ecoutes.add(ecouter)
  return () => {
    ecoutes.delete(ecouter)
  }
}

/** Référence stable entre deux modifications : c'est ce que React compare. */
function getSnapshot(): LigneSelection[] {
  return lignes
}

/** Côté serveur, on ne lit pas le stockage : une référence constante évite un hydratage givré. */
function getServerSnapshot(): LigneSelection[] {
  return VIDE
}

function maj(suivant: (actuel: LigneSelection[]) => LigneSelection[]): void {
  const resultat = suivant(lignes)
  lignes = resultat
  ecrire(resultat)
  notifier()
}

// Un deuxième onglet qui retire une pièce doit se voir ici : sans ce handler, le compteur
// du dock continuerait d'annoncer une sélection que l'autre onglet a vidée.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key !== CLE) return
    lignes = lire()
    notifier()
  })
}

export interface Selection {
  lignes: LigneSelection[]
  ajouter: (slug: string, taille?: string | null) => void
  retirer: (slug: string) => void
  definirQuantite: (slug: string, quantite: number) => void
  vider: () => void
  /** Nombre de pièces, toutes lignes confondues — c'est le compteur du dock. */
  total: number
  /** `true` dès qu'une ligne existe, pour ouvrir ou non le tiroir. */
  nonVide: boolean
}

export function useSelection(): Selection {
  const etat = useSyncExternalStore(souscrire, getSnapshot, getServerSnapshot)

  const ajouter = useCallback(
    (slug: string, taille: string | null = null) => {
      maj((actuel) => {
        const existant = actuel.find((l) => l.slug === slug)
        if (existant) {
          return actuel.map((l) =>
            l.slug === slug ? { ...l, quantite: l.quantite + 1 } : l,
          )
        }
        return [...actuel, { slug, quantite: 1, taille }]
      })
    },
    [],
  )

  const retirer = useCallback((slug: string) => {
    maj((actuel) => actuel.filter((l) => l.slug !== slug))
  }, [])

  const definirQuantite = useCallback((slug: string, quantite: number) => {
    if (quantite < 1) {
      maj((actuel) => actuel.filter((l) => l.slug !== slug))
      return
    }
    maj((actuel) =>
      actuel.map((l) => (l.slug === slug ? { ...l, quantite: Math.min(20, quantite) } : l)),
    )
  }, [])

  const vider = useCallback(() => maj(() => []), [])

  return {
    lignes: etat,
    ajouter,
    retirer,
    definirQuantite,
    vider,
    total: etat.reduce((somme, l) => somme + l.quantite, 0),
    nonVide: etat.length > 0,
  }
}

/**
 * Numéro de demande lisible : `PE-260924-07`.
 * Horodaté et lisible au téléphone — c'est la clé de suivi de la conversation.
 */
export function numeroDemande(date: Date, compteur: number): string {
  const deux = (n: number) => String(n).padStart(2, '0')
  const jour = `${deux(date.getDate())}${deux(date.getMonth() + 1)}`
  const annee = String(date.getFullYear()).slice(2)
  return `PE-${annee}${jour}-${deux(compteur)}`
}
