import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function ProtectedRoute({ children }) {
  const { currentUser } = useAuth()
  const location = useLocation()

  // Local bypass: enable on localhost or via env flag
  const skipAuth = (() => {
    try {
      const envFlag = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SKIP_AUTH_LOCAL === 'true'
      const host = typeof window !== 'undefined' ? window.location.hostname : ''
      const isLocalHost = host === 'localhost' || host === '127.0.0.1'
      return envFlag || isLocalHost
    } catch {
      return false
    }
  })()

  if (skipAuth) return children
  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return children
}