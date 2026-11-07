import { http } from 'msw'
import { autoriser } from '@/api/mocks/garde'
import { journaliser, magasin } from '@/api/mocks/magasin'
import { API, erreur, json, lireCorps, paginer, vide } from '@/api/mocks/reponses'
import { entreeCompteSchema, modificationCompteSchema } from '@/api/schemas/comptes'

/**
 * Comptes (`docs/CONTRAT-API.md` § 15.1) : lecture, création, rôle, désactivation et lien
 * de réinitialisation. Reflet des services du back end (`modules/comptes`) : les garde-fous
 * (dernier super-admin, RG-16, double saisie du rôle) sont faits ici comme au serveur.
 */

export const handlersComptes = [
  http.get(`${API}/comptes`, ({ request }) => {
    const garde = autoriser(request, 'lire', 'comptes')
    if (!garde.ok) return garde.reponse
    const url = new URL(request.url)
    const p = url.searchParams
    const liste = magasin.comptes
      .map((essai) => essai.compte)
      .filter((compte) => {
        if (p.get('role') && compte.role !== p.get('role')) return false
        const actif = p.get('actif')
        if (actif !== null && actif !== undefined && (actif === 'true') !== compte.actif) {
          return false
        }
        return true
      })
    const page = paginer(url, liste)
    return page.ok ? json(page.corps) : page.reponse
  }),

  http.get(`${API}/comptes/:id`, ({ request, params }) => {
    const garde = autoriser(request, 'lire', 'comptes')
    if (!garde.ok) return garde.reponse
    const compteConnecte = magasin.comptes
      .map((essai) => essai.compte)
      .find((candidat) => candidat.id === String(params['id']))
    if (!compteConnecte) return erreur(404, 'NON_TROUVE', 'Ce compte n’exexiste pas.')
    return json(compteConnecte)
  }),

  http.post(`${API}/comptes`, async ({ request }) => {
    const garde = autoriser(request, 'creer', 'comptes')
    if (!garde.ok) return garde.reponse
    const corps = await lireCorps(request, entreeCompteSchema)
    if (!corps.ok) return corps.reponse
    const entree = corps.valeur
    if (entree.role === 'vendeur' && !magasin.multiVendeurs) {
      return erreur(422, 'MULTI_VENDEURS_INACTIF', 'Le mode multi-vendeurs est désactivé.', {
        champ: 'role',
      })
    }
    const email = entree.email.trim().toLowerCase()
    if (magasin.comptes.some((essai) => essai.compte.email === email)) {
      return erreur(422, 'VALIDATION', 'Un compte existe déjà avec cette adresse.', {
        champ: 'email',
      })
    }
    const compte = {
      id: crypto.randomUUID(),
      email,
      nom: entree.nom,
      role: entree.role,
      actif: true,
      derniereConnexion: null,
      doitChangerMotDePasse: true,
      createurId: null,
    }
    magasin.comptes.push({ compte, motDePasse: '' })
    journaliser(garde.compte, 'creation', 'comptes', compte.id, null, compte)
    return json(compte, 201)
  }),

  http.patch(`${API}/comptes/:id`, async ({ request, params }) => {
    const garde = autoriser(request, 'modifier', 'comptes')
    if (!garde.ok) return garde.reponse
    const id = String(params['id'])
    const cible = magasin.comptes.map((essai) => essai.compte).find((compte) => compte.id === id)
    if (!cible) return erreur(404, 'NON_TROUVE', 'Ce compte n’exexiste pas.')
    const corps = await lireCorps(request, modificationCompteSchema)
    if (!corps.ok) return corps.reponse
    const modification = corps.valeur
    if (garde.compte.id === id) {
      return erreur(
        403,
        'RG-16',
        'Vous ne pouvez ni modifier votre rôle, ni vous désactiver vous-même.',
      )
    }
    const perdSuperAdmin =
      cible.role === 'super_admin' &&
      ((modification.role !== undefined && modification.role !== 'super_admin') ||
        (modification.actif === false && cible.actif))
    if (perdSuperAdmin) {
      const superAdminsRestants = magasin.comptes.filter(
        (essai) =>
          essai.compte.role === 'super_admin' && essai.compte.actif && essai.compte.id !== id,
      ).length
      if (superAdminsRestants === 0) {
        return erreur(
          422,
          'RG-16',
          'Le dernier super-admin ne peut être ni rétrogradé, ni désactivé.',
        )
      }
    }
    if (modification.role && modification.confirmationEmail?.trim().toLowerCase() !== cible.email) {
      return erreur(
        422,
        'RG-16',
        'Recopiez l’adresse e-mail du compte pour confirmer le changement de rôle.',
        {
          champ: 'confirmationEmail',
        },
      )
    }
    const apres = {
      ...cible,
      nom: modification.nom ?? cible.nom,
      role: modification.role ?? cible.role,
      actif: modification.actif ?? cible.actif,
    }
    const index = magasin.comptes.findIndex((essai) => essai.compte.id === id)
    const actuel = magasin.comptes[index]
    if (!actuel) return erreur(404, 'NON_TROUVE', 'Ce compte n’exexiste pas.')
    magasin.comptes[index] = { compte: apres, motDePasse: actuel.motDePasse }
    journaliser(
      garde.compte,
      modification.role ? 'changement_role' : 'modification',
      'comptes',
      id,
      cible,
      apres,
    )
    return json(apres)
  }),

  http.post(`${API}/comptes/:id/lien-mot-de-passe`, async ({ request, params }) => {
    const garde = autoriser(request, 'modifier', 'comptes')
    if (!garde.ok) return garde.reponse
    const id = String(params['id'])
    const cible = magasin.comptes.map((essai) => essai.compte).find((compte) => compte.id === id)
    if (!cible) return erreur(404, 'NON_TROUVE', 'Ce compte n’exexiste pas.')
    if (!cible.actif) {
      return erreur(422, 'VALIDATION', 'Réactivez le compte avant de lui envoyer un lien.', {
        champ: 'actif',
      })
    }
    journaliser(garde.compte, 'envoi_lien', 'comptes', id, null, null)
    return vide()
  }),
]
