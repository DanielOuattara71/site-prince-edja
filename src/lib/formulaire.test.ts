import { describe, expect, it } from 'vitest'
import {
  adresseApi,
  corpsCollaboration,
  corpsContact,
  corpsDemande,
  corpsNewsletter,
  emailCollaboration,
  emailContact,
} from '@/lib/formulaire'
import { VERSION_CONSENTEMENT } from '@/lib/newsletter'

describe('adresseApi (audit V2-01)', () => {
  it('le build de production sans adresse n’appelle rien — jamais localhost', () => {
    expect(adresseApi(undefined, null)).toBeNull()
    expect(adresseApi('   ', null)).toBeNull()
  })

  it('le serveur de développement se rabat sur localhost:3000', () => {
    expect(adresseApi(undefined, 'http://localhost:3000')).toBe('http://localhost:3000')
  })

  it('une adresse configurée est prise telle quelle, sans barre finale', () => {
    expect(adresseApi('https://api.exemple.org/', null)).toBe('https://api.exemple.org')
  })
})

function donnees(champs: Record<string, string>) {
  const fd = new FormData()
  for (const [cle, valeur] of Object.entries(champs)) fd.set(cle, valeur)
  return fd
}

describe('corps envoyés (contrat § 18)', () => {
  it('contact : le motif vient du champ « demande », le piège s’appelle siteWeb', () => {
    expect(
      corpsContact(
        donnees({
          nom: ' Awa ',
          email: 'awa@exemple.org',
          demande: 'Presse',
          message: 'Bonjour',
          siteWeb: '',
        }),
      ),
    ).toEqual({
      nom: 'Awa',
      email: 'awa@exemple.org',
      motif: 'Presse',
      message: 'Bonjour',
      langue: 'fr',
      siteWeb: '',
    })
  })

  it('contact : un motif vide n’est pas envoyé', () => {
    expect(corpsContact(donnees({ demande: '' })).motif).toBeUndefined()
  })

  it('collaboration : champs B2B et budget facultatif', () => {
    const corps = corpsCollaboration(
      donnees({
        'b2b-entreprise': 'Maison',
        'b2b-pays': 'Côte d’Ivoire',
        'b2b-type': 'Campagne',
        'b2b-calendrier': 'Printemps',
        'b2b-email': 'contact@maison.ci',
        'b2b-message': 'Projet',
      }),
    )
    expect(corps.budget).toBeUndefined()
    expect(corps.typeCollaboration).toBe('Campagne')
    expect(corps.siteWeb).toBe('')
  })
})

describe('repli par e-mail (décision du client, § 8.1)', () => {
  const lire = (lien: string) => {
    const url = new URL(lien)
    return {
      a: url.pathname,
      objet: url.searchParams.get('subject'),
      corps: url.searchParams.get('body'),
    }
  }

  it('contact : destinataire, objet et champs repris, rien de perdu', () => {
    const r = lire(
      emailContact(
        donnees({
          nom: 'Awa K.',
          email: 'awa@exemple.org',
          demande: 'Presse',
          message: 'Ligne 1\nLigne 2 & co',
        }),
        'contact@ohenetour.com',
      ),
    )
    expect(r.a).toBe('contact@ohenetour.com')
    expect(r.objet).toBe('Presse — Awa K.')
    expect(r.corps).toContain('E-mail : awa@exemple.org')
    expect(r.corps).toContain('Ligne 1\nLigne 2 & co')
  })

  it('collaboration : budget absent → pas de ligne vide « Budget »', () => {
    const r = lire(
      emailCollaboration(
        donnees({
          'b2b-entreprise': 'Maison',
          'b2b-pays': 'CI',
          'b2b-type': 'Campagne',
          'b2b-calendrier': 'Mars',
          'b2b-email': 'a@b.ci',
          'b2b-message': 'Bonjour',
        }),
        'contact@ohenetour.com',
      ),
    )
    expect(r.objet).toBe('Demande de collaboration — Maison')
    expect(r.corps).not.toContain('Budget')
    expect(r.corps).toContain('Type de collaboration : Campagne')
  })
})

/** Création des trois entrées de la boîte de réception : corps conformes au contrat § 18. */
describe('corps des créations (messages, abonnés, demandes)', () => {
  it('message : le corps de contact porte motif, message et le piège vide', () => {
    const corps = corpsContact(
      donnees({
        nom: 'Awa',
        email: 'awa@exemple.test',
        demande: 'question',
        message: 'Bonjour',
        siteWeb: '',
      }),
    )
    expect(corps).toMatchObject({
      nom: 'Awa',
      email: 'awa@exemple.test',
      motif: 'question',
      message: 'Bonjour',
      siteWeb: '',
      langue: 'fr',
    })
  })

  it('abonné : e-mail normalisé, consentement figé (texte, version, source)', () => {
    const corps = corpsNewsletter(
      { email: '  AWA@Exemple.TEST ', prenom: ' Awa ', pays: '' },
      'J’accepte de recevoir la lettre',
      '/site-prince-edja/histoires',
      'fr',
    )
    expect(corps).toEqual({
      email: 'awa@exemple.test',
      langue: 'fr',
      prenom: 'Awa',
      consentement: {
        texte: 'J’accepte de recevoir la lettre',
        version: VERSION_CONSENTEMENT,
        source: '/site-prince-edja/histoires',
      },
      siteWeb: '',
    })
    expect(corps).not.toHaveProperty('pays')
  })

  it('demande : variantes, coordonnées et message facultatif', () => {
    const varianteIds = ['11111111-1111-4111-8111-111111111111']
    const avecMessage = corpsDemande(
      donnees({ nom: 'Awa', email: 'awa@exemple.test', message: 'Deux pièces', siteWeb: '' }),
      varianteIds,
    )
    expect(avecMessage).toEqual({
      varianteIds,
      nom: 'Awa',
      email: 'awa@exemple.test',
      message: 'Deux pièces',
      langue: 'fr',
      siteWeb: '',
    })
    const sansMessage = corpsDemande(
      donnees({ nom: 'Awa', email: 'awa@exemple.test', message: '   ', siteWeb: '' }),
      varianteIds,
    )
    expect(sansMessage).not.toHaveProperty('message')
  })
})
