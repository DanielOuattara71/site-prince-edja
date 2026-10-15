import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { isDarkTop, SITE } from '@/data/site'
import { NAV_PRINCIPALE } from '@/data/navigation'
import type { EntreeNav } from '@/data/navigation'
import { replayIntro } from '@/lib/motion'
import { useScrollDirection } from '@/hooks/useScrollDirection'
import { useThemeBare } from '@/hooks/useThemeBare'
import { useHasFinePointer } from '@/hooks/useMediaQuery'
import { useLangue } from '@/i18n/contexteLangue'
import { Container } from '@/components/layout/Container'
import { NavOverlay } from '@/components/layout/NavOverlay'
import { MegaMenu } from '@/components/layout/MegaMenu'
import { RechercheGlobale } from '@/components/layout/RechercheGlobale'
import { LangueSwitcher } from '@/components/layout/LangueSwitcher'
import { CtaTravailler } from '@/components/layout/CtaTravailler'

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [groupeOuvert, setGroupeOuvert] = useState<string | null>(null)
  const [focusDansBarre, setFocusDansBarre] = useState(false)
  const minuteur = useRef(0)
  const barreRef = useRef<HTMLElement>(null)
  const pointeurFin = useHasFinePointer()
  const closeMenu = useCallback(() => setMenuOpen(false), [])
  const { pathname } = useLocation()
  const { t, l } = useLangue()

  // Se refermer au changement de route. Fait pendant le rendu, pas dans un effet :
  // un `useEffect` produirait un second rendu, donc un menu encore ouvert le temps
  // d'une frame. On le verrait clignoter sur la page qui vient de s'afficher.
  const [derniereRoute, setDerniereRoute] = useState(pathname)
  if (derniereRoute !== pathname) {
    setDerniereRoute(pathname)
    setMenuOpen(false)
    setGroupeOuvert(null)
  }

  const { degagee, visible } = useScrollDirection({
    force: menuOpen || groupeOuvert !== null || focusDansBarre,
    jeton: pathname,
  })

  useEffect(() => () => window.clearTimeout(minuteur.current), [])

  // Un clic hors de la barre referme le groupe ouvert. Le survol suffisait tant que le
  // pointeur restait dans l'en-tête ; dès qu'il en sortait sans traverser le menu, le
  // groupe restait affiché par-dessus le contenu.
  useEffect(() => {
    if (groupeOuvert === null) return
    const onPointerDown = (evenement: PointerEvent) => {
      const cible = evenement.target as Node | null
      if (cible && barreRef.current?.contains(cible)) return
      setGroupeOuvert(null)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [groupeOuvert])

  /*
    Le thème suit le fond réellement traversé, plus une liste de routes : les sections
    sombres se déclarent elles-mêmes (`data-theme-bare`). `isDarkTop` ne sert plus que
    d'amorce à la première frame, le temps que l'observer démarre.
  */
  const fondSombre = useThemeBare(isDarkTop(pathname))

  const flottante = degagee && !menuOpen
  const darkTop = !degagee && !menuOpen && fondSombre
  const lightText = menuOpen || darkTop

  const ouvrirGroupe = (id: string) => {
    window.clearTimeout(minuteur.current)
    setGroupeOuvert(id)
  }

  const fermerGroupe = () => {
    // Un retard à la fermeture : sans lui, traverser le méga-menu d'un bout à l'autre
    // le referme avant que le pointeur atteint un lien.
    minuteur.current = window.setTimeout(() => setGroupeOuvert(null), 140)
  }

  return (
    <>
      <header
        ref={barreRef}
        onFocus={() => setFocusDansBarre(true)}
        onBlur={(evenement) => {
          if (!evenement.currentTarget.contains(evenement.relatedTarget as Node | null)) {
            setFocusDansBarre(false)
          }
        }}
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-transform duration-(--d-base) ease-expo motion-reduce:transition-none',
          visible ? 'translate-y-0' : '-translate-y-[130%]',
          lightText && !degagee ? 'text-cream-100' : !degagee ? 'text-ink-900' : '',
          menuOpen && 'text-cream-100',
        )}
      >
        {/*
          Le calque ivoire : c'est lui qui donne l'aspect barre détachée. Il est posé en
          absolu dans un header resté pleine largeur, et son opacité seule est animée.
          Ni la largeur, ni les marges, ni le haut du conteneur ne bougent : le texte du
          menu garde la même position au sommet et une fois la barre décollée.
        */}
        <div
          aria-hidden
          className={cn(
            'absolute inset-x-3 top-3 bottom-3 mx-auto max-w-7xl rounded-md border border-transparent bg-sand-50/95 backdrop-blur-md transition-opacity duration-(--d-base) motion-reduce:transition-none lg:inset-x-4 lg:top-4 lg:bottom-4',
            flottante ? 'border-sand-200 opacity-100' : 'opacity-0',
          )}
        />

        <Container className="relative flex h-16 items-center justify-between gap-3 lg:h-20 lg:gap-4">
          <Link
            to="/"
            aria-label="Prince Edja · Accueil"
            onClick={() => replayIntro()}
            className="flex shrink-0 items-baseline gap-1.5 whitespace-nowrap font-display uppercase tracking-wide text-heading-sm"
          >
            {SITE.name}
            <span aria-hidden className="size-1.5 rounded-full bg-gold-400" />
          </Link>

          <nav
            aria-label={t('nav.etiquette')}
            className="hidden items-center gap-0.5 lg:flex"
            /* Le focus qui quitte la navigation referme le groupe : sans cela, un
               départ au clavier le laissait affiché sans que rien ne le referme. */
            onBlur={(evenement) => {
              if (evenement.currentTarget.contains(evenement.relatedTarget as Node | null)) return
              window.clearTimeout(minuteur.current)
              setGroupeOuvert(null)
            }}
          >
            {NAV_PRINCIPALE.map((entree: EntreeNav) => {
              const actif = entree.enfants?.length
                ? false
                : pathname === entree.to || pathname.startsWith(`${entree.to}/`)
              const idGroupe = `nav-groupe-${entree.to.replace(/\//g, '-')}`

              return (
                <div
                  key={entree.to}
                  className="relative"
                  onPointerEnter={() => entree.enfants && pointeurFin && ouvrirGroupe(entree.to)}
                  onPointerLeave={() => entree.enfants && pointeurFin && fermerGroupe()}
                >
                  <NavLink
                    to={entree.to}
                    aria-current={actif ? 'page' : undefined}
                    aria-haspopup={entree.enfants ? 'true' : undefined}
                    aria-expanded={entree.enfants ? groupeOuvert === entree.to : undefined}
                    aria-controls={entree.enfants ? idGroupe : undefined}
                    id={entree.enfants ? `${idGroupe}-declencheur` : undefined}
                    onFocus={() => entree.enfants && ouvrirGroupe(entree.to)}
                    onClick={(evenement) => {
                      /* Au tactile, un tap sur l'entrée ouvre la liste au lieu de
                         naviguer : sans pointeur fin, le survol n'existe pas et les
                         sous-entrées étaient inaccessibles. Second tap : navigation. */
                      if (!entree.enfants || pointeurFin) return
                      evenement.preventDefault()
                      if (groupeOuvert === entree.to) return
                      window.clearTimeout(minuteur.current)
                      setGroupeOuvert(entree.to)
                    }}
                    className={cn(
                      // shrink-0 + whitespace-nowrap : sans eux, une entrée trop à
                      // l'étroit se replie sur deux lignes (« Prince ▾ / Edja ») et
                      // désaligne toute la barre.
                      'relative flex min-h-11 shrink-0 items-center whitespace-nowrap rounded-md px-2.5 text-caption font-semibold transition-opacity hover:opacity-70 xl:px-3',
                      actif &&
                        'after:absolute after:inset-x-3 after:-bottom-0.5 after:h-0.5 after:bg-clay-500 xl:after:inset-x-4',
                    )}
                  >
                    {l(entree.libelle)}
                    {entree.enfants && (
                      <span
                        aria-hidden
                        className={cn(
                          'ml-1 text-caption opacity-60 transition-transform duration-(--d-fast)',
                          groupeOuvert === entree.to && 'rotate-180',
                        )}
                      >
                        ▾
                      </span>
                    )}
                  </NavLink>

                  {entree.enfants && groupeOuvert === entree.to && (
                    <MegaMenu
                      id={idGroupe}
                      entree={entree}
                      ouvert
                      onFermer={() => setGroupeOuvert(null)}
                    />
                  )}
                </div>
              )
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-2 lg:gap-3">
            {/* Le sélecteur suit la couleur du texte de la barre : crème sur hero
                sombre, encre sur barre ivoire. Une palette fixe l'aurait rendu
                invisible sur l'un des deux fonds. */}
            <LangueSwitcher tone={lightText ? 'sombre' : 'clair'} className="hidden lg:inline-flex" />

            <RechercheGlobale
              tone={lightText ? 'sombre' : 'clair'}
              className="hidden sm:inline-flex"
            />

            {/*
              L'action principale : une seule par écran, toujours atteignable. Sous
              1024 px elle quitte la barre (elle n'y tiendrait pas à côté de la marque
              et du bouton de menu) et devient la première action du menu plein écran.

              Le ton suit la barre : crème sur hero sombre — où un plein encre
              disparaîtrait, ink-900 et night-900 étant quasi confondus —, encre sur
              barre ivoire.
            */}
            <CtaTravailler tone={lightText ? 'sombre' : 'clair'} compact className="hidden lg:inline-flex" />

            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="menu-overlay"
              aria-label={menuOpen ? t('nav.fermerMenu') : t('nav.ouvrirMenu')}
              className={cn(
                'flex size-11 cursor-pointer items-center justify-center rounded-md border transition-colors duration-(--d-fast) lg:hidden',
                lightText || menuOpen
                  ? 'border-cream-100/40 hover:bg-cream-100 hover:text-ink-900'
                  : 'border-ink-900/30 hover:bg-ink-900 hover:text-cream-100',
              )}
            >
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </Container>
      </header>

      <NavOverlay open={menuOpen} onClose={closeMenu} />
    </>
  )
}
