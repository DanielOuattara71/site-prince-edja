import { definirJetonCsrf, requete } from '@/api/client'
import {
  changerMotDePasseSchema,
  connexionSchema,
  definirMotDePasseSchema,
  moiSchema,
  motDePasseOublieSchema,
  type Moi,
} from '@/api/schemas/auth'

/** Routes d'accès (`docs/CONTRAT-API.md` § 3.2). Le jeton CSRF reçu est gardé en mémoire. */

export async function lireMoi(signal?: AbortSignal): Promise<Moi> {
  const moi = await requete('/auth/moi', { schema: moiSchema, ...(signal ? { signal } : {}) })
  definirJetonCsrf(moi.csrf)
  return moi
}

export async function seConnecter(email: string, motDePasse: string): Promise<Moi> {
  const moi = await requete('/auth/connexion', {
    methode: 'POST',
    corps: connexionSchema.parse({ email, motDePasse }),
    schema: moiSchema,
  })
  definirJetonCsrf(moi.csrf)
  return moi
}

export async function seDeconnecter(): Promise<void> {
  try {
    await requete('/auth/deconnexion', { methode: 'POST' })
  } finally {
    definirJetonCsrf(null)
  }
}

export function changerMotDePasse(motDePasseActuel: string, nouveauMotDePasse: string) {
  return requete('/auth/changer-mot-de-passe', {
    methode: 'POST',
    corps: changerMotDePasseSchema.parse({ motDePasseActuel, nouveauMotDePasse }),
  })
}

/** Répond toujours `204` : l'interface affiche le même message, que le compte existe ou non. */
export function demanderReinitialisation(email: string) {
  return requete('/auth/mot-de-passe-oublie', {
    methode: 'POST',
    corps: motDePasseOublieSchema.parse({ email }),
  })
}

/** Lien reçu par e-mail : réinitialisation, amorçage ou création de compte (§ 3.2). */
export function definirMotDePasse(jeton: string, nouveauMotDePasse: string) {
  return requete('/auth/definir-mot-de-passe', {
    methode: 'POST',
    corps: definirMotDePasseSchema.parse({ jeton, nouveauMotDePasse }),
  })
}
