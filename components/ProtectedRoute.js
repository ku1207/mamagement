import { useRouter } from 'next/router'
import { useAuth } from '../context/AuthContext'
import { useEffect } from 'react'

export default function ProtectedRoute({ children, requiredRole = null }) {
  const { user, loading, hasPermission } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login')
        return
      }

      if (requiredRole && !hasPermission(requiredRole)) {
        router.push('/unauthorized')
        return
      }
    }
  }, [user, loading, router, requiredRole, hasPermission])

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (requiredRole && !hasPermission(requiredRole)) {
    return null
  }

  return children
} 