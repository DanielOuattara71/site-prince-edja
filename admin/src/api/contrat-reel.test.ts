import { beforeAll, describe, expect, it } from 'vitest'
import { seConnecter } from '@/api/endpoints/auth'
import { bijoux, categories, createurs } from '@/api/endpoints/boutique'
import { articles, journal, lireTableauDeBord, medias, site, tags } from '@/api/endpoints/contenus'
import { comptes } from '@/api/endpoints/comptes'
import { abonnes, demandes, messages } from '@/api/endpoints/audience'
import {
  archive,
  destinations,
  distinctions,
  episodes,
  etudesCas,
  galerie,
  jalons,
  livres,
  offres,
  pages,
  pagesLegales,
  partenaires,
  presse,
  projets,
  univers,
  villes,
} from '@/api/endpoints/editorial'
import { emplacementsPhotos } from '@/api/endpoints/emplacements'
import {
  chiffresAudience,
  motifsContact,
  navigation,
  parametres,
  textesInterface,
} from '@/api/endpoints/reglages'

/**
 * Test de contrat contre le **vrai** back end (PROMPT-CORRECTION, étape E2 ; LIAISON, étape 10).
 *
 * Chaque appel passe par le client de l'admin et ses schémas Zod : une réponse que l'admin ne sait
 * pas lire fait échouer le test de sa ressource, avec le détail de l'écart. Ignoré par défaut ; à
 * lancer contre une API de développement amorcée :
 *
 *   API_REELLE=1 VITE_API_URL=http://127.0.0.1:3000/admin/api/v1 \
 *   ADMIN_EMAIL=… ADMIN_MOT_DE_PASSE=… npx vitest run src/api/contrat-reel.test.ts
 *
 * Aucun identifiant n'est écrit ici : ils viennent de l'environnement (compte de développement).
 */
const actif = process.env['API_REELLE'] === '1'

/** Node n'a pas de pot à cookies : la session (`HttpOnly`) est gardée et renvoyée à la main. */
function installerPotACookies() {
  const fetchOrigine = globalThis.fetch
  let cookie = ''
  globalThis.fetch = async (entree, init = {}) => {
    const entetes = new Headers(init.headers)
    if (cookie) entetes.set('cookie', cookie)
    const reponse = await fetchOrigine(entree, { ...init, headers: entetes })
    const recus = reponse.headers.getSetCookie()
    if (recus.length > 0) cookie = recus.map((c) => c.split(';')[0]).join('; ')
    return reponse
  }
}

interface Liste {
  nom?: string
  lister: (parametres: { pageSize?: number }) => Promise<{ items: { id: string }[] }>
  lire?: (id: string) => Promise<unknown>
}

describe.runIf(actif)('contrat de l’admin contre le vrai back end (E2)', () => {
  beforeAll(async () => {
    installerPotACookies()
    await seConnecter(process.env['ADMIN_EMAIL'] ?? '', process.env['ADMIN_MOT_DE_PASSE'] ?? '')
  })

  const ressources: [string, Liste][] = [
    ['articles', articles],
    ['episodes', episodes],
    ['projets', projets],
    ['villes', villes],
    ['destinations', destinations],
    ['archive', archive],
    ['distinctions', distinctions],
    ['presse', presse],
    ['univers', univers],
    ['jalons', jalons],
    ['offres', offres],
    ['pages', pages],
    ['galerie', galerie],
    ['etudes-cas', etudesCas],
    ['partenaires', partenaires],
    ['pages-legales', pagesLegales],
    ['livres', livres],
    ['categories', categories],
    ['createurs', createurs],
    ['bijoux', bijoux],
    ['tags', tags],
    ['medias', medias],
    ['comptes', comptes],
    ['messages', messages],
    ['demandes', demandes],
    ['abonnes', abonnes],
    ['audience', chiffresAudience],
    ['motifs-contact', motifsContact],
  ]

  for (const [nom, ressource] of ressources) {
    it(`${nom} : liste, puis fiche du premier élément`, async () => {
      const page = await ressource.lister({ pageSize: 5 })
      const premier = page.items[0]
      if (premier && ressource.lire) await ressource.lire(premier.id)
      expect(Array.isArray(page.items)).toBe(true)
    })
  }

  const lectures: [string, () => Promise<unknown>][] = [
    ['tableau-de-bord', () => lireTableauDeBord()],
    ['journal', () => journal.lister({})],
    ['site/publications', () => site.publications({})],
    ['site/etat-reconstruction', () => site.etat()],
    ['emplacements-photos', () => emplacementsPhotos.lister()],
    ['parametres', () => parametres.lire()],
    ['navigation', () => navigation.lire()],
    ['textes-interface', () => textesInterface.lire()],
  ]
  for (const [nom, lire] of lectures) {
    it(`${nom} : lecture`, async () => {
      await expect(lire()).resolves.toBeDefined()
    })
  }

  /*
   * Écritures (contrat 1.5.0 § 22.2, § 22.3, § 22.8) : ce que les formulaires envoient, accepté et
   * relu tel quel. Chaque contenu créé est supprimé à la fin (brouillons), la base de développement
   * reste propre.
   */
  const marque = Date.now().toString(36)
  const corps = {
    type: 'doc' as const,
    content: [
      {
        type: 'paragraph' as const,
        content: [{ type: 'text' as const, text: 'Contrat : présentation.' }],
      },
    ],
  }

  it('projet complet (catégorie, présentation, template) puis épisode rattaché', async () => {
    const familles = await categories.lister({ pageSize: 100 }, undefined, { famille: 'projet' })
    const film = familles.items.find((c) => c.traductions.fr?.nom === 'Film')
    expect(film).toBeDefined()
    const projet = await projets.creer({
      format: 'Série',
      avancement: 'en_preparation',
      categorieId: film?.id ?? null,
      template: 'film',
      saison: 'Saison 1',
      blocsMasques: ['festivals'],
      traductions: {
        fr: {
          titre: `Contrat ${marque} — projet`,
          accroche: 'Contrat : accroche.',
          contenu: corps,
          citation: 'Contrat : citation.',
        },
      },
    })
    expect(projet).toMatchObject({ template: 'film', categorieId: film?.id, saison: 'Saison 1' })
    expect(projet.traductions.fr?.contenu).toEqual(corps)

    const episode = await episodes.creer({
      numero: `C${marque.slice(-4)}`,
      projetId: projet.id,
      traductions: { fr: { titre: `Contrat ${marque} — épisode` } },
    })
    expect(episode.projetId).toBe(projet.id)

    await episodes.supprimer(episode.id, episode.version)
    await projets.supprimer(projet.id, projet.version)
  })

  it('livre avec variantes, puis variantes réécrites avec le livre', async () => {
    const produits = await categories.lister({ pageSize: 100 }, undefined, { famille: 'produit' })
    const categorie = produits.items[0]
    const livre = await livres.creer({
      reference: `C${marque.slice(-6)}`,
      categorieId: categorie?.id ?? null,
      variantes: [
        {
          libelle: 'Broché',
          reference: null,
          prix: 15000,
          ancienPrix: null,
          stock: null,
          disponible: true,
        },
      ],
      traductions: { fr: { titre: `Contrat ${marque} — livre` } },
    })
    expect(livre.variantes).toHaveLength(1)
    const modifie = await livres.modifier(livre.id, {
      version: livre.version,
      variantes: [
        {
          ...livre.variantes[0],
          id: livre.variantes[0]?.id ?? '',
          libelle: 'Broché',
          prix: 16000,
        } as never,
        {
          libelle: 'Relié',
          reference: null,
          prix: 25000,
          ancienPrix: null,
          stock: null,
          disponible: true,
        },
      ],
    })
    expect(modifie.variantes.map((v) => v.prix)).toEqual([16000, 25000])
    await livres.supprimer(modifie.id, modifie.version)
  })

  it('article avec sa catégorie (famille article)', async () => {
    const familles = await categories.lister({ pageSize: 100 }, undefined, { famille: 'article' })
    const voyage = familles.items.find((c) => c.traductions.fr?.nom === 'Voyage')
    const article = await articles.creer({
      categorie: 'Voyage',
      categorieId: voyage?.id ?? null,
      traductions: { fr: { titre: `Contrat ${marque} — article` } },
    })
    expect(article.categorieId).toBe(voyage?.id)
    await articles.supprimer(article.id, article.version)
  })
})
