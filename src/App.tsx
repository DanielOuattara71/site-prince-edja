import { Suspense, lazy } from 'react'
import { BrowserRouter, Route, Routes, useLocation, Outlet } from 'react-router'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { DUR, EASE_EXPO, EASE_QUART } from '@/lib/motion'
import HomePage from '@/pages/HomePage'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ScrollToTop } from '@/components/layout/ScrollToTop'
import { LoaderIntro } from '@/components/motion/LoaderIntro'

const AboutPage = lazy(() => import('@/pages/AboutPage'))
const XplorePage = lazy(() => import('@/pages/XplorePage'))
const EpisodeDetailPage = lazy(() => import('@/pages/EpisodeDetailPage'))
const TasteTravelPage = lazy(() => import('@/pages/TasteTravelPage'))
const ShopPage = lazy(() => import('@/pages/ShopPage'))
const JournalPage = lazy(() => import('@/pages/JournalPage'))
const PressPage = lazy(() => import('@/pages/PressPage'))
const ContactPage = lazy(() => import('@/pages/ContactPage'))
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
            : { opacity: 0, y: -16, transition: { duration: 0.28, ease: EASE_QUART } }
        }
        transition={{ duration: DUR.base, ease: EASE_EXPO }}
      >
        <Outlet />
      </motion.main>
    </AnimatePresence>
  )
}

function SiteLayout() {
  return (
    <>
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[80] focus:rounded-full focus:bg-clay-500 focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-cream-100"
      >
        Aller au contenu
      </a>
      <ScrollToTop />
      <LoaderIntro />
      <Header />
      <Suspense fallback={<div className="min-h-svh" aria-busy="true" />}>
        <AnimatedOutlet />
      </Suspense>
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route index element={<HomePage />} />
          <Route path="/a-propos" element={<AboutPage />} />
          <Route path="/xplore" element={<XplorePage />} />
          <Route path="/xplore/:slug" element={<EpisodeDetailPage />} />
          <Route path="/taste-and-travel" element={<TasteTravelPage />} />
          <Route path="/boutique" element={<ShopPage />} />
          <Route path="/journal" element={<JournalPage />} />
          <Route path="/presse" element={<PressPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
