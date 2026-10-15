import { useEffect, useState } from 'react'
import { useAdminStore, fileToDataUrl, type SiteInfo } from '@/lib/adminStore'

type Stat = NonNullable<SiteInfo['stats']>[number]

const VIDE: Stat = { value: null, label: '' }

export default function Site() {
  const store = useAdminStore()
  const [site, setSite] = useState<SiteInfo>({
    name: '',
    role: '',
    heroImage: '',
    email: '',
    localisation: '',
    stats: [],
  })
  const [preview, setPreview] = useState('')

  useEffect(() => {
    const s = store.site.get()
    setSite(s)
    setPreview(s.heroImage)
  }, [])

  const save = () => {
    store.site.set(site)
    window.alert('Identité enregistrée (localStorage démo)')
  }

  /** Un champ de chiffre vidé redevient `null` : mieux vaut un trou qu'un zéro inventé. */
  const stat = (index: number, champ: Partial<Stat>) =>
    setSite((s) => {
      const stats = [...(s.stats ?? [])]
      const courant = stats[index] ?? VIDE
      stats[index] = { ...courant, ...champ }
      return { ...s, stats }
    })

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="font-display uppercase text-heading-md">Identité du site</h1>
      <div className="space-y-4 rounded-xl border border-sand-200 bg-sand-50 p-6">
        <input
          value={site.name}
          onChange={(e) => setSite({ ...site, name: e.target.value })}
          placeholder="Nom"
          className="w-full rounded-xl border border-sand-200 px-4 py-3 text-caption"
        />
        <textarea
          value={site.role}
          onChange={(e) => setSite({ ...site, role: e.target.value })}
          rows={2}
          placeholder="Rôle"
          className="w-full rounded-xl border border-sand-200 px-4 py-3 text-caption"
        />
        <input
          value={site.email}
          onChange={(e) => setSite({ ...site, email: e.target.value })}
          placeholder="Email"
          className="w-full rounded-xl border border-sand-200 px-4 py-3 text-caption"
        />
        <input
          value={site.localisation}
          onChange={(e) => setSite({ ...site, localisation: e.target.value })}
          placeholder="Localisation"
          className="w-full rounded-xl border border-sand-200 px-4 py-3 text-caption"
        />
        <div>
          <label className="label-caps">Hero image</label>
          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const f = e.target.files?.[0]
              if (f) {
                const u = await fileToDataUrl(f)
                setPreview(u)
                setSite((s) => ({ ...s, heroImage: u }))
              }
            }}
            className="mt-2 w-full text-caption"
          />
          {preview && (
            <img src={preview} alt="Hero" className="mt-3 h-48 w-full rounded-xl object-cover" />
          )}
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-sand-200 bg-sand-50 p-6">
        <h2 className="font-display uppercase text-heading-sm">Chiffres clés</h2>
        <p className="text-caption text-ink-500">
          Laisse le chiffre vide pour afficher « À fournir ». La date de validation reste
          visible sur le site : un chiffre non daté doit le dire.
        </p>
        {(site.stats ?? []).map((s, index) => (
          <div key={index} className="space-y-2 rounded-md border border-sand-200 p-3">
            <input
              value={s.label}
              onChange={(e) => stat(index, { label: e.target.value })}
              placeholder="Libellé"
              className="w-full rounded-md border border-sand-200 px-3 py-2 text-caption"
            />
            <div className="flex gap-2">
              <input
                value={s.value ?? ''}
                onChange={(e) =>
                  stat(index, { value: e.target.value === '' ? null : Number(e.target.value) })
                }
                inputMode="numeric"
                placeholder="Chiffre"
                className="w-24 rounded-md border border-sand-200 px-3 py-2 text-caption"
              />
              <input
                value={s.suffix ?? ''}
                onChange={(e) => stat(index, { suffix: e.target.value })}
                placeholder="Suffixe"
                className="w-24 rounded-md border border-sand-200 px-3 py-2 text-caption"
              />
              <input
                value={s.date ?? ''}
                onChange={(e) => stat(index, { date: e.target.value })}
                placeholder="Date de validation"
                className="flex-1 rounded-md border border-sand-200 px-3 py-2 text-caption"
              />
            </div>
            <button
              type="button"
              onClick={() =>
                setSite((s2) => ({
                  ...s2,
                  stats: (s2.stats ?? []).filter((_, i) => i !== index),
                }))
              }
              className="text-caption text-ink-500 underline"
            >
              Retirer
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setSite((s) => ({ ...s, stats: [...(s.stats ?? []), { ...VIDE }] }))}
          className="w-full rounded-full border border-sand-300 px-6 py-2 text-caption font-semibold"
        >
          Ajouter un chiffre
        </button>
      </div>

      <button
        type="button"
        onClick={save}
        className="w-full rounded-full bg-night-900 px-6 py-3 font-semibold text-cream-100"
      >
        Enregistrer
      </button>
      <p className="text-caption text-ink-500">
        Démo : sauvegarde locale. En prod : écrit dans <code>src/data/site.ts</code> via commit.
      </p>
    </div>
  )
}
