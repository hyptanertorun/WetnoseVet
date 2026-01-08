'use client'

  import { useEffect } from 'react'
  import { useRouter } from 'next/navigation'
  import { useAuthStore } from '@/lib/adminAuth'

  interface ProtectedRouteProps {
    children: React.ReactNode
    requiredRoles?: string[]
  }

  export default function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
    const router = useRouter()
    const { isAuthenticated, user, _hasHydrated } = useAuthStore()

    useEffect(() => {
      if (!_hasHydrated) return

      if (!isAuthenticated || !user) {
        router.replace('/admin/login')
        return
      }

      if (requiredRoles && requiredRoles.length > 0) {
        if (!requiredRoles.includes(user.role)) {
          router.replace('/admin/403')
          return
        }
      }
    }, [_hasHydrated, isAuthenticated, user, requiredRoles, router])

    if (!_hasHydrated) {
      return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400">Yükleniyor...</p>
          </div>
        </div>
      )
    }

    if (!isAuthenticated || !user) {
      return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400">Yönlendiriliyor...</p>
          </div>
        </div>
      )
    }

    if (requiredRoles && requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
      return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400">Yönlendiriliyor...</p>
          </div>
        </div>
      )
    }

    return <>{children}</>
  }
