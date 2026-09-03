import { useEffect, useState } from 'react'
import { useStore, fileToDataUrl, type SiteInfo } from '@/lib/store'

export default function Site() {
  const store = useStore()
  const [site, setSite] = useState<SiteInfo>({ name: '', role: '', heroImage: '', email: '', localisation: '' })
  const [preview, setPreview] = useState('')

  useEffect(() => { const s = store.site.get(); setSite(s); setPreview(s.heroImage) }, [])

  const save = () => { store.site.set(site); alert('Identité enregistrée (localStorage démo)') }

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="font-display uppercase text-heading-md">Identité du site</h1>
      <div className="space-y-4 rounded-2xl border border-sand-200 bg-white p-6">
        <input value={site.name} onChange={e => setSite({...site, name: e.target.value})} placeholder="Nom" className="w-full rounded-xl border border-sand-200 px-4 py-3 text-sm"/>
        <textarea value={site.role} onChange={e => setSite({...site, role: e.target.value})} rows={2} placeholder="Rôle" className="w-full rounded-xl border border-sand-200 px-4 py-3 text-sm"/>
        <input value={site.email} onChange={e => setSite({...site, email: e.target.value})} placeholder="Email" className="w-full rounded-xl border border-sand-200 px-4 py-3 text-sm"/>
        <input value={site.localisation} onChange={e => setSite({...site, localisation: e.target.value})} placeholder="Localisation" className="w-full rounded-xl border border-sand-200 px-4 py-3 text-sm"/>
        <div>
          <label className="label-caps">Hero image</label>
          <input type="file" accept="image/*" onChange={async e => { const f=e.target.files?.[0]; if(f){ const u=await fileToDataUrl(f); setPreview(u); setSite(s=>({...s, heroImage:u})) }}} className="mt-2 w-full text-sm"/>
          {preview && <img src={preview} alt="Hero" className="mt-3 h-48 w-full rounded-xl object-cover"/>}
        </div>
        <button type="button" onClick={save} className="w-full rounded-full bg-night-900 px-6 py-3 font-semibold text-cream-100">Enregistrer</button>
        <p className="text-xs text-ink-400">Démo : sauvegarde locale. En prod : écrit dans <code>src/data/site.ts</code> via commit.</p>
      </div>
    </div>
  )
}
