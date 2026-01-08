// Admin Panel Auth Store
  import { create } from 'zustand'
  import { persist } from 'zustand/middleware'

  export type UserRole = 'admin' | 'manager' | 'reception' | 'editor'
  export type UserStatus = 'active' | 'inactive' | 'suspended'

  export interface AdminUser {
    id: string
    email: string
    full_name: string
    role: UserRole
    status?: UserStatus
    avatar_url?: string | null
    last_login?: string | null
    must_change_password?: boolean
  }

  interface AuthState {
    user: AdminUser | null
    accessToken: string | null
    refreshToken: string | null
    isAuthenticated: boolean
    _hasHydrated: boolean
    setAuth: (user: AdminUser, accessToken: string, refreshToken: string) => void
    setUser: (user: AdminUser) => void
    logout: () => void
    updateUser: (user: Partial<AdminUser>) => void
    setHasHydrated: (state: boolean) => void
  }

  export const useAuthStore = create<AuthState>()(
    persist(
      (set) => ({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        _hasHydrated: false,
        setAuth: (user, accessToken, refreshToken) => {
          if (typeof window !== 'undefined') {
            document.cookie = `maintenance_preview=true; path=/; max-age=${60 * 60 * 24}; SameSite=Lax`
            localStorage.setItem('maintenance_preview', 'true')
          }
          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
          })
        },
        setUser: (user) =>
          set({
            user,
          }),
        logout: () => {
          if (typeof window !== 'undefined') {
            document.cookie = 'maintenance_preview=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
            localStorage.removeItem('maintenance_preview')
          }
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
          })
        },
        updateUser: (userData) =>
          set((state) => ({
            user: state.user ? { ...state.user, ...userData } : null,
          })),
        setHasHydrated: (state) => {
          set({ _hasHydrated: state })
        },
      }),
      {
        name: 'wetnose-admin-auth',
        onRehydrateStorage: () => (state) => {
          state?.setHasHydrated(true)
        },
      }
    )
  )

  // Role-based permission checks
  export const ROLE_PERMISSIONS = {
    admin: ['*'],
    manager: ['users:read', 'settings:read', 'settings:write', 'audit:read', 'content:*'],
    reception: ['leads:*', 'content:read'],
    editor: ['content:*'],
  }

  export function hasPermission(role: UserRole, permission: string): boolean {
    const permissions = ROLE_PERMISSIONS[role]
    if (permissions.includes('*')) return true
    if (permissions.includes(permission)) return true
    const [category] = permission.split(':')
    if (permissions.includes(`${category}:*`)) return true
    return false
  }

  export function canAccessPage(role: UserRole, page: string): boolean {
    const pagePermissions: Record<string, string> = {
      'users': 'users:read',
      'settings': 'settings:read',
      'audit-logs': 'audit:read',
      'leads': 'leads:read',
      'crm': 'leads:read',
      'services': 'content:read',
      'team': 'content:read',
      'blog': 'content:read',
      'gallery': 'content:read',
      'testimonials': 'content:read',
      'slider': 'content:read',
      'clinic-rhythm': 'content:read',
      'contact': 'leads:read',
      'maintenance': 'settings:write',
      'roles': 'users:write',
    }
    const requiredPermission = pagePermissions[page]
    if (!requiredPermission) return true
    return hasPermission(role, requiredPermission)
  }