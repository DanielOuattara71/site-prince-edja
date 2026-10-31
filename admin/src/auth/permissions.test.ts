import { describe, expect, it } from 'vitest'
import { peut, type Action, type CompteDroits, type Ressource } from '@/auth/permissions'

/** Tableau de droits de `docs/CONTRAT-API.md` § 5, rôle par rôle. */

const CREATEUR_A = '00000000-0000-4000-8000-00000000000a'
const CREATEUR_B = '00000000-0000-4000-8000-00000000000b'

const compte = (role: CompteDroits['role'], extra: Partial<CompteDroits> = {}): CompteDroits => ({
  id: `00000000-0000-4000-8000-0000000000${role.length.toString().padStart(2, '0')}`,
  role,
  actif: true,
  createurId: null,
  ...extra,
})

const editeur = compte('editeur')
const admin = compte('admin')
const superAdmin = compte('super_admin')
const vendeur = compte('vendeur', { createurId: CREATEUR_A })

type Ligne = [Action, Ressource, boolean, boolean, boolean]

describe('peut — éditeur, admin, super-admin', () => {
  // action, ressource, éditeur, admin, super-admin
  const tableau: Ligne[] = [
    ['lire', 'articles', true, true, true],
    ['creer', 'articles', true, true, true],
    ['soumettre', 'articles', true, true, true],
    ['publier', 'articles', false, true, true],
    ['refuser', 'articles', false, true, true],
    ['depublier', 'articles', false, true, true],
    ['archiver', 'articles', false, true, true],
    ['desarchiver', 'articles', false, true, true],
    ['supprimer', 'articles', false, true, true],
    ['restaurer', 'articles', false, true, true],
    ['confirmer_prix', 'bijoux', false, true, true],
    ['confirmer_prix', 'articles', false, false, false],
    ['creer', 'medias', true, true, true],
    ['supprimer', 'medias', false, true, true],
    ['lire', 'tags', true, true, true],
    ['creer', 'tags', false, true, true],
    ['lire', 'createurs', true, true, true],
    ['modifier', 'createurs', false, true, true],
    ['lire', 'messages', false, true, true],
    ['exporter', 'abonnes', false, true, true],
    ['modifier', 'navigation', false, true, true],
    ['modifier_hero', 'identite', false, true, true],
    ['modifier', 'parametres', false, true, true],
    ['basculer_interrupteur', 'parametres', false, false, true],
    ['reconstruire', 'site', false, true, true],
    ['lire', 'site', true, true, true],
    ['lire', 'journal', false, true, true],
    ['exporter', 'journal', false, false, true],
    ['lire', 'tableau-de-bord', true, true, true],
    ['creer', 'pages', false, false, false],
    ['supprimer', 'pages-legales', false, false, false],
  ]

  it.each(tableau)('%s %s → éditeur %s, admin %s, super-admin %s', (action, ressource, e, a, s) => {
    expect(peut(editeur, action, ressource)).toBe(e)
    expect(peut(admin, action, ressource)).toBe(a)
    expect(peut(superAdmin, action, ressource)).toBe(s)
  })
})

describe('peut — écriture selon le statut (§ 7.4)', () => {
  it('un éditeur ne modifie qu’un brouillon', () => {
    expect(peut(editeur, 'modifier', 'articles', { statut: 'brouillon' })).toBe(true)
    expect(peut(editeur, 'modifier', 'articles', { statut: 'en_relecture' })).toBe(false)
    expect(peut(editeur, 'modifier', 'articles', { statut: 'publie' })).toBe(false)
  })

  it('un admin modifie aussi un contenu en relecture ou publié, jamais un archivé', () => {
    expect(peut(admin, 'modifier', 'articles', { statut: 'publie' })).toBe(true)
    expect(peut(admin, 'modifier', 'articles', { statut: 'archive' })).toBe(false)
  })
})

describe('peut — comptes (RG-16)', () => {
  it('un éditeur ne gère aucun compte', () => {
    expect(peut(editeur, 'lire', 'comptes')).toBe(false)
  })

  it('un admin gère les éditeurs, pas les admins', () => {
    expect(peut(admin, 'creer', 'comptes', { role: 'editeur' })).toBe(true)
    expect(peut(admin, 'creer', 'comptes', { role: 'admin' })).toBe(false)
    expect(peut(admin, 'modifier', 'comptes', { role: 'super_admin' })).toBe(false)
  })

  it('un super-admin gère tous les rôles, sauf le sien et sauf les vendeurs', () => {
    expect(peut(superAdmin, 'creer', 'comptes', { role: 'admin' })).toBe(true)
    expect(
      peut(superAdmin, 'modifier', 'comptes', { id: superAdmin.id, role: 'super_admin' }),
    ).toBe(false)
    expect(peut(superAdmin, 'creer', 'comptes', { role: 'vendeur' })).toBe(false)
  })
})

describe('peut — vendeur (préparé, RG-22, RG-23)', () => {
  it('voit et modifie ses produits, jamais ceux d’un autre créateur', () => {
    expect(peut(vendeur, 'lire', 'bijoux', { createurId: CREATEUR_A })).toBe(true)
    expect(
      peut(vendeur, 'modifier', 'bijoux', { createurId: CREATEUR_A, statut: 'brouillon' }),
    ).toBe(true)
    expect(peut(vendeur, 'lire', 'bijoux', { createurId: CREATEUR_B })).toBe(false)
    expect(peut(vendeur, 'modifier', 'medias', { createurId: CREATEUR_B })).toBe(false)
  })

  it('soumet, mais ne publie jamais', () => {
    expect(peut(vendeur, 'soumettre', 'bijoux', { createurId: CREATEUR_A })).toBe(true)
    expect(peut(vendeur, 'publier', 'bijoux', { createurId: CREATEUR_A })).toBe(false)
    expect(peut(vendeur, 'supprimer', 'bijoux', { createurId: CREATEUR_A })).toBe(false)
  })

  it('n’accède à aucun contenu éditorial ni réglage', () => {
    const interdites: Ressource[] = [
      'articles',
      'episodes',
      'messages',
      'abonnes',
      'comptes',
      'parametres',
      'journal',
    ]
    for (const ressource of interdites) expect(peut(vendeur, 'lire', ressource)).toBe(false)
  })

  it('un vendeur sans créateur n’a aucun droit', () => {
    expect(peut(compte('vendeur'), 'lire', 'bijoux')).toBe(false)
  })
})

describe('peut — compte absent ou inactif', () => {
  it('refuse tout', () => {
    expect(peut(null, 'lire', 'articles')).toBe(false)
    expect(peut(compte('super_admin', { actif: false }), 'lire', 'articles')).toBe(false)
  })
})
