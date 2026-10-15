import { useEffect, useState } from 'react'
import { useAdminStore, fileToDataUrl, type Article } from '@/lib/adminStore'

export default function Articles() {
  const store = useAdminStore()
  const [items, setItems] = useState<Article[]>([])
  const [editing, setEditing] = useState<Article | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [form, setForm] = useState<Article>({
    slug: '',
    categorie: 'Carnet de route',
    titre: '',
    extrait: '',
    statut: 'à venir',
    image: '',
  })

  useEffect(() => {
    setItems(store.articles.get())
  }, [])

  const persist = (next: Article[]) => {
    setItems(next)
    store.articles.set(next)
  }

  const onFile = async (f: File | undefined) => {
    if (!f) return
    const url = await fileToDataUrl(f)
    setPreview(url)
    setForm((v) => ({ ...v, image: url }))
  }

  const submit = () => {
    if (!form.titre || !form.slug) {
      window.alert('Titre + slug requis')
      return
    }
    const next = editing ? items.map((i) => (i.slug === editing.slug ? form : i)) : [...items, form]
    persist(next)
    setForm({ slug: '', categorie: 'Carnet de route', titre: '', extrait: '', statut: 'à venir', image: '' })
    setPreview('')
    setEditing(null)
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display uppercase text-heading-md">Journal · Articles</h1>
          <p className="text-caption text-ink-500">
            Ajoute article + photo (localStorage démo → à brancher sur <code>src/data/content.ts</code>)
          </p>
        </div>
        <span className="label-caps rounded-full bg-leaf-600 px-3 py-1 text-cream-100">{items.length} articles</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <div className="rounded-xl border border-sand-200 bg-sand-50 p-6">
          <h2 className="font-display uppercase text-heading-sm">{editing ? 'Modifier' : 'Nouvel article'}</h2>
          <div className="mt-4 space-y-3">
            <input
              placeholder="Slug (afrique-multitude...)"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="w-full rounded-xl border border-sand-200 px-4 py-3 text-caption focus:border-clay-600 focus:outline-none"
            />
            <input
              placeholder="Titre"
              value={form.titre}
              onChange={(e) => setForm({ ...form, titre: e.target.value })}
              className="w-full rounded-xl border border-sand-200 px-4 py-3 text-caption focus:border-clay-600 focus:outline-none"
            />
            <select
              value={form.categorie}
              onChange={(e) => setForm({ ...form, categorie: e.target.value })}
              className="w-full rounded-xl border border-sand-200 bg-sand-50 px-4 py-3 text-caption"
            >
              {['Carnet de route', 'Nation branding', 'Culture', 'Tourisme', 'Patrimoine', 'Hospitalité', 'Création'].map(
                (o) => (
                  <option key={o}>{o}</option>
                ),
              )}
            </select>
            <select
              value={form.statut}
              onChange={(e) => setForm({ ...form, statut: e.target.value as Article['statut'] })}
              className="w-full rounded-xl border border-sand-200 bg-sand-50 px-4 py-3 text-caption"
            >
              <option>à venir</option>
              <option>publié</option>
            </select>
            <textarea
              placeholder="Extrait"
              value={form.extrait}
              onChange={(e) => setForm({ ...form, extrait: e.target.value })}
              rows={3}
              className="w-full rounded-xl border border-sand-200 px-4 py-3 text-caption"
            />
            <div>
              <label className="label-caps text-ink-500">Photo</label>
              <input type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0])} className="mt-2 w-full text-caption" />
              {(preview || form.image) && <img src={preview || form.image} alt="" className="mt-3 h-32 w-full rounded-xl object-cover" />}
            </div>
            <button
              type="button"
              onClick={submit}
              className="w-full rounded-full bg-clay-600 px-6 py-3 font-semibold text-cream-100 hover:bg-clay-700"
            >
              {editing ? 'Enregistrer' : 'Ajouter l’article'}
            </button>
            {editing && (
              <button
                type="button"
                onClick={() => {
                  setEditing(null)
                  setForm({ slug: '', categorie: 'Carnet de route', titre: '', extrait: '', statut: 'à venir', image: '' })
                  setPreview('')
                }}
                className="w-full rounded-full border border-sand-200 py-3 text-caption"
              >
                Annuler
              </button>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((a) => (
            <article
              key={a.slug}
              className="group flex flex-col overflow-hidden rounded-xl border border-sand-200 bg-sand-50"
            >
              <div className="h-36 overflow-hidden bg-sand-100">
                <img src={a.image} alt="" className="h-full w-full object-cover transition group-hover:scale-[1.02]" />
              </div>
              <div className="space-y-2 p-4">
                <span
                  className={`label-caps rounded-full px-2 py-1 text-caption ${a.statut === 'publié' ? 'bg-gold-400 text-night-900' : 'bg-sage-100 text-leaf-600'}`}
                >
                  {a.statut}
                </span>
                <h3 className="font-display uppercase text-heading-sm leading-tight">{a.titre}</h3>
                <p className="text-caption text-ink-500 line-clamp-2">{a.extrait}</p>
                <p className="text-caption text-ink-500">
                  {a.categorie} · {a.slug}
                </p>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(a)
                      setForm(a)
                      setPreview(a.image)
                    }}
                    className="rounded-full bg-night-900 px-4 py-1.5 text-caption font-semibold text-cream-100"
                  >
                    Éditer
                  </button>
                  <button
                    type="button"
                    onClick={() => persist(items.filter((i) => i.slug !== a.slug))}
                    className="rounded-full border border-clay-600 px-4 py-1.5 text-caption font-semibold text-clay-600 hover:bg-clay-600 hover:text-cream-100"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
