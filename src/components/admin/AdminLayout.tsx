import { NavLink, Outlet, Link, useNavigate } from 'react-router'
import { LayoutDashboard, FileText, Film, MapPin, Settings, Image, Newspaper, Award, Menu, X, LogOut } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/cn'

const NAV = [
  { to: '/admin/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { to: '/admin/articles', label: 'Journal · Articles', icon: FileText },
  { to: '/admin/episodes', label: "X'PLORE · Episodes", icon: Film },
  { to: '/admin/distinctions', label: 'Mes distinctions', icon: Award },
  { to: '/admin/travel', label: 'Taste & Travel', icon: MapPin },
  { to: '/admin/site', label: 'Identité du site', icon: Settings },
  { to: '/admin/media', label: 'Médiathèque', icon: Image },
  { to: '/admin/presse', label: 'Presse', icon: Newspaper },
  { to: '/admin/a-propos', label: 'À propos · Milestones', icon: Award },
]

const AUTH_KEY = 'pe_admin_auth'

export function AdminLayout() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  function handleLogout() {
    try {
      sessionStorage.removeItem(AUTH_KEY)
    } catch {
      /* ignore */
    }
    navigate('/admin')
  }

  return (
    <div className="min-h-svh bg-sand-50">
      <header className="grain sticky top-0 z-40 flex h-16 items-center justify-between bg-night-900 px-4 text-cream-100 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls="admin-nav"
            aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
            className="inline-flex size-10 items-center justify-center rounded-full border border-cream-100/20 transition hover:bg-cream-100 hover:text-ink-900 lg:hidden"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
          <Link to="/admin/dashboard" className="font-display text-lg uppercase tracking-wide">
            Prince Edja <span className="text-gold-400">· Admin</span>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-cream-100/60 sm:block">Abidjan · Côte d’Ivoire</span>
          <Link
            to="/"
            className="hidden rounded-full bg-clay-600 px-5 py-2 text-sm font-semibold text-cream-100 hover:bg-clay-700 sm:inline-flex"
          >
            Voir le site
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-full border border-cream-100/20 px-4 py-2 text-sm font-semibold text-cream-100 transition hover:bg-cream-100 hover:text-ink-900"
          >
            <LogOut className="size-4" />
            <span className="hidden sm:inline">Déconnexion</span>
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Backdrop mobile */}
        {open && (
          <button
            type="button"
            aria-label="Fermer le menu"
            onClick={() => setOpen(false)}
            className="fixed inset-0 top-16 z-20 bg-night-900/40 backdrop-blur-sm lg:hidden"
          />
        )}

        <aside
          id="admin-nav"
          className={cn(
            'grain fixed left-0 top-16 bottom-0 z-30 flex w-64 flex-col overflow-y-auto bg-night-800 transition-transform duration-300 ease-expo lg:static lg:translate-x-0 lg:top-auto lg:bottom-auto lg:h-[calc(100svh-4rem)] lg:shrink-0',
            open ? 'translate-x-0 shadow-2xl' : '-translate-x-full',
          )}
        >
          <nav className="flex-1 space-y-1 p-4">
            {NAV.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/admin/dashboard'}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition',
                    isActive
                      ? 'bg-gold-400 text-night-900 shadow-sm'
                      : 'text-cream-100/80 hover:bg-cream-100/10 hover:text-cream-100',
                  )
                }
              >
                <Icon className="size-4 shrink-0" />
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="p-4">
            <div className="rounded-xl bg-leaf-600 p-4 text-cream-100">
              <p className="label-caps text-cream-100/70">Même app</p>
              <p className="mt-1 text-sm leading-snug">Admin sur le même serveur — séparation au déploiement.</p>
              <Link
                to="/"
                className="mt-3 inline-flex text-xs font-semibold underline-offset-4 hover:underline lg:hidden"
              >
                ← Retour au site
              </Link>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const authed = (() => {
    try {
      return sessionStorage.getItem(AUTH_KEY) === '1'
    } catch {
      return false
    }
  })()

  if (!authed) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-sand-50 p-8">
        <div className="max-w-md rounded-2xl border border-sand-200 bg-white p-8 text-center">
          <p className="font-display uppercase text-heading-sm">Accès restreint</p>
          <p className="mt-2 text-sm text-ink-500">Veuillez vous connecter pour accéder à l’administration.</p>
          <Link
            to="/admin"
            className="mt-6 inline-flex rounded-full bg-clay-600 px-6 py-3 text-sm font-semibold text-cream-100 hover:bg-clay-700"
          >
            Aller à la connexion
          </Link>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
