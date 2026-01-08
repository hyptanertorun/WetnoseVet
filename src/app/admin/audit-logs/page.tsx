'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Shield, Search, Filter, User, Clock, FileText,
  LogIn, LogOut, UserPlus, UserMinus, Settings, Key,
  ChevronDown, ChevronUp, RefreshCcw
} from 'lucide-react'
import { adminApi } from '@/lib/adminApi'
import { cn } from '@/lib/utils'

interface AuditLog {
  id: string
  actor_user_id: string | null
  actor_email: string | null
  actor_role: string | null
  entity_type: string
  entity_id: string | null
  action: string
  before_state: Record<string, unknown> | null
  after_state: Record<string, unknown> | null
  metadata: Record<string, unknown> | null
  ip_address: string | null
  timestamp: string
  success: boolean
}

const ACTION_ICONS: Record<string, React.ElementType> = {
  login: LogIn,
  logout: LogOut,
  login_failed: LogIn,
  create: UserPlus,
  update: Settings,
  delete: UserMinus,
  activate: UserPlus,
  deactivate: UserMinus,
  password_reset: Key,
  role_change: User,
  token_refresh: RefreshCcw,
}

const ACTION_COLORS: Record<string, string> = {
  login: 'bg-green-500/20 text-green-400 border-green-500/30',
  logout: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  login_failed: 'bg-red-500/20 text-red-400 border-red-500/30',
  create: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  update: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  delete: 'bg-red-500/20 text-red-400 border-red-500/30',
  activate: 'bg-green-500/20 text-green-400 border-green-500/30',
  deactivate: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  password_reset: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  role_change: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  token_refresh: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
}

const ACTION_LABELS: Record<string, string> = {
  login: 'Giriş',
  logout: 'Çıkış',
  login_failed: 'Başarısız Giriş',
  create: 'Oluşturma',
  update: 'Güncelleme',
  delete: 'Silme',
  activate: 'Aktivasyon',
  deactivate: 'Deaktivasyon',
  password_reset: 'Şifre Sıfırlama',
  role_change: 'Rol Değişikliği',
  token_refresh: 'Token Yenileme',
}

const ENTITY_LABELS: Record<string, string> = {
  auth: 'Kimlik Doğrulama',
  user: 'Kullanıcı',
  settings: 'Ayarlar',
  service: 'Hizmet',
  team: 'Ekip',
  blog: 'Blog',
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [expandedLog, setExpandedLog] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    entity_type: '',
    action: '',
  })

  useEffect(() => {
    loadLogs()
  }, [page, filters])

  const loadLogs = async () => {
    setLoading(true)
    const response = await adminApi.getAuditLogs(page, 25, {
      entity_type: filters.entity_type || undefined,
      action: filters.action || undefined,
    })
    if (response.data) {
      setLogs(response.data.logs)
      setTotal(response.data.total)
    }
    setLoading(false)
  }

  const totalPages = Math.ceil(total / 25)

  const formatTimestamp = (ts: string) => {
    const date = new Date(ts)
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Shield className="w-7 h-7 text-teal-400" />
          Audit Logları
        </h1>
        <p className="text-gray-400 mt-1">Sistem aktivitelerini izleyin</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <select
            value={filters.entity_type}
            onChange={(e) => { setFilters({...filters, entity_type: e.target.value}); setPage(1) }}
            className="bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-white focus:border-teal-500 focus:outline-none appearance-none min-w-[150px]"
          >
            <option value="">Tüm Varlıklar</option>
            <option value="auth">Kimlik Doğrulama</option>
            <option value="user">Kullanıcı</option>
            <option value="settings">Ayarlar</option>
          </select>
        </div>
        
        <div className="relative">
          <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <select
            value={filters.action}
            onChange={(e) => { setFilters({...filters, action: e.target.value}); setPage(1) }}
            className="bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-white focus:border-teal-500 focus:outline-none appearance-none min-w-[150px]"
          >
            <option value="">Tüm İşlemler</option>
            <option value="login">Giriş</option>
            <option value="logout">Çıkış</option>
            <option value="create">Oluşturma</option>
            <option value="update">Güncelleme</option>
            <option value="password_reset">Şifre Sıfırlama</option>
          </select>
        </div>
        
        <button
          onClick={() => { setFilters({ entity_type: '', action: '' }); setPage(1) }}
          className="px-4 py-2.5 text-gray-400 hover:text-white transition-colors"
        >
          Filtreleri Temizle
        </button>
      </div>

      {/* Logs List */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center">
            <Shield className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Audit log bulunamadı</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {logs.map((log) => {
              const Icon = ACTION_ICONS[log.action] || FileText
              const isExpanded = expandedLog === log.id
              
              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-800/30"
                >
                  <button
                    onClick={() => setExpandedLog(isExpanded ? null : log.id)}
                    className="w-full px-6 py-4 flex items-center gap-4 text-left"
                  >
                    {/* Icon */}
                    <div className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center border',
                      ACTION_COLORS[log.action] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                    )}>
                      <Icon className="w-5 h-5" />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={cn(
                          'px-2 py-0.5 rounded text-xs font-medium border',
                          ACTION_COLORS[log.action] || 'bg-gray-500/20 text-gray-400'
                        )}>
                          {ACTION_LABELS[log.action] || log.action}
                        </span>
                        <span className="text-xs text-gray-500 px-2 py-0.5 rounded bg-gray-800">
                          {ENTITY_LABELS[log.entity_type] || log.entity_type}
                        </span>
                        {!log.success && (
                          <span className="text-xs text-red-400 px-2 py-0.5 rounded bg-red-500/10">
                            Başarısız
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 mt-1">
                        {log.actor_email ? (
                          <span className="text-white">{log.actor_email}</span>
                        ) : (
                          <span className="text-gray-500">Sistem</span>
                        )}
                        {log.entity_id && (
                          <span className="text-gray-500"> → {log.entity_id.slice(0, 8)}...</span>
                        )}
                      </p>
                    </div>
                    
                    {/* Timestamp & IP */}
                    <div className="text-right hidden sm:block">
                      <p className="text-sm text-gray-400 flex items-center gap-1 justify-end">
                        <Clock className="w-3 h-3" />
                        {formatTimestamp(log.timestamp)}
                      </p>
                      {log.ip_address && (
                        <p className="text-xs text-gray-600">{log.ip_address}</p>
                      )}
                    </div>
                    
                    {/* Expand */}
                    {(log.before_state || log.after_state || log.metadata) && (
                      <div className="text-gray-500">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    )}
                  </button>
                  
                  {/* Expanded Details */}
                  {isExpanded && (log.before_state || log.after_state || log.metadata) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-6 pb-4"
                    >
                      <div className="ml-14 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {log.before_state && Object.keys(log.before_state).length > 0 && (
                          <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
                            <p className="text-xs text-red-400 font-medium mb-2">Önceki Durum</p>
                            <pre className="text-xs text-gray-400 overflow-auto">
                              {JSON.stringify(log.before_state, null, 2)}
                            </pre>
                          </div>
                        )}
                        {log.after_state && Object.keys(log.after_state).length > 0 && (
                          <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4">
                            <p className="text-xs text-green-400 font-medium mb-2">Sonraki Durum</p>
                            <pre className="text-xs text-gray-400 overflow-auto">
                              {JSON.stringify(log.after_state, null, 2)}
                            </pre>
                          </div>
                        )}
                        {log.metadata && Object.keys(log.metadata).length > 0 && (
                          <div className="bg-gray-500/5 border border-gray-500/20 rounded-xl p-4 md:col-span-2">
                            <p className="text-xs text-gray-400 font-medium mb-2">Ek Bilgi</p>
                            <pre className="text-xs text-gray-400 overflow-auto">
                              {JSON.stringify(log.metadata, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )
            })}
          </div>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-800 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Toplam {total} kayıt
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg bg-gray-800 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Önceki
              </button>
              <span className="text-sm text-gray-400">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg bg-gray-800 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sonraki
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
