import './App.css'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { Layout } from './components/Layout'
import CollectionPage from './pages/CollectionPage'
import { FeedPage } from './pages/FeedPage'
import ResourcePage from './pages/ResourcePage'
import ResourceDetailPage from './pages/ResourceDetailPage'
import ThreadDetailPage from './pages/ThreadDetailPage'
import ChatPage from './pages/ChatPage'
import AuthPage from './pages/AuthPage'
import ProfilePage from './pages/ProfilePage'
import { useAuth } from './contexts/AuthContext'

function ProtectedRoute() {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Outlet /> : <Navigate to="/auth" replace />
}

function App() {
  return (
    <Routes>
      {/* Public route */}
      <Route path="/auth" element={<AuthPage />} />
      
      {/* Protected routes with layout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<FeedPage />} />
          <Route path="/collections" element={<CollectionPage />} />
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/feed/:id" element={<ThreadDetailPage />} />
          <Route path="/resource" element={<ResourcePage />} />
          <Route path="/resource/:id" element={<ResourceDetailPage />} />
          <Route path="/resources" element={<div><h1>Resources</h1></div>} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>
      
      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
