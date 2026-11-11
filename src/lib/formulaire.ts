/**
 * Envoi des formulaires vers l’API face publique (LIAISON — Partie C, C.2 ; contrat § 18).
 *
 * - Contact → `POST /public/api/v1/contact`, collaboration → `POST /public/api/v1/collaboration`,
 *   lettre → `POST /public/api/v1/newsletter` (avec consentement horodaté et texte accepté).
 * - Adresse de l’API : `PUBLIC_API_URL`, exposée au navigateur par `envPrefix` (`vite.config.ts`).
 * - Sans adresse configurée, le build de production n’appelle **rien** : `formulairesOuverts`
 *   vaut `false`, les pages l’annoncent dès l’arrivée et le bouton prépare un e-mail
 *   (`emailContact`, `emailCollaboration`). Seul le serveur de développement se
 *   rabat sur `http://localhost:3000`. Avant cette règle, le build visait `localhost:3000` et
 *   tout visiteur voyait « L’envoi a échoué » (audit V2-01).
 */
import { VERSION_CONSENTEMENT } from '@/lib/newsletter'

/** Repli du serveur de développement. `import.meta.env.DEV` est remplacé par `false` au build :
 *  l'adresse locale disparaît du code livré. */
const REPLI_DEVELOPPEMENT = import.meta.env.DEV ? 'http://localhost:3000' : null

export function adresseApi(
  configuree: string | undefined = import.meta.env.PUBLIC_API_URL,
  repli: string | null = REPLI_DEVELOPPEMENT,
): string | null {
  const adresse = configuree?.trim().replace(/\/+$/, '')
  return adresse || repli
}

/** `false` tant qu’aucune API publique n’est configurée pour ce build. */
export const formulairesOuverts = adresseApi() !== null

const texte = (donnees: FormData, cle: string) => String(donnees.get(cle) ?? '').trim()
const facultatif = (donnees: FormData, cle: string) => texte(donnees, cle) || undefined

async function poster(chemin: string, corps: Record<string, unknown>): Promise<boolean> {
  const base = adresseApi()
  if (!base) return false
  try {
    const reponse = await fetch(`${base}/public/api/v1/${chemin}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(corps),
    })
    return reponse.ok
  } catch {
    return false
  }
}

/** Corps de `POST /contact` : `{ nom, email, motif?, message, langue, siteWeb }`. */
export function corpsContact(donnees: FormData) {
  return {
    nom: texte(donnees, 'nom'),
    email: texte(donnees, 'email'),
    motif: facultatif(donnees, 'demande'),
    message: texte(donnees, 'message'),
    langue: 'fr' as const,
    // Champ piège : vide pour un humain (contrat § 18).
    siteWeb: texte(donnees, 'siteWeb'),
  }
}

/** Corps de `POST /newsletter` (contrat § 18) : double confirmation par e-mail envoyée par l'API ;
 *  le consentement enregistre le texte exact accepté, sa version et la page d'origine ; `siteWeb`
 *  reste vide pour un humain (champ piège RG-15). */
export function corpsNewsletter(
  entree: { email: string; prenom?: string; pays?: string },
  texteConsentement: string,
  source: string,
  langue: 'fr' | 'en' = 'fr',
) {
  const corps: Record<string, unknown> = {
    email: entree.email.trim().toLowerCase(),
    langue,
    consentement: { texte: texteConsentement, version: VERSION_CONSENTEMENT, source },
    siteWeb: '',
  }
  const prenom = entree.prenom?.trim()
  const pays = entree.pays?.trim()
  if (prenom) corps['prenom'] = prenom
  if (pays) corps['pays'] = pays
  return corps
}

/** Repli sans API : l'inscription reste enregistrée côté maison (localStorage), en flou documenté —
 *  aucun envoi n'a lieu, le libellé de confirmation le dit. */
export function envoyerNewsletter(
  entree: { email: string; prenom?: string; pays?: string },
  texteConsentement: string,
  source: string,
  langue: 'fr' | 'en' = 'fr',
): Promise<boolean> {
  return poster('newsletter', corpsNewsletter(entree, texteConsentement, source, langue))
}

/** Corps de `POST /collaboration` (contrat § 18). */
export function corpsCollaboration(donnees: FormData) {
  return {
    entreprise: texte(donnees, 'b2b-entreprise'),
    pays: texte(donnees, 'b2b-pays'),
    typeCollaboration: texte(donnees, 'b2b-type'),
    calendrier: texte(donnees, 'b2b-calendrier'),
    budget: facultatif(donnees, 'b2b-budget'),
    email: texte(donnees, 'b2b-email'),
    message: texte(donnees, 'b2b-message'),
    langue: 'fr' as const,
    siteWeb: texte(donnees, 'siteWeb'),
  }
}

/**
 * Repli sans API (décision du client, 07/11/2026) : le bouton ouvre la messagerie du visiteur avec
 * un e-mail prêt à partir — destinataire, objet et champs déjà remplis. Rien n'est perdu de ce qu'il
 * a saisi, et aucun envoi n'est simulé.
 */
function lienEmail(destinataire: string, objet: string, lignes: (string | false | undefined)[]) {
  const corps = lignes.filter((ligne) => ligne !== false && ligne !== undefined).join('\r\n')
  return `mailto:${destinataire}?subject=${encodeURIComponent(objet)}&body=${encodeURIComponent(corps)}`
}

export function emailContact(donnees: FormData, destinataire: string): string {
  const c = corpsContact(donnees)
  return lienEmail(destinataire, `${c.motif ?? 'Message'} — ${c.nom}`, [
    `Nom : ${c.nom}`,
    `E-mail : ${c.email}`,
    c.motif && `Demande : ${c.motif}`,
    '',
    c.message,
  ])
}

export function emailCollaboration(donnees: FormData, destinataire: string): string {
  const c = corpsCollaboration(donnees)
  return lienEmail(destinataire, `Demande de collaboration — ${c.entreprise}`, [
    `Entreprise : ${c.entreprise}`,
    `Pays : ${c.pays}`,
    `Type de collaboration : ${c.typeCollaboration}`,
    `Calendrier : ${c.calendrier}`,
    c.budget && `Budget : ${c.budget}`,
    `E-mail : ${c.email}`,
    '',
    c.message,
  ])
}

/** Un robot a rempli le champ piège : on ne fait rien, sans le lui dire. */
export const estRobot = (formulaire: HTMLFormElement) =>
  texte(new FormData(formulaire), 'siteWeb') !== ''

export function envoyerContact(formulaire: HTMLFormElement): Promise<boolean> {
  return poster('contact', corpsContact(new FormData(formulaire)))
}

export function envoyerCollaboration(formulaire: HTMLFormElement): Promise<boolean> {
  return poster('collaboration', corpsCollaboration(new FormData(formulaire)))
}
