import { BrowserRouter, Routes, Route } from 'react-router'
import { Layout } from '@/components/Layout'
import Dashboard from '@/pages/Dashboard'
import Articles from '@/pages/Articles'
import Episodes from '@/pages/Episodes'
import Site from '@/pages/Site'
import Media from '@/pages/Media'
import Generic from '@/pages/Generic'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="articles" element={<Articles />} />
          <Route path="episodes" element={<Episodes />} />
          <Route path="travel" element={<Generic title="Taste & Travel — Villes" />} />
          <Route path="site" element={<Site />} />
          <Route path="media" element={<Media />} />
          <Route path="presse" element={<Generic title="Presse" />} />
          <Route path="a-propos" element={<Generic title="À propos · Milestones" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
