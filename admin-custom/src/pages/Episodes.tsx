import { useEffect, useState } from 'react'
import { fileToDataUrl, useStore, type Episode } from '@/lib/store'

export default function Episodes() {
  const store = useStore()
  const [items, setItems] = useState<Episode[]>([])
  const [form, setForm] = useState<Episode>({ slug: '', numero: '07', titre: '', lieu: '', pitch: '', image: '' })
  const [preview, setPreview] = useState('')

  useEffect(() => { setItems(store.episodes.get()) }, [])
  const persist = (n: Episode[]) => { setItems(n); store.episodes.set(n) }

  return (
    <div className="space-y-6">
      <h1 className="font-display uppercase text-heading-md">X'PLORE — Episodes</h1>
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <div className="rounded-2xl border border-sand-200 bg-white p-6">
          <div className="space-y-3">
            <input placeholder="Slug" value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} className="w-full rounded-xl border border-sand-200 px-4 py-2 text-sm"/>
            <input placeholder="Titre" value={form.titre} onChange={e => setForm({...form, titre: e.target.value})} className="w-full rounded-xl border border-sand-200 px-4 py-2 text-sm"/>
            <div className="grid grid-cols-2 gap-3"><input placeholder="Numéro" value={form.numero} onChange={e => setForm({...form, numero: e.target.value})} className="rounded-xl border border-sand-200 px-4 py-2 text-sm"/><input placeholder="Lieu" value={form.lieu} onChange={e => setForm({...form, lieu: e.target.value})} className="rounded-xl border border-sand-200 px-4 py-2 text-sm"/></div>
            <textarea placeholder="Pitch" value={form.pitch} onChange={e => setForm({...form, pitch: e.target.value})} rows={2} className="w-full rounded-xl border border-sand-200 px-4 py-2 text-sm"/>
            <input type="file" accept="image/*" onChange={async e => { const f=e.target.files?.[0]; if(f){ const u=await fileToDataUrl(f); setPreview(u); setForm(v=>({...v, image:u})) }}} className="w-full text-sm"/>
            {preview && <img src={preview} alt="" className="h-32 w-full rounded-xl object-cover"/>}
            <button type="button" onClick={() => { if(!form.titre) return; const n=[...items, form]; persist(n); setForm({ slug:'',numero:'07',titre:'',lieu:'',pitch:'',image:''}); setPreview('')}} className="w-full rounded-full bg-forest-700 px-6 py-3 font-semibold text-cream-100 hover:bg-forest-900">Ajouter épisode</button>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map(ep => (
            <div key={ep.slug} className="overflow-hidden rounded-2xl border border-sand-200 bg-white">
              <img src={ep.image} alt="" className="h-36 w-full object-cover"/>
              <div className="p-4"><p className="label-caps text-clay-600">{ep.numero} · {ep.lieu}</p><h3 className="font-display uppercase">{ep.titre}</h3><p className="text-sm text-ink-500">{ep.pitch}</p>
              <button type="button" onClick={() => persist(items.filter(i=>i.slug!==ep.slug))} className="mt-3 text-xs text-clay-600 underline">Supprimer</button></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
