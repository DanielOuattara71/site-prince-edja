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
import {
  AVANCEMENTS_PROJET,
  EMPLACEMENTS_GALERIE,
  FIABILITES,
  FORMATS_PROJET,
  NATURES_DISTINCTION,
  RATIOS_GALERIE,
} from '@/api/schemas/editorial'
import { EpisodesDuProjet } from '@/features/editorial/EpisodesDuProjet'
import type {
  ApiDeclarative,
  ResumeDeclaratif,
  SpecRessource,
} from '@/features/gabarits/declaratif'
import { formatFCFA } from '@/lib/format'
import { templateDe, TEMPLATES, TEMPLATES_PROJET, type TemplateProjet } from '@/lib/templates'
import { t, type CleTraduction } from '@/i18n/fr'

/**
 * Descriptions des familles du lot 2 (`docs/CONTRAT-API.md` § 9.2 à 9.5), pour le gabarit
 * déclaratif (D-62). **P** = exigé à la publication (`requis`) ; **C** = crédibilité, suivi dans
 * `champsAFournir`, envoyé `null` quand il est vide.
 */
const api = (ressource: unknown) => ressource as ApiDeclarative

/** Les listes du groupe Projets s'ouvrent depuis le hub (ECRANS § 3) : il est leur parent. */
const HUB = { libelle: t('menu.projets'), chemin: '/projets' }

const texteResume = (o: ResumeDeclaratif, cle: string) => {
  const valeur = o[cle]
  return typeof valeur === 'string' && valeur ? valeur : '—'
}

export const SPEC_EPISODES: SpecRessource = {
  ressource: 'episodes',
  chemin: '/episodes',
  titreListe: t('menu.episodes'),
  nouveau: t('episode.nouveau'),
  champTitre: 'titre',
  slug: true,
  parent: HUB,
  colonneIdentifiant: { champ: 'numero', libelle: t('episode.numero') },
  colonnes: [
    { id: 'projet', entete: t('episode.projet'), cellule: (o) => texteResume(o, 'projet') },
    {
      id: 'destination',
      entete: t('episode.destination'),
      masquable: true,
      cellule: (o) => texteResume(o, 'destination'),
    },
  ],
  filtresRelation: [
    { cle: 'projetId', libelle: t('episode.projet'), ressource: 'projets' },
    { cle: 'destinationId', libelle: t('episode.destination'), ressource: 'destinations' },
  ],
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
    // Un épisode appartient à zéro ou un projet ; l'ordre suit le numéro (RG-32).
    { type: 'relation', cle: 'projetId', libelle: t('episode.projet'), ressource: 'projets' },
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
    { type: 'tags', cle: 'tagIds', libelle: t('liste.tag'), contexte: 'episode' },
  ],
  libelles: { dureeMinutes: t('episode.duree') },
  api: api(episodes),
}

/** Champs propres à certains templates (PROPOSITION-TEMPLATES-PROJETS § 4). */
const POUR = (...valeurs: TemplateProjet[]) => ({ champ: 'template', valeurs })

export const SPEC_PROJETS: SpecRessource = {
  ressource: 'projets',
  chemin: '/projets',
  // Le hub occupe `/projets` (ECRANS § 3.1) : la liste est un niveau plus bas.
  cheminListe: '/projets/liste',
  parent: HUB,
  titreListe: t('projet.liste'),
  nouveau: t('projet.nouveau'),
  champTitre: 'titre',
  slug: true,
  ordonnable: true,
  colonnes: [
    {
      id: 'template',
      entete: t('projet.template'),
      cellule: (o) => TEMPLATES[templateDe({ template: o['template'], format: o['format'] })].titre,
    },
    {
      id: 'format',
      entete: t('projet.format'),
      masquable: true,
      cellule: (o) => texteResume(o, 'format'),
    },
    {
      id: 'categorie',
      entete: t('article.categorie'),
      masquable: true,
      cellule: (o) => texteResume(o, 'categorie'),
    },
    {
      id: 'avancement',
      entete: t('projet.avancement'),
      masquable: true,
      cellule: (o) =>
        typeof o['avancement'] === 'string' ? t(`projet.${o['avancement']}` as CleTraduction) : '—',
    },
    {
      id: 'episodes',
      entete: t('projet.nombreEpisodes'),
      masquable: true,
      cellule: (o) => (typeof o['nombreEpisodes'] === 'number' ? String(o['nombreEpisodes']) : '—'),
    },
  ],
  filtres: [
    {
      cle: 'template',
      libelle: t('projet.template'),
      options: TEMPLATES_PROJET.map((tpl) => ({ valeur: tpl, libelle: TEMPLATES[tpl].titre })),
    },
    {
      cle: 'format',
      libelle: t('projet.format'),
      options: FORMATS_PROJET.map((f) => ({ valeur: f, libelle: f })),
    },
    {
      cle: 'avancement',
      libelle: t('projet.avancement'),
      options: AVANCEMENTS_PROJET.map((a) => ({
        valeur: a,
        libelle: t(`projet.${a}` as CleTraduction),
      })),
    },
  ],
  filtreCategorie: 'projet',
  complement: EpisodesDuProjet,
  principalApres: true,
  principal: [
    {
      type: 'template',
      cle: 'template',
      libelle: t('template.choisir'),
      aide: t('template.choisirAide'),
      champFormat: 'format',
    },
    {
      type: 'corps',
      cle: 'contenu',
      libelle: t('projet.presentation'),
      aide: t('projet.presentationAide'),
      visibleSi: POUR('film', 'programme'),
    },
    {
      type: 'relations',
      cle: 'escaleIds',
      libelle: t('projet.escales'),
      aide: t('projet.escalesAide'),
      ressource: 'villes',
      visibleSi: POUR('programme'),
    },
    {
      type: 'relations',
      cle: 'partenaireIds',
      libelle: t('projet.partenaires'),
      ressource: 'partenaires',
      visibleSi: POUR('film', 'programme'),
    },
    {
      type: 'blocsProjet',
      cle: 'blocsMasques',
      libelle: t('template.blocsFacultatifs'),
      champTemplate: 'template',
      champFormat: 'format',
    },
  ],
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
    {
      cle: 'citation',
      libelle: t('projet.citation'),
      aide: t('projet.citationAide'),
      multiligne: true,
      max: 300,
      vide: 'null',
    },
    {
      cle: 'programme',
      libelle: t('projet.programme'),
      aide: t('projet.programmeAide'),
      multiligne: true,
      max: 4000,
      vide: 'null',
      visibleSi: POUR('programme'),
    },
    {
      cle: 'festivals',
      libelle: t('projet.festivals'),
      aide: t('projet.festivalsAide'),
      multiligne: true,
      max: 4000,
      vide: 'null',
      visibleSi: POUR('film', 'programme'),
    },
  ],
  lateral: [
    {
      type: 'choix',
      cle: 'format',
      libelle: t('projet.format'),
      aide: t('projet.formatAide'),
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
    {
      type: 'texte',
      cle: 'saison',
      libelle: t('projet.saison'),
      aide: t('projet.saisonAide'),
      max: 40,
      visibleSi: POUR('film'),
    },
    {
      type: 'categorie',
      cle: 'categorieId',
      libelle: t('projet.categorie'),
      aide: t('projet.categorieAide'),
      famille: 'projet',
    },
    { type: 'image', cle: 'imageId', libelle: t('projet.image') },
    {
      type: 'image',
      cle: 'bandeauId',
      libelle: t('projet.bandeau'),
      aide: t('projet.bandeauAide'),
    },
    { type: 'cible', cle: 'cible', libelle: t('projet.cible'), aide: t('projet.cibleAide') },
    { type: 'tags', cle: 'tagIds', libelle: t('liste.tag'), contexte: 'projet' },
  ],
  libelles: { template: t('template.choisir'), escaleIds: t('projet.escales') },
  api: api(projets),
}

export const SPEC_VILLES: SpecRessource = {
  parent: HUB,
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
    { type: 'tags', cle: 'tagIds', libelle: t('liste.tag'), contexte: 'ville' },
  ],
  libelles: {},
  api: api(villes),
}

export const SPEC_DESTINATIONS: SpecRessource = {
  parent: HUB,
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
    { type: 'tags', cle: 'tagIds', libelle: t('destination.tags'), contexte: 'destination' },
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
  parent: HUB,
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
    { type: 'tags', cle: 'tagIds', libelle: t('liste.tag'), contexte: 'archive' },
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

// --- Lot 4 (§ 9.9, § 9.13 à 9.16) ---

export const SPEC_GALERIE: SpecRessource = {
  ressource: 'galerie',
  chemin: '/galerie',
  titreListe: t('menu.galerie'),
  nouveau: t('galerie.nouvelle'),
  champTitre: 'etiquette',
  slug: false,
  ordonnable: true,
  // Aucun champ de traduction n'est exigé partout : l'aperçu suit le premier texte saisi (§ 9.9).
  titreFacultatif: true,
  // L'ordre est déclaré par emplacement : un panneau d'ordre par groupe (§ 9.9).
  groupeOrdre: 'emplacement',
  filtres: [
    {
      cle: 'emplacement',
      libelle: t('galerie.emplacement'),
      options: [
        { valeur: '', libelle: t('liste.tous') },
        ...EMPLACEMENTS_GALERIE.map((e) => ({
          valeur: e,
          libelle: t(`galerie.emplacement.${e}` as CleTraduction),
        })),
      ],
    },
  ],
  principal: [],
  traduits: [
    {
      cle: 'etiquette',
      libelle: t('galerie.etiquette'),
      aide: t('galerie.etiquetteAide'),
      max: 120,
      vide: 'null',
    },
    {
      cle: 'titre',
      libelle: t('galerie.titre'),
      aide: t('galerie.titreAide'),
      max: 200,
      vide: 'null',
    },
    { cle: 'legende', libelle: t('galerie.legende'), multiligne: true, max: 600, vide: 'null' },
  ],
  lateral: [
    {
      type: 'choix',
      cle: 'emplacement',
      libelle: t('galerie.emplacement'),
      aide: t('galerie.emplacementAide'),
      obligatoire: true,
      options: EMPLACEMENTS_GALERIE.map((e) => ({
        valeur: e,
        libelle: t(`galerie.emplacement.${e}` as CleTraduction),
      })),
    },
    { type: 'image', cle: 'mediaId', libelle: t('galerie.media') },
    {
      type: 'choix',
      cle: 'ratio',
      libelle: t('galerie.ratio'),
      obligatoire: true,
      options: RATIOS_GALERIE.map((r) => ({ valeur: r, libelle: r })),
    },
    {
      type: 'nombre',
      cle: 'parallaxe',
      libelle: t('galerie.parallaxe'),
      aide: t('galerie.parallaxeAide'),
      entier: true,
      min: 0,
      max: 20,
    },
    { type: 'cible', cle: 'cible', libelle: t('galerie.lien'), aide: t('galerie.lienAide') },
    { type: 'url', cle: 'lienExterne', libelle: t('galerie.lienExterne') },
  ],
  libelles: {
    emplacement: t('galerie.emplacement'),
    accueil: t('galerie.emplacement.accueil'),
    boutique: t('galerie.emplacement.boutique'),
  },
  api: api(galerie),
}

export const SPEC_ETUDES_CAS: SpecRessource = {
  ressource: 'etudes-cas',
  chemin: '/etudes-cas',
  titreListe: t('menu.etudesCas'),
  nouveau: t('etude.nouvelle'),
  champTitre: 'titre',
  slug: true,
  ordonnable: true,
  principal: [],
  traduits: [
    { cle: 'titre', libelle: t('etude.titre'), requis: true, max: 200, vide: 'chaine' },
    {
      cle: 'client',
      libelle: t('etude.client'),
      aide: t('etude.clientAide'),
      max: 200,
      vide: 'null',
    },
    {
      cle: 'challenge',
      libelle: t('etude.challenge'),
      requis: true,
      multiligne: true,
      max: 8000,
      vide: 'null',
    },
    {
      cle: 'idee',
      libelle: t('etude.idee'),
      requis: true,
      multiligne: true,
      max: 8000,
      vide: 'null',
    },
    {
      cle: 'resultats',
      libelle: t('etude.resultats'),
      requis: true,
      multiligne: true,
      max: 8000,
      vide: 'null',
    },
    {
      cle: 'execution',
      libelle: t('etude.execution'),
      multiligne: true,
      max: 8000,
      vide: 'null',
    },
    {
      cle: 'contenus',
      libelle: t('etude.contenus'),
      multiligne: true,
      max: 8000,
      vide: 'null',
    },
    {
      cle: 'diffusion',
      libelle: t('etude.diffusion'),
      multiligne: true,
      max: 8000,
      vide: 'null',
    },
    {
      cle: 'temoignage',
      libelle: t('etude.temoignage'),
      multiligne: true,
      max: 2000,
      vide: 'null',
    },
  ],
  lateral: [
    {
      type: 'relation',
      ressource: 'offres',
      cle: 'offreId',
      libelle: t('etude.offre'),
    },
    { type: 'image', cle: 'imageId', libelle: t('etude.image') },
    { type: 'galerie', cle: 'galerieMediaIds', libelle: t('etude.galerie') },
  ],
  libelles: {},
  api: api(etudesCas),
}

export const SPEC_PARTENAIRES: SpecRessource = {
  ressource: 'partenaires',
  chemin: '/partenaires',
  titreListe: t('menu.partenaires'),
  nouveau: t('partenaire.nouveau'),
  champTitre: 'nom',
  slug: false,
  ordonnable: true,
  principal: [],
  traduits: [{ cle: 'nom', libelle: t('partenaire.nom'), requis: true, max: 200, vide: 'chaine' }],
  lateral: [
    { type: 'image', cle: 'logoId', libelle: t('partenaire.logo') },
    { type: 'url', cle: 'lien', libelle: t('partenaire.lien'), aide: t('partenaire.lienAide') },
  ],
  libelles: {},
  api: api(partenaires),
}

export const SPEC_PAGES_LEGALES: SpecRessource = {
  ressource: 'pages-legales',
  chemin: '/pages-legales',
  titreListe: t('menu.pagesLegales'),
  nouveau: t('menu.pagesLegales'),
  champTitre: 'titre',
  slug: false,
  fermee: true,
  colonneIdentifiant: { champ: 'cle', libelle: t('page.cle') },
  principal: [{ type: 'corps', cle: 'corps', libelle: t('page.corps'), aide: t('page.corpsAide') }],
  traduits: [
    { cle: 'titre', libelle: t('page.titre'), requis: true, max: 200, vide: 'chaine' },
    { cle: 'resume', libelle: t('page.resume'), multiligne: true, max: 600, vide: 'null' },
  ],
  lateral: [],
  libelles: {},
  api: api(pagesLegales),
}

/**
 * Livres (ECRANS § 4.3, SCHEMAS § 8.3) : un produit comme un bijou, avec ses variantes (« Broché »,
 * « Relié »…). Catégorie de la famille `produit`, créateur, couverture. Rien n'est inventé : un
 * prix vide reste « sur demande ».
 */
export const SPEC_LIVRES: SpecRessource = {
  ressource: 'livres',
  chemin: '/livres',
  titreListe: t('menu.livres'),
  nouveau: t('livre.nouveau'),
  champTitre: 'titre',
  slug: true,
  colonneIdentifiant: { champ: 'numero', libelle: t('livre.reference') },
  colonnes: [
    { id: 'auteur', entete: t('livre.auteur'), cellule: (o) => texteResume(o, 'auteur') },
    {
      id: 'categorie',
      entete: t('livre.categorie'),
      masquable: true,
      cellule: (o) => texteResume(o, 'categorie'),
    },
    {
      id: 'prixMin',
      entete: t('livre.prixMin'),
      masquable: true,
      cellule: (o) =>
        typeof o['prixMin'] === 'number' ? formatFCFA(o['prixMin']) : t('livre.surDemande'),
    },
    {
      id: 'visible',
      entete: t('livre.visible'),
      masquable: true,
      cellule: (o) => (o['visible'] === false ? t('declaratif.non') : t('declaratif.oui')),
    },
  ],
  filtreCategorie: 'produit',
  principalApres: true,
  principal: [
    { type: 'galerie', cle: 'galerieMediaIds', libelle: t('livre.galerie') },
    {
      type: 'variantes',
      cle: 'variantes',
      libelle: t('livre.variantes'),
      aide: t('livre.variantesAide'),
    },
  ],
  traduits: [
    { cle: 'titre', libelle: t('livre.titre'), requis: true, max: 200, vide: 'chaine' },
    {
      cle: 'resume',
      libelle: t('livre.resume'),
      requis: true,
      multiligne: true,
      max: 2000,
      vide: 'chaine',
    },
  ],
  lateral: [
    { type: 'categorie', cle: 'categorieId', libelle: t('livre.categorie'), famille: 'produit' },
    { type: 'createur', cle: 'createurId', libelle: t('livre.createur') },
    {
      type: 'texte',
      cle: 'reference',
      libelle: t('livre.reference'),
      aide: t('livre.referenceAide'),
      obligatoire: true,
      max: 20,
    },
    { type: 'texte', cle: 'auteur', libelle: t('livre.auteur'), max: 200 },
    { type: 'texte', cle: 'editeur', libelle: t('livre.editeur'), max: 200 },
    { type: 'texte', cle: 'isbn', libelle: t('livre.isbn'), max: 20 },
    {
      type: 'nombre',
      cle: 'anneePublication',
      libelle: t('livre.annee'),
      entier: true,
      min: 1000,
      max: 2100,
    },
    {
      type: 'nombre',
      cle: 'nombrePages',
      libelle: t('livre.pages'),
      entier: true,
      min: 1,
      max: 10000,
    },
    {
      type: 'booleen',
      cle: 'prixConfirme',
      libelle: t('livre.prixConfirme'),
      aide: t('livre.prixConfirmeAide'),
    },
    { type: 'booleen', cle: 'visible', libelle: t('livre.visible'), defaut: true },
    { type: 'image', cle: 'imageId', libelle: t('livre.couverture') },
    { type: 'tags', cle: 'tagIds', libelle: t('liste.tag'), contexte: 'livre' },
  ],
  libelles: {
    imageId: t('livre.couverture'),
    categorieId: t('livre.categorie'),
    createurId: t('livre.createur'),
    variantes: t('livre.variantes'),
  },
  api: api(livres),
}
