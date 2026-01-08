'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, Plus, Search, MoreVertical, Shield, Mail, Phone,
  UserCog, UserX, UserCheck, Key, X, Check, AlertCircle
} from 'lucide-react'
import { adminApi } from '@/lib/adminApi'
import { useAuthStore, UserRole } from '@/lib/adminAuth'
import { cn } from '@/lib/utils'

interface User {
  id: string
  email: string
  full_name: string
  role: string
  status: string
  phone: string | null
  last_login: string | null
  created_at: string
}

const ROLES = [
  { value: 'admin', label: 'Admin', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  { value: 'manager', label: 'Yönetici', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { value: 'reception', label: 'Resepsiyon', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  { value: 'editor', label: 'Editör', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
]

const STATUS = [
  { value: 'active', label: 'Aktif', color: 'bg-green-500/20 text-green-400' },
  { value: 'inactive', label: 'Pasif', color: 'bg-gray-500/20 text-gray-400' },
  { value: 'suspended', label: 'Askıya Alınmış', color: 'bg-red-500/20 text-red-400' },
]

export default function AdminUsersPage() {
  const { user: currentUser } = useAuthStore()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState<string | null>(null)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  // Create user form
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'editor',
    phone: ''
  })
  const [newPassword, setNewPassword] = useState('')
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    const response = await adminApi.getUsers()
    if (response.data) {
      setUsers(response.data.users)
    }
    setLoading(false)
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    
    const response = await adminApi.createUser(newUser)
    if (response.error) {
      setMessage({ type: 'error', text: response.error })
    } else {
      setMessage({ type: 'success', text: 'Kullanıcı başarıyla oluşturuldu' })
      setShowCreateModal(false)
      setNewUser({ email: '', password: '', full_name: '', role: 'editor', phone: '' })
      loadUsers()
    }
    setFormLoading(false)
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!showPasswordModal) return
    setFormLoading(true)
    
    const response = await adminApi.resetUserPassword(showPasswordModal, newPassword)
    if (response.error) {
      setMessage({ type: 'error', text: response.error })
    } else {
      setMessage({ type: 'success', text: 'Şifre başarıyla sıfırlandı' })
      setShowPasswordModal(null)
      setNewPassword('')
    }
    setFormLoading(false)
  }

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const response = currentStatus === 'active' 
      ? await adminApi.deactivateUser(userId)
      : await adminApi.activateUser(userId)
    
    if (response.error) {
      setMessage({ type: 'error', text: response.error })
    } else {
      setMessage({ type: 'success', text: `Kullanıcı ${currentStatus === 'active' ? 'devre dışı bırakıldı' : 'aktifleştirildi'}` })
      loadUsers()
    }
    setActiveMenu(null)
  }

  const filteredUsers = users.filter(u => 
    u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getRoleBadge = (role: string) => {
    const r = ROLES.find(r => r.value === role)
    return r ? (
      <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium border', r.color)}>
        {r.label}
      </span>
    ) : role
  }

  const getStatusBadge = (status: string) => {
    const s = STATUS.find(s => s.value === status)
    return s ? (
      <span className={cn('px-2 py-0.5 rounded-full text-xs', s.color)}>
        {s.label}
      </span>
    ) : status
  }

  // Check if current user is admin
  const isAdmin = currentUser?.role === 'admin'

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Erişim Engellendi</h2>
          <p className="text-gray-400">Bu sayfayı görüntülemek için Admin yetkisi gerekli.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Message Toast */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={cn(
              'fixed top-4 right-4 z-50 px-4 py-3 rounded-xl flex items-center gap-3',
              message.type === 'success' ? 'bg-green-500/20 border border-green-500/30 text-green-400' : 'bg-red-500/20 border border-red-500/30 text-red-400'
            )}
          >
            {message.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {message.text}
            <button onClick={() => setMessage(null)}><X className="w-4 h-4" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Users className="w-7 h-7 text-teal-400" />
            Kullanıcı Yönetimi
          </h1>
          <p className="text-gray-400 mt-1">Sistem kullanıcılarını yönetin</p>
        </div>
        
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl text-white font-medium hover:shadow-lg hover:shadow-teal-500/25 transition-all"
        >
          <Plus className="w-5 h-5" />
          Yeni Kullanıcı
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Kullanıcı ara..."
          className="w-full bg-gray-900/50 border border-gray-800 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:border-teal-500 focus:outline-none"
        />
      </div>

      {/* Users Table */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Kullanıcı bulunamadı</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Kullanıcı</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Rol</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Durum</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Son Giriş</th>
                  <th className="text-right py-4 px-6 text-sm font-medium text-gray-400">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white font-semibold">
                          {user.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white font-medium">{user.full_name}</p>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">{getRoleBadge(user.role)}</td>
                    <td className="py-4 px-6">{getStatusBadge(user.status)}</td>
                    <td className="py-4 px-6 text-sm text-gray-400">
                      {user.last_login 
                        ? new Date(user.last_login).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
                        : 'Hiç'
                      }
                    </td>
                    <td className="py-4 px-6">
                      <div className="relative flex justify-end">
                        <button
                          onClick={() => setActiveMenu(activeMenu === user.id ? null : user.id)}
                          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                          disabled={user.id === currentUser?.id}
                        >
                          <MoreVertical className={cn("w-5 h-5", user.id === currentUser?.id ? "text-gray-600" : "text-gray-400")} />
                        </button>
                        
                        <AnimatePresence>
                          {activeMenu === user.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="absolute right-0 top-10 w-48 bg-gray-800 border border-gray-700 rounded-xl shadow-xl z-10 overflow-hidden"
                            >
                              <button
                                onClick={() => { setShowPasswordModal(user.id); setActiveMenu(null) }}
                                className="flex items-center gap-2 w-full px-4 py-3 text-sm text-gray-300 hover:bg-gray-700"
                              >
                                <Key className="w-4 h-4" />
                                Şifre Sıfırla
                              </button>
                              <button
                                onClick={() => handleToggleStatus(user.id, user.status)}
                                className={cn(
                                  "flex items-center gap-2 w-full px-4 py-3 text-sm",
                                  user.status === 'active' 
                                    ? "text-red-400 hover:bg-red-500/10"
                                    : "text-green-400 hover:bg-green-500/10"
                                )}
                              >
                                {user.status === 'active' ? (
                                  <><UserX className="w-4 h-4" /> Devre Dışı Bırak</>
                                ) : (
                                  <><UserCheck className="w-4 h-4" /> Aktifleştir</>
                                )}
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Yeni Kullanıcı</h3>
                <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Ad Soyad</label>
                  <input
                    type="text"
                    value={newUser.full_name}
                    onChange={(e) => setNewUser({...newUser, full_name: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">E-posta</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Şifre</label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 focus:outline-none"
                    minLength={8}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Rol</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 focus:outline-none"
                  >
                    {ROLES.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Telefon (Opsiyonel)</label>
                  <input
                    type="tel"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 focus:outline-none"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={formLoading}
                  className="w-full py-3 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl text-white font-semibold hover:shadow-lg hover:shadow-teal-500/25 transition-all disabled:opacity-50"
                >
                  {formLoading ? 'Oluşturuluyor...' : 'Kullanıcı Oluştur'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            onClick={() => setShowPasswordModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-sm p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Şifre Sıfırla</h3>
                <button onClick={() => setShowPasswordModal(null)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Yeni Şifre</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 focus:outline-none"
                    minLength={8}
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={formLoading}
                  className="w-full py-3 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl text-white font-semibold hover:shadow-lg hover:shadow-teal-500/25 transition-all disabled:opacity-50"
                >
                  {formLoading ? 'Sıfırlanıyor...' : 'Şifreyi Sıfırla'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
