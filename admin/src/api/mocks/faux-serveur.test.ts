// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { articles, journal, medias, site, tags } from '@/api/endpoints/contenus'
import { abonnes, demandes, messages } from '@/api/endpoints/audience'
import { comptes } from '@/api/endpoints/comptes'
import { aLeCode, manquantsDe, usagesDe, type ErreurApi } from '@/api/erreurs'
import { IDS_EXEMPLE } from '@/api/mocks/donnees'
import { avancer } from '@/api/mocks/magasin'
import { connecter, utiliserFauxServeur } from '@/test/faux-serveur'

utiliserFauxServeur()

const echec = (promesse: Promise<unknown>) =>
  promesse.then(
    () => null,
    (e: unknown) => e as ErreurApi,
  )

describe('faux serveur — connexion', () => {
  it('ouvre une session pour chacun des trois comptes d’essai', async () => {
    for (const role of ['editeur', 'admin', 'super'] as const) {
      const moi = await connecter(role)
      expect(moi.compte.email).toBe(`${role}@exemple.test`)
      expect(moi.reglages.languesActives).toEqual(['fr'])
    }
  })

  it('répond pareil à un e-mail inconnu et à un mauvais mot de passe, puis limite le débit', async () => {
    const { seConnecter } = await import('@/api/endpoints/auth')
    const inconnu = await echec(seConnecter('personne@exemple.test', 'x'))
    const mauvais = await echec(seConnecter('admin@exemple.test', 'x'))
    expect(inconnu?.code).toBe('IDENTIFIANTS_INVALIDES')
    expect(mauvais?.message).toBe(inconnu?.message)
    for (let i = 0; i < 3; i += 1) await echec(seConnecter('admin@exemple.test', 'x'))
    expect((await echec(seConnecter('admin@exemple.test', 'x')))?.code).toBe('TROP_DE_REQUETES')
  })
})

describe('faux serveur — cycle de vie (§ 7)', () => {
  it('RG-02 : un éditeur soumet mais ne publie pas', async () => {
    await connecter('editeur')
    const article = await articles.lire(IDS_EXEMPLE.articleRelecture)
    const refus = await echec(
      articles.transition(article.id, { vers: 'publie', version: article.version }),
    )
    expect(refus?.status).toBe(403)
    expect(refus?.code).toBe('RG-02')
  })

  it('un admin publie un article en relecture, et la reconstruction se suit jusqu’au bout', async () => {
    await connecter('admin')
    const article = await articles.lire(IDS_EXEMPLE.articleRelecture)
    const { contenu, publicationId } = await articles.transition(article.id, {
      vers: 'publie',
      version: article.version,
    })
    expect(contenu.statut).toBe('publie')
    expect(contenu.publieLe).not.toBeNull()
    expect(publicationId).not.toBeNull()
    // Pas encore terminée. L'état exact dépend du temps réel écoulé (en attente pendant 1 s, puis
    // en cours) : sous la charge de la suite complète, la seconde peut déjà être passée.
    expect(['en_attente', 'en_cours']).toContain((await site.publication(publicationId ?? '')).etat)
    avancer(5000)
    expect((await site.publication(publicationId ?? '')).etat).toBe('reussie')
    const lignes = await journal.lister({ entiteId: article.id })
    expect(lignes.items.map((ligne) => ligne.action)).toContain('transition:publie')
  })

  it('aucune transition directe de brouillon à publié (E-03)', async () => {
    await connecter('admin')
    const article = await articles.lire(IDS_EXEMPLE.articleBrouillon)
    const refus = await echec(
      articles.transition(article.id, { vers: 'publie', version: article.version }),
    )
    expect(refus?.code).toBe('TRANSITION_INTERDITE')
    expect(refus?.details).toMatchObject({ autorisees: ['en_relecture'] })
  })

  it('RG-03 : une soumission avec une image sans texte alternatif liste les manques', async () => {
    await connecter('editeur')
    const article = await articles.lire(IDS_EXEMPLE.articleBrouillon)
    const refus = await echec(
      articles.transition(article.id, { vers: 'en_relecture', version: article.version }),
    )
    expect(refus?.code).toBe('RG-03')
    const champs = manquantsDe(refus as ErreurApi).map((manque) => manque.champ)
    expect(champs).toEqual(
      expect.arrayContaining(['imageId', 'traductions.fr.extrait', 'traductions.fr.corps']),
    )
  })

  it('RG-06 : un article sans tag de format ne se publie pas', async () => {
    await connecter('admin')
    const article = await articles.lire(IDS_EXEMPLE.articleRelecture)
    const modifie = await articles.modifier(article.id, {
      tagIds: [IDS_EXEMPLE.tagTheme],
      version: article.version,
    })
    const refus = await echec(
      articles.transition(article.id, { vers: 'publie', version: modifie.version }),
    )
    expect(manquantsDe(refus as ErreurApi).map((m) => m.champ)).toContain('tagIds')
  })

  it('un refus exige un motif, et le motif reste visible', async () => {
    await connecter('admin')
    const article = await articles.lire(IDS_EXEMPLE.articleRelecture)
    const sansMotif = await echec(
      articles.transition(article.id, { vers: 'brouillon', version: article.version }),
    )
    expect(sansMotif?.champ).toBe('motif')
    const { contenu } = await articles.transition(article.id, {
      vers: 'brouillon',
      version: article.version,
      motif: 'Exemple de motif',
    })
    expect(contenu.dernierMotifRefus).toBe('Exemple de motif')
  })

  it('un éditeur ne modifie pas un contenu publié', async () => {
    await connecter('editeur')
    const article = await articles.lire(IDS_EXEMPLE.articlePublie)
    const refus = await echec(
      articles.modifier(article.id, { aLaUne: true, version: article.version }),
    )
    expect(refus?.code).toBe('RG-02')
  })
})

describe('faux serveur — écritures', () => {
  it('409 VERSION_PERIMEE sur une version ancienne', async () => {
    await connecter('editeur')
    const article = await articles.lire(IDS_EXEMPLE.articleBrouillon)
    await articles.modifier(article.id, { aLaUne: true, version: article.version })
    const refus = await echec(
      articles.modifier(article.id, { aLaUne: false, version: article.version }),
    )
    expect(refus?.status).toBe(409)
    expect(refus?.details).toEqual({ versionCourante: article.version + 1 })
  })

  it('RG-04 : un slug déjà pris est refusé avec une variante proposée', async () => {
    await connecter('editeur')
    const refus = await echec(
      articles.creer({
        categorie: 'Voyage',
        traductions: { fr: { titre: 'Doublon', slug: 'exemple-publie' } },
      }),
    )
    expect(refus?.code).toBe('RG-04')
    expect(refus?.details).toEqual({ suggestion: 'exemple-publie-2' })
  })

  it('pagination réelle, plafonnée à 100', async () => {
    await connecter('editeur')
    const page = await articles.lister({ pageSize: 2, tri: 'titre' })
    expect(page).toMatchObject({ page: 1, pageSize: 2, total: 3 })
    expect(page.items).toHaveLength(2)
    expect(() => articles.lister({ pageSize: 101 })).toThrow()
  })
})

describe('faux serveur — médias et tags', () => {
  it('RG-08 : un média utilisé ne se supprime pas, et ses usages sont listés', async () => {
    await connecter('admin')
    const media = await medias.lire(IDS_EXEMPLE.mediaComplet)
    const refus = await echec(medias.supprimer(media.id, media.version))
    expect(refus?.code).toBe('RG-08')
    expect(usagesDe(refus as ErreurApi).length).toBeGreaterThan(0)
  })

  it('un média s’envoie sans texte alternatif et apparaît « à fournir » (E-05)', async () => {
    await connecter('editeur')
    const fichier = new File([new Uint8Array(1024)], 'nom-ignore.jpg', { type: 'image/jpeg' })
    const media = await medias.envoyer(fichier)
    expect(media.champsAFournir).toEqual(['traductions.fr.texteAlt', 'credit'])
    const refuse = await echec(
      medias.envoyer(new File(['x'], 'a.exe', { type: 'application/x-msdownload' })),
    )
    expect(refuse?.code).toBe('FICHIER_REFUSE')
  })

  it('un éditeur ne supprime pas de média ; un tag utilisé ne se supprime pas', async () => {
    await connecter('editeur')
    const media = await medias.lire(IDS_EXEMPLE.mediaSansAlt)
    expect((await echec(medias.supprimer(media.id, media.version)))?.status).toBe(403)
    await connecter('admin')
    const tag = await tags.lire(IDS_EXEMPLE.tagFormat)
    expect(aLeCode(await echec(tags.supprimer(tag.id, tag.version)), 'RG-08')).toBe(true)
  })
})

describe('faux serveur — boîtes de réception et newsletter (§ 8)', () => {
  it('un éditeur n’a pas accès aux boîtes de réception ; un admin les traite', async () => {
    await connecter('editeur')
    expect((await echec(messages.lister({ statut: 'non_lu' })))?.status).toBe(403)

    await connecter('admin')
    const liste = await messages.lister({ statut: 'non_lu' })
    expect(liste.items).toHaveLength(1)
    const message = liste.items[0]
    if (!message) throw new Error('Message attendu en boîte de réception.')
    const modifie = await messages.modifier(message.id, { statut: 'lu', version: message.version })
    expect(modifie.statut).toBe('lu')
    const refus = await echec(messages.modifier(message.id, { statut: 'traite', version: 1 }))
    expect(refus?.status).toBe(409)
  })

  it('une demande de pièce passe par les transitions du service', async () => {
    await connecter('admin')
    const liste = await demandes.lister({ statut: 'nouvelle' })
    expect(liste.items).toHaveLength(1)
    const demande = liste.items[0]
    if (!demande) throw new Error('Demande attendue.')
    const prise = await demandes.modifier(demande.id, {
      statut: 'en_cours',
      version: demande.version,
    })
    expect(prise.statut).toBe('en_cours')
    const refus = await echec(
      demandes.modifier(prise.id, { statut: 'nouvelle', version: prise.version }),
    )
    expect(refus?.code).toBe('TRANSITION_INTERDITE')
  })

  it('l’export des abonnés part avec les consentements, puis l’abonné est supprimable', async () => {
    await connecter('admin')
    const liste = await abonnes.lister({ statut: 'en_attente' })
    expect(liste.items).toHaveLength(1)
    const abonne = liste.items[0]
    if (!abonne) throw new Error('Abonné attendu.')
    const texte = await abonnes.exporterAbonnes({ statut: 'en_attente' })
    expect(texte).toContain('abonne@exemple.test')
    await abonnes.supprimer(abonne.id)
    expect((await abonnes.lister({ statut: 'en_attente' })).items).toHaveLength(0)
  })
})

describe('faux serveur — comptes (§ 15.1)', () => {
  it('un éditeur n’a pas accès à la liste des comptes ; un super-admin la consulte', async () => {
    await connecter('editeur')
    expect((await echec(comptes.lister({ page: 1, pageSize: 20 })))?.status).toBe(403)

    await connecter('super')
    const liste = await comptes.lister({ page: 1, pageSize: 20 })
    expect(liste.items).toHaveLength(3)
    expect(liste.items.map((compte) => compte.email)).toEqual(
      expect.arrayContaining(['editeur@exemple.test', 'admin@exemple.test', 'super@exemple.test']),
    )
  })

  it('la création d’un compte éditeur passe par un lien ; la création d’un vendeur est refusée', async () => {
    await connecter('super')
    const cree = await comptes.creer({
      email: 'nouveau@exemple.test',
      nom: 'Nouveau',
      role: 'editeur',
    })
    expect(cree.actif).toBe(true)
    expect(cree.doitChangerMotDePasse).toBe(true)
    const refus = await echec(
      comptes.creer({ email: 'vendeur@exemple.test', nom: 'Vendeur', role: 'vendeur' }),
    )
    expect(refus?.code).toBe('MULTI_VENDEURS_INACTIF')
  })

  it('un compte se désactive, puis l’envoi du lien est refusé pour un compte inactif', async () => {
    await connecter('super')
    const liste = await comptes.lister({ page: 1, pageSize: 20 })
    const admin = liste.items.find((compte) => compte.email === 'admin@exemple.test')
    if (!admin) throw new Error('Compte admin attendu.')
    const desactive = await comptes.modifier(admin.id, { actif: false })
    expect(desactive.actif).toBe(false)
    const refus = await echec(comptes.envoyerLien(admin.id))
    expect(refus?.code).toBe('VALIDATION')
  })
})
