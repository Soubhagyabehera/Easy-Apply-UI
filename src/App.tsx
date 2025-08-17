import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import SignInPage from './pages/SignInPage'
import SignUpPage from './pages/SignUpPage'
import Dashboard from './pages/Dashboard'
import CategoryJobsPage from './pages/CategoryJobsPage'
import JobDetailPage from './pages/JobDetailPage'
import ProfilePage from './pages/ProfilePage'
import AutoApplyPage from './pages/AutoApplyPage'
import ApplicationsPage from './pages/ApplicationsPage'
import DocumentsPage from './pages/DocumentsPage'
import JobsPage from './pages/JobsPage'

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Default landing page - Dashboard with jobs */}
        <Route path="/" element={
          <Layout>
            <Dashboard />
          </Layout>
        } />
        
        {/* Authentication routes */}
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        
        {/* Public job routes */}
        <Route path="/jobs" element={
          <Layout>
            <JobsPage />
          </Layout>
        } />
        <Route path="/jobs/:id" element={
          <Layout>
            <JobDetailPage />
          </Layout>
        } />
        
        {/* Protected routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/category/:categoryId" element={
          <ProtectedRoute>
            <Layout>
              <CategoryJobsPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Layout>
              <ProfilePage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/auto-apply" element={
          <ProtectedRoute>
            <Layout>
              <AutoApplyPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/applications" element={
          <ProtectedRoute>
            <Layout>
              <ApplicationsPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/documents" element={
          <Layout>
            <DocumentsPage />
          </Layout>
        } />
        <Route path="/document-manager" element={
          <ProtectedRoute>
            <Layout>
              <DocumentsPage />
            </Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </AuthProvider>
  )
}

export default App
