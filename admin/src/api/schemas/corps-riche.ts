import { z } from 'zod'
import { idSchema } from '@/api/schemas/communs'

/**
 * Corps riche (`docs/CONTRAT-API.md` § 9.1) : JSON Tiptap validé par liste blanche.
 * Le même contrôle tourne au serveur ; celui-ci sert à prévenir l'erreur (D-26).
 */

export const TYPES_NOEUD = [
  'paragraph',
  'text',
  'heading',
  'bulletList',
  'orderedList',
  'listItem',
  'blockquote',
  'hardBreak',
  'image',
] as const
export type TypeNoeud = (typeof TYPES_NOEUD)[number]

/** `https:`, `http:`, `mailto:` ou une adresse relative au site ; jamais `javascript:`. */
export const lienSurSchema = z
  .string()
  .regex(/^(https?:\/\/|mailto:|\/(?!\/))/i, 'Lien non autorisé.')

export const marqueRicheSchema = z.discriminatedUnion('type', [
  z.strictObject({ type: z.literal('bold') }),
  z.strictObject({ type: z.literal('italic') }),
  z.strictObject({ type: z.literal('link'), attrs: z.strictObject({ href: lienSurSchema }) }),
])
export type MarqueRiche = z.infer<typeof marqueRicheSchema>

export interface NoeudRiche {
  type: TypeNoeud
  attrs?: Record<string, unknown> | undefined
  text?: string | undefined
  marks?: MarqueRiche[] | undefined
  content?: NoeudRiche[] | undefined
}

const attrsHeading = z.strictObject({ level: z.union([z.literal(2), z.literal(3), z.literal(4)]) })
const attrsImage = z.strictObject({ mediaId: idSchema })
const attrsListeOrdonnee = z.strictObject({
  start: z.number().int().positive().optional(),
  type: z.string().nullable().optional(),
})

export const noeudRicheSchema: z.ZodType<NoeudRiche> = z.lazy(() =>
  z
    .strictObject({
      type: z.enum(TYPES_NOEUD),
      attrs: z.record(z.string(), z.unknown()).optional(),
      text: z.string().optional(),
      marks: z.array(marqueRicheSchema).optional(),
      content: z.array(noeudRicheSchema).optional(),
    })
    .superRefine((noeud, ctx) => {
      const erreur = (message: string) => ctx.addIssue({ code: 'custom', message })

      if (noeud.type === 'text') {
        if (!noeud.text) erreur('Un nœud texte doit contenir du texte.')
        if (noeud.content) erreur('Un nœud texte ne contient pas de nœuds.')
      } else if (noeud.text !== undefined || noeud.marks !== undefined) {
        erreur(`Le nœud « ${noeud.type} » ne porte ni texte ni marque.`)
      }

      const attrs = noeud.attrs
      if (noeud.type === 'heading') {
        if (!attrsHeading.safeParse(attrs).success) erreur('Titre : niveau 2, 3 ou 4.')
      } else if (noeud.type === 'image') {
        if (!attrsImage.safeParse(attrs).success) erreur('Image : seul `mediaId` est accepté.')
      } else if (noeud.type === 'orderedList') {
        if (attrs !== undefined && !attrsListeOrdonnee.safeParse(attrs).success) {
          erreur('Liste numérotée : attributs non autorisés.')
        }
      } else if (attrs !== undefined) {
        erreur(`Le nœud « ${noeud.type} » n'accepte aucun attribut.`)
      }
    }),
)

export const corpsRicheSchema = z.strictObject({
  type: z.literal('doc'),
  content: z.array(noeudRicheSchema),
})
export type CorpsRiche = z.infer<typeof corpsRicheSchema>

/** Identifiants des médias cités dans un corps (usages, RG-08). */
export function mediasDuCorps(corps: CorpsRiche | null | undefined): string[] {
  const ids: string[] = []
  const parcourir = (noeuds: NoeudRiche[] | undefined) => {
    for (const noeud of noeuds ?? []) {
      const mediaId = noeud.type === 'image' ? noeud.attrs?.['mediaId'] : undefined
      if (typeof mediaId === 'string') ids.push(mediaId)
      parcourir(noeud.content)
    }
  }
  parcourir(corps?.content)
  return ids
}

/** Nombre de mots du corps, pour la durée de lecture (200 mots par minute). */
export function motsDuCorps(corps: CorpsRiche | null | undefined): number {
  let total = 0
  const parcourir = (noeuds: NoeudRiche[] | undefined) => {
    for (const noeud of noeuds ?? []) {
      if (noeud.text) total += noeud.text.trim().split(/\s+/).filter(Boolean).length
      parcourir(noeud.content)
    }
  }
  parcourir(corps?.content)
  return total
}
