import { useEffect, useState } from 'react'
import { fileToDataUrl, useAdminStore, type Episode } from '@/lib/adminStore'

export default function Episodes() {
  const store = useAdminStore()
  const [items, setItems] = useState<Episode[]>([])
  const [form, setForm] = useState<Episode>({ slug: '', numero: '07', titre: '', lieu: '', pitch: '', image: '' })
  const [preview, setPreview] = useState('')

  useEffect(() => {
    setItems(store.episodes.get())
  }, [])

  const persist = (n: Episode[]) => {
    setItems(n)
    store.episodes.set(n)
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display uppercase text-heading-md">X&apos;PLORE · Episodes</h1>
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <div className="rounded-xl border border-sand-200 bg-sand-50 p-6">
          <div className="space-y-3">
            <input
              placeholder="Slug"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="w-full rounded-xl border border-sand-200 px-4 py-2 text-caption"
            />
            <input
              placeholder="Titre"
              value={form.titre}
              onChange={(e) => setForm({ ...form, titre: e.target.value })}
              className="w-full rounded-xl border border-sand-200 px-4 py-2 text-caption"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                placeholder="Numéro"
                value={form.numero}
                onChange={(e) => setForm({ ...form, numero: e.target.value })}
                className="rounded-xl border border-sand-200 px-4 py-2 text-caption"
              />
              <input
                placeholder="Lieu"
                value={form.lieu}
                onChange={(e) => setForm({ ...form, lieu: e.target.value })}
                className="rounded-xl border border-sand-200 px-4 py-2 text-caption"
              />
            </div>
            <textarea
              placeholder="Pitch"
              value={form.pitch}
              onChange={(e) => setForm({ ...form, pitch: e.target.value })}
              rows={2}
              className="w-full rounded-xl border border-sand-200 px-4 py-2 text-caption"
            />
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const f = e.target.files?.[0]
                if (f) {
                  const u = await fileToDataUrl(f)
                  setPreview(u)
                  setForm((v) => ({ ...v, image: u }))
                }
              }}
              className="w-full text-caption"
            />
            {preview && <img src={preview} alt="" className="h-32 w-full rounded-xl object-cover" />}
            <button
              type="button"
              onClick={() => {
                if (!form.titre) return
                const n = [...items, form]
                persist(n)
                setForm({ slug: '', numero: '07', titre: '', lieu: '', pitch: '', image: '' })
                setPreview('')
              }}
              className="w-full rounded-full bg-forest-700 px-6 py-3 font-semibold text-cream-100 hover:bg-forest-950"
            >
              Ajouter épisode
            </button>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((ep) => (
            <div key={ep.slug} className="overflow-hidden rounded-xl border border-sand-200 bg-sand-50">
              <img src={ep.image} alt="" className="h-36 w-full object-cover" />
              <div className="p-4">
                <p className="label-caps text-clay-600">
                  {ep.numero} · {ep.lieu}
                </p>
                <h3 className="font-display uppercase">{ep.titre}</h3>
                <p className="text-caption text-ink-500">{ep.pitch}</p>
                <button
                  type="button"
                  onClick={() => persist(items.filter((i) => i.slug !== ep.slug))}
                  className="mt-3 text-caption text-clay-600 underline"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
