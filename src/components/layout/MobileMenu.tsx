import { useEffect, useRef } from 'react'
import { NavLink, useLocation } from 'react-router'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/cn'
import { MENU_SECONDARY, NAV_ITEMS, SITE } from '@/data/site'
import { Container } from '@/components/layout/Container'
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll'
import { EASE_QUART } from '@/lib/motion'

interface MobileMenuProps {
  open: boolean
  onClose: () => void
}

const lineUp = {
  hidden: { y: '110%' },
  visible: { y: '0%', transition: { duration: 0.6, ease: EASE_QUART } },
}

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const firstLinkRef = useRef<HTMLAnchorElement>(null)
  const { pathname } = useLocation()

  useLockBodyScroll(open)

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  useEffect(() => {
    onClose()
  }, [pathname, onClose])

  useEffect(() => {
    if (open) firstLinkRef.current?.focus()
  }, [open])

  const allItems = [...NAV_ITEMS, ...MENU_SECONDARY]

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id="menu-mobile"
          role="dialog"
          aria-modal="true"
          aria-label="Menu de navigation"
          initial={{ y: '-100%' }}
          animate={{ y: 0 }}
          exit={{ y: '-100%' }}
          transition={{ duration: 0.65, ease: EASE_QUART }}
          className="grain fixed inset-0 z-40 bg-night-900 text-cream-100 lg:hidden"
        >
          <Container className="flex h-full flex-col pt-24 pb-12">
            <p className="label-caps mb-8 text-gold-400">Navigation</p>
            <motion.nav
              aria-label="Menu mobile"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.06, delayChildren: 0.25 } },
              }}
            >
              <ul className="space-y-1">
                {allItems.map((item, index) => (
                  <li key={item.to} className="overflow-hidden">
                    <motion.div variants={lineUp}>
                      <NavLink
                        ref={index === 0 ? firstLinkRef : undefined}
                        to={item.to}
                        className={({ isActive }) =>
                          cn(
                            'group flex items-baseline gap-4 py-2 font-display uppercase text-heading-md',
                            isActive ? 'text-clay-500' : 'text-cream-100',
                          )
                        }
                      >
                        <span className="text-caption tracking-normal opacity-60">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        {item.label}
                        <ArrowUpRight
                          aria-hidden
                          className="size-5 self-center opacity-0 transition-opacity group-hover:opacity-100"
                        />
                      </NavLink>
                    </motion.div>
                  </li>
                ))}
              </ul>
            </motion.nav>

            <div className="mt-auto space-y-3 border-t border-cream-100/15 pt-6">
              <a href={`mailto:${SITE.email}`} className="block text-body-lg font-semibold">
                {SITE.email}
              </a>
              <p className="label-caps text-cream-100/60">{SITE.localisation}</p>
            </div>
          </Container>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
