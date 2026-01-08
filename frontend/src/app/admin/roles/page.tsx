'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Shield, Check, X, Save, RotateCcw, AlertTriangle, 
  CheckCircle, Users, Settings, FileText, ClipboardList,
  Image, MessageSquare, Calendar, SlidersHorizontal, Mail,
  Wrench, LayoutDashboard, Sparkles, Eye
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/lib/adminAuth'

interface Permission {
  key: string
  label: string
  description: string
}

interface Role {
  role: string
  role_label: string
  permissions: string[]
  is_default: boolean
}

interface RolesData {
  roles: Role[]
  available_permissions: Permission[]
}

const PERMISSION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  dashboard: LayoutDashboard,
  crm: ClipboardList,
  contact: Mail,
  slider: SlidersHorizontal,
  clinic_rhythm: Calendar,
  services: Settings,
  team: Users,
  blog: FileText,
  ai_blog: Sparkles,
  gallery: Image,
  testimonials: MessageSquare,
  users: Users,
  settings: Settings,
  maintenance: Wrench,
  audit_logs: Eye,
}

export default function RolesPermissionsPage() {
  const [data, setData] = useState<RolesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [editedPermissions, setEditedPermissions] = useState<Record<string, string[]>>({})
  const [hasChanges, setHasChanges] = useState<Record<string, boolean>>({})
  const { accessToken } = useAuthStore()

  useEffect(() => {
    if (accessToken) {
      fetchData()
    }
  }, [accessToken])

  const fetchData = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/roles/permissions`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      })
      if (response.ok) {
        const json = await response.json()
        setData(json)
        const initial: Record<string, string[]> = {}
        json.roles.forEach((role: Role) => {
          initial[role.role] = [...role.permissions]
        })
        setEditedPermissions(initial)
      }
    } catch (error) {
      console.error('Failed to fetch roles:', error)
      setMessage({ type: 'error', text: 'Veriler yüklenemedi' })
    } finally {
      setLoading(false)
    }
  }

  const togglePermission = (role: string, permission: string) => {
    if (role === 'admin') return
    
    setEditedPermissions(prev => {
      const current = prev[role] || []
      const updated = current.includes(permission)
        ? current.filter(p => p !== permission)
        : [...current, permission]
      
      const original = data?.roles.find(r => r.role === role)?.permissions || []
      const changed = JSON.stringify([...updated].sort()) !== JSON.stringify([...original].sort())
      setHasChanges(prev => ({ ...prev, [role]: changed }))
      
      return { ...prev, [role]: updated }
    })
  }

  const saveRolePermissions = async (role: string) => {
    if (role === 'admin') return
    
    setSaving(role)
    setMessage(null)
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/roles/permissions/${role}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({ permissions: editedPermissions[role] })
        }
      )
      
      if (response.ok) {
        setMessage({ type: 'success', text: `${data?.roles.find(r => r.role === role)?.role_label} yetkileri güncellendi` })
        setHasChanges(prev => ({ ...prev, [role]: false }))
        await fetchData()
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.detail || 'Kaydetme başarısız' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Bir hata oluştu' })
    } finally {
      setSaving(null)
    }
  }

  const resetToDefaults = async () => {
    if (!confirm('Tüm rol yetkilerini varsayılana sıfırlamak istediğinizden emin misiniz?')) {
      return
    }
    
    setSaving('reset')
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/roles/permissions/reset`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      )
      
      if (response.ok) {
        setMessage({ type: 'success', text: 'Tüm yetkiler varsayılana sıfırlandı' })
        await fetchData()
        setHasChanges({})
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Sıfırlama başarısız' })
    } finally {
      setSaving(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
            <Shield className="w-8 h-8 text-teal-400" />
            Yetki Yönetimi
          </h1>
          <p className="text-gray-400 mt-2">
            Her rol için erişim yetkilerini özelleştirin
          </p>
        </div>
        
        <Button
          onClick={resetToDefaults}
          variant="outline"
          disabled={saving === 'reset'}
          className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Varsayılana Sıfırla
        </Button>
      </div>

      {/* Message */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
              message.type === 'success'
                ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                : 'bg-red-500/10 border border-red-500/20 text-red-400'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Roles Grid */}
      <div className="grid gap-6">
        {data?.roles.map((role) => {
          const isAdmin = role.role === 'admin'
          const roleHasChanges = hasChanges[role.role]
          
          return (
            <motion.div
              key={role.role}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-gray-900/50 border rounded-2xl overflow-hidden ${
                isAdmin ? 'border-yellow-500/30' : 'border-gray-800'
              }`}
            >
              {/* Role Header */}
              <div className={`p-4 lg:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                isAdmin ? 'bg-yellow-500/5' : 'bg-gray-800/30'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isAdmin 
                      ? 'bg-yellow-500/20 text-yellow-400' 
                      : 'bg-teal-500/20 text-teal-400'
                  }`}>
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{role.role_label}</h3>
                    <p className="text-sm text-gray-400">
                      {editedPermissions[role.role]?.length || 0} / {data?.available_permissions.length || 0} yetki
                      {isAdmin && ' (Değiştirilemez)'}
                    </p>
                  </div>
                </div>
                
                {!isAdmin && (
                  <Button
                    onClick={() => saveRolePermissions(role.role)}
                    disabled={!roleHasChanges || saving === role.role}
                    className={`${
                      roleHasChanges
                        ? 'bg-teal-600 hover:bg-teal-700'
                        : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {saving === role.role ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                        Kaydediliyor...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        {roleHasChanges ? 'Değişiklikleri Kaydet' : 'Kaydedildi'}
                      </>
                    )}
                  </Button>
                )}
              </div>
              
              {/* Permissions Grid */}
              <div className="p-4 lg:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {data?.available_permissions.map((perm) => {
                    const isEnabled = editedPermissions[role.role]?.includes(perm.key)
                    const Icon = PERMISSION_ICONS[perm.key] || Settings
                    
                    return (
                      <div
                        key={perm.key}
                        onClick={() => !isAdmin && togglePermission(role.role, perm.key)}
                        className={`p-3 rounded-xl border transition-all ${
                          isAdmin
                            ? 'bg-gray-800/30 border-gray-700/50 cursor-not-allowed opacity-60'
                            : isEnabled
                              ? 'bg-teal-500/10 border-teal-500/30 cursor-pointer hover:bg-teal-500/20'
                              : 'bg-gray-800/30 border-gray-700/50 cursor-pointer hover:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <Icon className={`w-4 h-4 flex-shrink-0 ${
                              isEnabled ? 'text-teal-400' : 'text-gray-500'
                            }`} />
                            <span className={`text-sm font-medium truncate ${
                              isEnabled ? 'text-white' : 'text-gray-400'
                            }`}>
                              {perm.label}
                            </span>
                          </div>
                          
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 ${
                            isEnabled
                              ? 'bg-teal-500 text-white'
                              : 'bg-gray-700 text-gray-500'
                          }`}>
                            {isEnabled ? (
                              <Check className="w-3 h-3" />
                            ) : (
                              <X className="w-3 h-3" />
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                          {perm.description}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Info Box */}
      <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-blue-400 mt-0.5" />
          <div>
            <p className="text-blue-400 font-medium">Bilgi</p>
            <ul className="text-sm text-blue-400/70 mt-1 space-y-1">
              <li>• Admin rolünün yetkileri değiştirilemez (tam erişim)</li>
              <li>• Değişiklikler kaydedildikten sonra kullanıcı yeniden giriş yapmalıdır</li>
              <li>• &quot;Varsayılana Sıfırla&quot; tüm özelleştirmeleri kaldırır</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
