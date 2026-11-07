import { http } from 'msw'
import { z } from 'zod'
import { autoriser, versionPerimee } from '@/api/mocks/garde'
import { journaliser, magasin, ouvrirPublication } from '@/api/mocks/magasin'
import { API, erreur, json, lireCorps, paginer, vide } from '@/api/mocks/reponses'
import {
  entreeChiffreSchema,
  entreeMotifSchema,
  modificationChiffreSchema,
  modificationMotifSchema,
  modificationNavigationSchema,
  modificationParametresSchema,
  modificationTextesInterfaceSchema,
} from '@/api/schemas/reglages'

/**
 * Réglages du site simulés (contrat § 13). Listes ordonnables (§ 13.2, § 13.6) et singletons
 * `GET` + `PATCH` avec `version` : chaque modification est journalisée ; les singletons (§ 13.3
 * à 13.5) demandent en plus une reconstruction du site (motif `reglage`).
 */
const ordreSchema = z.strictObject({ ids: z.array(z.uuid()).min(1) })

/** `422` quand la liste `ids` ne porte pas exactement les éléments d'une collection. */
function ordreInvalide(ids: string[], existants: Set<string>): boolean {
  return (
    new Set(ids).size !== ids.length ||
    ids.some((id) => !existants.has(id)) ||
    ids.length !== existants.size
  )
}

/** Retape l'e-mail du compte qui agit (RG-16, réglages sensibles § 13.3). */
const emailFaux = (garde: { compte: { email: string } }, envoye: string | undefined) =>
  envoye === undefined || envoye !== garde.compte.email

export const handlersReglages = [
  // --- Chiffres d'audience (§ 13.2) : ordonnables, sans cycle de vie ---
  http.get(`${API}/audience`, ({ request }) => {
    const garde = autoriser(request, 'lire', 'audience')
    if (!garde.ok) return garde.reponse
    const tries = [...magasin.chiffresAudience].sort((a, b) => a.ordre - b.ordre)
    const page = paginer(new URL(request.url), tries)
    return page.ok ? json(page.corps) : page.reponse
  }),

  http.post(`${API}/audience`, async ({ request }) => {
    const garde = autoriser(request, 'creer', 'audience')
    if (!garde.ok) return garde.reponse
    const corps = await lireCorps(request, entreeChiffreSchema)
    if (!corps.ok) return corps.reponse
    const chiffre = {
      id: crypto.randomUUID(),
      ordre: Math.max(-1, ...magasin.chiffresAudience.map((c) => c.ordre)) + 1,
      version: 1,
      plateforme: corps.valeur.plateforme,
      taille: corps.valeur.taille ?? null,
      portee: corps.valeur.portee ?? null,
      dateValidation: corps.valeur.dateValidation ?? null,
      source: corps.valeur.source ?? null,
    }
    magasin.chiffresAudience.push(chiffre)
    journaliser(garde.compte, 'creation', 'audience', chiffre.id, null, chiffre)
    return json(chiffre, 201)
  }),

  http.patch(`${API}/audience/:id`, async ({ request, params }) => {
    const garde = autoriser(request, 'modifier', 'audience')
    if (!garde.ok) return garde.reponse
    const chiffre = magasin.chiffresAudience.find((c) => c.id === params['id'])
    if (!chiffre) return erreur(404, 'NON_TROUVE', 'Ce chiffre n’existe pas.')
    const corps = await lireCorps(request, modificationChiffreSchema)
    if (!corps.ok) return corps.reponse
    const { version, ...modifications } = corps.valeur
    const perimee = versionPerimee(version, chiffre.version)
    if (perimee) return perimee
    const avant = structuredClone(chiffre)
    Object.assign(chiffre, modifications, { version: chiffre.version + 1 })
    journaliser(garde.compte, 'modification', 'audience', chiffre.id, avant, chiffre)
    return json(chiffre)
  }),

  http.delete(`${API}/audience/:id`, ({ request, params }) => {
    const garde = autoriser(request, 'supprimer', 'audience')
    if (!garde.ok) return garde.reponse
    const chiffre = magasin.chiffresAudience.find((c) => c.id === params['id'])
    if (!chiffre) return erreur(404, 'NON_TROUVE', 'Ce chiffre n’existe pas.')
    const version = Number(new URL(request.url).searchParams.get('version'))
    const perimee = versionPerimee(Number.isNaN(version) ? null : version, chiffre.version)
    if (perimee) return perimee
    magasin.chiffresAudience = magasin.chiffresAudience.filter((c) => c.id !== chiffre.id)
    journaliser(garde.compte, 'suppression', 'audience', chiffre.id, chiffre, null)
    return vide()
  }),

  http.patch(`${API}/audience/ordre`, async ({ request }) => {
    const garde = autoriser(request, 'ordonner', 'audience')
    if (!garde.ok) return garde.reponse
    const corps = await lireCorps(request, ordreSchema)
    if (!corps.ok) return corps.reponse
    const { ids } = corps.valeur
    const existants = new Set(magasin.chiffresAudience.map((c) => c.id))
    if (ordreInvalide(ids, existants)) {
      return erreur(
        422,
        'VALIDATION',
        'La liste doit contenir chaque chiffre exactement une fois.',
        { champ: 'ids' },
      )
    }
    for (const chiffre of magasin.chiffresAudience) chiffre.ordre = ids.indexOf(chiffre.id)
    journaliser(garde.compte, 'ordre', 'audience', null, null, { ids })
    return json({ ids })
  }),

  // --- Motifs du formulaire de contact (§ 13.6) : mêmes règles que les chiffres ---
  http.get(`${API}/motifs-contact`, ({ request }) => {
    const garde = autoriser(request, 'lire', 'motifs-contact')
    if (!garde.ok) return garde.reponse
    const tries = [...magasin.motifsContact].sort((a, b) => a.ordre - b.ordre)
    const page = paginer(new URL(request.url), tries)
    return page.ok ? json(page.corps) : page.reponse
  }),

  http.post(`${API}/motifs-contact`, async ({ request }) => {
    const garde = autoriser(request, 'creer', 'motifs-contact')
    if (!garde.ok) return garde.reponse
    const corps = await lireCorps(request, entreeMotifSchema)
    if (!corps.ok) return corps.reponse
    const { fr, en } = corps.valeur.traductions
    const motif = {
      id: crypto.randomUUID(),
      ordre: Math.max(-1, ...magasin.motifsContact.map((m) => m.ordre)) + 1,
      version: 1,
      traductions: {
        fr: { titre: fr.titre, description: fr.description ?? null },
        ...(en ? { en: { titre: en.titre ?? fr.titre, description: en.description ?? null } } : {}),
      },
    }
    magasin.motifsContact.push(motif)
    journaliser(garde.compte, 'creation', 'motifs-contact', motif.id, null, motif)
    return json(motif, 201)
  }),

  http.patch(`${API}/motifs-contact/:id`, async ({ request, params }) => {
    const garde = autoriser(request, 'modifier', 'motifs-contact')
    if (!garde.ok) return garde.reponse
    const motif = magasin.motifsContact.find((m) => m.id === params['id'])
    if (!motif) return erreur(404, 'NON_TROUVE', 'Ce motif n’existe pas.')
    const corps = await lireCorps(request, modificationMotifSchema)
    if (!corps.ok) return corps.reponse
    const { version, ...modifications } = corps.valeur
    const perimee = versionPerimee(version, motif.version)
    if (perimee) return perimee
    const avant = structuredClone(motif)
    const { fr, en } = modifications.traductions ?? {}
    if (fr) {
      motif.traductions.fr = {
        titre: fr.titre ?? motif.traductions.fr?.titre ?? '',
        description: fr.description ?? null,
      }
    }
    if (en === null) delete motif.traductions.en
    else if (typeof en === 'object') {
      motif.traductions.en = {
        titre: en.titre ?? motif.traductions.en?.titre ?? motif.traductions.fr?.titre ?? '',
        description: en.description ?? motif.traductions.en?.description ?? null,
      }
    }
    motif.version += 1
    journaliser(garde.compte, 'modification', 'motifs-contact', motif.id, avant, motif)
    return json(motif)
  }),

  http.delete(`${API}/motifs-contact/:id`, ({ request, params }) => {
    const garde = autoriser(request, 'supprimer', 'motifs-contact')
    if (!garde.ok) return garde.reponse
    const motif = magasin.motifsContact.find((m) => m.id === params['id'])
    if (!motif) return erreur(404, 'NON_TROUVE', 'Ce motif n’existe pas.')
    const version = Number(new URL(request.url).searchParams.get('version'))
    const perimee = versionPerimee(Number.isNaN(version) ? null : version, motif.version)
    if (perimee) return perimee
    magasin.motifsContact = magasin.motifsContact.filter((m) => m.id !== motif.id)
    journaliser(garde.compte, 'suppression', 'motifs-contact', motif.id, motif, null)
    return vide()
  }),

  http.patch(`${API}/motifs-contact/ordre`, async ({ request }) => {
    const garde = autoriser(request, 'ordonner', 'motifs-contact')
    if (!garde.ok) return garde.reponse
    const corps = await lireCorps(request, ordreSchema)
    if (!corps.ok) return corps.reponse
    const { ids } = corps.valeur
    const existants = new Set(magasin.motifsContact.map((m) => m.id))
    if (ordreInvalide(ids, existants)) {
      return erreur(422, 'VALIDATION', 'La liste doit contenir chaque motif exactement une fois.', {
        champ: 'ids',
      })
    }
    for (const motif of magasin.motifsContact) motif.ordre = ids.indexOf(motif.id)
    journaliser(garde.compte, 'ordre', 'motifs-contact', null, null, { ids })
    return json({ ids })
  }),

  // --- Paramètres (§ 13.3) : GET + PATCH, chaque champ porte son « qui modifie » ---
  http.get(`${API}/parametres`, ({ request }) => {
    const garde = autoriser(request, 'lire', 'parametres')
    if (!garde.ok) return garde.reponse
    return json(magasin.parametres)
  }),

  http.patch(`${API}/parametres`, async ({ request }) => {
    const garde = autoriser(request, 'modifier', 'parametres')
    if (!garde.ok) return garde.reponse
    const corps = await lireCorps(request, modificationParametresSchema)
    if (!corps.ok) return corps.reponse
    const { version, ...modifications } = corps.valeur
    const perimee = versionPerimee(version, magasin.parametres.version)
    if (perimee) return perimee

    /** Qui modifie (§ 13.3) : un champ super-admin glissé dans une écriture admin refuse tout. */
    const CHAMPS_SUPER_ADMIN = new Set([
      'regroupementPublicationSecondes',
      'boutiqueEnLigne',
      'multiVendeurs',
    ])
    const touches = Object.keys(modifications)
    if (touches.some((c) => CHAMPS_SUPER_ADMIN.has(c)) && garde.compte.role !== 'super_admin') {
      return erreur(403, 'DROIT_INSUFFISANT', 'Ce réglage est réservé au super-admin.')
    }
    if (
      touches.some((c) => CHAMPS_SUPER_ADMIN.has(c)) &&
      emailFaux(garde, modifications.confirmationEmail)
    ) {
      return erreur(422, 'VALIDATION', 'Retapez l’adresse du compte qui agit.', {
        champ: 'confirmationEmail',
      })
    }
    if (modifications.multiVendeurs === true) {
      const sansCreateur = magasin.bijoux.some((b) => !b.createurId)
      if (sansCreateur)
        return erreur(
          422,
          'MULTI_VENDEURS_INACTIF',
          'Chaque bijou doit avoir un créateur avant d’ouvrir à plusieurs vendeurs.',
        )
    }
    if (modifications.multiVendeurs === false) {
      const vendeurActif = magasin.comptes.some(
        (essai) => essai.compte.role === 'vendeur' && essai.compte.actif,
      )
      if (vendeurActif)
        return erreur(
          422,
          'MULTI_VENDEURS_INACTIF',
          'Désactivez d’abord les comptes vendeurs actifs.',
        )
    }
    if (modifications.boutiqueEnLigne === true) {
      return erreur(422, 'VALIDATION', 'Vente en ligne non disponible dans cette version.')
    }

    const avant = structuredClone(magasin.parametres)
    Object.assign(magasin.parametres, modifications, { version: magasin.parametres.version + 1 })
    magasin.languesActives = [...magasin.parametres.languesActives]
    magasin.multiVendeurs = magasin.parametres.multiVendeurs
    magasin.boutiqueEnLigne = magasin.parametres.boutiqueEnLigne
    journaliser(garde.compte, 'modification', 'parametres', null, avant, magasin.parametres)
    ouvrirPublication(garde.compte, 'reglage', null)
    return json(magasin.parametres)
  }),

  // --- Navigation (§ 13.4) : document unique, remplacé en entier à chaque PATCH ---
  http.get(`${API}/navigation`, ({ request }) => {
    const garde = autoriser(request, 'lire', 'navigation')
    if (!garde.ok) return garde.reponse
    return json(magasin.navigation)
  }),

  http.patch(`${API}/navigation`, async ({ request }) => {
    const garde = autoriser(request, 'modifier', 'navigation')
    if (!garde.ok) return garde.reponse
    const corps = await lireCorps(request, modificationNavigationSchema)
    if (!corps.ok) return corps.reponse
    const { version, ...suivant } = corps.valeur
    const perimee = versionPerimee(version, magasin.navigation.version)
    if (perimee) return perimee
    const avant = structuredClone(magasin.navigation)
    magasin.navigation = { ...suivant, version: magasin.navigation.version + 1 }
    journaliser(garde.compte, 'modification', 'navigation', null, avant, magasin.navigation)
    ouvrirPublication(garde.compte, 'reglage', null)
    return json(magasin.navigation)
  }),

  // --- Textes d'interface (§ 13.5) : seules les clés fournies bougent, une clé inconnue refuse ---
  http.get(`${API}/textes-interface`, ({ request }) => {
    const garde = autoriser(request, 'lire', 'textes-interface')
    if (!garde.ok) return garde.reponse
    return json(magasin.textesInterface)
  }),

  http.patch(`${API}/textes-interface`, async ({ request }) => {
    const garde = autoriser(request, 'modifier', 'textes-interface')
    if (!garde.ok) return garde.reponse
    const corps = await lireCorps(request, modificationTextesInterfaceSchema)
    if (!corps.ok) return corps.reponse
    const { version, valeurs } = corps.valeur
    const perimee = versionPerimee(version, magasin.textesInterface.version)
    if (perimee) return perimee
    const inconnue = Object.keys(valeurs).find((cle) => !(cle in magasin.textesInterface.valeurs))
    if (inconnue) {
      return erreur(422, 'VALIDATION', `Clé de texte inconnue : les clés viennent du site.`, {
        champ: 'valeurs',
      })
    }
    const avant = structuredClone(magasin.textesInterface)
    for (const [cle, ecrite] of Object.entries(valeurs)) {
      const existante = magasin.textesInterface.valeurs[cle]
      if (!existante) {
        return erreur(422, 'VALIDATION', `Clé de texte inconnue : les clés viennent du site.`, {
          champ: 'valeurs',
        })
      }
      magasin.textesInterface.valeurs[cle] = {
        fr: ecrite.fr ?? existante.fr,
        ...(ecrite.en !== undefined ? { en: ecrite.en } : existante.en ? { en: existante.en } : {}),
      }
    }
    magasin.textesInterface.version += 1
    journaliser(
      garde.compte,
      'modification',
      'textes-interface',
      null,
      avant,
      magasin.textesInterface,
    )
    ouvrirPublication(garde.compte, 'reglage', null)
    return json(magasin.textesInterface)
  }),
]
