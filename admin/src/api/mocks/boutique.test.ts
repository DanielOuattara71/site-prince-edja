// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { bijoux, categories, createurs } from '@/api/endpoints/boutique'
import type { ErreurApi } from '@/api/erreurs'
import { ID_CREATEUR_EXEMPLE, ID_CREATEUR_PRINCIPAL, IDS_EXEMPLE } from '@/api/mocks/donnees'
import { magasin } from '@/api/mocks/magasin'
import { connecter, utiliserFauxServeur } from '@/test/faux-serveur'

/** Étape 6 : boutique simulée — mêmes règles que le back end (B-39 à B-45). */

utiliserFauxServeur()

const echec = (promesse: Promise<unknown>) =>
  promesse.then(
    () => null,
    (e: unknown) => e as ErreurApi,
  )

describe('catégories (§ 10.1)', () => {
  it('huit catégories de produits ordonnées ; RG-31 : une catégorie utilisée reste', async () => {
    await connecter('admin')
    const produits = () => categories.lister({ pageSize: 100 }, undefined, { famille: 'produit' })
    const liste = await produits()
    expect(liste.total).toBe(8)
    expect(liste.items[0]?.nombreBijouxPublies).toBe(1)
    const premiere = await categories.lire(IDS_EXEMPLE.categorieBijoux)
    expect((await echec(categories.supprimer(premiere.id, premiere.version)))?.code).toBe(
      'CATEGORIE_UTILISEE',
    )
    const ids = liste.items.map((c) => c.id)
    expect((await echec(categories.ordonner(ids.slice(1))))?.code).toBe('VALIDATION')
    await categories.ordonner([...ids].reverse())
    expect((await produits()).items[0]?.id).toBe(ids.at(-1))
  })

  it('un éditeur lit les catégories mais ne les gère pas', async () => {
    await connecter('editeur')
    expect((await categories.lister({}, undefined, { famille: 'produit' })).total).toBe(8)
    expect((await categories.lister({}, undefined, { famille: 'article' })).total).toBe(8)
    const refus = await echec(categories.creer({ traductions: { fr: { nom: 'Exemple' } } }))
    expect(refus?.status).toBe(403)
  })
})

describe('bijoux et variantes (§ 10.3)', () => {
  it('une variante par défaut, vide ; rien n’est inventé', async () => {
    await connecter('editeur')
    const b = await bijoux.creer({
      numero: '07',
      categorieId: IDS_EXEMPLE.categorieBijoux,
      traductions: { fr: { nom: 'Exemple — bague' } },
    })
    expect(b.variantes).toEqual([
      expect.objectContaining({ reference: '07-1', prix: null, matiere: null, stock: null }),
    ])
    expect(b.createurId).toBe(ID_CREATEUR_PRINCIPAL)
    expect(b.champsAFournir).toEqual(expect.arrayContaining(['variantes.0.prix', 'poids']))
  })

  it('prixConfirme : admin seulement, et seulement avec un prix (RG-10)', async () => {
    await connecter('editeur')
    const b = await bijoux.lire(IDS_EXEMPLE.bijouBrouillon)
    expect(
      (await echec(bijoux.modifier(b.id, { prixConfirme: true, version: b.version })))?.status,
    ).toBe(403)
    await connecter('admin')
    expect(
      (await echec(bijoux.modifier(b.id, { prixConfirme: true, version: b.version })))?.code,
    ).toBe('RG-10')
    const v = b.variantes[0]
    if (!v) throw new Error('Variante absente.')
    expect(
      (
        await echec(
          bijoux.variantes.modifier(b.id, v.id, { prix: 100, ancienPrix: 90, version: 1 }),
        )
      )?.code,
    ).toBe('VALIDATION')
    await bijoux.variantes.modifier(b.id, v.id, { prix: 45000, version: 1 })
    const confirme = await bijoux.modifier(b.id, { prixConfirme: true, version: b.version })
    expect(confirme.prixConfirme).toBe(true)
  })

  it('RG-10 : la dernière variante reste ; RG-11 : une variante demandée aussi', async () => {
    await connecter('editeur')
    const b = await bijoux.lire(IDS_EXEMPLE.bijouBrouillon)
    expect(
      (await echec(bijoux.variantes.supprimer(b.id, IDS_EXEMPLE.varianteBrouillon, 1)))?.code,
    ).toBe('RG-10')
    const seconde = await bijoux.variantes.creer(b.id, { taille: 'Exemple : M' })
    expect(seconde.reference).toBe('01-2')
    magasin.variantesCitees.push(seconde.id)
    expect((await echec(bijoux.variantes.supprimer(b.id, seconde.id, 1)))?.code).toBe('RG-11')
  })

  it('RG-20 : un créateur inactif ne reçoit pas de bijou ; la vente en ligne exige prix et stock', async () => {
    await connecter('editeur')
    const refus = await echec(
      bijoux.creer({
        numero: '09',
        categorieId: IDS_EXEMPLE.categorieBijoux,
        createurId: ID_CREATEUR_EXEMPLE,
        traductions: { fr: { nom: 'Exemple' } },
      }),
    )
    expect(refus?.code).toBe('RG-20')
    await connecter('admin')
    magasin.boutiqueEnLigne = true
    const publie = await bijoux.lire(IDS_EXEMPLE.bijouPublie)
    const depublie = await bijoux.transition(publie.id, {
      vers: 'brouillon',
      version: publie.version,
    })
    const soumis = await echec(
      bijoux.transition(publie.id, { vers: 'en_relecture', version: depublie.contenu.version }),
    )
    expect(soumis?.code).toBe('RG-10')
  })
})

describe('créateurs (§ 10.2)', () => {
  it('RG-21 : le principal ne se supprime, ne se désactive ni ne s’archive', async () => {
    await connecter('admin')
    const principal = await createurs.lirePrincipal()
    expect((await echec(createurs.supprimer(principal.id, principal.version)))?.code).toBe('RG-21')
    expect(
      (await echec(createurs.modifier(principal.id, { actif: false, version: principal.version })))
        ?.code,
    ).toBe('RG-21')
    expect(
      (
        await echec(
          createurs.transition(principal.id, { vers: 'archive', version: principal.version }),
        )
      )?.code,
    ).toBe('RG-21')
  })

  it('hors multi-vendeurs : inactif par défaut, sans commission ; adresse figée après publication', async () => {
    await connecter('admin')
    expect((await echec(createurs.creer({ nom: 'Exemple', actif: true })))?.code).toBe(
      'MULTI_VENDEURS_INACTIF',
    )
    expect((await echec(createurs.creer({ nom: 'Exemple', tauxCommission: 10 })))?.code).toBe(
      'MULTI_VENDEURS_INACTIF',
    )
    const cree = await createurs.creer({ nom: 'Exemple : atelier' })
    expect(cree).toMatchObject({ actif: false, slug: 'exemple-atelier', tauxCommission: null })
    const principal = await createurs.lirePrincipal()
    const fige = await echec(
      createurs.modifier(principal.id, { slug: 'autre', version: principal.version }),
    )
    expect(fige?.code).toBe('SLUG_FIGE')
  })

  it('RG-27 : un créateur qui a des bijoux ne se supprime pas ; le désactiver les dépublie', async () => {
    await connecter('admin')
    magasin.multiVendeurs = true
    const invite = await createurs.lire(ID_CREATEUR_EXEMPLE)
    const actif = await createurs.modifier(invite.id, { actif: true, version: invite.version })
    const publie = magasin.bijoux.find((b) => b.id === IDS_EXEMPLE.bijouPublie)
    if (!publie) throw new Error('Bijou absent.')
    publie.createurId = invite.id
    expect((await echec(createurs.supprimer(invite.id, actif.version)))?.code).toBe('RG-27')
    await createurs.modifier(invite.id, { actif: false, version: actif.version })
    expect((await bijoux.lire(publie.id)).statut).toBe('brouillon')
  })
})
