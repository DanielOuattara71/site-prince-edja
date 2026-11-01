import type { Article } from '@/api/schemas/articles'
import type { Bijou, Categorie } from '@/api/schemas/boutique'
import type { Destination, Episode, Projet, Ville } from '@/api/schemas/editorial'
import type { Compte, CompteResume, Langue } from '@/api/schemas/communs'
import type { Media } from '@/api/schemas/medias'
import type { EntreeJournal, Publication } from '@/api/schemas/site'
import type { Tag } from '@/api/schemas/tags'
import type { EntreeVersion } from '@/api/schemas/versions'
import {
  articlesInitiaux,
  bijouxInitiaux,
  archiveInitiale,
  categoriesInitiales,
  distinctionsInitiales,
  jalonsInitiaux,
  offresInitiales,
  pagesInitiales,
  presseInitiale,
  universInitiaux,
  type Archive,
  type Distinction,
  type Jalon,
  type Offre,
  type PageFixe,
  type Presse,
  type Univers,
  destinationsInitiales,
  episodesInitiaux,
  projetsInitiaux,
  villesInitiales,
  comptesInitiaux,
  createursInitiaux,
  mediasInitiaux,
  tagsInitiaux,
  type CompteEssai,
  type CreateurEssai,
} from '@/api/mocks/donnees'

/** Instantané d'un objet à une version donnée (§ 14.2). */
export interface VersionStockee extends EntreeVersion {
  ressource: string
  id: string
  instantane: unknown
}

/**
 * État en mémoire du faux serveur. Une seule session à la fois (un navigateur, un
 * développeur) : c'est la place du cookie `HttpOnly` que le vrai serveur poserait.
 *
 * L'horloge est décalable (`avancer`) pour que les tests suivent une reconstruction sans
 * attendre.
 */
export interface Magasin {
  comptes: CompteEssai[]
  session: { compteId: string; csrf: string; expireLe: number } | null
  articles: Article[]
  medias: Media[]
  tags: Tag[]
  createurs: CreateurEssai[]
  categories: Categorie[]
  bijoux: Bijou[]
  episodes: Episode[]
  projets: Projet[]
  villes: Ville[]
  destinations: Destination[]
  archive: Archive[]
  distinctions: Distinction[]
  presse: Presse[]
  univers: Univers[]
  jalons: Jalon[]
  offres: Offre[]
  pages: PageFixe[]
  /** Variantes citées par une demande de pièce (RG-11) : les demandes arrivent au lot 4. */
  variantesCitees: string[]
  publications: Publication[]
  journal: EntreeJournal[]
  versions: VersionStockee[]
  languesActives: Langue[]
  /** Réglage `parametres.multiVendeurs` (§ 13.3), faux par défaut. */
  multiVendeurs: boolean
  /** Réglage `parametres.boutiqueEnLigne` (§ 13.3), faux par défaut. */
  boutiqueEnLigne: boolean
  /** Latence simulée en millisecondes (`null` = aucune, pour les tests). */
  latence: [number, number] | null
  /** Probabilité d'un échec `500` simulé, entre 0 et 1. */
  tauxEchec: number
  decalageHorloge: number
  /** Échecs de connexion consécutifs, pour la limitation de débit simulée (`429`). */
  echecsConnexion: number
}

const DUREE_SESSION_MS = 8 * 60 * 60 * 1000

/** Version 1 de chaque objet de départ : l'historique commence avec les données d'exemple. */
function versionsInitiales(collections: Record<string, { id: string; version: number }[]>) {
  return Object.entries(collections).flatMap(([ressource, objets]) =>
    objets.map((objet): VersionStockee => ({
      ressource,
      id: objet.id,
      version: objet.version,
      creeLe: '2026-10-30T08:00:00.000Z',
      creePar: null,
      action: 'creation',
      instantane: structuredClone(objet),
    })),
  )
}

function etatInitial(): Magasin {
  const articles = articlesInitiaux()
  const medias = mediasInitiaux()
  const tags = tagsInitiaux()
  const createurs = createursInitiaux()
  const bijoux = bijouxInitiaux()
  return {
    comptes: comptesInitiaux(),
    session: null,
    articles,
    medias,
    tags,
    createurs,
    categories: categoriesInitiales(),
    bijoux,
    episodes: episodesInitiaux(),
    projets: projetsInitiaux(),
    villes: villesInitiales(),
    destinations: destinationsInitiales(),
    archive: archiveInitiale(),
    distinctions: distinctionsInitiales(),
    presse: presseInitiale(),
    univers: universInitiaux(),
    jalons: jalonsInitiaux(),
    offres: offresInitiales(),
    pages: pagesInitiales(),
    variantesCitees: [],
    publications: [],
    journal: [],
    versions: versionsInitiales({ articles, medias, tags, createurs, bijoux }),
    languesActives: ['fr'],
    multiVendeurs: false,
    boutiqueEnLigne: false,
    latence: null,
    tauxEchec: 0,
    decalageHorloge: 0,
    echecsConnexion: 0,
  }
}

export const magasin: Magasin = etatInitial()

/** Remet le faux serveur dans son état d'origine (entre deux tests). */
export function reinitialiserMagasin(): void {
  Object.assign(magasin, etatInitial())
}

export function maintenant(): number {
  return Date.now() + magasin.decalageHorloge
}

export function horodatage(): string {
  return new Date(maintenant()).toISOString()
}

export function avancer(millisecondes: number): void {
  magasin.decalageHorloge += millisecondes
}

export function ouvrirSession(compteId: string): { csrf: string; expireLe: string } {
  const csrf = crypto.randomUUID()
  const expireLe = maintenant() + DUREE_SESSION_MS
  magasin.session = { compteId, csrf, expireLe }
  return { csrf, expireLe: new Date(expireLe).toISOString() }
}

/** Toute requête authentifiée repousse l'échéance : durée glissante (§ 3.1). */
export function compteConnecte(): Compte | null {
  const session = magasin.session
  if (!session || session.expireLe < maintenant()) return null
  session.expireLe = maintenant() + DUREE_SESSION_MS
  return magasin.comptes.find((essai) => essai.compte.id === session.compteId)?.compte ?? null
}

export function resumeCompte(id: string | null): CompteResume | null {
  const trouve = magasin.comptes.find((essai) => essai.compte.id === id)?.compte
  return trouve ? { id: trouve.id, nom: trouve.nom } : null
}

/** RG-17 : toute écriture laisse une ligne, avec l'avant et l'après. */
export function journaliser(
  compte: Compte | null,
  action: string,
  entite: string,
  entiteId: string | null,
  avant: unknown,
  apres: unknown,
): void {
  magasin.journal.unshift({
    id: crypto.randomUUID(),
    compte: compte ? { id: compte.id, nom: compte.nom } : null,
    action,
    entite,
    entiteId,
    avant: avant ?? null,
    apres: apres ?? null,
    requeteId: null,
    creeLe: horodatage(),
  })
  // Une écriture qui produit une nouvelle version laisse aussi son instantané (§ 14.2).
  const version = (apres as { version?: unknown } | null)?.version
  if (entiteId && typeof version === 'number') {
    const deja = magasin.versions.some(
      (v) => v.ressource === entite && v.id === entiteId && v.version === version,
    )
    if (!deja) {
      magasin.versions.push({
        ressource: entite,
        id: entiteId,
        version,
        creeLe: horodatage(),
        creePar: compte ? { id: compte.id, nom: compte.nom } : null,
        action,
        instantane: structuredClone(apres),
      })
    }
  }
}

/** Ouvre une publication du site (RG-19) et renvoie son identifiant. */
export function ouvrirPublication(
  compte: Compte | null,
  motif: Publication['motif'],
  objet: Publication['objet'],
): string {
  const publication: Publication = {
    id: crypto.randomUUID(),
    motif,
    etat: 'en_attente',
    demandeePar: compte ? { id: compte.id, nom: compte.nom } : null,
    declencheeLe: horodatage(),
    termineeLe: null,
    messageErreur: null,
    buildId: null,
    objet,
  }
  magasin.publications.unshift(publication)
  return publication.id
}

/**
 * État d'une publication à l'instant présent : en attente pendant 1 s, en cours pendant
 * 3 s, puis réussie. Simule la reconstruction réelle sans minuterie.
 */
export function avancementPublication(publication: Publication): Publication {
  if (publication.etat === 'reussie' || publication.etat === 'echec') return publication
  const ecoule = maintenant() - Date.parse(publication.declencheeLe)
  if (ecoule < 1000) return publication
  if (ecoule < 4000)
    return { ...publication, etat: 'en_cours', buildId: `build-${publication.id.slice(0, 8)}` }
  const terminee: Publication = {
    ...publication,
    etat: 'reussie',
    buildId: `build-${publication.id.slice(0, 8)}`,
    termineeLe: new Date(Date.parse(publication.declencheeLe) + 4000).toISOString(),
  }
  Object.assign(publication, terminee)
  return terminee
}
