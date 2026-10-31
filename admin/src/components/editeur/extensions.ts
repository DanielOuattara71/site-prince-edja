import { mergeAttributes, Node, type Extensions } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { lienSurSchema } from '@/api/schemas/corps-riche'
import { VueImageMedia } from '@/components/editeur/VueImageMedia'

/**
 * Extensions de l'éditeur : la liste blanche du contrat (§ 9.1, D-21), et elle seule.
 * StarterKit apporte le reste ; ce qui en sort (souligné, barré, code, bloc de code,
 * filet) est **désactivé explicitement**.
 */

/** Image de la médiathèque : le nœud ne porte que `mediaId`. Une `<img>` collée sans lui est écartée. */
export const ImageMedia = Node.create({
  name: 'image',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      mediaId: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-media-id'),
        renderHTML: (attributs) => ({ 'data-media-id': attributs['mediaId'] as string | null }),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'img[data-media-id]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['img', mergeAttributes(HTMLAttributes)]
  },

  addNodeView() {
    return ReactNodeViewRenderer(VueImageMedia)
  },
})

const lienAutorise = (url: string) => lienSurSchema.safeParse(url).success

export const EXTENSIONS: Extensions = [
  StarterKit.configure({
    heading: { levels: [2, 3, 4] },
    code: false,
    codeBlock: false,
    strike: false,
    underline: false,
    horizontalRule: false,
    link: {
      openOnClick: false,
      autolink: true,
      defaultProtocol: 'https',
      protocols: ['mailto'],
      isAllowedUri: (url) => lienAutorise(url),
      // Aucun attribut de présentation : le site public décide de `target` et `rel`.
      HTMLAttributes: { target: null, rel: null, class: null },
    },
  }),
  ImageMedia,
]

/** Les mêmes, sans vue React : pour analyser du HTML hors de l'éditeur (tests, import). */
export const EXTENSIONS_SANS_VUE: Extensions = [
  EXTENSIONS[0] as Extensions[number],
  ImageMedia.extend({ addNodeView: () => null }),
]
