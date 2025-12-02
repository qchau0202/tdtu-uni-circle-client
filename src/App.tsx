import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import StudySessionPage from './pages/StudySessionPage'
import { FeedPage } from './pages/FeedPage'
import MaterialRepository from './pages/MaterialRepository'
import ChatPage from './pages/ChatPage'
import AuthPage from './pages/AuthPage'
import ProfilePage from './pages/ProfilePage'

function App() {
  return (
    <Routes>
      {/* Public route */}
      <Route path="/auth" element={<AuthPage />} />
      
      {/* Protected routes with layout */}
      <Route element={<Layout />}>
        <Route path="/" element={<FeedPage />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="/study-sessions" element={<StudySessionPage />} />
        <Route path="/feed" element={<FeedPage />} />
        <Route path="/material-repo" element={<MaterialRepository />} />
        <Route path="/resources" element={<div><h1>Resources</h1></div>} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
      
      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
