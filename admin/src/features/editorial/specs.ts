import {
  archive,
  destinations,
  distinctions,
  episodes,
  jalons,
  offres,
  pages,
  presse,
  projets,
  univers,
  villes,
} from '@/api/endpoints/editorial'
import {
  AVANCEMENTS_PROJET,
  FIABILITES,
  FORMATS_PROJET,
  NATURES_DISTINCTION,
} from '@/api/schemas/editorial'
import type { ApiDeclarative, SpecRessource } from '@/features/gabarits/declaratif'
import { t, type CleTraduction } from '@/i18n/fr'

/**
 * Descriptions des familles du lot 2 (`docs/CONTRAT-API.md` § 9.2 à 9.5), pour le gabarit
 * déclaratif (D-62). **P** = exigé à la publication (`requis`) ; **C** = crédibilité, suivi dans
 * `champsAFournir`, envoyé `null` quand il est vide.
 */
const api = (ressource: unknown) => ressource as ApiDeclarative

export const SPEC_EPISODES: SpecRessource = {
  ressource: 'episodes',
  chemin: '/episodes',
  titreListe: t('menu.episodes'),
  nouveau: t('episode.nouveau'),
  champTitre: 'titre',
  slug: true,
  colonneIdentifiant: { champ: 'numero', libelle: t('episode.numero') },
  principal: [
    {
      type: 'texte',
      cle: 'numero',
      libelle: t('episode.numero'),
      aide: t('episode.numeroAide'),
      obligatoire: true,
      max: 10,
    },
  ],
  traduits: [
    { cle: 'titre', libelle: t('episode.titre'), requis: true, max: 200, vide: 'chaine' },
    { cle: 'lieu', libelle: t('episode.lieu'), requis: true, max: 200, vide: 'chaine' },
    {
      cle: 'pitch',
      libelle: t('episode.pitch'),
      requis: true,
      multiligne: true,
      max: 300,
      vide: 'chaine',
    },
    {
      cle: 'synopsisLong',
      libelle: t('episode.synopsisLong'),
      multiligne: true,
      max: 8000,
      vide: 'null',
    },
    {
      cle: 'noteIntention',
      libelle: t('episode.noteIntention'),
      multiligne: true,
      max: 8000,
      vide: 'null',
    },
    {
      cle: 'personnages',
      libelle: t('episode.personnages'),
      multiligne: true,
      max: 8000,
      vide: 'null',
    },
    { cle: 'makingOf', libelle: t('episode.makingOf'), multiligne: true, max: 8000, vide: 'null' },
    { cle: 'presse', libelle: t('episode.presse'), multiligne: true, max: 8000, vide: 'null' },
    { cle: 'credits', libelle: t('episode.credits'), multiligne: true, max: 8000, vide: 'null' },
  ],
  lateral: [
    { type: 'image', cle: 'imageId', libelle: t('episode.image') },
    { type: 'url', cle: 'trailerUrl', libelle: t('episode.trailer') },
    {
      type: 'nombre',
      cle: 'dureeMinutes',
      libelle: t('episode.duree'),
      entier: true,
      min: 1,
      max: 1000,
    },
    {
      type: 'relation',
      cle: 'destinationId',
      libelle: t('episode.destination'),
      ressource: 'destinations',
    },
    { type: 'pdf', cle: 'guideMediaId', libelle: t('episode.guide') },
    { type: 'tags', cle: 'tagIds', libelle: t('liste.tag') },
  ],
  libelles: { dureeMinutes: t('episode.duree') },
  api: api(episodes),
}

export const SPEC_PROJETS: SpecRessource = {
  ressource: 'projets',
  chemin: '/projets',
  titreListe: t('menu.projets'),
  nouveau: t('projet.nouveau'),
  champTitre: 'titre',
  slug: true,
  ordonnable: true,
  principal: [],
  traduits: [
    { cle: 'titre', libelle: t('projet.titre'), requis: true, max: 200, vide: 'chaine' },
    {
      cle: 'accroche',
      libelle: t('projet.accroche'),
      requis: true,
      multiligne: true,
      max: 300,
      vide: 'chaine',
    },
  ],
  lateral: [
    {
      type: 'choix',
      cle: 'format',
      libelle: t('projet.format'),
      obligatoire: true,
      options: FORMATS_PROJET.map((f) => ({ valeur: f, libelle: f })),
    },
    {
      type: 'choix',
      cle: 'avancement',
      libelle: t('projet.avancement'),
      aide: t('projet.avancementAide'),
      obligatoire: true,
      options: AVANCEMENTS_PROJET.map((a) => ({
        valeur: a,
        libelle: t(`projet.${a}` as CleTraduction),
      })),
    },
    { type: 'datePartielle', cle: 'annee', libelle: t('projet.annee') },
    { type: 'image', cle: 'imageId', libelle: t('projet.image') },
    { type: 'cible', cle: 'cible', libelle: t('projet.cible'), aide: t('projet.cibleAide') },
    { type: 'tags', cle: 'tagIds', libelle: t('liste.tag') },
  ],
  libelles: {},
  api: api(projets),
}

export const SPEC_VILLES: SpecRessource = {
  ressource: 'villes',
  chemin: '/villes',
  titreListe: t('menu.villes'),
  nouveau: t('ville.nouvelle'),
  champTitre: 'nom',
  slug: false,
  ordonnable: true,
  principal: [],
  traduits: [
    { cle: 'nom', libelle: t('ville.nom'), requis: true, max: 120, vide: 'chaine' },
    {
      cle: 'intention',
      libelle: t('ville.intention'),
      requis: true,
      multiligne: true,
      max: 300,
      vide: 'chaine',
    },
  ],
  lateral: [
    { type: 'image', cle: 'imageId', libelle: t('ville.image') },
    { type: 'tags', cle: 'tagIds', libelle: t('liste.tag') },
  ],
  libelles: {},
  api: api(villes),
}

export const SPEC_DESTINATIONS: SpecRessource = {
  ressource: 'destinations',
  chemin: '/destinations',
  titreListe: t('menu.destinations'),
  nouveau: t('destination.nouvelle'),
  champTitre: 'nom',
  slug: true,
  principal: [
    {
      type: 'nombre',
      cle: 'latitude',
      libelle: t('destination.latitude'),
      aide: t('destination.latitudeAide'),
      min: -90,
      max: 90,
    },
    {
      type: 'nombre',
      cle: 'longitude',
      libelle: t('destination.longitude'),
      aide: t('destination.longitudeAide'),
      min: -180,
      max: 180,
    },
  ],
  traduits: [
    { cle: 'nom', libelle: t('destination.nom'), requis: true, max: 120, vide: 'chaine' },
    { cle: 'texte', libelle: t('destination.texte'), multiligne: true, max: 8000, vide: 'null' },
  ],
  lateral: [
    { type: 'tags', cle: 'tagIds', libelle: t('destination.tags') },
    { type: 'image', cle: 'imageId', libelle: t('destination.image') },
    {
      type: 'relation',
      cle: 'episodeId',
      libelle: t('destination.episode'),
      ressource: 'episodes',
    },
    { type: 'pdf', cle: 'guideMediaId', libelle: t('destination.guide') },
  ],
  libelles: { tagIds: 'Tag de pays' },
  api: api(destinations),
}

// --- Lot 3 (§ 9.6 à 9.12, § 9.15) ---

export const SPEC_ARCHIVE: SpecRessource = {
  ressource: 'archive',
  chemin: '/archive',
  titreListe: t('menu.archive'),
  nouveau: t('archive.nouvelle'),
  champTitre: 'titre',
  slug: true,
  principal: [
    {
      type: 'sources',
      cle: 'sources',
      libelle: t('archive.sources'),
      aide: t('archive.sourcesAide'),
    },
  ],
  traduits: [
    { cle: 'titre', libelle: t('archive.titre'), requis: true, max: 200, vide: 'chaine' },
    {
      cle: 'texte',
      libelle: t('archive.texte'),
      requis: true,
      multiligne: true,
      max: 20000,
      vide: 'null',
    },
  ],
  lateral: [
    {
      type: 'texte',
      cle: 'categorie',
      libelle: t('archive.categorie'),
      obligatoire: true,
      max: 60,
    },
    {
      type: 'choix',
      cle: 'fiabilite',
      libelle: t('archive.fiabilite'),
      aide: t('archive.fiabiliteAide'),
      options: FIABILITES.map((f) => ({
        valeur: f,
        libelle: t(`archive.fiabilite.${f}` as CleTraduction),
      })),
    },
    { type: 'texte', cle: 'epoque', libelle: t('archive.epoque'), max: 120 },
    { type: 'image', cle: 'imageId', libelle: t('archive.image') },
    { type: 'tags', cle: 'tagIds', libelle: t('liste.tag') },
  ],
  libelles: { sources: t('archive.sources') },
  api: api(archive),
}

export const SPEC_DISTINCTIONS: SpecRessource = {
  ressource: 'distinctions',
  chemin: '/distinctions',
  titreListe: t('menu.distinctions'),
  nouveau: t('distinction.nouvelle'),
  champTitre: 'titre',
  slug: false,
  ordonnable: true,
  principal: [],
  traduits: [
    { cle: 'titre', libelle: t('distinction.titre'), requis: true, max: 200, vide: 'chaine' },
    {
      cle: 'description',
      libelle: t('distinction.description'),
      multiligne: true,
      max: 4000,
      vide: 'null',
    },
  ],
  lateral: [
    {
      type: 'choix',
      cle: 'nature',
      libelle: t('distinction.nature'),
      obligatoire: true,
      options: NATURES_DISTINCTION.map((n) => ({
        valeur: n,
        libelle: t(`distinction.nature.${n}` as CleTraduction),
      })),
    },
    {
      type: 'datePartielle',
      cle: 'annee',
      libelle: t('distinction.annee'),
      aide: t('distinction.anneeAide'),
    },
    { type: 'texte', cle: 'organisme', libelle: t('distinction.organisme'), max: 200 },
    { type: 'url', cle: 'lien', libelle: t('distinction.lien') },
    { type: 'image', cle: 'imageId', libelle: t('distinction.image') },
  ],
  libelles: {},
  api: api(distinctions),
}

export const SPEC_PRESSE: SpecRessource = {
  ressource: 'presse',
  chemin: '/presse',
  titreListe: t('menu.presse'),
  nouveau: t('presse.nouvelle'),
  champTitre: 'titre',
  slug: false,
  ordonnable: true,
  colonneIdentifiant: { champ: 'numero', libelle: t('presse.source') },
  principal: [],
  traduits: [
    { cle: 'titre', libelle: t('presse.titre'), requis: true, max: 300, vide: 'chaine' },
    { cle: 'resume', libelle: t('presse.resume'), multiligne: true, max: 2000, vide: 'null' },
    {
      cle: 'citation',
      libelle: t('presse.citation'),
      aide: t('presse.citationAide'),
      multiligne: true,
      max: 600,
      vide: 'null',
    },
  ],
  lateral: [
    { type: 'texte', cle: 'source', libelle: t('presse.source'), obligatoire: true, max: 200 },
    { type: 'datePartielle', cle: 'datePublication', libelle: t('presse.date') },
    { type: 'url', cle: 'lien', libelle: t('presse.lien'), aide: t('presse.lienAide') },
    { type: 'booleen', cle: 'aLaUne', libelle: t('presse.aLaUne'), aide: t('presse.aLaUneAide') },
    { type: 'image', cle: 'avatarId', libelle: t('presse.avatar') },
  ],
  libelles: {},
  api: api(presse),
}

export const SPEC_UNIVERS: SpecRessource = {
  ressource: 'univers',
  chemin: '/univers',
  titreListe: t('menu.univers'),
  nouveau: t('univers.nouveau'),
  champTitre: 'nom',
  slug: false,
  ordonnable: true,
  colonneIdentifiant: { champ: 'numero', libelle: t('univers.numero') },
  principal: [
    { type: 'texte', cle: 'numero', libelle: t('univers.numero'), obligatoire: true, max: 10 },
  ],
  traduits: [
    { cle: 'nom', libelle: t('univers.nom'), requis: true, max: 120, vide: 'chaine' },
    {
      cle: 'pitch',
      libelle: t('univers.pitch'),
      requis: true,
      multiligne: true,
      max: 400,
      vide: 'chaine',
    },
  ],
  lateral: [
    { type: 'cible', cle: 'cible', libelle: t('univers.cible'), aide: t('projet.cibleAide') },
  ],
  libelles: {},
  api: api(univers),
}

export const SPEC_JALONS: SpecRessource = {
  ressource: 'jalons',
  chemin: '/jalons',
  titreListe: t('menu.jalons'),
  nouveau: t('jalon.nouveau'),
  champTitre: 'titre',
  slug: false,
  ordonnable: true,
  colonneIdentifiant: { champ: 'periode', libelle: t('jalon.periode') },
  principal: [
    {
      type: 'texte',
      cle: 'periode',
      libelle: t('jalon.periode'),
      aide: t('jalon.periodeAide'),
      obligatoire: true,
      max: 40,
    },
  ],
  traduits: [
    { cle: 'titre', libelle: t('jalon.titre'), requis: true, max: 200, vide: 'chaine' },
    {
      cle: 'description',
      libelle: t('jalon.description'),
      multiligne: true,
      max: 4000,
      vide: 'null',
    },
  ],
  lateral: [],
  libelles: {},
  api: api(jalons),
}

export const SPEC_OFFRES: SpecRessource = {
  ressource: 'offres',
  chemin: '/offres',
  titreListe: t('menu.offres'),
  nouveau: t('offre.nouvelle'),
  champTitre: 'titre',
  slug: false,
  ordonnable: true,
  principal: [],
  traduits: [
    { cle: 'titre', libelle: t('offre.titre'), requis: true, max: 200, vide: 'chaine' },
    {
      cle: 'texte',
      libelle: t('offre.texte'),
      aide: t('offre.texteAide'),
      requis: true,
      multiligne: true,
      max: 8000,
      vide: 'null',
    },
  ],
  lateral: [],
  libelles: {},
  api: api(offres),
}

export const SPEC_PAGES: SpecRessource = {
  ressource: 'pages',
  chemin: '/pages',
  titreListe: t('menu.pages'),
  nouveau: t('menu.pages'),
  champTitre: 'titre',
  slug: false,
  fermee: true,
  colonneIdentifiant: { champ: 'cle', libelle: t('page.cle') },
  principal: [{ type: 'blocs', cle: 'blocs', libelle: t('page.blocs'), aide: t('page.blocsAide') }],
  traduits: [
    { cle: 'titre', libelle: t('page.titre'), requis: true, max: 200, vide: 'chaine' },
    { cle: 'chapo', libelle: t('page.chapo'), multiligne: true, max: 600, vide: 'null' },
    { cle: 'seoTitre', libelle: t('page.seoTitre'), requis: true, max: 70, vide: 'null' },
    {
      cle: 'seoDescription',
      libelle: t('page.seoDescription'),
      requis: true,
      multiligne: true,
      max: 160,
      vide: 'null',
    },
  ],
  lateral: [{ type: 'image', cle: 'imageId', libelle: t('page.image') }],
  libelles: {},
  api: api(pages),
}
