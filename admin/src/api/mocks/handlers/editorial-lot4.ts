import {
  ecritureEtudeCas,
  ecritureGalerie,
  ecriturePageLegale,
  ecriturePartenaire,
  type EtudeCas,
  type Galerie,
  type PageLegale,
  type Partenaire,
} from '@/api/schemas/editorial'
import type { CorpsRiche } from '@/api/schemas/corps-riche'
import { magasin } from '@/api/mocks/magasin'
import { erreur } from '@/api/mocks/reponses'
import { ressourceSimulee, titreDe } from '@/api/mocks/ressource-simulee'
import {
  credibiliteTraduite,
  manquesImage,
  manquesTraduits,
  texteOuNull,
} from '@/api/mocks/handlers/editorial'

/**
 * Lot 4 éditorial simulé (`docs/CONTRAT-API.md` § 9.9, § 9.13 à 9.16), sur la fabrique (D-63).
 * Particularités : la galerie s'ordonne **par emplacement** (§ 9.9), une étude de cas exige
 * image et récit, les pages légales sont un ensemble fermé dont le texte reste à fournir.
 */
const champ = <T>(e: Record<string, unknown>, cle: string, defaut: T) =>
  (e[cle] as T | undefined) ?? defaut

const tri = (o: { ordre?: number }) => o.ordre ?? 0

export const handlersEditorialLot4 = [
  ...ressourceSimulee<Galerie>({
    nom: 'galerie',
    collection: () => magasin.galerie,
    remplacer: (liste) => {
      magasin.galerie = liste
    },
    entree: ecritureGalerie.entree,
    modification: ecritureGalerie.modification,
    champTitre: 'etiquette',
    slugs: false,
    ordonnable: true,
    // L'ordre est déclaré **par emplacement** (accueil, boutique) : la liste d'un `PATCH /ordre`
    // ne porte qu'un emplacement à la fois, la création ordonne dans l'emplacement seul.
    groupe: 'emplacement',
    traduction: (e) => ({
      etiquette: texteOuNull(e['etiquette']),
      titre: texteOuNull(e['titre']),
      legende: texteOuNull(e['legende']),
    }),
    champsInitiaux: (e) => {
      const emplacement = e['emplacement'] as Galerie['emplacement']
      const dedans = magasin.galerie.filter((o) => o.emplacement === emplacement)
      return {
        emplacement,
        mediaId: champ<string | null>(e, 'mediaId', null),
        cible: champ<Galerie['cible']>(e, 'cible', null),
        lienExterne: champ<string | null>(e, 'lienExterne', null),
        ratio: e['ratio'] as Galerie['ratio'],
        parallaxe: champ<number | null>(e, 'parallaxe', null),
        ordre: Math.max(-1, ...dedans.map((o) => o.ordre)) + 1,
      }
    },
    exigences: (o) => {
      const manques = manquesImage(o.mediaId, 'mediaId', true)
      // Le titre n'est exigé que sur la galerie de la boutique ; l'accueil se contente d'un visuel.
      if (o.emplacement === 'boutique') {
        for (const langue of magasin.languesActives) {
          const t = o.traductions[langue]
          if (typeof t?.['titre'] !== 'string' || !t['titre'].trim()) {
            manques.push({
              champ: `traductions.${langue}.titre`,
              langue,
              message: 'Titre obligatoire pour la galerie de la boutique.',
            })
          }
        }
      }
      return manques
    },
    // `cible` (interne) et `lienExterne` s'excluent (§ 9.9).
    controler: (o) =>
      o.cible && o.lienExterne
        ? erreur(422, 'VALIDATION', 'Un lien interne et un lien externe s’excluent.', {
            champ: 'cible',
          })
        : null,
    filtrer: (o, p) => (p.get('emplacement') ? o.emplacement === p.get('emplacement') : true),
    tris: { ordre: tri, titre: (o) => titreDe(o, 'etiquette').toLowerCase() },
    resume: (o) => ({ ordre: o.ordre, emplacement: o.emplacement }),
  }),

  ...ressourceSimulee<EtudeCas>({
    nom: 'etudes-cas',
    collection: () => magasin.etudesCas,
    remplacer: (liste) => {
      magasin.etudesCas = liste
    },
    entree: ecritureEtudeCas.entree,
    modification: ecritureEtudeCas.modification,
    champTitre: 'titre',
    slugs: true,
    ordonnable: true,
    traduction: (e) => ({
      titre: e['titre'],
      client: texteOuNull(e['client']),
      challenge: texteOuNull(e['challenge']),
      idee: texteOuNull(e['idee']),
      execution: texteOuNull(e['execution']),
      contenus: texteOuNull(e['contenus']),
      diffusion: texteOuNull(e['diffusion']),
      resultats: texteOuNull(e['resultats']),
      temoignage: texteOuNull(e['temoignage']),
    }),
    champsInitiaux: (e) => ({
      offreId: champ<string | null>(e, 'offreId', null),
      imageId: champ<string | null>(e, 'imageId', null),
      galerieMediaIds: champ<string[]>(e, 'galerieMediaIds', []),
    }),
    exigences: (o) => [
      ...manquesTraduits(o.traductions, {
        titre: 'Titre',
        challenge: 'Challenge',
        idee: 'Idée',
        resultats: 'Résultats',
      }),
      ...manquesImage(o.imageId, 'imageId', true),
    ],
    credibilite: (o) => [
      ...credibiliteTraduite(o.traductions, ['client', 'execution', 'contenus', 'diffusion']),
      ...credibiliteTraduite(o.traductions, ['temoignage']),
    ],
    tris: { ordre: tri, titre: (o) => titreDe(o, 'titre').toLowerCase() },
  }),

  ...ressourceSimulee<Partenaire>({
    nom: 'partenaires',
    collection: () => magasin.partenaires,
    remplacer: (liste) => {
      magasin.partenaires = liste
    },
    entree: ecriturePartenaire.entree,
    modification: ecriturePartenaire.modification,
    champTitre: 'nom',
    slugs: false,
    ordonnable: true,
    traduction: (e) => ({ nom: e['nom'] }),
    champsInitiaux: (e) => ({
      logoId: champ<string | null>(e, 'logoId', null),
      lien: champ<string | null>(e, 'lien', null),
    }),
    exigences: (o) => [
      ...manquesTraduits(o.traductions, { nom: 'Nom' }),
      ...manquesImage(o.logoId, 'logoId', true),
    ],
    tris: { ordre: tri, titre: (o) => titreDe(o, 'nom').toLowerCase() },
  }),

  // Pages légales : ensemble fermé (`peut` refuse création et suppression), texte fourni.
  ...ressourceSimulee<PageLegale>({
    nom: 'pages-legales',
    collection: () => magasin.pagesLegales,
    remplacer: (liste) => {
      magasin.pagesLegales = liste
    },
    entree: ecriturePageLegale.entree,
    modification: ecriturePageLegale.modification,
    champTitre: 'titre',
    slugs: false,
    traduction: (e, existante) => ({
      titre: e['titre'],
      resume: texteOuNull(e['resume']),
      corps:
        (e['corps'] as CorpsRiche | null | undefined) ??
        (existante?.['corps'] as CorpsRiche | null | undefined) ??
        null,
    }),
    champsInitiaux: () => ({}),
    exigences: (o) => {
      const manques = manquesTraduits(o.traductions, { titre: 'Titre' })
      for (const langue of magasin.languesActives) {
        if (!o.traductions[langue]?.['corps']) {
          manques.push({
            champ: `traductions.${langue}.corps`,
            langue,
            message: 'Corps du texte manquant.',
          })
        }
      }
      return manques
    },
    tris: { titre: (o) => titreDe(o, 'titre').toLowerCase() },
    resume: (o) => ({ cle: o.cle }),
  }),
]
