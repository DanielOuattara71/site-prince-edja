import type { CibleInterne } from '@/api/schemas/communs'
import {
  ecritureArchive,
  ecritureDistinction,
  ecritureJalon,
  ecritureOffre,
  ecriturePage,
  ecriturePresse,
  ecritureUnivers,
} from '@/api/schemas/editorial'
import {
  BLOCS_PAGES,
  type Archive,
  type Distinction,
  type Jalon,
  type Offre,
  type PageFixe,
  type Presse,
  type Univers,
} from '@/api/mocks/donnees'
import { magasin } from '@/api/mocks/magasin'
import { erreur } from '@/api/mocks/reponses'
import { ressourceSimulee, titreDe } from '@/api/mocks/ressource-simulee'
import {
  contenuCible,
  credibiliteTraduite,
  manquesImage,
  manquesTraduits,
  texteOuNull,
  texteOuVide,
} from '@/api/mocks/handlers/editorial'

/**
 * Lot 3 éditorial simulé (`docs/CONTRAT-API.md` § 9.6 à 9.12, § 9.15), sur la fabrique (D-63).
 * Règle phare : une entrée d'archive sans source n'est pas publiable (règle du CDC).
 */
const champ = <T>(e: Record<string, unknown>, cle: string, defaut: T) =>
  (e[cle] as T | undefined) ?? defaut

const pasDeLien = (lien: string | null) =>
  lien ? [] : [{ champ: 'lien', message: 'Lien vers la source manquant.' }]

const tri = (o: { ordre?: number }) => o.ordre ?? 0

export const handlersEditorialLot3 = [
  ...ressourceSimulee<Archive>({
    nom: 'archive',
    collection: () => magasin.archive,
    remplacer: (liste) => {
      magasin.archive = liste
    },
    entree: ecritureArchive.entree,
    modification: ecritureArchive.modification,
    champTitre: 'titre',
    slugs: true,
    traduction: (e) => ({ titre: e['titre'], texte: texteOuNull(e['texte']) }),
    champsInitiaux: (e) => ({
      categorie: String(e['categorie']),
      fiabilite: champ<Archive['fiabilite']>(e, 'fiabilite', null),
      epoque: champ<string | null>(e, 'epoque', null),
      imageId: champ<string | null>(e, 'imageId', null),
      sources: champ<Archive['sources']>(e, 'sources', []),
      tagIds: champ<string[]>(e, 'tagIds', []),
    }),
    exigences: (o) => [
      ...manquesTraduits(o.traductions, { titre: 'Titre', texte: 'Texte' }),
      ...(o.fiabilite ? [] : [{ champ: 'fiabilite', message: 'Fiabilité manquante.' }]),
      ...(o.sources.length > 0
        ? []
        : [{ champ: 'sources', message: 'Au moins une source est exigée (règle du CDC).' }]),
      ...manquesImage(o.imageId, 'imageId', false),
    ],
    credibilite: (o) => [
      ...(o.epoque ? [] : ['epoque']),
      ...(o.fiabilite ? [] : ['fiabilite']),
      ...o.sources.flatMap((s, i) => (s.url || s.type === 'orale' ? [] : [`sources.${i}.url`])),
    ],
    tris: { titre: (o) => titreDe(o, 'titre').toLowerCase() },
  }),

  ...ressourceSimulee<Distinction>({
    nom: 'distinctions',
    collection: () => magasin.distinctions,
    remplacer: (liste) => {
      magasin.distinctions = liste
    },
    entree: ecritureDistinction.entree,
    modification: ecritureDistinction.modification,
    champTitre: 'titre',
    slugs: false,
    ordonnable: true,
    traduction: (e) => ({ titre: e['titre'], description: texteOuNull(e['description']) }),
    champsInitiaux: (e) => ({
      nature: e['nature'] as Distinction['nature'],
      annee: champ<string | null>(e, 'annee', null),
      organisme: champ<string | null>(e, 'organisme', null),
      lien: champ<string | null>(e, 'lien', null),
      imageId: champ<string | null>(e, 'imageId', null),
      tagIds: champ<string[]>(e, 'tagIds', []),
    }),
    exigences: (o) => [
      ...manquesTraduits(o.traductions, { titre: 'Titre' }),
      ...(o.annee ? [] : [{ champ: 'annee', message: 'Date manquante.' }]),
      ...manquesImage(o.imageId, 'imageId', false),
    ],
    credibilite: (o) => [
      ...(o.organisme ? [] : ['organisme']),
      ...(o.lien ? [] : ['lien']),
      ...credibiliteTraduite(o.traductions, ['description']),
    ],
    tris: { ordre: tri, titre: (o) => titreDe(o, 'titre').toLowerCase() },
  }),

  ...ressourceSimulee<Presse>({
    nom: 'presse',
    collection: () => magasin.presse,
    remplacer: (liste) => {
      magasin.presse = liste
    },
    entree: ecriturePresse.entree,
    modification: ecriturePresse.modification,
    champTitre: 'titre',
    slugs: false,
    ordonnable: true,
    traduction: (e) => ({
      titre: e['titre'],
      resume: texteOuNull(e['resume']),
      citation: texteOuNull(e['citation']),
    }),
    champsInitiaux: (e) => ({
      source: String(e['source']),
      datePublication: champ<string | null>(e, 'datePublication', null),
      lien: champ<string | null>(e, 'lien', null),
      avatarId: champ<string | null>(e, 'avatarId', null),
      aLaUne: champ<boolean>(e, 'aLaUne', false),
      tagIds: champ<string[]>(e, 'tagIds', []),
    }),
    exigences: (o) => [
      ...manquesTraduits(o.traductions, { titre: 'Titre' }),
      ...(o.datePublication ? [] : [{ champ: 'datePublication', message: 'Date manquante.' }]),
      ...pasDeLien(o.lien),
      ...manquesImage(o.avatarId, 'avatarId', false),
    ],
    // Une seule parution à la une : la mettre à la une retire les autres (§ 9.8).
    apresEcriture: (o) => {
      if (!o.aLaUne) return
      for (const autre of magasin.presse) if (autre.id !== o.id) autre.aLaUne = false
    },
    tris: { ordre: tri, titre: (o) => titreDe(o, 'titre').toLowerCase() },
    resume: (o) => ({ numero: o.source }),
  }),

  ...ressourceSimulee<Univers>({
    nom: 'univers',
    collection: () => magasin.univers,
    remplacer: (liste) => {
      magasin.univers = liste
    },
    entree: ecritureUnivers.entree,
    modification: ecritureUnivers.modification,
    champTitre: 'nom',
    slugs: false,
    ordonnable: true,
    traduction: (e) => ({ nom: e['nom'], pitch: texteOuVide(e['pitch']) }),
    champsInitiaux: (e) => ({
      numero: String(e['numero']),
      cible: champ<CibleInterne | null>(e, 'cible', null),
      tagIds: champ<string[]>(e, 'tagIds', []),
    }),
    exigences: (o) => {
      const cible = contenuCible(o.cible)
      return [
        ...manquesTraduits(o.traductions, { nom: 'Nom', pitch: 'Accroche' }),
        ...(o.cible ? [] : [{ champ: 'cible', message: 'Lien manquant.' }]),
        ...(cible && cible.statut !== 'publie'
          ? [{ champ: 'cible', message: 'Le contenu visé n’est pas publié.' }]
          : []),
      ]
    },
    controler: (o) =>
      contenuCible(o.cible) === undefined
        ? erreur(422, 'VALIDATION', 'Le contenu visé n’existe pas.', { champ: 'cible' })
        : null,
    tris: { ordre: tri, titre: (o) => titreDe(o, 'nom').toLowerCase() },
    resume: (o) => ({ numero: o.numero }),
  }),

  ...ressourceSimulee<Jalon>({
    nom: 'jalons',
    collection: () => magasin.jalons,
    remplacer: (liste) => {
      magasin.jalons = liste
    },
    entree: ecritureJalon.entree,
    modification: ecritureJalon.modification,
    champTitre: 'titre',
    slugs: false,
    ordonnable: true,
    traduction: (e) => ({ titre: e['titre'], description: texteOuNull(e['description']) }),
    champsInitiaux: (e) => ({
      periode: String(e['periode']),
      tagIds: champ<string[]>(e, 'tagIds', []),
    }),
    exigences: (o) => manquesTraduits(o.traductions, { titre: 'Titre' }),
    credibilite: (o) => credibiliteTraduite(o.traductions, ['description']),
    tris: { ordre: tri, titre: (o) => titreDe(o, 'titre').toLowerCase() },
    resume: (o) => ({ periode: o.periode }),
  }),

  ...ressourceSimulee<Offre>({
    nom: 'offres',
    collection: () => magasin.offres,
    remplacer: (liste) => {
      magasin.offres = liste
    },
    entree: ecritureOffre.entree,
    modification: ecritureOffre.modification,
    champTitre: 'titre',
    slugs: false,
    ordonnable: true,
    traduction: (e) => ({ titre: e['titre'], texte: texteOuNull(e['texte']) }),
    champsInitiaux: (e) => ({ tagIds: champ<string[]>(e, 'tagIds', []) }),
    exigences: (o) => manquesTraduits(o.traductions, { titre: 'Titre', texte: 'Texte' }),
    credibilite: (o) => credibiliteTraduite(o.traductions, ['texte']),
    tris: { ordre: tri, titre: (o) => titreDe(o, 'titre').toLowerCase() },
  }),

  // Pages : ensemble fermé (`peut` refuse création et suppression), blocs déclarés par page.
  ...ressourceSimulee<PageFixe>({
    nom: 'pages',
    collection: () => magasin.pages,
    remplacer: (liste) => {
      magasin.pages = liste
    },
    entree: ecriturePage.entree,
    modification: ecriturePage.modification,
    champTitre: 'titre',
    slugs: false,
    traduction: (e, existante) => ({
      titre: e['titre'],
      chapo: texteOuNull(e['chapo']),
      seoTitre: texteOuNull(e['seoTitre']),
      seoDescription: texteOuNull(e['seoDescription']),
      blocs:
        (e['blocs'] as Record<string, string> | undefined) ??
        (existante?.['blocs'] as Record<string, string> | undefined) ??
        {},
    }),
    champsInitiaux: () => ({}),
    exigences: (o) => [
      ...manquesTraduits(o.traductions, {
        titre: 'Titre',
        seoTitre: 'Titre pour les moteurs',
        seoDescription: 'Description pour les moteurs',
      }),
      ...manquesImage(o.imageId, 'imageId', false),
    ],
    controler: (o) => {
      const permises = new Set(BLOCS_PAGES[o.cle] ?? [])
      for (const [langue, t] of Object.entries(o.traductions)) {
        const inconnue = Object.keys(
          (t?.['blocs'] as Record<string, string> | undefined) ?? {},
        ).find((cle) => !permises.has(cle))
        if (inconnue) {
          return erreur(422, 'VALIDATION', `Clé de bloc inconnue pour cette page : ${inconnue}.`, {
            champ: `traductions.${langue}.blocs`,
          })
        }
      }
      return null
    },
    tris: { titre: (o) => titreDe(o, 'titre').toLowerCase() },
    resume: (o) => ({ cle: o.cle }),
  }),
]
