import { adresseApi } from '@/lib/formulaire'
import type { LignePanier } from '@/lib/panier-contexte'

/**
 * Face publique des commandes (contrat 1.14.0 § 31.4). Aucun secret ici : les identifiants
 * Wave restent côté serveur. Sans API configurée, l'achat est indisponible — la maison le dit.
 */

export interface CommandeCreee {
  numero: string
  etat: string
  total: string
  devise: string
  fournisseur: string
  sessionId: string
  waveLaunchUrl: string
}

export interface CommandePublique {
  numero: string
  statut: string
  total: string
  devise: string
  creeLe: string
  payeeLe: string | null
}

export async function creerCommande(
  lignes: LignePanier[],
  client: { nom: string; email: string },
  langue: 'fr' | 'en',
): Promise<CommandeCreee> {
  const base = adresseApi()
  if (!base) throw new Error('Commande indisponible : API non configurée.')
  const reponse = await fetch(`${base}/public/api/v1/commandes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      lignes: lignes.map((l) => ({ varianteId: l.varianteId, quantite: l.quantite })),
      client,
      langue,
    }),
  })
  if (!reponse.ok) throw new Error(await messageErreur(reponse))
  return reponse.json() as Promise<CommandeCreee>
}

/** Annulation d'une commande encore en attente (contrat 1.14.0 § 31.4). */
export async function annulerCommande(numero: string): Promise<void> {
  const base = adresseApi()
  if (!base) throw new Error('Annulation indisponible : API non configurée.')
  const reponse = await fetch(`${base}/public/api/v1/commandes/${encodeURIComponent(numero)}/annuler`, {
    method: 'POST',
  })
  if (!reponse.ok) throw new Error(await messageErreur(reponse))
}

export async function lireCommande(numero: string, email: string): Promise<CommandePublique> {
  const base = adresseApi()
  if (!base) throw new Error('Suivi indisponible : API non configurée.')
  const url = `${base}/public/api/v1/commandes/${encodeURIComponent(numero)}?email=${encodeURIComponent(email)}`
  const reponse = await fetch(url)
  if (!reponse.ok) throw new Error(await messageErreur(reponse))
  return reponse.json() as Promise<CommandePublique>
}

async function messageErreur(reponse: Response): Promise<string> {
  try {
    const donnees = (await reponse.json()) as { message?: string }
    return donnees.message ?? 'Une erreur est survenue.'
  } catch {
    return 'Une erreur est survenue.'
  }
}
