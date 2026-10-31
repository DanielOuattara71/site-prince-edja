import type { Content } from '@tiptap/core'
import { EditorContent, useEditor, useEditorState, type Editor } from '@tiptap/react'
import {
  Bold,
  Heading2,
  Heading3,
  Heading4,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Undo2,
} from 'lucide-react'
import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { lienSurSchema, type CorpsRiche } from '@/api/schemas/corps-riche'
import { EXTENSIONS } from '@/components/editeur/extensions'
import { nettoyerCollage, normaliserCorps } from '@/components/editeur/normaliser'
import { SelecteurMedia } from '@/components/medias/SelecteurMedia'
import { Bouton } from '@/components/ui/Bouton'
import { Champ } from '@/components/ui/Champ'
import { MessageErreurChamp } from '@/components/ui/EnveloppeChamp'
import { t } from '@/i18n/fr'
import { cn } from '@/lib/cn'

/**
 * Éditeur de corps riche (section 10, D-21) : titres 2 à 4, gras, italique, listes,
 * citation, lien et image de la médiathèque. La sortie est le JSON du contrat (§ 9.1),
 * jamais du HTML ; un document vide vaut `null`. Le collage est nettoyé, et tout ce qui
 * sort de la liste blanche est écarté par le schéma de l'éditeur.
 *
 * Non contrôlé après le montage : `valeur` sert de contenu initial (comme `defaultValue`).
 * Pour charger un autre contenu, changer la `key` du composant.
 *
 * @example
 * <Controller control={control} name="traductions.fr.corps" render={({ field, fieldState }) => (
 *   <EditeurRiche id="traductions.fr.corps" libelle="Corps de l'article" valeur={field.value}
 *     surChange={field.onChange} erreur={fieldState.error?.message} />
 * )} />
 */
export function EditeurRiche({
  libelle,
  valeur,
  surChange,
  aide,
  erreur,
  id,
}: {
  libelle: string
  valeur: CorpsRiche | null | undefined
  surChange: (corps: CorpsRiche | null) => void
  aide?: ReactNode
  erreur?: string | undefined
  id?: string
}) {
  const idAuto = useId()
  const idChamp = id ?? idAuto
  const decrit = [aide ? `${idChamp}-aide` : null, erreur ? `${idChamp}-erreur` : null]
    .filter(Boolean)
    .join(' ')
  const surChangeCourant = useRef(surChange)
  useEffect(() => {
    surChangeCourant.current = surChange
  })

  const [lienOuvert, setLienOuvert] = useState(false)
  const [mediatheque, setMediatheque] = useState(false)

  const editeur = useEditor({
    extensions: EXTENSIONS,
    // Le corps du contrat est un sous-ensemble du JSON de Tiptap (seuls les `undefined`
    // explicites diffèrent sous `exactOptionalPropertyTypes`).
    content: (valeur ?? '') as Content,
    editorProps: { transformPastedHTML: nettoyerCollage },
    onUpdate: ({ editor }) => surChangeCourant.current(normaliserCorps(editor.getJSON())),
  })

  // La zone éditable porte le libellé, l'aide et l'erreur, comme un champ ordinaire. Son `id`
  // est le chemin du champ : le résumé d'erreurs y mène.
  useEffect(() => {
    editeur?.setOptions({
      editorProps: {
        transformPastedHTML: nettoyerCollage,
        attributes: {
          id: idChamp,
          role: 'textbox',
          'aria-multiline': 'true',
          'aria-labelledby': `${idChamp}-libelle`,
          ...(decrit ? { 'aria-describedby': decrit } : {}),
          ...(erreur ? { 'aria-invalid': 'true' } : {}),
          class: 'min-h-48 px-4 py-3 focus:outline-none',
        },
      },
    })
  }, [editeur, idChamp, decrit, erreur])

  return (
    <div className="space-y-1.5">
      <p id={`${idChamp}-libelle`} className="text-body font-semibold text-ink-900">
        {libelle}
      </p>
      {aide ? (
        <p id={`${idChamp}-aide`} className="text-caption text-ink-700">
          {aide}
        </p>
      ) : null}
      <div
        className={cn(
          'rounded-md border bg-sand-50 focus-within:outline-2 focus-within:outline-offset-3 focus-within:outline-clay-600',
          erreur ? 'border-clay-700' : 'border-ink-500',
        )}
      >
        {editeur ? (
          <BarreOutils
            editeur={editeur}
            libelle={libelle}
            surLien={() => setLienOuvert(true)}
            surImage={() => setMediatheque(true)}
          />
        ) : null}
        {lienOuvert && editeur ? (
          <FormulaireLien editeur={editeur} surFermeture={() => setLienOuvert(false)} />
        ) : null}
        <EditorContent editor={editeur} className={STYLES_CONTENU} />
      </div>
      {erreur ? <MessageErreurChamp id={`${idChamp}-erreur`}>{erreur}</MessageErreurChamp> : null}
      <SelecteurMedia
        ouverte={mediatheque}
        surFermeture={() => setMediatheque(false)}
        surChoix={(media) => {
          setMediatheque(false)
          editeur
            ?.chain()
            .focus()
            .insertContent({ type: 'image', attrs: { mediaId: media.id } })
            .run()
        }}
      />
    </div>
  )
}

/** Mise en forme du contenu édité, sur la typographie du site public. */
const STYLES_CONTENU = cn(
  'text-body-lg text-ink-900',
  '[&_h2]:mt-6 [&_h2]:font-display [&_h2]:text-heading-md [&_h2]:uppercase',
  '[&_h3]:mt-5 [&_h3]:font-display [&_h3]:text-heading-sm [&_h3]:uppercase',
  '[&_h4]:mt-4 [&_h4]:font-semibold',
  '[&_p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mt-3 [&_ol]:list-decimal [&_ol]:pl-6',
  '[&_blockquote]:mt-4 [&_blockquote]:border-l-2 [&_blockquote]:border-gold-400 [&_blockquote]:pl-4 [&_blockquote]:font-quote [&_blockquote]:italic',
  '[&_a]:text-clay-700 [&_a]:underline [&_a]:underline-offset-4',
)

function BarreOutils({
  editeur,
  libelle,
  surLien,
  surImage,
}: {
  editeur: Editor
  libelle: string
  surLien: () => void
  surImage: () => void
}) {
  const etat = useEditorState({
    editor: editeur,
    selector: ({ editor }) => ({
      h2: editor.isActive('heading', { level: 2 }),
      h3: editor.isActive('heading', { level: 3 }),
      h4: editor.isActive('heading', { level: 4 }),
      gras: editor.isActive('bold'),
      italique: editor.isActive('italic'),
      puces: editor.isActive('bulletList'),
      numeros: editor.isActive('orderedList'),
      citation: editor.isActive('blockquote'),
      lien: editor.isActive('link'),
      annulable: editor.can().undo(),
      retablissable: editor.can().redo(),
    }),
  })
  const chaine = () => editeur.chain().focus()

  return (
    <fieldset className="flex flex-wrap gap-0.5 border-b border-sand-200 p-1">
      <legend className="sr-only">{`${t('editeur.outils')} : ${libelle}`}</legend>
      <Outil
        libelle={t('editeur.titre2')}
        actif={etat.h2}
        surClic={() => chaine().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 />
      </Outil>
      <Outil
        libelle={t('editeur.titre3')}
        actif={etat.h3}
        surClic={() => chaine().toggleHeading({ level: 3 }).run()}
      >
        <Heading3 />
      </Outil>
      <Outil
        libelle={t('editeur.titre4')}
        actif={etat.h4}
        surClic={() => chaine().toggleHeading({ level: 4 }).run()}
      >
        <Heading4 />
      </Outil>
      <Separateur />
      <Outil
        libelle={t('editeur.gras')}
        actif={etat.gras}
        surClic={() => chaine().toggleBold().run()}
      >
        <Bold />
      </Outil>
      <Outil
        libelle={t('editeur.italique')}
        actif={etat.italique}
        surClic={() => chaine().toggleItalic().run()}
      >
        <Italic />
      </Outil>
      <Separateur />
      <Outil
        libelle={t('editeur.puces')}
        actif={etat.puces}
        surClic={() => chaine().toggleBulletList().run()}
      >
        <List />
      </Outil>
      <Outil
        libelle={t('editeur.numeros')}
        actif={etat.numeros}
        surClic={() => chaine().toggleOrderedList().run()}
      >
        <ListOrdered />
      </Outil>
      <Outil
        libelle={t('editeur.citation')}
        actif={etat.citation}
        surClic={() => chaine().toggleBlockquote().run()}
      >
        <Quote />
      </Outil>
      <Separateur />
      <Outil libelle={t('editeur.lien')} actif={etat.lien} surClic={surLien}>
        <Link2 />
      </Outil>
      <Outil libelle={t('editeur.image')} surClic={surImage}>
        <ImagePlus />
      </Outil>
      <Separateur />
      <Outil
        libelle={t('editeur.annuler')}
        desactive={!etat.annulable}
        surClic={() => chaine().undo().run()}
      >
        <Undo2 />
      </Outil>
      <Outil
        libelle={t('editeur.retablir')}
        desactive={!etat.retablissable}
        surClic={() => chaine().redo().run()}
      >
        <Redo2 />
      </Outil>
    </fieldset>
  )
}

function Outil({
  libelle,
  actif,
  desactive = false,
  surClic,
  children,
}: {
  libelle: string
  actif?: boolean
  desactive?: boolean
  surClic: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={actif}
      disabled={desactive}
      onClick={surClic}
      className={cn(
        'inline-flex size-11 items-center justify-center rounded-md text-ink-900 hover:bg-sand-100 disabled:cursor-not-allowed disabled:opacity-40 [&_svg]:size-5',
        actif && 'bg-sand-200',
      )}
    >
      <span aria-hidden className="contents">
        {children}
      </span>
      <span className="sr-only">{libelle}</span>
    </button>
  )
}

function Separateur() {
  return <span aria-hidden className="mx-1 my-2 w-px bg-sand-200" />
}

/** Saisie d'un lien : seules les adresses autorisées par le contrat passent (§ 9.1). */
function FormulaireLien({ editeur, surFermeture }: { editeur: Editor; surFermeture: () => void }) {
  const existant = editeur.getAttributes('link')['href'] as string | undefined
  const [adresse, setAdresse] = useState(existant ?? '')
  const [erreur, setErreur] = useState<string | undefined>()

  const appliquer = () => {
    const valeur = adresse.trim()
    if (!lienSurSchema.safeParse(valeur).success) {
      setErreur(t('editeur.lienRefuse'))
      return
    }
    editeur.chain().focus().extendMarkRange('link').setLink({ href: valeur }).run()
    surFermeture()
  }

  return (
    <div className="flex flex-wrap items-end gap-2 border-b border-sand-200 bg-sand-100 p-3">
      <Champ
        libelle={t('editeur.adresseLien')}
        aide={t('editeur.lienAide')}
        value={adresse}
        erreur={erreur}
        onChange={(evenement) => {
          setAdresse(evenement.target.value)
          setErreur(undefined)
        }}
        onKeyDown={(evenement) => {
          if (evenement.key === 'Enter') {
            evenement.preventDefault()
            appliquer()
          }
          if (evenement.key === 'Escape') surFermeture()
        }}
        className="min-w-60 flex-1"
      />
      <Bouton onClick={appliquer}>{t('editeur.appliquerLien')}</Bouton>
      {existant ? (
        <Bouton
          variante="secondaire"
          onClick={() => {
            editeur.chain().focus().extendMarkRange('link').unsetLink().run()
            surFermeture()
          }}
        >
          {t('editeur.retirerLien')}
        </Bouton>
      ) : null}
      <Bouton variante="discret" onClick={surFermeture}>
        {t('confirmation.annuler')}
      </Bouton>
    </div>
  )
}
