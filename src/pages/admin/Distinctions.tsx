import { useEffect, useState } from 'react'
import { fileToDataUrl, useAdminStore, type Distinction } from '@/lib/adminStore'

export default function Distinctions() {
  const store = useAdminStore()
  const [items, setItems] = useState<Distinction[]>([])
  const [editing, setEditing] = useState<Distinction | null>(null)
  const [preview, setPreview] = useState('')
  const [form, setForm] = useState<Distinction>({
    id: '',
    annee: String(new Date().getFullYear()),
    titre: '',
    delivreePar: '',
    description: '',
    image: '',
    url: '',
  })

  useEffect(() => {
    setItems(store.distinctions.get())
  }, [])

  const persist = (next: Distinction[]) => {
    setItems(next)
    store.distinctions.set(next)
  }

  const onFile = async (f: File | undefined) => {
    if (!f) return
    const url = await fileToDataUrl(f)
    setPreview(url)
    setForm((v) => ({ ...v, image: url }))
  }

  const submit = () => {
    if (!form.titre.trim() || !form.description.trim()) {
      window.alert('Titre + description requis')
      return
    }
    const id = form.id.trim() || form.titre.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40)
    const entry: Distinction = { ...form, id }
    // si image vide, garde placeholder template (sera remplacé plus tard)
    if (!entry.image) entry.image = `${import.meta.env.BASE_URL}images/placeholder-carre.svg`
    const next = editing ? items.map((i) => (i.id === editing.id ? entry : i)) : [...items, entry]
    persist(next)
    setForm({ id: '', annee: String(new Date().getFullYear()), titre: '', delivreePar: '', description: '', image: '', url: '' })
    setPreview('')
    setEditing(null)
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display uppercase text-heading-md">Mes distinctions</h1>
          <p className="text-sm text-ink-500">
            Ajoute photo + description de tes moments forts — templates par défaut, remplaçables. Stockage localStorage démo.
          </p>
        </div>
        <span className="label-caps rounded-full bg-leaf-600 px-3 py-1 text-cream-100">{items.length} distinctions</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <div className="rounded-2xl border border-sand-200 bg-white p-6 shadow-sm">
          <h2 className="font-display uppercase text-heading-sm">{editing ? 'Modifier' : 'Nouvelle distinction'}</h2>
          <div className="mt-4 space-y-3">
            <input
              placeholder="ID (auto si vide)"
              value={form.id}
              onChange={(e) => setForm({ ...form, id: e.target.value })}
              className="w-full rounded-xl border border-sand-200 px-4 py-3 text-sm focus:border-clay-600 focus:outline-none"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                placeholder="Année"
                value={form.annee}
                onChange={(e) => setForm({ ...form, annee: e.target.value })}
                className="w-full rounded-xl border border-sand-200 px-4 py-3 text-sm"
              />
              <input
                placeholder="Délivrée par"
                value={form.delivreePar}
                onChange={(e) => setForm({ ...form, delivreePar: e.target.value })}
                className="w-full rounded-xl border border-sand-200 px-4 py-3 text-sm"
              />
            </div>
            <input
              placeholder="Titre"
              value={form.titre}
              onChange={(e) => setForm({ ...form, titre: e.target.value })}
              className="w-full rounded-xl border border-sand-200 px-4 py-3 text-sm focus:border-clay-600 focus:outline-none"
            />
            <textarea
              placeholder="Description du moment fort"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full rounded-xl border border-sand-200 px-4 py-3 text-sm"
            />
            <input
              placeholder="URL source (optionnel)"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              className="w-full rounded-xl border border-sand-200 px-4 py-3 text-sm"
            />
            <div>
              <label className="label-caps text-ink-500">Photo</label>
              <p className="text-xs text-ink-400">Template par défaut si vide — ajoute ta photo pour remplacer.</p>
              <input type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0])} className="mt-2 w-full text-sm" />
              {(preview || form.image) && (
                <img src={preview || form.image} alt="" className="mt-3 h-40 w-full rounded-xl object-cover" />
              )}
            </div>
            <button type="button" onClick={submit} className="w-full rounded-full bg-clay-600 px-6 py-3 font-semibold text-cream-100 hover:bg-clay-700">
              {editing ? 'Enregistrer' : 'Ajouter la distinction'}
            </button>
            {editing && (
              <button
                type="button"
                onClick={() => {
                  setEditing(null)
                  setForm({ id: '', annee: String(new Date().getFullYear()), titre: '', delivreePar: '', description: '', image: '', url: '' })
                  setPreview('')
                }}
                className="w-full rounded-full border border-sand-200 py-3 text-sm"
              >
                Annuler
              </button>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((d) => (
            <article key={d.id} className="group flex flex-col overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-sm">
              <div className="h-36 overflow-hidden bg-sand-100">
                <img src={d.image} alt="" className="h-full w-full object-cover transition group-hover:scale-[1.02]" />
              </div>
              <div className="space-y-2 p-4">
                <p className="label-caps text-leaf-600">
                  {d.annee} · {d.delivreePar ?? 'Distinction'}
                </p>
                <h3 className="font-display uppercase text-heading-sm leading-tight">{d.titre}</h3>
                <p className="text-sm text-ink-500 line-clamp-3">{d.description}</p>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(d)
                      setForm(d)
                      setPreview(d.image)
                    }}
                    className="rounded-full bg-night-900 px-4 py-1.5 text-xs font-semibold text-cream-100"
                  >
                    Éditer
                  </button>
                  <button
                    type="button"
                    onClick={() => persist(items.filter((i) => i.id !== d.id))}
                    className="rounded-full border border-clay-600 px-4 py-1.5 text-xs font-semibold text-clay-600 hover:bg-clay-600 hover:text-cream-100"
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
