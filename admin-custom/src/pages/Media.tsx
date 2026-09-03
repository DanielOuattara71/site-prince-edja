export default function Media() {
  return (
    <div className="space-y-6">
      <h1 className="font-display uppercase text-heading-md">Médiathèque</h1>
      <div className="rounded-2xl border border-sage-300 bg-sage-100 p-6">
        <p className="text-sm text-ink-700">Glisse tes photos ici (démo) → en prod, upload vers <code>public/images/{`{hero,episodes,journal}`}</code> via commit. Inspiré du style <code>overlay-forest / sage</code> du site.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="group relative overflow-hidden rounded-2xl border border-sand-200 bg-white">
            <div className="h-36 bg-gradient-to-br from-sand-100 to-sage-100" />
            <div className="p-3"><p className="label-caps text-ink-400">Image {i + 1}</p><p className="text-xs text-ink-300">1600×900 · WebP 80%</p></div>
          </div>
        ))}
      </div>
    </div>
  )
}
