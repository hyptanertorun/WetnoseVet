'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Mail, Inbox, Eye, EyeOff, Trash2, Search, Filter, RefreshCw,
  ChevronLeft, ChevronRight, Clock, User, Phone, MessageSquare,
  Check, Archive, Send, Loader2, X, AlertCircle, MailOpen
} from 'lucide-react'
import { adminApi } from '@/lib/adminApi'
import { cn } from '@/lib/utils'

interface ContactMessage {
  id: string
  name: string
  email: string
  phone: string | null
  subject: string
  message: string
  status: string
  created_at: string
  read_at: string | null
  replied_at: string | null
}

interface ContactStats {
  total: number
  new: number
  read: number
  replied: number
  archived: number
}

const STATUS_COLORS = {
  new: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Yeni' },
  read: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Okundu' },
  replied: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Yanıtlandı' },
  archived: { bg: 'bg-gray-500/20', text: 'text-gray-400', label: 'Arşiv' },
}

export default function ContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [stats, setStats] = useState<ContactStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
  
  // Filters
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 10
  
  // Actions
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [messagesRes, statsRes] = await Promise.all([
        adminApi.getContactMessages({ page, limit, status: statusFilter || undefined, search: search || undefined }),
        adminApi.getContactStats()
      ])
      
      if (messagesRes.data) {
        setMessages(messagesRes.data.messages)
        setTotal(messagesRes.data.total)
      }
      if (statsRes.data) {
        setStats(statsRes.data)
      }
    } catch (err) {
      setError('Veriler yüklenemedi')
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter, search])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [success])

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  const handleViewMessage = async (msg: ContactMessage) => {
    setSelectedMessage(msg)
    // Mark as read if new
    if (msg.status === 'new') {
      await adminApi.getContactMessage(msg.id)
      fetchData() // Refresh to update stats
    }
  }

  const handleStatusChange = async (messageId: string, status: string) => {
    setActionLoading(messageId)
    try {
      await adminApi.updateContactStatus(messageId, status)
      setSuccess('Durum güncellendi')
      fetchData()
      if (selectedMessage?.id === messageId) {
        setSelectedMessage({ ...selectedMessage, status })
      }
    } catch {
      setError('Durum güncellenemedi')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (messageId: string) => {
    if (!confirm('Bu mesajı silmek istediğinize emin misiniz?')) return
    
    setActionLoading(messageId)
    try {
      await adminApi.deleteContactMessage(messageId)
      setSuccess('Mesaj silindi')
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(null)
      }
      fetchData()
    } catch {
      setError('Mesaj silinemedi')
    } finally {
      setActionLoading(null)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Mail className="w-7 h-7 text-teal-400" />
            İletişim Mesajları
          </h1>
          <p className="text-gray-400 mt-1">Web sitesi üzerinden gelen mesajları yönetin</p>
        </div>
        
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-gray-300 transition-colors"
        >
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          Yenile
        </button>
      </div>

      {/* Messages */}
      <AnimatePresence>
        {(success || error) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              "p-4 rounded-lg flex items-center gap-3",
              success ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"
            )}
          >
            {success ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span>{success || error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-500/20 rounded-lg">
                <Inbox className="w-5 h-5 text-teal-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
                <p className="text-xs text-gray-400">Toplam</p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Mail className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.new}</p>
                <p className="text-xs text-gray-400">Yeni</p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <MailOpen className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.read}</p>
                <p className="text-xs text-gray-400">Okundu</p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Send className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.replied}</p>
                <p className="text-xs text-gray-400">Yanıtlandı</p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-500/20 rounded-lg">
                <Archive className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.archived}</p>
                <p className="text-xs text-gray-400">Arşiv</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Ad, e-posta veya konu ara..."
            className="w-full px-4 py-2.5 pl-10 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-teal-500 focus:outline-none"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          className="px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-teal-500 focus:outline-none min-w-[150px]"
        >
          <option value="">Tüm Durumlar</option>
          <option value="new">Yeni</option>
          <option value="read">Okundu</option>
          <option value="replied">Yanıtlandı</option>
          <option value="archived">Arşiv</option>
        </select>
      </div>

      {/* Messages List */}
      <div className="bg-gray-800/30 rounded-xl border border-gray-700/50 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="p-12 text-center">
            <Mail className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">Mesaj bulunamadı</h3>
            <p className="text-gray-500">Henüz iletişim mesajı yok veya filtrelere uygun mesaj bulunamadı.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-700/50">
            {messages.map((msg) => {
              const statusStyle = STATUS_COLORS[msg.status as keyof typeof STATUS_COLORS] || STATUS_COLORS.new
              return (
                <div
                  key={msg.id}
                  className={cn(
                    "p-4 hover:bg-gray-800/30 transition-colors cursor-pointer",
                    msg.status === 'new' && "bg-blue-500/5"
                  )}
                  onClick={() => handleViewMessage(msg)}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                      msg.status === 'new' ? "bg-blue-500/20" : "bg-gray-700/50"
                    )}>
                      {msg.status === 'new' ? (
                        <Mail className="w-5 h-5 text-blue-400" />
                      ) : (
                        <MailOpen className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={cn(
                          "font-medium truncate",
                          msg.status === 'new' ? "text-white" : "text-gray-300"
                        )}>
                          {msg.name}
                        </h3>
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-xs",
                          statusStyle.bg, statusStyle.text
                        )}>
                          {statusStyle.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mb-1">{msg.email}</p>
                      <p className={cn(
                        "text-sm truncate",
                        msg.status === 'new' ? "text-gray-200 font-medium" : "text-gray-400"
                      )}>
                        {msg.subject}
                      </p>
                    </div>
                    
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-gray-500">{formatDate(msg.created_at)}</p>
                      <div className="flex items-center gap-1 mt-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(msg.id) }}
                          disabled={actionLoading === msg.id}
                          className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded transition-colors"
                        >
                          {actionLoading === msg.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">
            {total} mesajdan {((page - 1) * limit) + 1}-{Math.min(page * limit, total)} gösteriliyor
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 hover:text-white disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-400">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 hover:text-white disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Message Detail Modal */}
      <AnimatePresence>
        {selectedMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedMessage(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl bg-gray-900 rounded-2xl border border-gray-700 overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-800">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-1">{selectedMessage.subject}</h2>
                    <p className="text-sm text-gray-400">{formatDate(selectedMessage.created_at)}</p>
                  </div>
                  <button
                    onClick={() => setSelectedMessage(null)}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {/* Sender Info */}
              <div className="p-6 border-b border-gray-800 bg-gray-800/30">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-teal-500/20 flex items-center justify-center">
                    <User className="w-6 h-6 text-teal-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{selectedMessage.name}</h3>
                    <p className="text-sm text-gray-400">{selectedMessage.email}</p>
                    {selectedMessage.phone && (
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <Phone className="w-3 h-3" />
                        {selectedMessage.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Message Content */}
              <div className="p-6">
                <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {selectedMessage.message}
                </p>
              </div>
              
              {/* Actions */}
              <div className="p-6 border-t border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">Durum:</span>
                  <select
                    value={selectedMessage.status}
                    onChange={(e) => handleStatusChange(selectedMessage.id, e.target.value)}
                    className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:border-teal-500 focus:outline-none"
                  >
                    <option value="new">Yeni</option>
                    <option value="read">Okundu</option>
                    <option value="replied">Yanıtlandı</option>
                    <option value="archived">Arşiv</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-2">
                  <a
                    href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 rounded-lg text-white font-medium transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    Yanıtla
                  </a>
                  <button
                    onClick={() => handleDelete(selectedMessage.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Sil
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
