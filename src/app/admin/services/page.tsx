'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Stethoscope, Plus, Search, MoreVertical, Edit, Trash2, Eye, EyeOff,
  RotateCcw, X, Check, AlertCircle, GripVertical, ArrowUp, ArrowDown,
  ExternalLink, Archive, Image as ImageIcon
} from 'lucide-react'
import { adminApi } from '@/lib/adminApi'
import { useAuthStore } from '@/lib/adminAuth'
import { cn } from '@/lib/utils'
import ImageUploadCropper from '@/components/admin/ImageUploadCropper'

interface Service {
  id: string
  title: string
  slug: string
  short_description: string
  cover_image_url: string
  icon: string | null
  status: string
  sort_order: number
  archived_at: string | null
  created_at: string
}

const STATUS_BADGES: Record<string, { label: string; color: string }> = {
  draft: { label: 'Taslak', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  published: { label: 'Yayında', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
}

export default function AdminServicesPage() {
  const { user } = useAuthStore()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [showArchived, setShowArchived] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [formLoading, setFormLoading] = useState(false)

  // Form state
  const [form, setForm] = useState({
    title: '',
    slug: '',
    short_description: '',
    long_description: '',
    cover_image_url: '',
    icon: '',
    price_mode: 'hidden',
    status: 'draft',
    seo: { meta_title: '', meta_description: '' }
  })

  useEffect(() => {
    loadServices()
  }, [showArchived])

  const loadServices = async () => {
    setLoading(true)
    const response = await adminApi.getServices(1, 100, { archived: showArchived })
    if (response.data) {
      setServices(response.data.services)
    }
    setLoading(false)
  }

  const resetForm = () => {
    setForm({
      title: '',
      slug: '',
      short_description: '',
      long_description: '',
      cover_image_url: '',
      icon: '',
      price_mode: 'hidden',
      status: 'draft',
      seo: { meta_title: '', meta_description: '' }
    })
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    
    const response = await adminApi.createService({
      ...form,
      slug: form.slug || undefined,
      seo: form.seo.meta_title || form.seo.meta_description ? form.seo : undefined
    })
    
    if (response.error) {
      setMessage({ type: 'error', text: response.error })
    } else {
      setMessage({ type: 'success', text: 'Hizmet oluşturuldu' })
      setShowCreateModal(false)
      resetForm()
      loadServices()
    }
    setFormLoading(false)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingService) return
    setFormLoading(true)
    
    const response = await adminApi.updateService(editingService.id, {
      ...form,
      seo: form.seo.meta_title || form.seo.meta_description ? form.seo : undefined
    })
    
    if (response.error) {
      setMessage({ type: 'error', text: response.error })
    } else {
      setMessage({ type: 'success', text: 'Hizmet güncellendi' })
      setEditingService(null)
      resetForm()
      loadServices()
    }
    setFormLoading(false)
  }

  const handleStatusToggle = async (service: Service) => {
    const newStatus = service.status === 'published' ? 'draft' : 'published'
    const response = await adminApi.updateServiceStatus(service.id, newStatus)
    
    if (response.error) {
      setMessage({ type: 'error', text: response.error })
    } else {
      setMessage({ type: 'success', text: `Hizmet ${newStatus === 'published' ? 'yayınlandı' : 'taslağa alındı'}` })
      loadServices()
    }
    setActiveMenu(null)
  }

  const handleArchive = async (service: Service) => {
    if (!confirm(`"${service.title}" hizmetini arşivlemek istediğinize emin misiniz?`)) return
    
    const response = await adminApi.deleteService(service.id)
    if (response.error) {
      setMessage({ type: 'error', text: response.error })
    } else {
      setMessage({ type: 'success', text: 'Hizmet arşivlendi' })
      loadServices()
    }
    setActiveMenu(null)
  }

  const handleRestore = async (service: Service) => {
    const response = await adminApi.restoreService(service.id)
    if (response.error) {
      setMessage({ type: 'error', text: response.error })
    } else {
      setMessage({ type: 'success', text: 'Hizmet geri yüklendi' })
      loadServices()
    }
    setActiveMenu(null)
  }

  const handleMoveUp = async (index: number) => {
    if (index === 0) return
    const items = [...services]
    const temp = items[index].sort_order
    items[index].sort_order = items[index - 1].sort_order
    items[index - 1].sort_order = temp
    
    await adminApi.reorderServices([
      { id: items[index].id, sort_order: items[index].sort_order },
      { id: items[index - 1].id, sort_order: items[index - 1].sort_order }
    ])
    loadServices()
  }

  const handleMoveDown = async (index: number) => {
    if (index === services.length - 1) return
    const items = [...services]
    const temp = items[index].sort_order
    items[index].sort_order = items[index + 1].sort_order
    items[index + 1].sort_order = temp
    
    await adminApi.reorderServices([
      { id: items[index].id, sort_order: items[index].sort_order },
      { id: items[index + 1].id, sort_order: items[index + 1].sort_order }
    ])
    loadServices()
  }

  const openEditModal = async (service: Service) => {
    const response = await adminApi.getServiceById(service.id)
    if (response.data) {
      setForm({
        title: response.data.title,
        slug: response.data.slug,
        short_description: response.data.short_description,
        long_description: response.data.long_description || '',
        cover_image_url: response.data.cover_image_url,
        icon: response.data.icon || '',
        price_mode: response.data.price_mode,
        status: response.data.status,
        seo: {
          meta_title: response.data.seo?.meta_title || '',
          meta_description: response.data.seo?.meta_description || ''
        }
      })
      setEditingService(service)
    }
    setActiveMenu(null)
  }

  const filteredServices = services.filter(s =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.short_description.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
            <Stethoscope className="w-7 h-7 text-teal-400" />
            Hizmet Yönetimi
          </h1>
          <p className="text-gray-400 mt-1">Klinik hizmetlerini yönetin</p>
        </div>
        
        <button
          onClick={() => { resetForm(); setShowCreateModal(true) }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl text-white font-medium hover:shadow-lg hover:shadow-teal-500/25 transition-all"
        >
          <Plus className="w-5 h-5" />
          Yeni Hizmet
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Hizmet ara..."
            className="w-full bg-gray-900/50 border border-gray-800 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:border-teal-500 focus:outline-none"
          />
        </div>
        
        <button
          onClick={() => setShowArchived(!showArchived)}
          className={cn(
            'flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors',
            showArchived
              ? 'bg-orange-500/20 border-orange-500/30 text-orange-400'
              : 'bg-gray-900/50 border-gray-800 text-gray-400 hover:text-white'
          )}
        >
          <Archive className="w-5 h-5" />
          {showArchived ? 'Arşivlenmiş' : 'Arşivi Göster'}
        </button>
      </div>

      {/* Services Table */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="p-12 text-center">
            <Stethoscope className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">{showArchived ? 'Arşivlenmiş hizmet yok' : 'Hizmet bulunamadı'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="w-12 py-4 px-2"></th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Hizmet</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Durum</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Sıra</th>
                  <th className="text-right py-4 px-6 text-sm font-medium text-gray-400">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {filteredServices.map((service, index) => (
                  <tr key={service.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="py-4 px-2">
                      {!showArchived && (
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => handleMoveUp(index)}
                            disabled={index === 0}
                            className="p-1 text-gray-500 hover:text-white disabled:opacity-30"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleMoveDown(index)}
                            disabled={index === filteredServices.length - 1}
                            className="p-1 text-gray-500 hover:text-white disabled:opacity-30"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <img
                          src={service.cover_image_url}
                          alt={service.title}
                          className="w-16 h-12 object-cover rounded-lg"
                        />
                        <div>
                          <p className="text-white font-medium">{service.title}</p>
                          <p className="text-sm text-gray-500 line-clamp-1">{service.short_description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={cn(
                        'px-2.5 py-1 rounded-full text-xs font-medium border',
                        STATUS_BADGES[service.status]?.color || 'bg-gray-500/20 text-gray-400'
                      )}>
                        {STATUS_BADGES[service.status]?.label || service.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-400">
                      #{service.sort_order}
                    </td>
                    <td className="py-4 px-6">
                      <div className="relative flex justify-end">
                        <button
                          onClick={() => setActiveMenu(activeMenu === service.id ? null : service.id)}
                          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-5 h-5 text-gray-400" />
                        </button>
                        
                        <AnimatePresence>
                          {activeMenu === service.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="absolute right-0 top-10 w-48 bg-gray-800 border border-gray-700 rounded-xl shadow-xl z-10 overflow-hidden"
                            >
                              {!showArchived ? (
                                <>
                                  <button
                                    onClick={() => openEditModal(service)}
                                    className="flex items-center gap-2 w-full px-4 py-3 text-sm text-gray-300 hover:bg-gray-700"
                                  >
                                    <Edit className="w-4 h-4" /> Düzenle
                                  </button>
                                  <button
                                    onClick={() => handleStatusToggle(service)}
                                    className="flex items-center gap-2 w-full px-4 py-3 text-sm text-gray-300 hover:bg-gray-700"
                                  >
                                    {service.status === 'published' ? (
                                      <><EyeOff className="w-4 h-4" /> Yayından Kaldır</>
                                    ) : (
                                      <><Eye className="w-4 h-4" /> Yayınla</>
                                    )}
                                  </button>
                                  <a
                                    href={`/hizmetler/${service.slug}`}
                                    target="_blank"
                                    className="flex items-center gap-2 w-full px-4 py-3 text-sm text-gray-300 hover:bg-gray-700"
                                  >
                                    <ExternalLink className="w-4 h-4" /> Önizle
                                  </a>
                                  <button
                                    onClick={() => handleArchive(service)}
                                    className="flex items-center gap-2 w-full px-4 py-3 text-sm text-red-400 hover:bg-red-500/10"
                                  >
                                    <Trash2 className="w-4 h-4" /> Arşivle
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => handleRestore(service)}
                                  className="flex items-center gap-2 w-full px-4 py-3 text-sm text-green-400 hover:bg-green-500/10"
                                >
                                  <RotateCcw className="w-4 h-4" /> Geri Yükle
                                </button>
                              )}
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

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {(showCreateModal || editingService) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            onClick={() => { setShowCreateModal(false); setEditingService(null); resetForm() }}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">
                  {editingService ? 'Hizmet Düzenle' : 'Yeni Hizmet'}
                </h3>
                <button
                  onClick={() => { setShowCreateModal(false); setEditingService(null); resetForm() }}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={editingService ? handleUpdate : handleCreate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Başlık *</label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => setForm({...form, title: e.target.value})}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Slug (URL)</label>
                    <input
                      type="text"
                      value={form.slug}
                      onChange={(e) => setForm({...form, slug: e.target.value})}
                      placeholder="Otomatik oluşturulur"
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 focus:outline-none"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Kısa Açıklama *</label>
                  <textarea
                    value={form.short_description}
                    onChange={(e) => setForm({...form, short_description: e.target.value})}
                    rows={2}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 focus:outline-none resize-none"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Detaylı Açıklama (HTML)</label>
                  <textarea
                    value={form.long_description}
                    onChange={(e) => setForm({...form, long_description: e.target.value})}
                    rows={4}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 focus:outline-none resize-none font-mono text-sm"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                      <ImageIcon className="w-4 h-4" />
                      Kapak Görseli *
                    </label>
                    <ImageUploadCropper
                      value={form.cover_image_url}
                      onChange={(url) => setForm({...form, cover_image_url: url})}
                      aspectPreset="4:3"
                      uploadContext="services"
                      title={form.title}
                      hideAI
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">İkon</label>
                    <input
                      type="text"
                      value={form.icon}
                      onChange={(e) => setForm({...form, icon: e.target.value})}
                      placeholder="flask, scan, ambulance..."
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Durum</label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({...form, status: e.target.value})}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 focus:outline-none"
                    >
                      <option value="draft">Taslak</option>
                      <option value="published">Yayında</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Fiyat Gösterimi</label>
                    <select
                      value={form.price_mode}
                      onChange={(e) => setForm({...form, price_mode: e.target.value})}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 focus:outline-none"
                    >
                      <option value="hidden">Gizle</option>
                      <option value="starting_from">Başlayan Fiyatlar</option>
                      <option value="fixed">Sabit Fiyat</option>
                    </select>
                  </div>
                </div>

                {/* SEO Section */}
                <div className="border-t border-gray-800 pt-4 mt-4">
                  <h4 className="text-sm font-medium text-white mb-4">SEO Ayarları</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Meta Başlık</label>
                      <input
                        type="text"
                        value={form.seo.meta_title}
                        onChange={(e) => setForm({...form, seo: {...form.seo, meta_title: e.target.value}})}
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Meta Açıklama</label>
                      <textarea
                        value={form.seo.meta_description}
                        onChange={(e) => setForm({...form, seo: {...form.seo, meta_description: e.target.value}})}
                        rows={2}
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 focus:outline-none resize-none"
                      />
                    </div>
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={formLoading}
                  className="w-full py-3 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl text-white font-semibold hover:shadow-lg hover:shadow-teal-500/25 transition-all disabled:opacity-50"
                >
                  {formLoading ? 'Kaydediliyor...' : (editingService ? 'Güncelle' : 'Oluştur')}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
