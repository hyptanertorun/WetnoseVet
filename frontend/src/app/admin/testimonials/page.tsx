'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageSquare, Star, Filter, Search, CheckCircle, XCircle, 
  Archive, RotateCcw, Trash2, Eye, Edit3, ChevronDown, X,
  AlertTriangle, TrendingUp, Users, ThumbsUp, ThumbsDown,
  Phone, Mail, Calendar, Clock, ExternalLink, Copy, Check, Plus, Upload, Image as ImageIcon
} from 'lucide-react'
import { adminApi } from '@/lib/adminApi'
import { useAuthStore, hasPermission } from '@/lib/adminAuth'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import ImageUploadCropper from '@/components/admin/ImageUploadCropper'

interface Testimonial {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  pet_name: string
  pet_photo_url: string | null
  service_id: string | null
  service_name_snapshot: string | null
  rating: number
  feedback_type: string
  comment: string
  consent_internal: boolean
  consent_public: boolean
  status: string
  admin_note: string | null
  submitted_at: string
  approved_at: string | null
  approved_by: string | null
  approved_by_email: string | null
  source: string
  archived_at: string | null
  sort_order: number
}

interface Analytics {
  overall_avg_rating: number
  last_30_days_avg_rating: number
  total_count: number
  rating_distribution: Array<{ rating: number; count: number; percentage: number }>
  positive_count: number
  neutral_count: number
  negative_count: number
  positive_ratio: number
  attention_needed_count: number
  pending_count: number
}

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || ''

export default function AdminTestimonialsPage() {
  const { user } = useAuthStore()
  const canEdit = user && hasPermission(user.role, 'content:write')
  const canDelete = user && (user.role === 'admin' || user.role === 'manager')
  
  // Data state
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  
  // Filter state
  const [statusFilter, setStatusFilter] = useState('')
  const [ratingFilter, setRatingFilter] = useState('')
  const [feedbackTypeFilter, setFeedbackTypeFilter] = useState('')
  const [consentPublicFilter, setConsentPublicFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showArchived, setShowArchived] = useState(false)
  
  // UI state
  const [isLoading, setIsLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  
  // Edit state
  const [editMode, setEditMode] = useState(false)
  const [editComment, setEditComment] = useState('')
  const [editAdminNote, setEditAdminNote] = useState('')
  
  // Create new testimonial state
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newTestimonial, setNewTestimonial] = useState({
    full_name: '',
    pet_name: '',
    pet_type: '',
    pet_photo_url: '',
    owner_photo_url: '',
    rating: 5,
    comment: '',
    treatment: '',
    feedback_type: 'positive'
  })
  const [createLoading, setCreateLoading] = useState(false)
  
  // Load data
  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [testimonialsRes, analyticsRes] = await Promise.all([
        adminApi.getTestimonials(page, pageSize, {
          status: statusFilter || undefined,
          rating: ratingFilter ? parseInt(ratingFilter) : undefined,
          feedback_type: feedbackTypeFilter || undefined,
          consent_public: consentPublicFilter ? consentPublicFilter === 'true' : undefined,
          search: searchQuery || undefined,
          include_archived: showArchived,
          sort_by: 'submitted_at',
          sort_order: 'desc'
        }),
        adminApi.getTestimonialAnalytics()
      ])
      
      if (testimonialsRes.data) {
        setTestimonials(testimonialsRes.data.testimonials)
        setTotal(testimonialsRes.data.total)
      }
      
      if (analyticsRes.data) {
        setAnalytics(analyticsRes.data)
      }
    } catch (error) {
      console.error('Error loading testimonials:', error)
    } finally {
      setIsLoading(false)
    }
  }, [page, pageSize, statusFilter, ratingFilter, feedbackTypeFilter, consentPublicFilter, searchQuery, showArchived])
  
  useEffect(() => {
    loadData()
  }, [loadData])
  
  // Handlers
  const handleStatusChange = async (id: string, status: string) => {
    const res = await adminApi.updateTestimonialStatus(id, status)
    if (!res.error) {
      loadData()
      if (selectedTestimonial?.id === id) {
        setSelectedTestimonial({ ...selectedTestimonial, status })
      }
    }
  }
  
  const handleBulkAction = async (action: 'approve' | 'reject' | 'archive') => {
    if (selectedIds.length === 0) return
    
    const res = await adminApi.bulkTestimonialAction(selectedIds, action)
    if (!res.error) {
      setSelectedIds([])
      loadData()
    }
  }
  
  const handleSaveEdit = async () => {
    if (!selectedTestimonial) return
    
    const res = await adminApi.updateTestimonial(selectedTestimonial.id, {
      comment: editComment,
      admin_note: editAdminNote || null
    })
    
    if (!res.error) {
      setEditMode(false)
      loadData()
      setSelectedTestimonial({ ...selectedTestimonial, comment: editComment, admin_note: editAdminNote })
    }
  }
  
  const handleArchive = async (id: string) => {
    const res = await adminApi.archiveTestimonial(id)
    if (!res.error) {
      loadData()
      setSelectedTestimonial(null)
    }
  }
  
  const handleRestore = async (id: string) => {
    const res = await adminApi.restoreTestimonial(id)
    if (!res.error) {
      loadData()
    }
  }
  
  const handleDelete = async (id: string) => {
    if (!confirm('Bu yorumu kalıcı olarak silmek istediğinize emin misiniz?')) return
    
    const res = await adminApi.deleteTestimonial(id)
    if (!res.error) {
      loadData()
      setSelectedTestimonial(null)
    }
  }
  
  const copyFeedbackLink = () => {
    const link = `${window.location.origin}/geri-bildirim`
    navigator.clipboard.writeText(link)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }
  
  // Create new testimonial
  const handleCreateTestimonial = async () => {
    if (!newTestimonial.full_name || !newTestimonial.pet_name || !newTestimonial.comment) {
      alert('Lütfen zorunlu alanları doldurun')
      return
    }
    
    setCreateLoading(true)
    try {
      const res = await adminApi.createTestimonial({
        ...newTestimonial,
        consent_internal: true,
        consent_public: true,
        status: 'approved'
      })
      
      if (!res.error) {
        setShowCreateModal(false)
        setNewTestimonial({
          full_name: '',
          pet_name: '',
          pet_type: '',
          pet_photo_url: '',
          owner_photo_url: '',
          rating: 5,
          comment: '',
          treatment: '',
          feedback_type: 'positive'
        })
        loadData()
      } else {
        alert('Yorum oluşturulurken hata: ' + res.error)
      }
    } catch (err) {
      alert('Yorum oluşturulurken hata oluştu')
    }
    setCreateLoading(false)
  }
  
  const openDetail = (t: Testimonial) => {
    setSelectedTestimonial(t)
    setEditComment(t.comment)
    setEditAdminNote(t.admin_note || '')
    setEditMode(false)
  }
  
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }
  
  const selectAll = () => {
    if (selectedIds.length === testimonials.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(testimonials.map(t => t.id))
    }
  }
  
  // Render helpers
  const renderStars = (rating: number, size = 'w-4 h-4') => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star 
          key={i} 
          className={`${size} ${i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} 
        />
      ))}
    </div>
  )
  
  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      approved: 'bg-green-500/20 text-green-400 border-green-500/30',
      rejected: 'bg-red-500/20 text-red-400 border-red-500/30'
    }
    const labels: Record<string, string> = {
      pending: 'Beklemede',
      approved: 'Onaylandı',
      rejected: 'Reddedildi'
    }
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs border ${styles[status] || styles.pending}`}>
        {labels[status] || status}
      </span>
    )
  }
  
  const getFeedbackTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      positive: 'bg-green-500/20 text-green-400',
      neutral: 'bg-gray-500/20 text-gray-400',
      negative: 'bg-red-500/20 text-red-400'
    }
    const emojis: Record<string, string> = {
      positive: '😊',
      neutral: '😐',
      negative: '😔'
    }
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs ${styles[type] || styles.neutral}`}>
        {emojis[type] || '😐'}
      </span>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <MessageSquare className="w-7 h-7 text-teal-400" />
            Yorumlar
          </h1>
          <p className="text-gray-400 mt-1">Müşteri geri bildirimleri ve değerlendirmeleri</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-medium hover:shadow-lg hover:shadow-teal-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            Yeni Yorum Ekle
          </button>
          <button
            onClick={copyFeedbackLink}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500/20 text-teal-400 hover:bg-teal-500/30 transition-colors"
          >
            {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copiedLink ? 'Kopyalandı!' : 'Form Linki'}
          </button>
        </div>
      </div>
      
      {/* Create Testimonial Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Yeni Yorum Ekle</h2>
                <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Sahip Adı *</label>
                    <input
                      type="text"
                      value={newTestimonial.full_name}
                      onChange={(e) => setNewTestimonial(prev => ({ ...prev, full_name: e.target.value }))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white"
                      placeholder="Ayşe Yılmaz"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Hayvan Adı *</label>
                    <input
                      type="text"
                      value={newTestimonial.pet_name}
                      onChange={(e) => setNewTestimonial(prev => ({ ...prev, pet_name: e.target.value }))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white"
                      placeholder="Boncuk"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Hayvan Türü</label>
                    <input
                      type="text"
                      value={newTestimonial.pet_type}
                      onChange={(e) => setNewTestimonial(prev => ({ ...prev, pet_type: e.target.value }))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white"
                      placeholder="Golden Retriever"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Tedavi / Hizmet</label>
                    <input
                      type="text"
                      value={newTestimonial.treatment}
                      onChange={(e) => setNewTestimonial(prev => ({ ...prev, treatment: e.target.value }))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white"
                      placeholder="Kalp Cerrahisi"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Puan</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewTestimonial(prev => ({ ...prev, rating: star }))}
                        className="p-1"
                      >
                        <Star
                          className={`w-8 h-8 ${star <= newTestimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Yorum *</label>
                  <textarea
                    value={newTestimonial.comment}
                    onChange={(e) => setNewTestimonial(prev => ({ ...prev, comment: e.target.value }))}
                    rows={4}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white resize-none"
                    placeholder="Müşterinin yorumunu yazın..."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                      <ImageIcon className="w-4 h-4" /> Hayvan Fotoğrafı
                    </label>
                    <ImageUploadCropper
                      value={newTestimonial.pet_photo_url}
                      onChange={(url) => setNewTestimonial(prev => ({ ...prev, pet_photo_url: url }))}
                      aspectPreset="1:1"
                      uploadContext="testimonials"
                      hideAI
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                      <ImageIcon className="w-4 h-4" /> Sahip Fotoğrafı
                    </label>
                    <ImageUploadCropper
                      value={newTestimonial.owner_photo_url}
                      onChange={(url) => setNewTestimonial(prev => ({ ...prev, owner_photo_url: url }))}
                      aspectPreset="1:1"
                      uploadContext="testimonials"
                      hideAI
                    />
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-800 flex justify-end gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white"
                >
                  İptal
                </button>
                <button
                  onClick={handleCreateTestimonial}
                  disabled={createLoading}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl font-medium disabled:opacity-50"
                >
                  {createLoading ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
              <Star className="w-4 h-4" />
              Genel Puan
            </div>
            <div className="text-2xl font-bold text-white">{analytics.overall_avg_rating.toFixed(1)}</div>
            {renderStars(Math.round(analytics.overall_avg_rating), 'w-3 h-3')}
          </div>
          
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
              <TrendingUp className="w-4 h-4" />
              Son 30 Gün
            </div>
            <div className="text-2xl font-bold text-white">{analytics.last_30_days_avg_rating.toFixed(1)}</div>
          </div>
          
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
              <Users className="w-4 h-4" />
              Toplam
            </div>
            <div className="text-2xl font-bold text-white">{analytics.total_count}</div>
          </div>
          
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
              <ThumbsUp className="w-4 h-4 text-green-400" />
              Olumlu
            </div>
            <div className="text-2xl font-bold text-green-400">{analytics.positive_ratio.toFixed(0)}%</div>
          </div>
          
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
              <Clock className="w-4 h-4 text-yellow-400" />
              Bekleyen
            </div>
            <div className="text-2xl font-bold text-yellow-400">{analytics.pending_count}</div>
          </div>
          
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              Dikkat
            </div>
            <div className="text-2xl font-bold text-red-400">{analytics.attention_needed_count}</div>
          </div>
        </div>
      )}
      
      {/* Filters & Actions */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="İsim, yorum veya e-posta ile ara..."
              className="w-full bg-gray-800/50 border border-gray-700 rounded-xl pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:border-teal-500 focus:outline-none"
            />
          </div>
          
          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-colors ${
              showFilters ? 'bg-teal-500/20 border-teal-500/30 text-teal-400' : 'border-gray-700 text-gray-400 hover:border-gray-600'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filtreler
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
          
          {/* Bulk Actions */}
          {selectedIds.length > 0 && canEdit && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">{selectedIds.length} seçili</span>
              <button
                onClick={() => handleBulkAction('approve')}
                className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30"
                title="Toplu Onayla"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleBulkAction('reject')}
                className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30"
                title="Toplu Reddet"
              >
                <XCircle className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleBulkAction('archive')}
                className="p-2 rounded-lg bg-gray-500/20 text-gray-400 hover:bg-gray-500/30"
                title="Toplu Arşivle"
              >
                <Archive className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
        
        {/* Filter Options */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4 mt-4 border-t border-gray-800">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-gray-800/50 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:border-teal-500 focus:outline-none"
                >
                  <option value="">Tüm Durumlar</option>
                  <option value="pending">Beklemede</option>
                  <option value="approved">Onaylandı</option>
                  <option value="rejected">Reddedildi</option>
                </select>
                
                <select
                  value={ratingFilter}
                  onChange={(e) => setRatingFilter(e.target.value)}
                  className="bg-gray-800/50 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:border-teal-500 focus:outline-none"
                >
                  <option value="">Tüm Puanlar</option>
                  <option value="5">5 Yıldız</option>
                  <option value="4">4 Yıldız</option>
                  <option value="3">3 Yıldız</option>
                  <option value="2">2 Yıldız</option>
                  <option value="1">1 Yıldız</option>
                </select>
                
                <select
                  value={feedbackTypeFilter}
                  onChange={(e) => setFeedbackTypeFilter(e.target.value)}
                  className="bg-gray-800/50 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:border-teal-500 focus:outline-none"
                >
                  <option value="">Tüm Tipler</option>
                  <option value="positive">😊 Olumlu</option>
                  <option value="neutral">😐 Nötr</option>
                  <option value="negative">😔 Olumsuz</option>
                </select>
                
                <select
                  value={consentPublicFilter}
                  onChange={(e) => setConsentPublicFilter(e.target.value)}
                  className="bg-gray-800/50 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:border-teal-500 focus:outline-none"
                >
                  <option value="">Yayın İzni</option>
                  <option value="true">✓ İzin Var</option>
                  <option value="false">✗ İzin Yok</option>
                </select>
                
                <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showArchived}
                    onChange={(e) => setShowArchived(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-teal-500"
                  />
                  Arşivlenenleri Göster
                </label>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Table */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="p-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === testimonials.length && testimonials.length > 0}
                    onChange={selectAll}
                    className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-teal-500"
                  />
                </th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">İsim</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Hayvan</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Hizmet</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Puan</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Tip</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Yayın</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Durum</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Tarih</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-gray-500">
                    Yükleniyor...
                  </td>
                </tr>
              ) : testimonials.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-gray-500">
                    Yorum bulunamadı
                  </td>
                </tr>
              ) : (
                testimonials.map((t) => (
                  <tr 
                    key={t.id} 
                    className={`border-t border-gray-800 hover:bg-gray-800/30 transition-colors ${
                      t.rating <= 2 ? 'bg-red-500/5' : ''
                    } ${t.archived_at ? 'opacity-50' : ''}`}
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(t.id)}
                        onChange={() => toggleSelect(t.id)}
                        className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-teal-500"
                      />
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-white">{t.full_name}</div>
                      {t.email && <div className="text-xs text-gray-500">{t.email}</div>}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {t.pet_photo_url && (
                          <img 
                            src={`${API_URL}${t.pet_photo_url}`} 
                            alt={t.pet_name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        )}
                        <span className="text-gray-300">{t.pet_name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-400">
                      {t.service_name_snapshot || '-'}
                    </td>
                    <td className="p-4">
                      {renderStars(t.rating)}
                    </td>
                    <td className="p-4">
                      {getFeedbackTypeBadge(t.feedback_type)}
                    </td>
                    <td className="p-4">
                      {t.consent_public ? (
                        <span className="text-green-400 text-sm">✓</span>
                      ) : (
                        <span className="text-gray-500 text-sm">✗</span>
                      )}
                    </td>
                    <td className="p-4">
                      {getStatusBadge(t.status)}
                    </td>
                    <td className="p-4 text-sm text-gray-400">
                      {format(new Date(t.submitted_at), 'dd MMM yyyy', { locale: tr })}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openDetail(t)}
                          className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                          title="Detay"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {canEdit && !t.archived_at && (
                          <>
                            {t.status !== 'approved' && (
                              <button
                                onClick={() => handleStatusChange(t.id, 'approved')}
                                className="p-2 rounded-lg hover:bg-green-500/20 text-gray-400 hover:text-green-400 transition-colors"
                                title="Onayla"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            {t.status !== 'rejected' && (
                              <button
                                onClick={() => handleStatusChange(t.id, 'rejected')}
                                className="p-2 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                                title="Reddet"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            )}
                          </>
                        )}
                        {t.archived_at && canDelete && (
                          <button
                            onClick={() => handleRestore(t.id)}
                            className="p-2 rounded-lg hover:bg-teal-500/20 text-gray-400 hover:text-teal-400 transition-colors"
                            title="Geri Yükle"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {total > pageSize && (
          <div className="flex items-center justify-between p-4 border-t border-gray-800">
            <div className="text-sm text-gray-400">
              Toplam {total} yorum
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 rounded-lg bg-gray-800 text-gray-400 disabled:opacity-50"
              >
                Önceki
              </button>
              <span className="px-3 py-1 text-gray-400">
                Sayfa {page} / {Math.ceil(total / pageSize)}
              </span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page >= Math.ceil(total / pageSize)}
                className="px-3 py-1 rounded-lg bg-gray-800 text-gray-400 disabled:opacity-50"
              >
                Sonraki
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Detail Drawer */}
      <AnimatePresence>
        {selectedTestimonial && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setSelectedTestimonial(null)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-lg bg-gray-900 border-l border-gray-800 z-50 overflow-y-auto"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Yorum Detayı</h2>
                  <button
                    onClick={() => setSelectedTestimonial(null)}
                    className="p-2 rounded-lg hover:bg-gray-800 text-gray-400"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Customer Info */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-4">
                    {selectedTestimonial.pet_photo_url && (
                      <img
                        src={`${API_URL}${selectedTestimonial.pet_photo_url}`}
                        alt={selectedTestimonial.pet_name}
                        className="w-20 h-20 rounded-xl object-cover"
                      />
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-white">{selectedTestimonial.full_name}</h3>
                      <p className="text-gray-400">🐾 {selectedTestimonial.pet_name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {renderStars(selectedTestimonial.rating)}
                        {getFeedbackTypeBadge(selectedTestimonial.feedback_type)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {selectedTestimonial.email && (
                      <a 
                        href={`mailto:${selectedTestimonial.email}`}
                        className="flex items-center gap-1 px-3 py-1 rounded-lg bg-gray-800 text-gray-400 hover:text-white text-sm"
                      >
                        <Mail className="w-3 h-3" />
                        {selectedTestimonial.email}
                      </a>
                    )}
                    {selectedTestimonial.phone && (
                      <a 
                        href={`tel:${selectedTestimonial.phone}`}
                        className="flex items-center gap-1 px-3 py-1 rounded-lg bg-gray-800 text-gray-400 hover:text-white text-sm"
                      >
                        <Phone className="w-3 h-3" />
                        {selectedTestimonial.phone}
                      </a>
                    )}
                  </div>
                </div>
                
                {/* Status & Consent Info */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {getStatusBadge(selectedTestimonial.status)}
                  
                  <span className={`px-2 py-0.5 rounded-full text-xs border ${
                    selectedTestimonial.consent_public 
                      ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                      : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                  }`}>
                    {selectedTestimonial.consent_public ? '✓ Yayın İzni Var' : '✗ Yayın İzni Yok'}
                  </span>
                  
                  {selectedTestimonial.service_name_snapshot && (
                    <span className="px-2 py-0.5 rounded-full text-xs bg-teal-500/20 text-teal-400 border border-teal-500/30">
                      {selectedTestimonial.service_name_snapshot}
                    </span>
                  )}
                </div>
                
                {/* Important Notice */}
                {selectedTestimonial.status === 'approved' && !selectedTestimonial.consent_public && (
                  <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 mb-6">
                    <p className="text-sm text-yellow-400">
                      ⚠️ Bu yorum onaylandı ancak müşteri yayın izni vermemiş. Web sitesinde gösterilmeyecek.
                    </p>
                  </div>
                )}
                
                {/* Comment */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-400">Yorum</label>
                    {canEdit && !editMode && (
                      <button
                        onClick={() => setEditMode(true)}
                        className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" />
                        Düzenle
                      </button>
                    )}
                  </div>
                  
                  {editMode ? (
                    <textarea
                      value={editComment}
                      onChange={(e) => setEditComment(e.target.value)}
                      rows={4}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 focus:outline-none resize-none"
                    />
                  ) : (
                    <p className="text-gray-300 bg-gray-800/30 rounded-xl p-4">
                      {selectedTestimonial.comment}
                    </p>
                  )}
                </div>
                
                {/* Admin Note */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Admin Notu (Dahili)
                  </label>
                  {editMode ? (
                    <textarea
                      value={editAdminNote}
                      onChange={(e) => setEditAdminNote(e.target.value)}
                      rows={2}
                      placeholder="Dahili not ekle..."
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-teal-500 focus:outline-none resize-none"
                    />
                  ) : (
                    <p className="text-gray-400 bg-gray-800/30 rounded-xl p-4 text-sm">
                      {selectedTestimonial.admin_note || 'Not eklenmemiş'}
                    </p>
                  )}
                </div>
                
                {/* Edit Actions */}
                {editMode && (
                  <div className="flex gap-2 mb-6">
                    <button
                      onClick={handleSaveEdit}
                      className="flex-1 py-2 rounded-xl bg-teal-500 text-white font-medium hover:bg-teal-600 transition-colors"
                    >
                      Kaydet
                    </button>
                    <button
                      onClick={() => {
                        setEditMode(false)
                        setEditComment(selectedTestimonial.comment)
                        setEditAdminNote(selectedTestimonial.admin_note || '')
                      }}
                      className="px-4 py-2 rounded-xl bg-gray-700 text-white hover:bg-gray-600 transition-colors"
                    >
                      İptal
                    </button>
                  </div>
                )}
                
                {/* Meta Info */}
                <div className="text-xs text-gray-500 space-y-1 mb-6 pb-6 border-b border-gray-800">
                  <p>
                    <Calendar className="w-3 h-3 inline mr-1" />
                    Gönderilme: {format(new Date(selectedTestimonial.submitted_at), 'dd MMMM yyyy HH:mm', { locale: tr })}
                  </p>
                  {selectedTestimonial.approved_at && (
                    <p>
                      <CheckCircle className="w-3 h-3 inline mr-1" />
                      Onaylanma: {format(new Date(selectedTestimonial.approved_at), 'dd MMMM yyyy HH:mm', { locale: tr })}
                      {selectedTestimonial.approved_by_email && ` (${selectedTestimonial.approved_by_email})`}
                    </p>
                  )}
                  <p>Kaynak: {selectedTestimonial.source === 'post-treatment' ? 'Tedavi Sonrası Form' : 'Manuel'}</p>
                </div>
                
                {/* Action Buttons */}
                {!editMode && (
                  <div className="space-y-3">
                    {canEdit && selectedTestimonial.status !== 'approved' && (
                      <button
                        onClick={() => handleStatusChange(selectedTestimonial.id, 'approved')}
                        className="w-full py-3 rounded-xl bg-green-500/20 text-green-400 font-medium hover:bg-green-500/30 transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Onayla
                      </button>
                    )}
                    
                    {canEdit && selectedTestimonial.status !== 'rejected' && (
                      <button
                        onClick={() => handleStatusChange(selectedTestimonial.id, 'rejected')}
                        className="w-full py-3 rounded-xl bg-red-500/20 text-red-400 font-medium hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-5 h-5" />
                        Reddet
                      </button>
                    )}
                    
                    {canDelete && !selectedTestimonial.archived_at && (
                      <button
                        onClick={() => handleArchive(selectedTestimonial.id)}
                        className="w-full py-3 rounded-xl bg-gray-700 text-gray-300 font-medium hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                      >
                        <Archive className="w-5 h-5" />
                        Arşivle
                      </button>
                    )}
                    
                    {canDelete && selectedTestimonial.archived_at && (
                      <>
                        <button
                          onClick={() => handleRestore(selectedTestimonial.id)}
                          className="w-full py-3 rounded-xl bg-teal-500/20 text-teal-400 font-medium hover:bg-teal-500/30 transition-colors flex items-center justify-center gap-2"
                        >
                          <RotateCcw className="w-5 h-5" />
                          Geri Yükle
                        </button>
                        <button
                          onClick={() => handleDelete(selectedTestimonial.id)}
                          className="w-full py-3 rounded-xl bg-red-500/20 text-red-400 font-medium hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2"
                        >
                          <Trash2 className="w-5 h-5" />
                          Kalıcı Sil
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
