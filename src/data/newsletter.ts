/**
 * La Lettre du Griot.
 *
 * La promesse et la segmentation viennent du CDC et sont reproduites telles quelles.
 * Aucun fournisseur d'emailing n'est branché : le formulaire valide, enregistre l'intention
 * et annonce l'état d'avancement, plutôt que de faire croire à un envoi.
 */

export const PROMESSE_NEWSLETTER =
  'Des histoires, des destinations et des fragments d’Afrique que les réseaux sociaux ne permettent pas toujours de raconter.'

/** Segmentation préparée, non exposée (CDC T-152). */
export const SEGMENTS_NEWSLETTER = [
  'culture',
  'voyage',
  'films',
  'shop',
  'professionnels',
] as const

export type SegmentNewsletter = (typeof SEGMENTS_NEWSLETTER)[number]
