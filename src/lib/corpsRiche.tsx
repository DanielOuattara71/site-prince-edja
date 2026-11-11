/**
 * Rendu de corps riches (Tiptap/ProseMirror document) du back end, en HTML **épuré**.
 *
 * Whitelist stricte de nœuds et de marques : toute chose inconnue est supprimée, jamais rendue.
 * Un lien externe passe par un `rel="noopener noreferrer"` + `target="_blank"`.
 *
 * Entrée : JSON issu du back end (`mediasCorps`), jamais HTML.
 */
import type { ReactNode } from 'react'

export interface CorpsMarque {
  type: string
  attrs?: Record<string, unknown>
}
export interface CorpsNoeud {
  type?: string
  attrs?: Record<string, unknown>
  content?: CorpsNoeud[]
  text?: string
  marks?: CorpsMarque[]
}
export interface CorpsDocument {
  type?: string
  content?: CorpsNoeud[]
}

const TAG_MARQUES: Record<string, string> = {
  bold: 'strong',
  em: 'em',
  underline: 'u',
  strike: 's',
  code: 'code',
}

function HrefValide(attrs: Record<string, unknown> | undefined): string | undefined {
  const href = typeof attrs?.['href'] === 'string' ? attrs['href'].toString() : undefined
  if (!href) return undefined
  if (/^(https?:|mailto:)/.test(href)) return href
  return undefined
}

function avecMarques(node: CorpsNoeud, enfants: ReactNode): ReactNode {
  return (node.marks ?? []).reduceRight<ReactNode>((acc, marque) => {
    if (marque.type === 'link') {
      const href = HrefValide(marque.attrs)
      if (!href) return acc
      const externe = /^https?:/.test(href)
      return (
        <a
          href={href}
          {...(externe ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          className="text-clay-600 underline-offset-4 hover:underline"
        >
          {acc}
        </a>
      )
    }
    const tag = TAG_MARQUES[marque.type]
    if (!tag) return acc
    const El = tag as 'strong' | 'em' | 'u' | 's' | 'code'
    return tag === 'code' ? (
      <code key={marque.type} className="rounded bg-sand-200 px-1 py-0.5 text-[0.95em]">
        {acc}
      </code>
    ) : (
      <El key={marque.type}>{acc}</El>
    )
  }, enfants)
}

function rendreNoeud(node: CorpsNoeud, i: number): ReactNode {
  switch (node.type) {
    case 'paragraph':
      return (
        <p key={i} className="text-body text-ink-700">
          {rendreContenu(node.content, i)}
        </p>
      )
    case 'heading': {
      const niveau = Number(node.attrs?.['level']) || 2
      const cls = 'font-display uppercase text-heading-sm text-ink-900'
      if (niveau <= 2)
        return (
          <h2 key={i} className={cls}>
            {rendreContenu(node.content, i)}
          </h2>
        )
      return (
        <h3 key={i} className={cls}>
          {rendreContenu(node.content, i)}
        </h3>
      )
    }
    case 'bulletList':
      return (
        <ul key={i} className="list-disc space-y-1 pl-5 marker:text-ink-500">
          {rendreContenu(node.content, i)}
        </ul>
      )
    case 'orderedList':
      return (
        <ol key={i} className="list-decimal space-y-1 pl-5 marker:text-ink-500">
          {rendreContenu(node.content, i)}
        </ol>
      )
    case 'listItem':
      return (
        <li key={i} className="text-body text-ink-700">
          {rendreContenu(node.content, i)}
        </li>
      )
    case 'blockquote':
      return (
        <blockquote key={i} className="border-l-4 border-clay-500 pl-4 italic text-ink-500">
          {rendreContenu(node.content, i)}
        </blockquote>
      )
    case 'hardBreak':
      return <br key={i} />
    case 'text':
      return node.text != null ? avecMarques(node, node.text) : null
    default:
      return null
  }
}

function rendreContenu(noeuds: CorpsNoeud[] | undefined, iParent: number): ReactNode {
  if (!noeuds) return null
  return noeuds.map((n, i) => rendreNoeud(n, iParent * 1000 + i))
}

export function CorpsRiche({ corps }: { corps: CorpsDocument | null | undefined }) {
  if (!corps || corps.type !== 'doc' || !Array.isArray(corps.content)) return null
  return <div className="space-y-4">{rendreContenu(corps.content, 0)}</div>
}
