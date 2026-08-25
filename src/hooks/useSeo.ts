import { useEffect } from 'react'

interface SeoOptions {
  title: string
  description?: string
}

function upsertMeta(name: string, content: string) {
  let meta = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)
  if (!meta) {
    meta = document.createElement('meta')
    meta.name = name
    document.head.appendChild(meta)
  }
  meta.content = content
}

export function useSeo({ title, description }: SeoOptions) {
  useEffect(() => {
    document.title = title
    if (description) upsertMeta('description', description)
  }, [title, description])
}
