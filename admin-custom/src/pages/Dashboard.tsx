import { FileText, Film, MapPin, Eye } from 'lucide-react'
import { Link } from 'react-router'

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display uppercase text-display-lg">Administration<span className="text-clay-600">.</span></h1>
        <p className="mt-2 max-w-2xl text-body text-ink-500">Gère tout ton site depuis ici — inspiré du style Prince Edja (sand / night / clay / gold / forest). Données stockées en localStorage pour la démo, prêtes à brancher sur <code>src/data/*.ts</code>.</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Articles Journal', value: '7', to: '/articles', icon: FileText, color: 'bg-leaf-600' },
          { label: 'Episodes X\'PLORE', value: '6', to: '/episodes', icon: Film, color: 'bg-forest-700' },
          { label: 'Villes Taste & Travel', value: '3', to: '/travel', icon: MapPin, color: 'bg-clay-600' },
          { label: 'Visiter le site', value: '→', to: 'http://localhost:5173', icon: Eye, color: 'bg-night-900' },
        ].map(card => (
          <Link key={card.label} to={card.to} className="rounded-2xl border border-sand-200 bg-white p-6 shadow-sm hover:border-clay-500/30">
            <div className={`flex size-10 items-center justify-center rounded-xl text-cream-100 ${card.color}`}><card.icon className="size-5"/></div>
            <p className="mt-4 font-display text-heading-md">{card.value}</p>
            <p className="label-caps text-ink-500">{card.label}</p>
          </Link>
        ))}
      </div>
      <div className="rounded-2xl border border-sage-300 bg-sage-100 p-6">
        <p className="label-caps text-leaf-600">Comparaison Decap</p>
        <p className="mt-2 text-sm text-ink-700">Ce dossier <code>admin-custom/</code> est ton admin custom codé (style Prince Edja). <code>admin/</code> reste Decap Git-based — garde les deux pour comparer, ne supprime pas Decap comme demandé.</p>
      </div>
    </div>
  )
}
