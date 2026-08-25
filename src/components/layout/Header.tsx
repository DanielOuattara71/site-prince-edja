import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { isDarkTop, NAV_ITEMS, SITE } from '@/data/site'
import { Container } from '@/components/layout/Container'
import { MagneticButton } from '@/components/motion/MagneticButton'
import { Button } from '@/components/ui/Button'
import { MobileMenu } from '@/components/layout/MobileMenu'

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    let lastY = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 32)
      setHidden(y > 140 && y > lastY)
      lastY = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const darkTop = !scrolled && !menuOpen && isDarkTop(pathname)
  const lightText = menuOpen || darkTop

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-[transform,background-color,color,box-shadow] duration-(--d-base)',
          hidden && !menuOpen && '-translate-y-full',
          scrolled && !menuOpen
            ? 'bg-sand-50/90 text-ink-900 shadow-[0_1px_0_var(--color-sand-200)] backdrop-blur-md'
            : 'bg-transparent',
          lightText && !scrolled ? 'text-cream-100' : !scrolled ? 'text-ink-900' : '',
          menuOpen && 'text-cream-100',
        )}
      >
        <Container className="flex h-16 items-center justify-between gap-4 lg:h-20">
          <Link
            to="/"
            aria-label="Prince Edja — Accueil"
            className="flex items-baseline gap-1.5 font-display text-xl uppercase tracking-wide"
          >
            {SITE.name}
            <span aria-hidden className="size-1.5 rounded-full bg-gold-400" />
          </Link>

          <nav aria-label="Navigation principale" className="hidden items-center gap-1 lg:flex">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'relative rounded-full px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-70',
                    isActive &&
                      'after:absolute after:inset-x-4 after:-bottom-0.5 after:h-0.5 after:bg-clay-500',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Button
              to="/contact"
              variant={lightText ? 'ghost-light' : 'ghost-dark'}
              magnetic={false}
              className="hidden md:inline-flex"
            >
              Contact
            </Button>
            <MagneticButton>
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                aria-expanded={menuOpen}
                aria-controls="menu-mobile"
                aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
                className={cn(
                  'flex size-11 cursor-pointer items-center justify-center rounded-full border transition-colors duration-(--d-fast) lg:hidden',
                  lightText || menuOpen
                    ? 'border-cream-100/40 hover:bg-cream-100 hover:text-ink-900'
                    : 'border-ink-900/30 hover:bg-ink-900 hover:text-cream-100',
                )}
              >
                {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
              </button>
            </MagneticButton>
          </div>
        </Container>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  )
}
