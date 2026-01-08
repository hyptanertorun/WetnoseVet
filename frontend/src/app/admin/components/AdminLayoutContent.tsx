'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import AdminSidebar from './AdminSidebar'
import ProtectedRoute from './ProtectedRoute'
import { useAuthStore } from '@/lib/adminAuth'

export default function AdminLayoutContent({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
    // Add admin-page class to body for normal cursor
    document.body.classList.add('admin-page')
    
    return () => {
      document.body.classList.remove('admin-page')
    }
  }, [])
  
  // Check if user must change password
  useEffect(() => {
    if (!mounted) return
    
    // Skip for login and force-password-change pages
    if (pathname === '/admin/login' || pathname === '/admin/force-password-change') {
      return
    }
    
    // If authenticated and must change password, redirect
    if (isAuthenticated && user?.must_change_password) {
      router.push('/admin/force-password-change')
    }
  }, [mounted, isAuthenticated, user, pathname, router])
  
  // Don't show sidebar on login page
  if (pathname === '/admin/login') {
    return <>{children}</>
  }
  
  // Don't show sidebar on force-password-change page
  if (pathname === '/admin/force-password-change') {
    return (
      <ProtectedRoute>
        {children}
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-950 flex">
        <AdminSidebar />
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  )
}
