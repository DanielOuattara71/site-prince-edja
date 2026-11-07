import { afterEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { ErreurApi } from '@/api/erreurs'
import { AVANCE_AVERTISSEMENT_MS, delaisSession, minutesRestantes } from '@/auth/inactivite'
import { comparer, valeurLisible } from '@/lib/comparer'
import { listerErreurs, rattacherErreursServeur } from '@/lib/formulaires'
import { messageErreur } from '@/lib/message-erreur'
import { ecrirePreference, lirePreference } from '@/lib/preferences'
import { etatAffiche } from '@/lib/statuts'
import { etatTraduction, libelleChamp } from '@/lib/traductions'

/** Logique pure des composants transverses (étape 3). */

describe('états affichés (D-18)', () => {
  const maintenant = Date.parse('2026-10-30T12:00:00Z')
  it('publié avec une date future = programmé (RG-05)', () => {
    expect(etatAffiche('publie', '2026-11-01T09:00:00Z', maintenant)).toBe('programme')
    expect(etatAffiche('publie', '2026-10-29T09:00:00Z', maintenant)).toBe('publie')
    expect(etatAffiche('brouillon', '2026-11-01T09:00:00Z', maintenant)).toBe('brouillon')
  })
})

describe('traductions', () => {
  it('le français est la référence : l’anglais n’est « à traduire » que si le français existe', () => {
    expect(etatTraduction('fr', { fr: 'Titre' })).toBe('traduit')
    expect(etatTraduction('en', { fr: 'Titre' })).toBe('a_traduire')
    expect(etatTraduction('en', { fr: '  ' })).toBe('vide')
    expect(etatTraduction('en', { fr: 'Titre', en: 'Title' })).toBe('traduit')
  })

  it('libellé lisible d’un chemin de champsAFournir', () => {
    expect(libelleChamp('traductions.fr.extrait', { extrait: 'Résumé' })).toBe('Résumé (FR)')
    expect(libelleChamp('credit', { credit: 'Crédit' })).toBe('Crédit')
    expect(libelleChamp('inconnu')).toBe('inconnu')
  })
})

describe('comparaison de versions', () => {
  it('ne liste que les champs modifiés, sans les champs techniques', () => {
    const avant = {
      version: 1,
      modifieLe: 'a',
      aLaUne: false,
      traductions: { fr: { titre: 'Ancien' } },
    }
    const apres = {
      version: 2,
      modifieLe: 'b',
      aLaUne: true,
      traductions: { fr: { titre: 'Nouveau' } },
    }
    expect(comparer(avant, apres)).toEqual([
      { chemin: 'aLaUne', avant: 'non', apres: 'oui' },
      { chemin: 'traductions.fr.titre', avant: 'Ancien', apres: 'Nouveau' },
    ])
  })

  it('un corps riche se compare par son texte', () => {
    const corps = {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Bonjour' }] }],
    }
    expect(valeurLisible(corps)).toBe('Bonjour')
    expect(valeurLisible(null)).toBe('—')
  })
})

describe('session et inactivité (D-16)', () => {
  it('l’avertissement tombe deux minutes avant l’échéance, jamais dans le passé', () => {
    const maintenant = Date.parse('2026-10-30T12:00:00Z')
    expect(delaisSession('2026-10-30T12:10:00Z', maintenant)).toEqual({
      avantAvertissement: 10 * 60_000 - AVANCE_AVERTISSEMENT_MS,
      avantEcheance: 10 * 60_000,
    })
    expect(delaisSession('2026-10-30T12:01:00Z', maintenant).avantAvertissement).toBe(0)
    expect(minutesRestantes('2026-10-30T12:01:30Z', maintenant)).toBe(2)
  })
})

describe('formulaires', () => {
  it('aplatit les erreurs imbriquées de React Hook Form en chemins', () => {
    expect(
      listerErreurs({
        categorie: { type: 'required', message: 'Catégorie obligatoire.' },
        traductions: { fr: { titre: { type: 'min', message: 'Titre obligatoire.' } } },
      }),
    ).toEqual([
      { champ: 'categorie', message: 'Catégorie obligatoire.' },
      { champ: 'traductions.fr.titre', message: 'Titre obligatoire.' },
    ])
  })

  it('rattache un 422 RG-03 aux champs connus, rend les autres en bandeau', () => {
    const setError = vi.fn()
    const erreur = new ErreurApi({
      status: 422,
      code: 'RG-03',
      message: 'Exigences de publication non remplies.',
      details: {
        manquants: [
          { champ: 'traductions.fr.extrait', langue: 'fr', message: 'Résumé manquant.' },
          { champ: 'imageId.texteAlt', message: 'Texte alternatif manquant.' },
        ],
      },
    })
    const orphelines = rattacherErreursServeur(erreur, setError, ['traductions.fr.extrait'])
    expect(setError).toHaveBeenCalledWith('traductions.fr.extrait', {
      type: 'serveur',
      message: 'Résumé manquant.',
    })
    expect(orphelines).toEqual([
      { champ: 'imageId.texteAlt', message: 'Texte alternatif manquant.' },
    ])
  })

  it('un message d’erreur ne montre jamais de trace ni de code (U13)', () => {
    expect(messageErreur(new Error('stack'))).not.toContain('stack')
    expect(
      messageErreur(
        new ErreurApi({ status: 422, code: 'RG-06', message: 'Tag de format manquant.' }),
      ),
    ).toBe('Tag de format manquant.')
    expect(
      messageErreur(
        new ErreurApi({ status: 500, code: 'ERREUR_INTERNE', message: 'détail interne' }),
      ),
    ).not.toContain('détail interne')
  })
})

describe('préférences d’affichage (D-09)', () => {
  afterEach(() => localStorage.clear())

  it('relit ce qui a été écrit, et retombe sur la valeur par défaut si c’est illisible', () => {
    const schema = z.array(z.string())
    expect(lirePreference('colonnes:essai', schema, [])).toEqual([])
    ecrirePreference('colonnes:essai', ['auteur'])
    expect(lirePreference('colonnes:essai', schema, [])).toEqual(['auteur'])
    localStorage.setItem('pe-admin:colonnes:essai', '{pas du json')
    expect(lirePreference('colonnes:essai', schema, ['defaut'])).toEqual(['defaut'])
  })
})
