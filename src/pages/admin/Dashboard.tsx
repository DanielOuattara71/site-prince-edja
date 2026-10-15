import { FileText, Film, MapPin, Eye } from 'lucide-react'
import { Link } from 'react-router'

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display uppercase text-display-lg">
          Administration<span className="text-clay-600">.</span>
        </h1>
        <p className="mt-2 max-w-2xl text-body text-ink-500">
          Gère tout ton site depuis ici, dans le style Prince Edja (sand / night / clay / gold / forest). Données en
          localStorage pour la démo, même app que le site principal (séparation au déploiement).
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Articles Journal', value: '7', to: '/admin/articles', icon: FileText, color: 'bg-leaf-600' },
          { label: "Episodes X'PLORE", value: '6', to: '/admin/episodes', icon: Film, color: 'bg-forest-700' },
          { label: 'Villes Taste & Travel', value: '3', to: '/admin/travel', icon: MapPin, color: 'bg-clay-600' },
          { label: 'Visiter le site', value: '→', to: '/', icon: Eye, color: 'bg-night-900' },
        ].map((card) => (
          <Link
            key={card.label}
            to={card.to}
            className="rounded-xl border border-sand-200 bg-sand-50 p-6 hover:border-clay-500/30"
          >
            <div className={`flex size-10 items-center justify-center rounded-xl text-cream-100 ${card.color}`}>
              <card.icon className="size-5" />
            </div>
            <p className="mt-4 font-display text-heading-md">{card.value}</p>
            <p className="label-caps text-ink-500">{card.label}</p>
          </Link>
        ))}
      </div>
      <div className="rounded-xl border border-sage-300 bg-sage-100 p-6">
        <p className="label-caps text-leaf-600">Même application</p>
        <p className="mt-2 text-caption text-ink-700">
          Admin intégré au site principal sur le même serveur (<code>/site-prince-edja</code> +{' '}
          <code>/admin/*</code>). Les dossiers <code>admin/</code> et <code>admin-custom/</code> restent
          inchangés pour le futur déploiement séparé.
        </p>
      </div>
    </div>
  )
}
