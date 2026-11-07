import { http } from 'msw'
import { autoriser, versionPerimee } from '@/api/mocks/garde'
import { journaliser, magasin } from '@/api/mocks/magasin'
import { API, erreur, json, lireCorps, paginer, trier, vide } from '@/api/mocks/reponses'
import type { Abonne, Demande, Message } from '@/api/schemas/audience'
import {
  entreeModificationDemandeSchema,
  entreeModificationMessageSchema,
} from '@/api/schemas/audience'

/**
 * Boîtes de réception et newsletter du faux serveur (contrat § 12) : messages, demandes de
 * pièce, abonnés. Les mêmes règles que le serveur réel — statut, version, transition, journal,
 * export — appliquées sur l'état du magasin.
 */

const TRI_DEFAUT = '-creeLe'

export const handlersAudience = [
  http.get(`${API}/messages`, ({ request }) => {
    const garde = autoriser(request, 'lire', 'messages')
    if (!garde.ok) return garde.reponse
    const url = new URL(request.url)
    const etat = url.searchParams.get('statut')
    const type = url.searchParams.get('type')
    const q = url.searchParams.get('q')
    const liste = magasin.messages.filter((message) => {
      if (etat && message.statut !== etat) return false
      if (type && message.type !== type) return false
      if (
        q &&
        !`${message.nom ?? ''} ${message.email} ${message.message ?? ''}`
          .toLowerCase()
          .includes(q.toLowerCase())
      )
        return false
      return true
    })
    const trie = trier(url, liste, { creeLe: (message: Message) => message.creeLe }, TRI_DEFAUT)
    if (!trie.ok) return trie.reponse
    const page = paginer(url, trie.elements)
    return page.ok ? json(page.corps) : page.reponse
  }),

  http.get(`${API}/messages/:id`, ({ request, params }) => {
    const garde = autoriser(request, 'lire', 'messages')
    if (!garde.ok) return garde.reponse
    const message = magasin.messages.find((m) => m.id === params['id'])
    return message ? json(message) : erreur(404, 'NON_TROUVE', 'Ce message n’existe pas.')
  }),

  http.patch(`${API}/messages/:id`, async ({ request, params }) => {
    const garde = autoriser(request, 'modifier', 'messages')
    if (!garde.ok) return garde.reponse
    const lue = await lireCorps(request, entreeModificationMessageSchema)
    if (!lue.ok) return lue.reponse
    const message = magasin.messages.find((m) => m.id === params['id'])
    if (!message) return erreur(404, 'NON_TROUVE', 'Ce message n’existe pas.')
    const perimee = versionPerimee(lue.valeur.version, message.version)
    if (perimee) return perimee
    const avant: Message = { ...message }
    Object.assign(message, {
      version: message.version + 1,
      ...(lue.valeur.statut ? { statut: lue.valeur.statut } : {}),
      ...(lue.valeur.noteInterne !== undefined ? { noteInterne: lue.valeur.noteInterne } : {}),
    })
    journaliser(garde.compte, 'modification', 'messages', message.id, avant, message)
    return json(message)
  }),

  http.delete(`${API}/messages/:id`, ({ request, params }) => {
    const garde = autoriser(request, 'supprimer', 'messages')
    if (!garde.ok) return garde.reponse
    const url = new URL(request.url)
    const version = Number(url.searchParams.get('version') ?? '')
    const message = magasin.messages.find((m) => m.id === params['id'])
    if (!message) return erreur(404, 'NON_TROUVE', 'Ce message n’existe pas.')
    const perimee = versionPerimee(version, message.version)
    if (perimee) return perimee
    magasin.messages = magasin.messages.filter((m) => m.id !== message.id)
    journaliser(garde.compte, 'suppression', 'messages', message.id, message, null)
    return vide()
  }),

  http.get(`${API}/demandes`, ({ request }) => {
    const garde = autoriser(request, 'lire', 'demandes')
    if (!garde.ok) return garde.reponse
    const url = new URL(request.url)
    const etat = url.searchParams.get('statut')
    const createur = url.searchParams.get('createur')
    const q = url.searchParams.get('q')
    const liste = magasin.demandes.filter((demande) => {
      if (etat && demande.statut !== etat) return false
      if (createur && !demande.lignes.some((ligne) => ligne.bijouId === createur)) return false
      if (q && !`${demande.nom} ${demande.email}`.toLowerCase().includes(q.toLowerCase()))
        return false
      return true
    })
    const trie = trier(url, liste, { creeLe: (demande: Demande) => demande.creeLe }, TRI_DEFAUT)
    if (!trie.ok) return trie.reponse
    const page = paginer(url, trie.elements)
    return page.ok ? json(page.corps) : page.reponse
  }),

  http.get(`${API}/demandes/:id`, ({ request, params }) => {
    const garde = autoriser(request, 'lire', 'demandes')
    if (!garde.ok) return garde.reponse
    const demande = magasin.demandes.find((d) => d.id === params['id'])
    return demande ? json(demande) : erreur(404, 'NON_TROUVE', 'Cette demande n’existe pas.')
  }),

  http.patch(`${API}/demandes/:id`, async ({ request, params }) => {
    const garde = autoriser(request, 'modifier', 'demandes')
    if (!garde.ok) return garde.reponse
    const lue = await lireCorps(request, entreeModificationDemandeSchema)
    if (!lue.ok) return lue.reponse
    const demande = magasin.demandes.find((d) => d.id === params['id'])
    if (!demande) return erreur(404, 'NON_TROUVE', 'Cette demande n’existe pas.')
    const perimee = versionPerimee(lue.valeur.version, demande.version)
    if (perimee) return perimee
    const SUITES: Record<string, readonly string[]> = {
      nouvelle: ['en_cours', 'annulee'],
      en_cours: ['conclue', 'annulee'],
      conclue: [],
      annulee: [],
    }
    const vers = lue.valeur.statut
    if (vers && vers !== demande.statut && !SUITES[demande.statut]?.includes(vers)) {
      return erreur(
        422,
        'TRANSITION_INTERDITE',
        'Le statut d’une demande ne revient jamais en arrière.',
        {
          details: { depuis: demande.statut, vers, autorisees: SUITES[demande.statut] ?? [] },
        },
      )
    }
    const avant: Demande = { ...demande }
    Object.assign(demande, {
      version: demande.version + 1,
      ...(vers ? { statut: vers } : {}),
      ...(lue.valeur.noteInterne !== undefined ? { noteInterne: lue.valeur.noteInterne } : {}),
    })
    journaliser(garde.compte, 'modification', 'demandes', demande.id, avant, demande)
    return json(demande)
  }),

  http.get(`${API}/abonnes`, ({ request }) => {
    const garde = autoriser(request, 'lire', 'abonnes')
    if (!garde.ok) return garde.reponse
    const url = new URL(request.url)
    const etat = url.searchParams.get('statut')
    const q = url.searchParams.get('q')
    const liste = magasin.abonnes.filter((abonne) => {
      if (etat && abonne.statut !== etat) return false
      if (q && !abonne.email.toLowerCase().includes(q.toLowerCase())) return false
      return true
    })
    const trie = trier(url, liste, { creeLe: (abonne: Abonne) => abonne.creeLe }, TRI_DEFAUT)
    if (!trie.ok) return trie.reponse
    const page = paginer(url, trie.elements)
    return page.ok ? json(page.corps) : page.reponse
  }),

  http.get(`${API}/abonnes/export`, ({ request }) => {
    const garde = autoriser(request, 'exporter', 'abonnes')
    if (!garde.ok) return garde.reponse
    const url = new URL(request.url)
    const etat = url.searchParams.get('statut')
    const q = url.searchParams.get('q')
    const abonnes = magasin.abonnes.filter((abonne) => {
      if (etat && abonne.statut !== etat) return false
      if (q && !abonne.email.toLowerCase().includes(q.toLowerCase())) return false
      return true
    })
    const lignes = [
      'email;prenom;pays;langue;statut;confirmeLe;consentementAccepteLe;consentementVersion',
      ...abonnes.map((abonne) => {
        const dernier = abonne.consentements.at(-1)
        const champs = [
          abonne.email,
          abonne.prenom ?? '',
          abonne.pays ?? '',
          abonne.langue,
          abonne.statut,
          abonne.confirmeLe ?? '',
          dernier?.accepteLe ?? '',
          dernier?.version ?? '',
        ]
        const echappe = (valeur: string) =>
          /[;"]/.test(valeur) ? '"' + valeur.split('"').join('""') + '"' : valeur
        return champs.map((valeur) => echappe(valeur)).join(';')
      }),
    ]
    return new Response(lignes.join('\r\n') + '\r\n', {
      headers: { 'Content-Type': 'text/csv; charset=utf-8', 'X-Request-Id': crypto.randomUUID() },
    })
  }),

  http.delete(`${API}/abonnes/:id`, ({ request, params }) => {
    const garde = autoriser(request, 'supprimer', 'abonnes')
    if (!garde.ok) return garde.reponse
    const abonne = magasin.abonnes.find((a) => a.id === params['id'])
    if (!abonne) return erreur(404, 'NON_TROUVE', 'Cet abonné n’existe pas.')
    magasin.abonnes = magasin.abonnes.filter((a) => a.id !== abonne.id)
    journaliser(garde.compte, 'suppression', 'abonnes', abonne.id, abonne, null)
    return vide()
  }),
]
