export default function Generic({ title }: { title: string }) {
  return (
    <div className="space-y-6">
      <h1 className="font-display uppercase text-heading-md">{title}</h1>
      <div className="rounded-2xl border border-sand-200 bg-white p-8 text-center">
        <p className="text-ink-500">Module <span className="font-semibold">{title}</span> — structure prête, à brancher sur <code>src/data/content.ts</code> comme Articles/Episodes.</p>
        <p className="mt-2 text-sm text-ink-400">Style inspiré : night/gold/clay + grain + rounded-2xl identique au site.</p>
      </div>
    </div>
  )
}
