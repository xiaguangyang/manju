import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './components/MainLayout'
import Dashboard from './pages/Dashboard'
import ScriptEditor from './pages/ScriptEditor'
import Storyboard from './pages/Storyboard'
import ImageGenerator from './pages/ImageGenerator'
import VideoGenerator from './pages/VideoGenerator'
import AudioMixer from './pages/AudioMixer'
import PreviewExport from './pages/PreviewExport'
import MaterialLibrary from './pages/MaterialLibrary'
import ProjectManagement from './pages/ProjectManagement'
import EpisodeManagement from './pages/EpisodeManagement'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="projects" element={<ProjectManagement />} />
          <Route path="projects/:projectId/episodes" element={<EpisodeManagement />} />
          <Route path="script" element={<ScriptEditor />} />
          <Route path="storyboard" element={<Storyboard />} />
          <Route path="images" element={<ImageGenerator />} />
          <Route path="video" element={<VideoGenerator />} />
          <Route path="audio" element={<AudioMixer />} />
          <Route path="preview" element={<PreviewExport />} />
          <Route path="materials" element={<MaterialLibrary />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
