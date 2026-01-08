'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string | null
  cover_image_url: string | null
  cover_image_alt: string | null
  cover_image_focal?: { x: number; y: number } | null
  category: string | null
  tags: string[]
  seo: {
    meta_title: string | null
    meta_description: string | null
    og_image: string | null
  } | null
  status: 'draft' | 'published'
  published_at: string | null
  created_at: string | null
  updated_at: string | null
}

interface Category {
  id: string
  name: string
  slug: string
  is_active: boolean
  is_deleted: boolean
}

// Turkish character normalization for slug
function slugify(text: string): string {
  const turkishMap: Record<string, string> = {
    'ş': 's', 'Ş': 's', 'ı': 'i', 'İ': 'i', 'ğ': 'g', 'Ğ': 'g',
    'ü': 'u', 'Ü': 'u', 'ö': 'o', 'Ö': 'o', 'ç': 'c', 'Ç': 'c'
  }
  
  let result = text.toLowerCase()
  for (const [tr, en] of Object.entries(turkishMap)) {
    result = result.replace(new RegExp(tr, 'g'), en)
  }
  
  return result
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 100)
}

// Toast notification component
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error' | 'warning'; onClose: () => void }) {
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
        type === 'error' && "bg-red-500 text-white",
        type === 'warning' && "bg-yellow-500 text-black"
      )}
    >
      {type === 'success' && <Check className="w-5 h-5" />}
      {type === 'error' && <AlertCircle className="w-5 h-5" />}
      {type === 'warning' && <AlertTriangle className="w-5 h-5" />}
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-70">
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  )
}

// Loading Skeleton
function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gray-700 rounded-lg" />
          <div>
            <div className="h-6 w-48 bg-gray-700 rounded mb-2" />
            <div className="h-4 w-32 bg-gray-700/50 rounded" />
          </div>
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-32 bg-gray-700 rounded-lg" />
          <div className="h-10 w-24 bg-gray-700 rounded-lg" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 space-y-4">
            <div className="h-12 bg-gray-700 rounded-lg" />
            <div className="h-12 bg-gray-700 rounded-lg" />
            <div className="h-24 bg-gray-700 rounded-lg" />
          </div>
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
            <div className="h-96 bg-gray-700 rounded-lg" />
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 h-40" />
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 h-48" />
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 h-40" />
        </div>
      </div>
    </div>
  )
}

// Inline Category Create Modal
function InlineCategoryModal({
  isOpen,
  onClose,
  onCreated
}: {
  isOpen: boolean
  onClose: () => void
  onCreated: (categoryName: string) => void
}) {
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setName('')
      setError(null)
    }
  }, [isOpen])

  const handleCreate = async () => {
    if (!name.trim()) return
    setSaving(true)
    setError(null)
    
    try {
      const res = await adminApi.request('/api/admin/blog/categories', {
        method: 'POST',
        body: JSON.stringify({ name: name.trim(), is_active: true })
      })
      
      if (res.error) {
        setError(res.error)
      } else {
        onCreated(name.trim())
        onClose()
      }
    } catch (err: any) {
      setError(err.message || 'Hata oluştu')
    }
    setSaving(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-gray-800 border border-gray-700 rounded-xl p-5 w-full max-w-sm"
      >
        <h3 className="text-lg font-bold text-white mb-4">Yeni Kategori</h3>
        
        <div className="space-y-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Kategori adı"
            className="w-full px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-teal-500"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
          
          {error && (
            <p className="text-red-400 text-xs flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {error}
            </p>
          )}
          
          <p className="text-gray-500 text-xs">
            Slug otomatik oluşturulacak: {slugify(name) || '...'}
          </p>
        </div>
        
        <div className="flex gap-2 mt-4">
          <button
            onClick={onClose}
            className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg text-sm hover:bg-gray-600"
          >
            Vazgeç
          </button>
          <button
            onClick={handleCreate}
            disabled={saving || !name.trim()}
            className="flex-1 px-3 py-2 bg-teal-500 text-white rounded-lg text-sm hover:bg-teal-600 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Oluştur
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default function BlogEditPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuthStore()
  const postId = params.id as string

  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null)

  // Form state
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('')
  const [tags, setTags] = useState('')
  const [coverImageUrl, setCoverImageUrl] = useState('')
  const [coverImageAlt, setCoverImageAlt] = useState('')
  const [coverImageFocal, setCoverImageFocal] = useState<{ x: number; y: number } | null>(null)
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [status, setStatus] = useState<'draft' | 'published'>('draft')

  // Categories state
  const [categories, setCategories] = useState<Category[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(false)
  const [inlineCategoryModalOpen, setInlineCategoryModalOpen] = useState(false)

  // Initial values for dirty check
  const [initialValues, setInitialValues] = useState<string>('')

  // Check if form is dirty
  const currentValues = useMemo(() => JSON.stringify({
    title, slug, excerpt, content, category, tags, coverImageUrl, coverImageAlt, metaTitle, metaDescription
  }), [title, slug, excerpt, content, category, tags, coverImageUrl, coverImageAlt, metaTitle, metaDescription])

  const isDirty = initialValues !== '' && currentValues !== initialValues

  // RBAC check - only admin, manager, editor can edit
  const canEdit = user?.role && ['admin', 'manager', 'editor'].includes(user.role)

  // Load categories
  const loadCategories = useCallback(async () => {
    setCategoriesLoading(true)
    try {
      const res = await adminApi.request<{ categories: Category[] }>(
        '/api/admin/blog/categories?active_only=false&include_deleted=true'
      )
      if (res.data?.categories) {
        setCategories(res.data.categories)
      }
    } catch (err) {
      console.error('Categories load error:', err)
    }
    setCategoriesLoading(false)
  }, [])

  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  // Handle inline category creation
  const handleInlineCategoryCreated = (categoryName: string) => {
    loadCategories()
    setCategory(categoryName)
    setToast({ message: 'Kategori oluşturuldu ve seçildi', type: 'success' })
  }

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  const loadPost = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await adminApi.request<BlogPost>(`/api/admin/blog-posts/${postId}`)
      if (res.data) {
        setPost(res.data)
        setTitle(res.data.title || '')
        setSlug(res.data.slug || '')
        setExcerpt(res.data.excerpt || '')
        setContent(res.data.content || '')
        setCategory(res.data.category || '')
        setTags(res.data.tags?.join(', ') || '')
        setCoverImageUrl(res.data.cover_image_url || '')
        setCoverImageAlt(res.data.cover_image_alt || '')
        setMetaTitle(res.data.seo?.meta_title || '')
        setMetaDescription(res.data.seo?.meta_description || '')
        setStatus(res.data.status)

        // Set initial values for dirty check
        setInitialValues(JSON.stringify({
          title: res.data.title || '',
          slug: res.data.slug || '',
          excerpt: res.data.excerpt || '',
          content: res.data.content || '',
          category: res.data.category || '',
          tags: res.data.tags?.join(', ') || '',
          coverImageUrl: res.data.cover_image_url || '',
          coverImageAlt: res.data.cover_image_alt || '',
          metaTitle: res.data.seo?.meta_title || '',
          metaDescription: res.data.seo?.meta_description || ''
        }))
      }
    } catch (err: any) {
      if (err.message?.includes('404') || err.message?.includes('bulunamadı')) {
        setError('Blog yazısı bulunamadı')
      } else if (err.message?.includes('401') || err.message?.includes('403')) {
        setError('Bu sayfaya erişim yetkiniz yok')
      } else if (err.message?.includes('429')) {
        setError('Çok fazla istek gönderildi. Lütfen bekleyin.')
      } else {
        setError(err.message || 'Sunucuya ulaşılamıyor')
      }
    }
    setLoading(false)
  }, [postId])

  useEffect(() => {
    loadPost()
  }, [loadPost])

  // Auto-generate slug from title
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle)
    // Only auto-generate if slug is empty or matches old auto-generated slug
    if (!slug || slug === slugify(title)) {
      setSlug(slugify(newTitle))
    }
  }

  // Generate slug button
  const handleGenerateSlug = () => {
    setSlug(slugify(title))
    setToast({ message: 'Slug otomatik oluşturuldu', type: 'success' })
  }

  const handleSave = async () => {
    if (!canEdit) {
      setToast({ message: 'Düzenleme yetkiniz yok', type: 'error' })
      return
    }

    if (!title.trim()) {
      setToast({ message: 'Başlık zorunludur', type: 'error' })
      return
    }

    if (!slug.trim()) {
      setToast({ message: 'URL slug zorunludur', type: 'error' })
      return
    }

    setSaving(true)
    try {
      const res = await adminApi.request(`/api/admin/blog-posts/${postId}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: title.trim(),
          slug: slug.trim(),
          excerpt: excerpt.trim() || null,
          content: content || null,
          category: category.trim() || null,
          tags: tags.split(',').map(t => t.trim()).filter(Boolean),
          cover_image_url: coverImageUrl.trim() || null,
          cover_image_alt: coverImageAlt.trim() || null,
          seo: {
            meta_title: metaTitle.trim() || null,
            meta_description: metaDescription.trim() || null,
            og_image: null
          }
        })
      })

      if (res.error) {
        if (res.error.includes('slug') && res.error.includes('exist')) {
          setToast({ message: 'Bu URL slug zaten kullanımda. Farklı bir slug deneyin.', type: 'error' })
        } else {
          setToast({ message: res.error, type: 'error' })
        }
      } else {
        setToast({ message: 'Blog yazısı kaydedildi!', type: 'success' })
        // Update initial values
        setInitialValues(currentValues)
      }
    } catch (err: any) {
      setToast({ message: err.message || 'Kaydetme hatası', type: 'error' })
    }
    setSaving(false)
  }

  const handleStatusChange = async () => {
    if (!canEdit) {
      setToast({ message: 'Düzenleme yetkiniz yok', type: 'error' })
      return
    }

    const newStatus = status === 'published' ? 'draft' : 'published'
    setPublishing(true)
    
    try {
      await adminApi.request(`/api/admin/blog-posts/${postId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      })
      setStatus(newStatus)
      setToast({ 
        message: newStatus === 'published' ? 'Yazı yayınlandı!' : 'Yazı taslağa alındı', 
        type: 'success' 
      })
    } catch (err: any) {
      setToast({ message: err.message || 'Durum değiştirme hatası', type: 'error' })
    }
    setPublishing(false)
  }

  // Handle back navigation with dirty check
  const handleBack = () => {
    if (isDirty) {
      if (confirm('Kaydedilmemiş değişiklikler var. Çıkmak istediğinize emin misiniz?')) {
        router.push('/admin/blog')
      }
    } else {
      router.push('/admin/blog')
    }
  }

  // SEO character count helpers
  const metaTitleLength = metaTitle.length
  const metaDescLength = metaDescription.length
  const isTitleOptimal = metaTitleLength >= 50 && metaTitleLength <= 60
  const isDescOptimal = metaDescLength >= 140 && metaDescLength <= 160

  if (loading) {
    return <LoadingSkeleton />
  }

  if (error || !post) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">
          {error?.includes('yetki') ? 'Erişim Engellendi' : 'Yazı Bulunamadı'}
        </h2>
        <p className="text-gray-400 mb-6 max-w-md">{error}</p>
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/admin/blog')}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Blog Listesine Dön
          </button>
          <button
            onClick={loadPost}
            className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Tekrar Dene
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6 pb-24 lg:pb-6">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}
      </AnimatePresence>

      {/* Inline Category Modal */}
      <AnimatePresence>
        <InlineCategoryModal
          isOpen={inlineCategoryModalOpen}
          onClose={() => setInlineCategoryModalOpen(false)}
          onCreated={handleInlineCategoryCreated}
        />
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 md:gap-4">
          <button
            onClick={handleBack}
            className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-lg md:text-xl font-bold text-white flex items-center gap-2 md:gap-3">
              <FileText className="w-5 h-5 md:w-6 md:h-6 text-teal-400 flex-shrink-0" />
              <span className="truncate">Yazıyı Düzenle</span>
            </h1>
            <p className="text-xs md:text-sm text-gray-500 mt-0.5 truncate">
              ID: {postId.substring(0, 8)}...
              {post.updated_at && ` • Son güncelleme: ${format(new Date(post.updated_at), 'dd MMM HH:mm', { locale: tr })}`}
            </p>
          </div>
        </div>

        {/* Desktop Actions */}
        <div className="hidden sm:flex items-center gap-2 md:gap-3">
          {isDirty && (
            <span className="text-yellow-400 text-sm flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              Kaydedilmedi
            </span>
          )}
          <button
            onClick={handleStatusChange}
            disabled={publishing || !canEdit}
            className={cn(
              "flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg transition-colors text-sm disabled:opacity-50",
              status === 'published'
                ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
                : "bg-green-500/20 text-green-400 hover:bg-green-500/30"
            )}
          >
            {publishing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : status === 'published' ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
            <span className="hidden md:inline">{status === 'published' ? 'Taslağa Al' : 'Yayınla'}</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !canEdit}
            className="flex items-center gap-2 px-3 md:px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors text-sm disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span className="hidden md:inline">Kaydet</span>
          </button>
        </div>
      </div>

      {/* Status & Info Bar */}
      <div className="flex flex-wrap items-center gap-2 md:gap-3">
        <span className={cn(
          "px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium",
          status === 'published'
            ? "bg-green-500/20 text-green-400"
            : "bg-yellow-500/20 text-yellow-400"
        )}>
          {status === 'published' ? 'Yayında' : 'Taslak'}
        </span>
        {status === 'published' && slug && (
          <a
            href={`/saglik-rehberi/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs md:text-sm text-teal-400 hover:text-teal-300 flex items-center gap-1"
          >
            <ExternalLink className="w-3 h-3" />
            Yazıyı Görüntüle
          </a>
        )}
        {!canEdit && (
          <span className="text-xs text-red-400 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Salt okunur mod
          </span>
        )}
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          {/* Title & Slug */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 md:p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Başlık <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                disabled={!canEdit}
                className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 disabled:opacity-50 text-sm md:text-base"
                placeholder="Blog yazısı başlığı"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                URL Slug <span className="text-red-400">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  disabled={!canEdit}
                  className="flex-1 px-3 md:px-4 py-2.5 md:py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 disabled:opacity-50 text-sm md:text-base"
                  placeholder="blog-yazisi-url"
                />
                <button
                  onClick={handleGenerateSlug}
                  disabled={!canEdit || !title}
                  className="px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                  title="Slug Oluştur"
                >
                  <Wand2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">/saglik-rehberi/{slug || 'slug'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Özet</label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                disabled={!canEdit}
                rows={3}
                className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 resize-none disabled:opacity-50 text-sm md:text-base"
                placeholder="Kısa açıklama..."
              />
            </div>
          </div>

          {/* Content */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 md:p-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              İçerik (HTML) <span className="text-red-400">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={!canEdit}
              rows={16}
              className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 resize-y disabled:opacity-50 font-mono text-xs md:text-sm"
              placeholder="<h2>Başlık</h2><p>İçerik...</p>"
            />
            <p className="text-xs text-gray-500 mt-2">
              {content.length.toLocaleString()} karakter
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 md:space-y-6">
          {/* Category & Tags */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 md:p-6 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Tag className="w-4 h-4 text-teal-400" />
              Kategori & Etiketler
            </h3>
            <div>
              <label className="block text-xs md:text-sm text-gray-400 mb-2">Kategori</label>
              <div className="flex gap-2">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={!canEdit || categoriesLoading}
                  className="flex-1 px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-teal-500 disabled:opacity-50"
                >
                  <option value="">Kategori Seçin</option>
                  {categories.map(cat => {
                    const isArchived = cat.is_deleted
                    const isInactive = !cat.is_active && !cat.is_deleted
                    return (
                      <option 
                        key={cat.id} 
                        value={cat.name}
                        disabled={isArchived}
                        className={cn(
                          isArchived && "text-gray-500",
                          isInactive && "text-yellow-400"
                        )}
                      >
                        {cat.name}{isArchived ? ' (Arşiv)' : isInactive ? ' (Pasif)' : ''}
                      </option>
                    )
                  })}
                </select>
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => setInlineCategoryModalOpen(true)}
                    className="px-2 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                    title="Yeni Kategori Ekle"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>
              {categoriesLoading && (
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> Kategoriler yükleniyor...
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs md:text-sm text-gray-400 mb-2">Etiketler</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                disabled={!canEdit}
                className="w-full px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-teal-500 disabled:opacity-50"
                placeholder="kedi, sağlık, bakım"
              />
              <p className="text-xs text-gray-500 mt-1">Virgülle ayırın</p>
            </div>
            {tags && (
              <div className="flex flex-wrap gap-1">
                {tags.split(',').map(t => t.trim()).filter(Boolean).map((tag, i) => (
                  <span key={i} className="px-2 py-0.5 bg-teal-500/20 text-teal-400 rounded text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Cover Image - with Upload Cropper */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 md:p-6 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-teal-400" />
              Kapak Görseli
            </h3>
            
            {/* Image Upload Cropper */}
            <ImageUploadCropper
              value={coverImageUrl}
              onChange={(url, focal) => {
                setCoverImageUrl(url)
                if (focal) setCoverImageFocal(focal)
              }}
              onFocalPointChange={(focal) => setCoverImageFocal(focal)}
              disabled={!canEdit}
              title={title}
              category={category}
            />
            
            {/* Manual URL Input (Secondary option) */}
            <div className="pt-3 border-t border-gray-700/50">
              <label className="block text-xs text-gray-500 mb-2">veya URL ile ekle:</label>
              <input
                type="text"
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                disabled={!canEdit}
                className="w-full px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-teal-500 disabled:opacity-50"
                placeholder="https://..."
              />
            </div>
            
            <div>
              <label className="block text-xs md:text-sm text-gray-400 mb-2">Alt Metin</label>
              <input
                type="text"
                value={coverImageAlt}
                onChange={(e) => setCoverImageAlt(e.target.value)}
                disabled={!canEdit}
                className="w-full px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-teal-500 disabled:opacity-50"
                placeholder="Görsel açıklaması (SEO için önemli)"
              />
              <p className="text-xs text-gray-500 mt-1">Görseli açıklayan kısa metin</p>
            </div>
            
            {/* Preview with focal point */}
            {coverImageUrl && (
              <div className="mt-3 rounded-lg overflow-hidden border border-gray-700">
                <img 
                  src={coverImageUrl} 
                  alt={coverImageAlt} 
                  className="w-full h-32 object-cover"
                  style={{
                    objectPosition: coverImageFocal 
                      ? `${coverImageFocal.x * 100}% ${coverImageFocal.y * 100}%` 
                      : 'center center'
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" fill="%23374151"><rect width="100%" height="100%"/><text x="50%" y="50%" fill="%239CA3AF" text-anchor="middle" dy=".3em" font-size="12">Görsel yüklenemedi</text></svg>'
                  }}
                />
              </div>
            )}
          </div>

          {/* SEO */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 md:p-6 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-teal-400" />
              SEO Ayarları
            </h3>
            <div>
              <label className="block text-xs md:text-sm text-gray-400 mb-2 flex items-center justify-between">
                <span>Meta Başlık</span>
                <span className={cn(
                  "text-xs",
                  metaTitleLength === 0 ? "text-gray-500" :
                  isTitleOptimal ? "text-green-400" : 
                  metaTitleLength > 60 ? "text-red-400" : "text-yellow-400"
                )}>
                  {metaTitleLength}/60
                </span>
              </label>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                disabled={!canEdit}
                className="w-full px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-teal-500 disabled:opacity-50"
                placeholder="SEO başlığı (50-60 karakter)"
              />
              {metaTitleLength > 0 && !isTitleOptimal && (
                <p className="text-xs text-yellow-400 mt-1 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Önerilen: 50-60 karakter
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs md:text-sm text-gray-400 mb-2 flex items-center justify-between">
                <span>Meta Açıklama</span>
                <span className={cn(
                  "text-xs",
                  metaDescLength === 0 ? "text-gray-500" :
                  isDescOptimal ? "text-green-400" : 
                  metaDescLength > 160 ? "text-red-400" : "text-yellow-400"
                )}>
                  {metaDescLength}/160
                </span>
              </label>
              <textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                disabled={!canEdit}
                rows={3}
                className="w-full px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-teal-500 resize-none disabled:opacity-50"
                placeholder="SEO açıklaması (140-160 karakter)"
              />
              {metaDescLength > 0 && !isDescOptimal && (
                <p className="text-xs text-yellow-400 mt-1 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Önerilen: 140-160 karakter
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Fixed Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-900/95 backdrop-blur border-t border-gray-800 sm:hidden z-40">
        <div className="flex items-center gap-2">
          {isDirty && (
            <span className="text-yellow-400 text-xs flex items-center gap-1 mr-auto">
              <AlertTriangle className="w-3 h-3" />
              Kaydedilmedi
            </span>
          )}
          <button
            onClick={handleStatusChange}
            disabled={publishing || !canEdit}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg transition-colors text-sm disabled:opacity-50",
              status === 'published'
                ? "bg-yellow-500/20 text-yellow-400"
                : "bg-green-500/20 text-green-400"
            )}
          >
            {publishing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : status === 'published' ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
            {status === 'published' ? 'Taslak' : 'Yayınla'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !canEdit}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-teal-500 text-white rounded-lg text-sm disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Kaydet
          </button>
        </div>
      </div>
    </div>
  )
}
