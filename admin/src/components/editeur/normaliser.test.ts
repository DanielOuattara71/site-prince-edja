import { generateJSON } from '@tiptap/core'
import { describe, expect, it } from 'vitest'
import { corpsRicheSchema } from '@/api/schemas/corps-riche'
import { EXTENSIONS_SANS_VUE } from '@/components/editeur/extensions'
import { nettoyerCollage, normaliserCorps } from '@/components/editeur/normaliser'

/** D-21 : l'éditeur ne laisse sortir que la liste blanche du contrat (§ 9.1). */

const MEDIA = '00000000-0000-4000-8000-0000000000d1'

function depuisHtml(html: string) {
  return normaliserCorps(generateJSON(nettoyerCollage(html), EXTENSIONS_SANS_VUE))
}

describe('corps riche', () => {
  it('garde titres 2 à 4, gras, italique, listes, citation, lien et image médiathèque', () => {
    const corps = depuisHtml(
      `<h2>Titre</h2><p><strong>gras</strong> <em>italique</em> <a href="https://exemple.test" target="_blank" rel="noopener">lien</a></p>
       <ul><li><p>un</p></li></ul><ol start="3"><li><p>trois</p></li></ol>
       <blockquote><p>citation</p></blockquote><img data-media-id="${MEDIA}">`,
    )
    expect(corpsRicheSchema.safeParse(corps).success).toBe(true)
    const types = corps?.content.map((noeud) => noeud.type)
    expect(types).toEqual([
      'heading',
      'paragraph',
      'bulletList',
      'orderedList',
      'blockquote',
      'image',
    ])
    expect(corps?.content[3]?.attrs).toEqual({ start: 3 })
    expect(corps?.content[5]?.attrs).toEqual({ mediaId: MEDIA })
    const lien = corps?.content[1]?.content?.find((noeud) => noeud.marks?.[0]?.type === 'link')
    // Ni `target`, ni `rel`, ni `class` : seulement `href`.
    expect(lien?.marks).toEqual([{ type: 'link', attrs: { href: 'https://exemple.test' } }])
  })

  it('écarte scripts, styles, souligné, barré, code, titre 1 et images hors médiathèque', () => {
    const corps = depuisHtml(
      `<style>p{color:red}</style><script>alert(1)</script><!-- Word -->
       <h1>Grand titre</h1><p><u>souligné</u> <s>barré</s> <code>code</code></p>
       <pre><code>bloc</code></pre><hr><img src="https://ailleurs.test/x.png">`,
    )
    const texte = JSON.stringify(corps)
    for (const interdit of ['alert', 'color', 'Word', 'ailleurs'])
      expect(texte).not.toContain(interdit)
    // Le texte reste ; les marques et nœuds interdits disparaissent.
    for (const type of ['underline', 'strike', 'code', 'codeBlock', 'horizontalRule']) {
      expect(texte).not.toContain(`"type":"${type}"`)
    }
    expect(corps?.content[0]?.type).toBe('paragraph')
    expect(corpsRicheSchema.safeParse(corps).success).toBe(true)
  })

  it('refuse les liens javascript: (le texte reste, le lien disparaît)', () => {
    const corps = depuisHtml('<p><a href="javascript:alert(1)">piège</a></p>')
    expect(JSON.stringify(corps)).not.toContain('javascript')
    expect(JSON.stringify(corps)).toContain('piège')
  })

  it('un document vide vaut null, pas un paragraphe vide', () => {
    expect(depuisHtml('<p></p>')).toBeNull()
    expect(depuisHtml('')).toBeNull()
  })
})
