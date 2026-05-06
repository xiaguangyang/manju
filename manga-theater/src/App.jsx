import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from './components/MainLayout'
import Dashboard from './pages/Dashboard'
import ProjectDetail from './pages/ProjectDetail'
import EpisodeDetail from './pages/EpisodeDetail'
import MaterialLibrary from './pages/MaterialLibrary'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="project/:id" element={<ProjectDetail />} />
          <Route path="project/:id/episode/:episodeId" element={<EpisodeDetail />} />
          <Route path="materials" element={<MaterialLibrary />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
