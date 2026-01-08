'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { adminApi } from '@/lib/adminApi'
import { useAuthStore } from '@/lib/adminAuth'
import {
  Plus, Search, Edit2, Archive, RotateCcw, Loader2, X,
  Tag, AlertCircle, Check, ChevronUp, ChevronDown, Filter
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  order: number
  is_active: boolean
  is_deleted: boolean
  post_count: number
  created_at: string
  updated_at: string
}

interface CategoryFormData {
  name: string
  description: string
  order: number
  is_active: boolean
}

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, x: '-50%' }}
      animate={{ opacity: 1, y: 0, x: '-50%' }}
      exit={{ opacity: 0, y: 50, x: '-50%' }}
      className={cn(
        "fixed bottom-6 left-1/2 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3",
        type === 'success' && "bg-green-500 text-white",
        type === 'error' && "bg-red-500 text-white"
      )}
    >
      {type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-70"><X className="w-4 h-4" /></button>
    </motion.div>
  )
}

function CategoryModal({
  isOpen,
  onClose,
  onSave,
  category,
  loading
}: {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CategoryFormData) => void
  category: Category | null
  loading: boolean
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [order, setOrder] = useState(0)
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    if (category) {
      setName(category.name)
      setDescription(category.description || '')
      setOrder(category.order)
      setIsActive(category.is_active)
    } else {
      setName('')
      setDescription('')
      setOrder(0)
      setIsActive(true)
    }
  }, [category, isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-md"
      >
        <h2 className="text-xl font-bold text-white mb-4">
          {category ? 'Kategori Düzenle' : 'Yeni Kategori'}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">İsim *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-teal-500"
              placeholder="Kategori adı"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Açıklama</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-teal-500 resize-none"
              placeholder="Kategori açıklaması (opsiyonel)"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Sıra</label>
              <input
                type="number"
                value={order}
                onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Durum</label>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={cn(
                  "w-full px-4 py-2 rounded-lg border transition-colors",
                  isActive
                    ? "bg-green-500/20 border-green-500/50 text-green-400"
                    : "bg-gray-700/50 border-gray-600 text-gray-400"
                )}
              >
                {isActive ? 'Aktif' : 'Pasif'}
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Vazgeç
          </button>
          <button
            onClick={() => onSave({ name, description, order, is_active: isActive })}
            disabled={loading || !name.trim()}
            className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {category ? 'Güncelle' : 'Oluştur'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default function CategoriesPage() {
  const { user } = useAuthStore()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive' | 'archived'>('active')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const canEdit = user?.role && ['admin', 'manager', 'editor'].includes(user.role)
  const canDelete = user?.role && ['admin', 'manager'].includes(user.role)

  const loadCategories = useCallback(async () => {
    setLoading(true)
    try {
      const includeDeleted = filter === 'archived' || filter === 'all'
      const activeOnly = filter === 'active'
      const res = await adminApi.request<{ categories: Category[] }>(
        `/api/admin/blog/categories?include_deleted=${includeDeleted}&active_only=${activeOnly}&search=${search}`
      )
      let data = res.data?.categories || []
      
      if (filter === 'archived') {
        data = data.filter(c => c.is_deleted)
      } else if (filter === 'inactive') {
        data = data.filter(c => !c.is_active && !c.is_deleted)
      }
      
      setCategories(data)
    } catch (err: any) {
      setToast({ message: err.message || 'Yükleme hatası', type: 'error' })
    }
    setLoading(false)
  }, [filter, search])

  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  const handleSave = async (data: CategoryFormData) => {
    setSaving(true)
    try {
      if (editingCategory) {
        await adminApi.request(`/api/admin/blog/categories/${editingCategory.id}`, {
          method: 'PATCH',
          body: JSON.stringify(data)
        })
        setToast({ message: 'Kategori güncellendi', type: 'success' })
      } else {
        await adminApi.request('/api/admin/blog/categories', {
          method: 'POST',
          body: JSON.stringify(data)
        })
        setToast({ message: 'Kategori oluşturuldu', type: 'success' })
      }
      setModalOpen(false)
      setEditingCategory(null)
      loadCategories()
    } catch (err: any) {
      setToast({ message: err.message || 'Kaydetme hatası', type: 'error' })
    }
    setSaving(false)
  }

  const handleArchive = async (category: Category) => {
    if (!confirm(`"${category.name}" kategorisini arşivlemek istediğinize emin misiniz?`)) return
    
    try {
      const res = await adminApi.request(`/api/admin/blog/categories/${category.id}`, {
        method: 'DELETE'
      })
      if (res.error?.includes('yazı bulunuyor')) {
        if (confirm(`${res.error}\n\nYine de arşivlemek ve yazıların kategorisini kaldırmak ister misiniz?`)) {
          await adminApi.request(`/api/admin/blog/categories/${category.id}?force=true`, {
            method: 'DELETE'
          })
        } else {
          return
        }
      }
      setToast({ message: 'Kategori arşivlendi', type: 'success' })
      loadCategories()
    } catch (err: any) {
      setToast({ message: err.message || 'Arşivleme hatası', type: 'error' })
    }
  }

  const handleRestore = async (category: Category) => {
    try {
      await adminApi.request(`/api/admin/blog/categories/${category.id}/restore`, {
        method: 'POST'
      })
      setToast({ message: 'Kategori geri yüklendi', type: 'success' })
      loadCategories()
    } catch (err: any) {
      setToast({ message: err.message || 'Geri yükleme hatası', type: 'error' })
    }
  }

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      <CategoryModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingCategory(null) }}
        onSave={handleSave}
        category={editingCategory}
        loading={saving}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
            <Tag className="w-6 h-6 text-teal-400" />
            Blog Kategorileri
          </h1>
          <p className="text-gray-400 text-sm mt-1">Kategorileri yönetin ve düzenleyin</p>
        </div>
        {canEdit && (
          <button
            onClick={() => { setEditingCategory(null); setModalOpen(true) }}
            className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Yeni Kategori
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Kategori ara..."
            className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal-500"
          />
        </div>
        <div className="flex gap-2">
          {(['active', 'inactive', 'archived', 'all'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                filter === f
                  ? "bg-teal-500/20 text-teal-400 border border-teal-500/50"
                  : "bg-gray-800/50 text-gray-400 border border-gray-700 hover:bg-gray-700/50"
              )}
            >
              {f === 'active' && 'Aktif'}
              {f === 'inactive' && 'Pasif'}
              {f === 'archived' && 'Arşiv'}
              {f === 'all' && 'Tümü'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-8 h-8 text-teal-400 animate-spin mx-auto" />
          </div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center">
            <Tag className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">Kategori bulunamadı</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">İsim</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase hidden sm:table-cell">Slug</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">Durum</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase hidden md:table-cell">Yazı</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase hidden md:table-cell">Sıra</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {categories.map(cat => (
                  <tr key={cat.id} className="hover:bg-gray-700/20">
                    <td className="px-4 py-3">
                      <div className="font-medium text-white">{cat.name}</div>
                      {cat.description && (
                        <div className="text-xs text-gray-500 truncate max-w-[200px]">{cat.description}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-sm hidden sm:table-cell">{cat.slug}</td>
                    <td className="px-4 py-3 text-center">
                      {cat.is_deleted ? (
                        <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">Arşiv</span>
                      ) : cat.is_active ? (
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">Aktif</span>
                      ) : (
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">Pasif</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-400 hidden md:table-cell">{cat.post_count}</td>
                    <td className="px-4 py-3 text-center text-gray-400 hidden md:table-cell">{cat.order}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {!cat.is_deleted && canEdit && (
                          <button
                            onClick={() => { setEditingCategory(cat); setModalOpen(true) }}
                            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                            title="Düzenle"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        {!cat.is_deleted && canDelete && (
                          <button
                            onClick={() => handleArchive(cat)}
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Arşivle"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        )}
                        {cat.is_deleted && canDelete && (
                          <button
                            onClick={() => handleRestore(cat)}
                            className="p-2 text-gray-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                            title="Geri Yükle"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
