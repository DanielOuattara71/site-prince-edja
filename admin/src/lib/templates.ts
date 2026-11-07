import type { FORMATS_PROJET } from '@/api/schemas/editorial'
import { t } from '@/i18n/fr'

/**
 * Templates de projet (docs/PROPOSITION-TEMPLATES-PROJETS.md, validée le 06/11/2026).
 *
 * Trois templates, chacun appuyé sur un projet réel du site public :
 * - **Film** : X'PLORE quand le projet a des épisodes (carte, album, épisode à la une, guides),
 *   film unitaire sinon (synopsis, crédits, festivals). La bascule suit la présence d'épisodes ;
 * - **Programme** : Taste & Travel (escales, programme, partenaires) ;
 * - **Bibliothèque** : Archive d'Afrique (entrées documentées et leurs sources).
 *
 * L'administrateur **choisit** le template ; le format en **propose** un par défaut. Tous les
 * épisodes partagent un template unique : aucun choix par épisode.
 *
 * Ce fichier est la seule description des templates : hub, formulaire, liste et faux serveur la
 * lisent. Un bloc décrit ce que la page publique montre ; un bloc `facultatif` peut être masqué.
 */
export type FormatProjet = (typeof FORMATS_PROJET)[number]

export const TEMPLATES_PROJET = ['film', 'programme', 'bibliotheque'] as const
export type TemplateProjet = (typeof TEMPLATES_PROJET)[number]

export interface BlocTemplate {
  id: string
  libelle: string
  /** Un bloc facultatif peut être masqué sur le site (`blocsMasques`). */
  facultatif: boolean
  /** Condition d'affichage propre (« avec épisodes », « sans épisode »). */
  condition?: string
}

export interface DescriptionTemplate {
  id: TemplateProjet
  titre: string
  usage: string
  reference: string
  blocs: BlocTemplate[]
}

const bloc = (id: string, facultatif = false, condition?: string): BlocTemplate => ({
  id,
  libelle: t(`bloc.${id}` as Parameters<typeof t>[0]),
  facultatif,
  ...(condition ? { condition } : {}),
})

const AVEC = t('template.avecEpisodes')

export const TEMPLATES: Record<TemplateProjet, DescriptionTemplate> = {
  film: {
    id: 'film',
    titre: t('template.film'),
    usage: t('template.filmUsage'),
    reference: t('template.filmReference'),
    blocs: [
      bloc('heros'),
      bloc('carte', false, AVEC),
      bloc('album', false, AVEC),
      bloc('aLaUne'),
      bloc('guides', false, AVEC),
      bloc('synopsis', true),
      bloc('festivals', true),
      bloc('partenaires', true),
    ],
  },
  programme: {
    id: 'programme',
    titre: t('template.programme'),
    usage: t('template.programmeUsage'),
    reference: t('template.programmeReference'),
    blocs: [
      bloc('heros'),
      bloc('escales'),
      bloc('programme'),
      bloc('partenaires'),
      bloc('festivals', true),
    ],
  },
  bibliotheque: {
    id: 'bibliotheque',
    titre: t('template.bibliotheque'),
    usage: t('template.bibliothequeUsage'),
    reference: t('template.bibliothequeReference'),
    blocs: [bloc('heros'), bloc('entrees'), bloc('rigueur')],
  },
}

/** Template proposé selon le format (il reste modifiable). */
export const TEMPLATE_DU_FORMAT: Record<FormatProjet, TemplateProjet> = {
  Série: 'film',
  Documentaire: 'film',
  Émission: 'programme',
  Archive: 'bibliotheque',
}

/** Template d'un projet : le sien, sinon celui de son format (projets enregistrés avant). */
export function templateDe(projet: { template?: unknown; format?: unknown }): TemplateProjet {
  if (
    typeof projet.template === 'string' &&
    (TEMPLATES_PROJET as readonly string[]).includes(projet.template)
  )
    return projet.template as TemplateProjet
  return (
    TEMPLATE_DU_FORMAT[(typeof projet.format === 'string' ? projet.format : '') as FormatProjet] ??
    'film'
  )
}
