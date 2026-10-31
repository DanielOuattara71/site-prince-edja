import type { JSONContent } from '@tiptap/core'
import {
  corpsRicheSchema,
  TYPES_NOEUD,
  type CorpsRiche,
  type MarqueRiche,
  type NoeudRiche,
  type TypeNoeud,
} from '@/api/schemas/corps-riche'

/**
 * Passe du JSON de Tiptap au corps riche du contrat (§ 9.1, D-21). Tiptap ajoute des
 * attributs de présentation (`target`, `rel`, `class` des liens, `start` par défaut des
 * listes) : ils sont retirés, et tout ce qui sort de la liste blanche disparaît. Le résultat
 * est revalidé par le schéma partagé avec le serveur.
 */

const NOEUDS = new Set<string>(TYPES_NOEUD)

function marques(brutes: JSONContent['marks']): MarqueRiche[] | undefined {
  const retenues: MarqueRiche[] = []
  for (const marque of brutes ?? []) {
    if (marque.type === 'bold' || marque.type === 'italic') retenues.push({ type: marque.type })
    const href: unknown = marque.attrs?.['href']
    if (marque.type === 'link' && typeof href === 'string') {
      retenues.push({ type: 'link', attrs: { href } })
    }
  }
  return retenues.length > 0 ? retenues : undefined
}

function attributs(
  type: TypeNoeud,
  attrs: JSONContent['attrs'],
): Record<string, unknown> | undefined {
  if (type === 'heading') return { level: attrs?.['level'] }
  if (type === 'image') return { mediaId: attrs?.['mediaId'] }
  if (type === 'orderedList') {
    const debut: unknown = attrs?.['start']
    return typeof debut === 'number' && debut > 1 ? { start: debut } : undefined
  }
  return undefined
}

function noeud(brut: JSONContent): NoeudRiche | null {
  if (!brut.type || !NOEUDS.has(brut.type)) return null
  const type = brut.type as TypeNoeud
  if (type === 'text') {
    if (!brut.text) return null
    const marquesRetenues = marques(brut.marks)
    return { type, text: brut.text, ...(marquesRetenues ? { marks: marquesRetenues } : {}) }
  }
  const attrs = attributs(type, brut.attrs)
  const enfants = (brut.content ?? []).map(noeud).filter((n): n is NoeudRiche => n !== null)
  return {
    type,
    ...(attrs ? { attrs } : {}),
    ...(brut.content ? { content: enfants } : {}),
  }
}

/** Corps riche, ou `null` si le document est vide (vide ≠ paragraphe vide, section 11). */
export function normaliserCorps(document: JSONContent): CorpsRiche | null {
  const contenu = (document.content ?? []).map(noeud).filter((n): n is NoeudRiche => n !== null)
  const significatif = contenu.some(
    (n) => n.type === 'image' || (n.content !== undefined && n.content.length > 0),
  )
  if (!significatif) return null
  return corpsRicheSchema.parse({ type: 'doc', content: contenu })
}

/**
 * Nettoyage du collage (section 10) : les blocs `script`, `style`, `iframe` et les
 * commentaires (Word) sont retirés avant même que Tiptap n'analyse le HTML. Le schéma de
 * l'éditeur écarte ensuite toute balise hors liste blanche.
 */
export function nettoyerCollage(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(script|style|iframe|object|embed)\b[\s\S]*?<\/\1\s*>/gi, '')
    .replace(/<(script|style|iframe|object|embed|link|meta)\b[^>]*\/?>/gi, '')
}
