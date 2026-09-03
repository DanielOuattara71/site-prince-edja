import { NavLink, Outlet, Link } from 'react-router'
import { LayoutDashboard, FileText, Film, MapPin, Settings, Image, Newspaper, Award, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/cn'

const NAV = [
  { to: '/', label: 'Tableau de bord', icon: LayoutDashboard },
  { to: '/articles', label: 'Journal · Articles', icon: FileText },
  { to: '/episodes', label: 'X\'PLORE · Episodes', icon: Film },
  { to: '/travel', label: 'Taste & Travel', icon: MapPin },
  { to: '/site', label: 'Identité du site', icon: Settings },
  { to: '/media', label: 'Médiathèque', icon: Image },
  { to: '/presse', label: 'Presse', icon: Newspaper },
  { to: '/a-propos', label: 'À propos · Milestones', icon: Award },
]

export function Layout() {
  const [open, setOpen] = useState(false)
  return (
    <div className="min-h-svh bg-sand-50">
      <header className="grain sticky top-0 z-30 flex h-16 items-center justify-between bg-night-900 px-4 text-cream-100 lg:px-8">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setOpen(!open)} className="lg:hidden rounded-full border border-cream-100/20 p-2">{open ? <X className="size-4"/> : <Menu className="size-4"/>}</button>
          <Link to="/" className="font-display text-lg uppercase tracking-wide">Prince Edja <span className="text-gold-400">· Admin</span></Link>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-cream-100/60 sm:block">Abidjan · Côte d’Ivoire</span>
          <a href="http://localhost:5173" target="_blank" rel="noreferrer" className="rounded-full bg-clay-600 px-5 py-2 text-sm font-semibold text-cream-100 hover:bg-clay-700">Voir le site</a>
        </div>
      </header>
      <div className="flex">
        <aside className={cn("grain fixed inset-y-0 left-0 z-20 w-64 bg-night-800 pt-16 transition lg:static lg:translate-x-0", open ? "translate-x-0" : "-translate-x-full")}>
          <nav className="space-y-1 p-4">
            {NAV.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} onClick={() => setOpen(false)} className={({ isActive }) => cn("flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition", isActive ? "bg-gold-400 text-night-900" : "text-cream-100/80 hover:bg-cream-100/10 hover:text-cream-100")}>
                <Icon className="size-4 shrink-0" />{label}
              </NavLink>
            ))}
          </nav>
          <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-leaf-600 p-4 text-cream-100">
            <p className="label-caps text-cream-100/70">Decap dispo</p>
            <p className="mt-1 text-sm">Comparer : <a href="http://localhost:5174" target="_blank" className="underline">/admin Decap</a></p>
          </div>
        </aside>
        <main className="min-w-0 flex-1 p-4 lg:p-8" onClick={() => setOpen(false)}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
