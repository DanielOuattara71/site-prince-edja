import { Suspense, lazy } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation, Outlet } from 'react-router'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { DUR, EASE_EXPO, EASE_QUART } from '@/lib/motion'
import HomePage from '@/pages/HomePage'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ScrollToTop } from '@/components/layout/ScrollToTop'
import { LoaderIntro } from '@/components/motion/LoaderIntro'
import { CurseurGyeNyame } from '@/components/motion/CurseurGyeNyame'
import { FenetreNewsletter } from '@/components/newsletter/FenetreNewsletter'
import { PAGES_LEGALES } from '@/acces/site'
import { useLangue } from '@/i18n/contexteLangue'
import { FournisseurDemande } from '@/lib/demande'
import { BoutonDemande } from '@/components/shop/BoutonDemande'

const AboutPage = lazy(() => import('@/pages/AboutPage'))
const HistoiresPage = lazy(() => import('@/pages/HistoiresPage'))
const ContactPage = lazy(() => import('@/pages/ContactPage'))
const ArticlePage = lazy(() => import('@/pages/ArticlePage'))
const NewsletterPage = lazy(() => import('@/pages/NewsletterPage'))
const DestinationPage = lazy(() => import('@/pages/DestinationPage'))
const ArchivePage = lazy(() => import('@/pages/ArchivePage'))
const ObjetPage = lazy(() => import('@/pages/ObjetPage'))
const LegalPage = lazy(() => import('@/pages/LegalPage'))
const XplorePage = lazy(() => import('@/pages/XplorePage'))
const EpisodeDetailPage = lazy(() => import('@/pages/EpisodeDetailPage'))
const TasteTravelPage = lazy(() => import('@/pages/TasteTravelPage'))
const ShopPage = lazy(() => import('@/pages/ShopPage'))
const JournalPage = lazy(() => import('@/pages/JournalPage'))
const PressPage = lazy(() => import('@/pages/PressPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

function AnimatedOutlet() {
  const location = useLocation()
  const reducedMotion = useReducedMotion()

  return (
    <AnimatePresence mode="wait">
      <motion.main
        id="contenu"
        key={location.pathname}
        initial={reducedMotion ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={
          reducedMotion
            ? undefined
            : {
                opacity: 0,
                y: -16,
                transition: {
                  duration: 0.28,
                  ease: EASE_QUART,
                },
              }
        }
        transition={{
          duration: DUR.base,
          ease: EASE_EXPO,
        }}
      >
        <Outlet />
      </motion.main>
    </AnimatePresence>
  )
}

function SiteLayout() {
  const { t } = useLangue()

  return (
    <>
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[80] focus:rounded-full focus:bg-clay-500 focus:px-5 focus:py-3 focus:text-caption focus:font-semibold focus:text-cream-100"
      >
        {t('a11y.allerContenu')}
      </a>

      <ScrollToTop />

      <LoaderIntro />

      {/* Curseur monté ici et non à la racine : il ne doit pas toucher aux surfaces
          d'administration, qui vivent dans une application séparée. */}
      <CurseurGyeNyame />

      <Header />

      <FournisseurDemande>
        <Suspense fallback={<div className="min-h-svh" aria-busy="true" />}>
          <AnimatedOutlet />
        </Suspense>

        <BoutonDemande />
      </FournisseurDemande>

      <Footer />

      {/* Fenêtre d'inscription à la lettre du Griot : déclenchée une fois (~20 s
          sur les pages de contenu), fermable, jamais avec une autre fenêtre. */}
      <FenetreNewsletter />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route index element={<HomePage />} />

          <Route path="/a-propos" element={<AboutPage />} />

          {/* Ancienne page Influence : son contenu vit dans À propos. La route
              redirige au lieu de disparaître. */}
          <Route
            path="/a-propos/influence"
            element={<Navigate to="/a-propos#audience" replace />}
          />

          <Route path="/histoires" element={<HistoiresPage />} />

          <Route path="/xplore" element={<XplorePage />} />

          <Route path="/xplore/:slug" element={<EpisodeDetailPage />} />

          <Route path="/taste-and-travel" element={<TasteTravelPage />} />

          <Route path="/boutique" element={<ShopPage />} />

          <Route path="/boutique/:objet" element={<ObjetPage />} />

          <Route path="/journal" element={<JournalPage />} />

          <Route path="/journal/:slug" element={<ArticlePage />} />

          <Route path="/presse" element={<PressPage />} />

          {/* L'ancienne page « Travailler avec Prince » : son contenu vit désormais
              dans Contact (univers, motifs, délai de réponse). La route redirige
              au lieu de disparaître — les CTA du header, du footer, du héros et
              des épisodes gardent une cible vivante. */}
          <Route path="/travailler-ensemble" element={<Navigate to="/contact" replace />} />

          <Route path="/contact" element={<ContactPage />} />

          {PAGES_LEGALES.map((page) => (
            <Route key={page.chemin} path={page.chemin} element={<LegalPage />} />
          ))}
          <Route path="/destinations/:slug" element={<DestinationPage />} />
          <Route path="/archive-afrique" element={<ArchivePage />} />
          <Route path="/newsletter/confirmation" element={<NewsletterPage vue="confirmation" />} />
          <Route path="/newsletter/preferences" element={<NewsletterPage vue="preferences" />} />
          <Route
            path="/newsletter/desinscription"
            element={<NewsletterPage vue="desinscription" />}
          />

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
