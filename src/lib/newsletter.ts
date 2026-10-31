/**
 * Mécanisme unique d'inscription à la lettre du Griot.
 *
 * Point de remplacement par un prestataire d'emailing (Brevo, Mailchimp,
 * Buttondown…). Tous les points de collecte du site (bloc accueil, bloc footer,
 * modal) passent par ici : l'inscription vit ici et ne vit nulle part ailleurs.
 *
 * Ce qui existe aujourd'hui : l'inscription est **enregistrée côté maison** —
 * intention horodatée et consentement rétrospectif (source, version du texte)
 * sauvegardés en localStorage, avec dédoublonnage par adresse. Aucun envoi
 * réel n'est fait : la confirmation affichée doit donc rester dans le flou
 * documenté par les libellés.
 */

const CLE_INTENSIONS = 'pe_newsletter_intentions'
const CLE_ABONNES = 'pe_newsletter_abonnes'

/** Version du texte de consentement auquel les utilisateurs répondront. */
export const VERSION_CONSENTEMENT = '1'

export type Consentement = {
  /** Horodatage ISO de l'acceptation, au moment du consentement. */
  date: string
  /** Version du texte de consentement auquel l'utilisateur a répondu. */
  version: string
  /** Page d'origine (ex. « / ») : la provenance de l'acceptation. */
  source: string
}

export type IntentionNewsletter = {
  email: string
  prenom?: string
  pays?: string
  consentement?: Consentement
}

/** Validation e-mail : syntaxe standard, sans normalisation abusive. */
export function emailValide(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

function lireJSON<T>(cle: string): T | null {
  try {
    const brutes = window.localStorage.getItem(cle)
    return brutes ? (JSON.parse(brutes) as T) : null
  } catch {
    /* Stockage indisponible (navigation privée) : pas d'inscription ici. */
    return null
  }
}

function ecrireJSON(cle: string, valeur: unknown) {
  try {
    window.localStorage.setItem(cle, JSON.stringify(valeur))
  } catch {
    /* Stockage indisponible : l'inscription n'est pas persévérable côté maison. */
  }
}

function emailNormalise(email: string): string {
  return email.trim().toLowerCase()
}

/** Enregistre une intention, dédoublonnée par adresse. Idempotent. */
export function consignerIntention(intention: IntentionNewsletter): boolean {
  const email = emailNormalise(intention.email)
  const dejaInscrit = lireJSON<IntentionNewsletter[]>(CLE_INTENSIONS)?.some(
    (i) => i.email.trim().toLowerCase() === email,
  )
  if (dejaInscrit) return true

  const liste = [...(lireJSON<IntentionNewsletter[]>(CLE_INTENSIONS) ?? []), intention]
  ecrireJSON(CLE_INTENSIONS, liste)
  return true
}

/** L'utilisateur a accepté (à ce jour) : marqueur anti-re-solicitation, par adresse. */
export function estInscrit(email?: string): boolean {
  if (!email) return false
  const cible = emailNormalise(email)
  const marque = localStorage.getItem(CLE_ABONNES)
  if (marque && marque.trim().toLowerCase() === cible) return true
  return (lireJSON<IntentionNewsletter[]>(CLE_INTENSIONS) ?? []).some(
    (i) => i.email.trim().toLowerCase() === cible,
  )
}

/** Matérialise l'acceptation dans l'état d'inscription (utilisé par le modal et le bloc). */
export function marquerInscrit(intention: IntentionNewsletter) {
  const email = emailNormalise(intention.email)
  localStorage.setItem(CLE_ABONNES, email)
  consignerIntention(intention)
}
