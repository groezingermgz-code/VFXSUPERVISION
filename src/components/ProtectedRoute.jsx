import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function ProtectedRoute({ children }) {
  const { currentUser } = useAuth()
  const location = useLocation()
  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return children
}