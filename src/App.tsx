import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import CategoryJobsPage from './pages/CategoryJobsPage'
import JobDetailPage from './pages/JobDetailPage'
import ProfilePage from './pages/ProfilePage'
import AutoApplyPage from './pages/AutoApplyPage'
import ApplicationsPage from './pages/ApplicationsPage'
import DocumentsPage from './pages/DocumentsPage'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/category/:categoryId" element={<CategoryJobsPage />} />
        <Route path="/jobs/:id" element={<JobDetailPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/auto-apply" element={<AutoApplyPage />} />
        <Route path="/applications" element={<ApplicationsPage />} />
        <Route path="/documents" element={<DocumentsPage />} />
      </Routes>
    </Layout>
  )
}

export default App
