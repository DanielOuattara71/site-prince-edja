import {
  entreeDestinationSchema,
  entreeEpisodeSchema,
  entreeProjetSchema,
  entreeVilleSchema,
  LIMITES_COTE_IVOIRE,
  modificationDestinationSchema,
  modificationEpisodeSchema,
  modificationProjetSchema,
  modificationVilleSchema,
  type Destination,
  type Episode,
  type Projet,
  type Ville,
} from '@/api/schemas/editorial'
import type { CibleInterne } from '@/api/schemas/communs'
import { CODE_PAYS_COTE_IVOIRE } from '@/api/mocks/donnees'
import { magasin } from '@/api/mocks/magasin'
import { manquesMedia, trouverMedia, type Manquant } from '@/api/mocks/regles'
import { erreur } from '@/api/mocks/reponses'
import { ressourceSimulee, titreDe, type Traductions } from '@/api/mocks/ressource-simulee'

/**
 * Épisodes, projets, villes, destinations simulés (`docs/CONTRAT-API.md` § 9.2 à 9.5), sur la
 * fabrique commune (D-63). Ici, seulement ce qui est propre à chacun.
 */

/** Champs **P** traduits, dans chaque langue active (§ 7.5). */
export function manquesTraduits(
  traductions: Traductions,
  champs: Record<string, string>,
): Manquant[] {
  const manques: Manquant[] = []
  for (const langue of magasin.languesActives) {
    const t = traductions[langue]
    if (!t) {
      manques.push({
        champ: `traductions.${langue}`,
        langue,
        message: `Traduction ${langue} absente.`,
      })
      continue
    }
    for (const [champ, libelle] of Object.entries(champs)) {
      const valeur = t[champ]
      if (typeof valeur !== 'string' || !valeur.trim()) {
        manques.push({
          champ: `traductions.${langue}.${champ}`,
          langue,
          message: `${libelle} manquant(e).`,
        })
      }
    }
  }
  return manques
}

/** Champs **C** traduits vides, dans chaque langue active (§ 7.6). */
export function credibiliteTraduite(traductions: Traductions, champs: string[]): string[] {
  return magasin.languesActives.flatMap((langue) => {
    const t = traductions[langue]
    if (!t) return []
    return champs.flatMap((champ) => {
      const valeur = t[champ]
      return typeof valeur === 'string' && valeur.trim() ? [] : [`traductions.${langue}.${champ}`]
    })
  })
}

export function manquesImage(id: string | null, champ: string, exigee: boolean): Manquant[] {
  if (!id) return exigee ? [{ champ, message: 'Image manquante.' }] : []
  return manquesMedia(trouverMedia(id), champ, magasin.languesActives)
}

export const texteOuNull = (v: unknown) => (typeof v === 'string' && v.trim() ? v : null)
export const texteOuVide = (v: unknown) => (typeof v === 'string' ? v : '')

function refusPdf(id: string | null | undefined, champ: string): Response | null {
  if (!id) return null
  const media = trouverMedia(id)
  if (!media) return erreur(422, 'VALIDATION', 'Ce média n’existe pas.', { champ })
  return media.mime === 'application/pdf'
    ? null
    : erreur(422, 'VALIDATION', 'Le guide doit être un PDF.', { champ })
}

/** Le contenu visé par une cible existe ; s'il n'est pas publié, la publication le dit (RG-03). */
export function contenuCible(cible: CibleInterne | null): { statut: string } | undefined | null {
  if (!cible || cible.type !== 'contenu') return null
  const collections: Record<string, { id: string; statut: string }[]> = {
    articles: magasin.articles,
    bijoux: magasin.bijoux,
    episodes: magasin.episodes,
    projets: magasin.projets,
    destinations: magasin.destinations,
  }
  return collections[cible.ressource]?.find((o) => o.id === cible.id)
}

const TRADUCTION_EPISODE = [
  'synopsisLong',
  'noteIntention',
  'personnages',
  'makingOf',
  'presse',
  'credits',
]

export const handlersEditorial = [
  ...ressourceSimulee<Episode>({
    nom: 'episodes',
    collection: () => magasin.episodes,
    remplacer: (liste) => {
      magasin.episodes = liste
    },
    entree: entreeEpisodeSchema,
    modification: modificationEpisodeSchema,
    champTitre: 'titre',
    slugs: true,
    traduction: (e) => ({
      titre: e['titre'],
      lieu: texteOuVide(e['lieu']),
      pitch: texteOuVide(e['pitch']),
      ...Object.fromEntries(TRADUCTION_EPISODE.map((champ) => [champ, texteOuNull(e[champ])])),
    }),
    champsInitiaux: (e) => ({
      numero: String(e['numero']),
      imageId: (e['imageId'] as string | null | undefined) ?? null,
      guideMediaId: (e['guideMediaId'] as string | null | undefined) ?? null,
      destinationId: (e['destinationId'] as string | null | undefined) ?? null,
      trailerUrl: (e['trailerUrl'] as string | null | undefined) ?? null,
      dureeMinutes: (e['dureeMinutes'] as number | null | undefined) ?? null,
      tagIds: (e['tagIds'] as string[] | undefined) ?? [],
    }),
    exigences: (o) => [
      ...manquesTraduits(o.traductions, { titre: 'Titre', lieu: 'Lieu', pitch: 'Résumé' }),
      ...manquesImage(o.imageId, 'imageId', true),
      ...(o.guideMediaId ? manquesImage(o.guideMediaId, 'guideMediaId', false) : []),
    ],
    credibilite: (o) => [
      ...(o.dureeMinutes === null ? ['dureeMinutes'] : []),
      ...credibiliteTraduite(o.traductions, TRADUCTION_EPISODE),
    ],
    controler: (o) => {
      if (magasin.episodes.some((autre) => autre.id !== o.id && autre.numero === o.numero)) {
        return erreur(422, 'RG-04', 'Ce numéro est déjà celui d’un autre épisode.', {
          champ: 'numero',
        })
      }
      if (o.destinationId && !magasin.destinations.some((d) => d.id === o.destinationId)) {
        return erreur(422, 'VALIDATION', 'Cette destination n’existe pas.', {
          champ: 'destinationId',
        })
      }
      return refusPdf(o.guideMediaId, 'guideMediaId')
    },
    tris: { numero: (o) => o.numero, titre: (o) => titreDe(o, 'titre').toLowerCase() },
    resume: (o) => ({ numero: o.numero }),
  }),

  ...ressourceSimulee<Projet>({
    nom: 'projets',
    collection: () => magasin.projets,
    remplacer: (liste) => {
      magasin.projets = liste
    },
    entree: entreeProjetSchema,
    modification: modificationProjetSchema,
    champTitre: 'titre',
    slugs: true,
    ordonnable: true,
    traduction: (e) => ({ titre: e['titre'], accroche: texteOuVide(e['accroche']) }),
    champsInitiaux: (e) => ({
      format: e['format'] as Projet['format'],
      avancement: e['avancement'] as Projet['avancement'],
      annee: (e['annee'] as string | null | undefined) ?? null,
      imageId: (e['imageId'] as string | null | undefined) ?? null,
      cible: (e['cible'] as CibleInterne | null | undefined) ?? null,
      tagIds: (e['tagIds'] as string[] | undefined) ?? [],
    }),
    exigences: (o) => {
      const cible = contenuCible(o.cible)
      return [
        ...manquesTraduits(o.traductions, { titre: 'Titre', accroche: 'Accroche' }),
        // Un projet en préparation n'a pas encore d'image (§ 9.3).
        ...manquesImage(o.imageId, 'imageId', o.avancement !== 'en_preparation'),
        ...(cible && cible.statut !== 'publie'
          ? [{ champ: 'cible', message: 'Le contenu visé n’est pas publié.' }]
          : []),
      ]
    },
    credibilite: (o) => (o.annee ? [] : ['annee']),
    controler: (o) =>
      contenuCible(o.cible) === undefined
        ? erreur(422, 'VALIDATION', 'Le contenu visé n’existe pas.', { champ: 'cible' })
        : null,
    tris: { ordre: (o) => o.ordre, titre: (o) => titreDe(o, 'titre').toLowerCase() },
  }),

  ...ressourceSimulee<Ville>({
    nom: 'villes',
    collection: () => magasin.villes,
    remplacer: (liste) => {
      magasin.villes = liste
    },
    entree: entreeVilleSchema,
    modification: modificationVilleSchema,
    champTitre: 'nom',
    slugs: false,
    ordonnable: true,
    traduction: (e) => ({ nom: e['nom'], intention: texteOuVide(e['intention']) }),
    champsInitiaux: (e) => ({
      imageId: (e['imageId'] as string | null | undefined) ?? null,
      tagIds: (e['tagIds'] as string[] | undefined) ?? [],
    }),
    exigences: (o) => [
      ...manquesTraduits(o.traductions, { nom: 'Nom', intention: 'Intention' }),
      ...manquesImage(o.imageId, 'imageId', true),
    ],
    tris: { ordre: (o) => o.ordre, nom: (o) => titreDe(o, 'nom').toLowerCase() },
  }),

  ...ressourceSimulee<Destination>({
    nom: 'destinations',
    collection: () => magasin.destinations,
    remplacer: (liste) => {
      magasin.destinations = liste
    },
    entree: entreeDestinationSchema,
    modification: modificationDestinationSchema,
    champTitre: 'nom',
    slugs: true,
    traduction: (e) => ({ nom: e['nom'], texte: texteOuNull(e['texte']) }),
    champsInitiaux: (e) => ({
      latitude: (e['latitude'] as number | null | undefined) ?? null,
      longitude: (e['longitude'] as number | null | undefined) ?? null,
      episodeId: (e['episodeId'] as string | null | undefined) ?? null,
      guideMediaId: (e['guideMediaId'] as string | null | undefined) ?? null,
      imageId: (e['imageId'] as string | null | undefined) ?? null,
      tagIds: (e['tagIds'] as string[] | undefined) ?? [],
    }),
    exigences: (o) => [
      ...manquesTraduits(o.traductions, { nom: 'Nom' }),
      ...(o.latitude === null ? [{ champ: 'latitude', message: 'Latitude manquante.' }] : []),
      ...(o.longitude === null ? [{ champ: 'longitude', message: 'Longitude manquante.' }] : []),
      ...(o.tagIds.some((id) => magasin.tags.find((t) => t.id === id)?.type === 'pays')
        ? []
        : [{ champ: 'tagIds', message: 'Au moins un tag de pays est exigé.' }]),
      ...(o.imageId ? manquesImage(o.imageId, 'imageId', false) : []),
    ],
    credibilite: (o) => credibiliteTraduite(o.traductions, ['texte']),
    controler: (o) => {
      if (o.episodeId && !magasin.episodes.some((e) => e.id === o.episodeId)) {
        return erreur(422, 'VALIDATION', 'Cet épisode n’existe pas.', { champ: 'episodeId' })
      }
      const ivoirien = o.tagIds.some(
        (id) => magasin.tags.find((t) => t.id === id)?.code === CODE_PAYS_COTE_IVOIRE,
      )
      const { latMin, latMax, lngMin, lngMax } = LIMITES_COTE_IVOIRE
      if (
        ivoirien &&
        o.latitude !== null &&
        o.longitude !== null &&
        (o.latitude < latMin || o.latitude > latMax || o.longitude < lngMin || o.longitude > lngMax)
      ) {
        return erreur(
          422,
          'COORDONNEES_HORS_PAYS',
          'Ces coordonnées sont hors de la Côte d’Ivoire. À l’ouest du méridien, la longitude est négative.',
          { champ: o.longitude > lngMax ? 'longitude' : 'latitude' },
        )
      }
      return refusPdf(o.guideMediaId, 'guideMediaId')
    },
    tris: { nom: (o) => titreDe(o, 'nom').toLowerCase() },
  }),
]
