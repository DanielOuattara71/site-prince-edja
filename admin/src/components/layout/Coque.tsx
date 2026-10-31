import { LogOut, Menu, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router'
import { useSession } from '@/auth/contexte-session'
import { AvertissementInactivite, VerrouSession } from '@/auth/VerrouSession'
import { BarreLaterale } from '@/components/layout/BarreLaterale'
import { LienEvitement } from '@/components/layout/LienEvitement'
import { t, type CleTraduction } from '@/i18n/fr'

/**
 * Coque de l'admin (section 5) : barre latérale fixe sur écran large, tiroir sur mobile,
 * en-tête avec le compte et la déconnexion, contenu en colonne. Points de repère
 * `header`, `nav`, `main` ; lien d'évitement en premier.
 */
export function Coque() {
  const { moi, deconnecter } = useSession()
  const navigate = useNavigate()
  const location = useLocation()
  const [tiroir, setTiroir] = useState(false)
  const [cheminVu, setCheminVu] = useState(location.pathname)
  const boutonMenu = useRef<HTMLButtonElement>(null)
  const dialogue = useRef<HTMLDialogElement>(null)

  // Le tiroir se ferme quand la page change (ajustement pendant le rendu, sans effet).
  if (cheminVu !== location.pathname) {
    setCheminVu(location.pathname)
    setTiroir(false)
  }

  // Le `<dialog>` modal natif piège le focus et se ferme sur Échap.
  useEffect(() => {
    const element = dialogue.current
    if (!element || typeof element.showModal !== 'function') return
    if (tiroir && !element.open) element.showModal()
    if (!tiroir && element.open) element.close()
  }, [tiroir])

  if (!moi) return null
  const { compte } = moi

  const fermer = () => {
    setTiroir(false)
    boutonMenu.current?.focus()
  }

  const seDeconnecter = async () => {
    await deconnecter()
    void navigate('/connexion', { replace: true })
  }

  return (
    <div className="min-h-svh bg-sand-50">
      <LienEvitement />
      <header className="sticky top-0 z-50 flex min-h-16 items-center justify-between gap-4 border-b border-sand-200 bg-sand-50 px-4 lg:pl-72">
        <div className="flex items-center gap-3">
          <button
            ref={boutonMenu}
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-md text-ink-900 hover:bg-sand-100 lg:hidden"
            aria-expanded={tiroir}
            aria-controls="tiroir-navigation"
            onClick={() => setTiroir(true)}
          >
            <Menu aria-hidden className="size-6" />
            <span className="sr-only">{t('coque.ouvrirMenu')}</span>
          </button>
          <Link to="/" className="font-display text-heading-sm uppercase text-ink-900">
            {t('app.nom')}
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/changer-mot-de-passe"
            className="hidden min-h-11 flex-col justify-center rounded-md px-3 text-right hover:bg-sand-100 sm:flex"
          >
            <span className="text-body font-semibold text-ink-900">{compte.nom}</span>
            <span className="text-caption text-ink-700">
              {t(`role.${compte.role}` as CleTraduction)}
            </span>
          </Link>
          <button
            type="button"
            onClick={() => void seDeconnecter()}
            className="inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-button font-semibold text-ink-900 hover:bg-sand-100"
          >
            <LogOut aria-hidden className="size-5" />
            <span className="sr-only sm:not-sr-only">{t('coque.deconnexion')}</span>
          </button>
        </div>
      </header>

      <nav
        aria-label={t('coque.navigation')}
        className="fixed inset-y-0 left-0 z-50 hidden w-64 overflow-y-auto bg-forest-950 lg:block"
      >
        <BarreLaterale compte={compte} />
      </nav>

      <dialog
        ref={dialogue}
        id="tiroir-navigation"
        aria-label={t('coque.navigation')}
        onClose={fermer}
        className="m-0 h-full max-h-none w-72 max-w-[85vw] overflow-y-auto bg-forest-950 p-0 backdrop:bg-night-900/60 lg:hidden"
      >
        <div className="flex justify-end p-2">
          <button
            type="button"
            onClick={fermer}
            className="inline-flex size-11 items-center justify-center rounded-md text-cream-100 hover:bg-forest-900"
          >
            <X aria-hidden className="size-6" />
            <span className="sr-only">{t('coque.fermerMenu')}</span>
          </button>
        </div>
        {tiroir ? (
          <nav aria-label={t('coque.navigation')}>
            <BarreLaterale compte={compte} surNavigation={() => setTiroir(false)} />
          </nav>
        ) : null}
      </dialog>

      <main
        id="contenu"
        tabIndex={-1}
        className="px-4 py-6 focus:outline-none sm:px-6 lg:ml-64 lg:px-10"
      >
        <Outlet />
      </main>
      <AvertissementInactivite />
      <VerrouSession />
    </div>
  )
}
