'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { adminApi } from '@/lib/adminApi'
import { 
  ImageIcon, Plus, Search, Trash2, Edit, 
  Folder, Eye, EyeOff, Loader2, GripVertical, X,
  Upload, CheckSquare, Square, ChevronDown, ChevronUp,
  AlertCircle, Check, Image as ImageLucide
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDropzone } from 'react-dropzone'

interface GalleryAlbum {
  id: string
  title: string
  slug: string
  description: string | null
  cover_image_url: string | null
  status: 'active' | 'inactive'
  item_count: number
  created_at: string | null
}

interface GalleryItem {
  id: string
  album_id: string
  image_url: string
  image_alt: string | null
  caption: string | null
  sort_order: number
}

interface UploadProgress {
  filename: string
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
}

export default function AdminGalleryPage() {
  const [albums, setAlbums] = useState<GalleryAlbum[]>([])
  const [selectedAlbum, setSelectedAlbum] = useState<GalleryAlbum | null>(null)
  const [items, setItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingItems, setLoadingItems] = useState(false)
  const [showCreateAlbum, setShowCreateAlbum] = useState(false)
  const [editingAlbum, setEditingAlbum] = useState<GalleryAlbum | null>(null)
  
  // Upload states
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([])
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)
  
  // Selection states
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [bulkDeleting, setBulkDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const loadAlbums = async () => {
    setLoading(true)
    try {
      const res = await adminApi.request<{albums: GalleryAlbum[], total: number}>('/api/admin/gallery')
      if (res.data) {
        setAlbums(res.data.albums)
      }
    } catch (error) {
      console.error('Error loading albums:', error)
    }
    setLoading(false)
  }

  const loadItems = async (albumId: string) => {
    setLoadingItems(true)
    try {
      const res = await adminApi.request<{items: GalleryItem[], total: number}>(`/api/admin/gallery/${albumId}/items`)
      if (res.data) {
        setItems(res.data.items.sort((a, b) => a.sort_order - b.sort_order))
      }
    } catch (error) {
      console.error('Error loading items:', error)
    }
    setLoadingItems(false)
  }

  useEffect(() => {
    loadAlbums()
  }, [])

  useEffect(() => {
    if (selectedAlbum) {
      loadItems(selectedAlbum.id)
      setSelectedItems(new Set())
    }
  }, [selectedAlbum?.id])

  // Helper function to get auth token from Zustand store
  const getAuthToken = (): string | null => {
    if (typeof window === 'undefined') return null
    const stored = localStorage.getItem('wetnose-admin-auth')
    if (!stored) return null
    try {
      const parsed = JSON.parse(stored)
      return parsed.state?.accessToken || null
    } catch {
      return null
    }
  }

  // Drag & Drop Upload Handler
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!selectedAlbum || acceptedFiles.length === 0) return
    
    const token = getAuthToken()
    if (!token) {
      setUploadProgress([{
        filename: 'Tüm dosyalar',
        progress: 0,
        status: 'error' as const,
        error: 'Oturum süresi dolmuş. Lütfen tekrar giriş yapın.'
      }])
      return
    }
    
    setUploading(true)
    setUploadProgress(acceptedFiles.map(f => ({
      filename: f.name,
      progress: 0,
      status: 'pending' as const
    })))

    const formData = new FormData()
    acceptedFiles.forEach(file => {
      formData.append('files', file)
    })

    try {
      // Update progress to uploading
      setUploadProgress(prev => prev.map(p => ({ ...p, status: 'uploading' as const, progress: 50 })))
      
      const response = await fetch(`/api/admin/gallery/albums/${selectedAlbum.id}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      const data = await response.json()
      
      if (response.ok) {
        // Update progress to success
        setUploadProgress(prev => prev.map(p => ({ ...p, status: 'success' as const, progress: 100 })))
        
        // Reload items
        await loadItems(selectedAlbum.id)
        await loadAlbums() // Update item counts
        
        // Clear progress after delay
        setTimeout(() => {
          setUploadProgress([])
        }, 2000)
      } else {
        const errorMsg = data.detail || `HTTP ${response.status}: Yükleme başarısız`
        console.error('Upload failed:', response.status, data)
        setUploadProgress(prev => prev.map(p => ({ 
          ...p, 
          status: 'error' as const, 
          error: errorMsg
        })))
      }
    } catch (error) {
      console.error('Upload network error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata'
      setUploadProgress(prev => prev.map(p => ({ 
        ...p, 
        status: 'error' as const, 
        error: `Ağ hatası: ${errorMessage}` 
      })))
    }
    
    setUploading(false)
  }, [selectedAlbum])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
    },
    maxSize: 3 * 1024 * 1024, // 3MB
    disabled: !selectedAlbum || uploading
  })

  // URL ile ekleme (Gelişmiş Seçenekler)
  const handleAddByUrl = async (url: string, alt: string, caption: string) => {
    if (!selectedAlbum) return
    
    try {
      await adminApi.request('/api/admin/gallery/items', {
        method: 'POST',
        body: JSON.stringify({
          album_id: selectedAlbum.id,
          image_url: url,
          image_alt: alt,
          caption: caption
        })
      })
      
      await loadItems(selectedAlbum.id)
      await loadAlbums()
    } catch (error) {
      console.error('Error adding by URL:', error)
    }
  }

  // Reorder handler
  const handleReorder = async (newOrder: GalleryItem[]) => {
    setItems(newOrder)
    
    try {
      await adminApi.request('/api/admin/gallery/items/reorder', {
        method: 'PATCH',
        body: JSON.stringify({
          items: newOrder.map((item, idx) => ({ id: item.id, sort_order: idx }))
        })
      })
    } catch (error) {
      console.error('Reorder error:', error)
      // Rollback on error
      if (selectedAlbum) loadItems(selectedAlbum.id)
    }
  }

  // Selection handlers
  const toggleSelectItem = (itemId: string) => {
    setSelectedItems(prev => {
      const next = new Set(prev)
      if (next.has(itemId)) {
        next.delete(itemId)
      } else {
        next.add(itemId)
      }
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedItems.size === items.length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(items.map(i => i.id)))
    }
  }

  // Bulk delete
  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) return
    
    setBulkDeleting(true)
    try {
      await adminApi.request('/api/admin/gallery/bulk-delete', {
        method: 'DELETE',
        body: JSON.stringify({ item_ids: Array.from(selectedItems) })
      })
      
      setSelectedItems(new Set())
      if (selectedAlbum) {
        await loadItems(selectedAlbum.id)
        await loadAlbums()
      }
    } catch (error) {
      console.error('Bulk delete error:', error)
    }
    setBulkDeleting(false)
    setShowDeleteConfirm(false)
  }

  // Delete single item
  const handleDeleteItem = async (itemId: string) => {
    try {
      await adminApi.request(`/api/admin/gallery/items/${itemId}`, { method: 'DELETE' })
      if (selectedAlbum) {
        await loadItems(selectedAlbum.id)
        await loadAlbums()
      }
    } catch (error) {
      console.error('Delete error:', error)
    }
  }

  // Album CRUD handlers
  const handleCreateAlbum = async (title: string, description: string) => {
    try {
      await adminApi.request('/api/admin/gallery/albums', {
        method: 'POST',
        body: JSON.stringify({ title, description })
      })
      await loadAlbums()
      setShowCreateAlbum(false)
    } catch (error) {
      console.error('Create album error:', error)
    }
  }

  const handleUpdateAlbum = async (albumId: string, data: Partial<GalleryAlbum>) => {
    try {
      await adminApi.request(`/api/admin/gallery/albums/${albumId}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      })
      await loadAlbums()
      if (selectedAlbum?.id === albumId) {
        setSelectedAlbum(prev => prev ? { ...prev, ...data } : null)
      }
      setEditingAlbum(null)
    } catch (error) {
      console.error('Update album error:', error)
    }
  }

  const handleDeleteAlbum = async (albumId: string) => {
    if (!confirm('Bu albümü ve tüm görsellerini silmek istediğinize emin misiniz?')) return
    
    try {
      await adminApi.request(`/api/admin/gallery/albums/${albumId}`, { method: 'DELETE' })
      await loadAlbums()
      if (selectedAlbum?.id === albumId) {
        setSelectedAlbum(null)
        setItems([])
      }
    } catch (error) {
      console.error('Delete album error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Galeri Yönetimi</h1>
            <p className="text-gray-400 mt-1">Albümler ve görselleri yönetin</p>
          </div>
          <button
            onClick={() => setShowCreateAlbum(true)}
            className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Yeni Albüm
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Albums Sidebar */}
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-4">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Folder className="w-5 h-5 text-teal-400" />
              Albümler
            </h2>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-teal-400 animate-spin" />
              </div>
            ) : albums.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Folder className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Henüz albüm yok</p>
              </div>
            ) : (
              <div className="space-y-2">
                {albums.map(album => (
                  <div
                    key={album.id}
                    onClick={() => setSelectedAlbum(album)}
                    className={cn(
                      "p-3 rounded-lg cursor-pointer transition-all border",
                      selectedAlbum?.id === album.id
                        ? "bg-teal-500/20 border-teal-500/50"
                        : "bg-gray-900/50 border-transparent hover:border-gray-700"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium truncate">{album.title}</h3>
                        <p className="text-sm text-gray-400">{album.item_count} görsel</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {album.status === 'inactive' && (
                          <EyeOff className="w-4 h-4 text-gray-500" />
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditingAlbum(album) }}
                          className="p-1.5 hover:bg-gray-700 rounded"
                        >
                          <Edit className="w-4 h-4 text-gray-400" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteAlbum(album.id) }}
                          className="p-1.5 hover:bg-red-500/20 rounded"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Album Content */}
          <div className="lg:col-span-2">
            {selectedAlbum ? (
              <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6">
                {/* Album Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-white">{selectedAlbum.title}</h2>
                    <p className="text-gray-400 text-sm">{items.length} görsel</p>
                  </div>
                  
                  {/* Bulk Actions */}
                  {selectedItems.size > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">{selectedItems.size} seçili</span>
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        disabled={bulkDeleting}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                      >
                        {bulkDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        Sil
                      </button>
                    </div>
                  )}
                </div>

                {/* Upload Area - Drag & Drop */}
                <div
                  {...getRootProps()}
                  className={cn(
                    "border-2 border-dashed rounded-xl p-8 mb-6 text-center transition-all cursor-pointer",
                    isDragActive
                      ? "border-teal-400 bg-teal-400/10"
                      : "border-gray-600 hover:border-gray-500 hover:bg-gray-800/50",
                    uploading && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <input {...getInputProps()} />
                  <Upload className={cn(
                    "w-12 h-12 mx-auto mb-4",
                    isDragActive ? "text-teal-400" : "text-gray-500"
                  )} />
                  <p className="text-white font-medium mb-1">
                    {isDragActive ? "Dosyaları bırakın..." : "Dosyaları buraya bırakın veya seçin"}
                  </p>
                  <p className="text-sm text-gray-500">
                    PNG, JPG, WebP, GIF (max 3MB)
                  </p>
                </div>

                {/* Upload Progress */}
                {uploadProgress.length > 0 && (
                  <div className="mb-6 space-y-2">
                    {uploadProgress.map((p, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg">
                        <div className="flex-shrink-0">
                          {p.status === 'success' && <Check className="w-5 h-5 text-green-400" />}
                          {p.status === 'error' && <AlertCircle className="w-5 h-5 text-red-400" />}
                          {(p.status === 'pending' || p.status === 'uploading') && (
                            <Loader2 className="w-5 h-5 text-teal-400 animate-spin" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate">{p.filename}</p>
                          {p.error && <p className="text-xs text-red-400">{p.error}</p>}
                        </div>
                        <div className="w-24">
                          <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className={cn(
                                "h-full transition-all",
                                p.status === 'success' ? "bg-green-500" : 
                                p.status === 'error' ? "bg-red-500" : "bg-teal-500"
                              )}
                              style={{ width: `${p.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Advanced Options (Collapsed) */}
                <div className="mb-6">
                  <button
                    onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {showAdvancedOptions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    Gelişmiş Seçenekler
                  </button>
                  
                  <AnimatePresence>
                    {showAdvancedOptions && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <AddByUrlForm onSubmit={handleAddByUrl} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Select All Toggle */}
                {items.length > 0 && (
                  <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-700">
                    <button
                      onClick={toggleSelectAll}
                      className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {selectedItems.size === items.length ? (
                        <CheckSquare className="w-4 h-4 text-teal-400" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                      Tümünü Seç
                    </button>
                  </div>
                )}

                {/* Items Grid with Reorder */}
                {loadingItems ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
                  </div>
                ) : items.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <ImageLucide className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Bu albümde henüz görsel yok</p>
                    <p className="text-sm mt-1">Yukarıdaki alana dosya sürükleyin</p>
                  </div>
                ) : (
                  <Reorder.Group
                    axis="x"
                    values={items}
                    onReorder={handleReorder}
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
                  >
                    {items.map(item => (
                      <Reorder.Item
                        key={item.id}
                        value={item}
                        className="relative group aspect-square bg-gray-900 rounded-lg overflow-hidden cursor-grab active:cursor-grabbing"
                      >
                        {/* Selection Checkbox */}
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleSelectItem(item.id) }}
                          className="absolute top-2 left-2 z-10 p-1 bg-black/50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          {selectedItems.has(item.id) ? (
                            <CheckSquare className="w-5 h-5 text-teal-400" />
                          ) : (
                            <Square className="w-5 h-5 text-white" />
                          )}
                        </button>

                        {/* Drag Handle */}
                        <div className="absolute top-2 right-2 z-10 p-1 bg-black/50 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          <GripVertical className="w-5 h-5 text-white" />
                        </div>

                        {/* Image */}
                        <img
                          src={item.image_url}
                          alt={item.image_alt || ''}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />

                        {/* Overlay Actions */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                          <div className="w-full p-2 flex items-center justify-between">
                            <p className="text-xs text-white truncate flex-1">
                              {item.image_alt || item.caption || 'Görsel'}
                            </p>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteItem(item.id) }}
                              className="p-1.5 bg-red-500/80 hover:bg-red-500 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4 text-white" />
                            </button>
                          </div>
                        </div>

                        {/* Selection Indicator */}
                        {selectedItems.has(item.id) && (
                          <div className="absolute inset-0 border-2 border-teal-400 rounded-lg pointer-events-none" />
                        )}
                      </Reorder.Item>
                    ))}
                  </Reorder.Group>
                )}
              </div>
            ) : (
              <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-12 text-center">
                <Folder className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <h3 className="text-xl font-medium text-white mb-2">Albüm Seçin</h3>
                <p className="text-gray-400">Görsel yüklemek için sol taraftan bir albüm seçin</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Album Modal */}
      <AnimatePresence>
        {showCreateAlbum && (
          <AlbumModal
            onClose={() => setShowCreateAlbum(false)}
            onSave={handleCreateAlbum}
          />
        )}
      </AnimatePresence>

      {/* Edit Album Modal */}
      <AnimatePresence>
        {editingAlbum && (
          <AlbumModal
            album={editingAlbum}
            onClose={() => setEditingAlbum(null)}
            onSave={(title, description) => handleUpdateAlbum(editingAlbum.id, { title, description })}
          />
        )}
      </AnimatePresence>

      {/* Bulk Delete Confirmation */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <ConfirmModal
            title="Toplu Silme"
            message={`${selectedItems.size} görseli silmek istediğinize emin misiniz?`}
            onConfirm={handleBulkDelete}
            onCancel={() => setShowDeleteConfirm(false)}
            loading={bulkDeleting}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// Album Create/Edit Modal
function AlbumModal({ album, onClose, onSave }: { 
  album?: GalleryAlbum, 
  onClose: () => void, 
  onSave: (title: string, description: string) => void 
}) {
  const [title, setTitle] = useState(album?.title || '')
  const [description, setDescription] = useState(album?.description || '')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await onSave(title, description)
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-md"
      >
        <h3 className="text-xl font-semibold text-white mb-6">
          {album ? 'Albümü Düzenle' : 'Yeni Albüm'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Albüm Adı</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-teal-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Açıklama</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-teal-500 resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white transition-colors">
              İptal
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (album ? 'Kaydet' : 'Oluştur')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

// Add by URL Form (Advanced Options)
function AddByUrlForm({ onSubmit }: { onSubmit: (url: string, alt: string, caption: string) => void }) {
  const [url, setUrl] = useState('')
  const [alt, setAlt] = useState('')
  const [caption, setCaption] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await onSubmit(url, alt, caption)
    setUrl('')
    setAlt('')
    setCaption('')
    setLoading(false)
  }

  return (
    <div className="mt-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
      <p className="text-xs text-gray-500 mb-3">Harici kaynaktan görsel eklemek için</p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Görsel URL"
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-teal-500"
          required
        />
        <input
          type="text"
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
          placeholder="Alt metin (opsiyonel)"
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-teal-500"
        />
        <input
          type="text"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Açıklama (opsiyonel)"
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-teal-500"
        />
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 text-sm"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'URL ile Ekle'}
        </button>
      </form>
    </div>
  )
}

// Confirm Modal
function ConfirmModal({ title, message, onConfirm, onCancel, loading }: {
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-sm"
      >
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-gray-400 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 text-gray-400 hover:text-white transition-colors">
            İptal
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sil'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
