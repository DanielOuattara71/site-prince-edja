/**
 * Couche d'accès — preuves, presse, parcours et contenus éditoriaux courts (PLAN-DE-LANCEMENT S1, S2).
 *
 * Mode API : presse, distinctions, jalons, partenaires, offres, univers et galerie d'accueil
 * viennent de `GET /public/api/v1/contenus/<type>`, chargés à la construction. Restent lus dans
 * `src/data/` : motifs de contact, audience, étapes d'étude de cas.
 */
import { MILESTONES as JALONS_DEPART, PRESS as PRESSE_DEPART } from '@/data/content'
import { PARTENAIRES as PARTENAIRES_DEPART, type Partenaire } from '@/data/collaborations'
import { DISTINCTIONS as DISTINCTIONS_DEPART } from '@/data/distinctions'
import { OFFRES as OFFRES_DEPART, type Offre } from '@/data/offres'
import { UNIVERS as UNIVERS_DEPART } from '@/data/content'
import { GALLERY as GALLERY_DEPART } from '@/data/gallery'
import type { Distinction, Milestone, PressItem, Univers, GalleryItem } from '@/types'
import {
  versDistinction,
  versGalerie,
  versJalon,
  versOffre,
  versPartenaire,
  versPresse,
  versUnivers,
  type DistinctionPublique,
  type GaleriePublique,
  type JalonPublic,
  type OffrePublique,
  type PartenairePublic,
  type PressePublique,
  type UniversPublic,
} from './adaptateurs'
import { lireGenere, SOURCE_API } from './source'

export { CONTACT_MOTIFS } from '@/data/content'
export { AUDIENCE, AUDIENCE_PROFILS } from '@/data/audience'
export type { LigneAudience } from '@/data/audience'
export type { Partenaire } from '@/data/collaborations'
export { ETAPES_CAS } from '@/data/offres'
export type { Offre } from '@/data/offres'
export { GALLERY_QUOTE } from '@/data/gallery'

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

export const UNIVERS: Univers[] = SOURCE_API
  ? lireGenere<UniversPublic[]>('univers').map((u) => versUnivers(u))
  : UNIVERS_DEPART

export const GALLERY: GalleryItem[] = SOURCE_API
  ? lireGenere<GaleriePublique[]>('galerie')
      .filter((g) => g.emplacement === 'accueil')
      .sort((a, b) => (a.ordre ?? 0) - (b.ordre ?? 0))
      .map((g) => versGalerie(g))
  : GALLERY_DEPART
