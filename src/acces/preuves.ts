/**
 * Couche d'accès — preuves, presse, parcours et contenus éditoriaux courts (PLAN-DE-LANCEMENT S1, S2).
 *
 * Mode API : presse, distinctions, jalons, partenaires et offres viennent de
 * `GET /public/api/v1/contenus/<type>`, chargés à la construction. Restent lus dans `src/data/`
 * (non chargés en S2) : univers, motifs de contact, audience, étapes d'étude de cas, galerie de
 * l'accueil (`GET /galeries/:emplacement`, à brancher).
 */
import { MILESTONES as JALONS_DEPART, PRESS as PRESSE_DEPART } from '@/data/content'
import { PARTENAIRES as PARTENAIRES_DEPART, type Partenaire } from '@/data/collaborations'
import { DISTINCTIONS as DISTINCTIONS_DEPART } from '@/data/distinctions'
import { OFFRES as OFFRES_DEPART, type Offre } from '@/data/offres'
import type { Distinction, Milestone, PressItem } from '@/types'
import {
  versDistinction,
  versJalon,
  versOffre,
  versPartenaire,
  versPresse,
  type DistinctionPublique,
  type JalonPublic,
  type OffrePublique,
  type PartenairePublic,
  type PressePublique,
} from './adaptateurs'
import { lireGenere, SOURCE_API } from './source'

export { UNIVERS, CONTACT_MOTIFS } from '@/data/content'
export { AUDIENCE, AUDIENCE_PROFILS } from '@/data/audience'
export type { LigneAudience } from '@/data/audience'
export type { Partenaire } from '@/data/collaborations'
export { ETAPES_CAS } from '@/data/offres'
export type { Offre } from '@/data/offres'
export { GALLERY, GALLERY_QUOTE } from '@/data/gallery'

export const PRESS: PressItem[] = SOURCE_API
  ? lireGenere<PressePublique[]>('presse').map(versPresse)
  : PRESSE_DEPART
export const MILESTONES: Milestone[] = SOURCE_API
  ? lireGenere<JalonPublic[]>('jalons').map(versJalon)
  : JALONS_DEPART
export const DISTINCTIONS: Distinction[] = SOURCE_API
  ? lireGenere<DistinctionPublique[]>('distinctions').map(versDistinction)
  : DISTINCTIONS_DEPART
export const PARTENAIRES: Partenaire[] = SOURCE_API
  ? lireGenere<PartenairePublic[]>('partenaires').map(versPartenaire)
  : PARTENAIRES_DEPART
export const OFFRES: Offre[] = SOURCE_API
  ? lireGenere<OffrePublique[]>('offres').map(versOffre)
  : OFFRES_DEPART
