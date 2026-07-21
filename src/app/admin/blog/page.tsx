'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { adminApi } from '@/lib/adminApi'
import { 
  FileText, Plus, Search, Eye, EyeOff, Trash2, Edit, 
  Calendar, Tag, MoreVertical, Loader2, Archive, RotateCcw,
  Sparkles, ChevronDown, Clock, Check, AlertCircle, Wand2, Image as ImageIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import ImageUploadCropper from '@/components/admin/ImageUploadCropper'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content?: string | null
  cover_image_url: string | null
  category: string | null
  tags: string[]
  status: 'draft' | 'published'
  published_at: string | null
  archived_at: string | null
  created_at: string | null
  updated_at: string | null
  ai_generated?: boolean
  ai_metadata?: {
    faq?: Array<{ question: string; answer: string }>
    last_revision_summary?: string
  } | null
  meta_title?: string | null
  meta_description?: string | null
}

interface RevisionTemplate {
  id: string
  label: string
  instruction: string
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [showArchived, setShowArchived] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)

  const loadPosts = async () => {
    setLoading(true)
    try {
      const res = await adminApi.request<{posts: BlogPost[], total: number}>(
        `/api/admin/blog?limit=50${statusFilter ? `&status=${statusFilter}` : ''}${showArchived ? '&archived=true' : ''}${search ? `&search=${encodeURIComponent(search)}` : ''}`
      )
      if (res.data) {
        setPosts(res.data.posts)
      }
    } catch (error) {
      console.error('Error loading posts:', error)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadPosts()
  }, [statusFilter, showArchived, search])

  // AI Writer'dan gelen ?edit={id} parametresiyle editörü otomatik aç
  useEffect(() => {
    const editId = new URLSearchParams(window.location.search).get('edit')
    if (!editId) return
    adminApi.request<BlogPost>(`/api/admin/blog/${editId}`).then(res => {
      if (res.data) setEditingPost(res.data)
      window.history.replaceState({}, '', '/admin/blog')
    })
  }, [])

  const handleStatusChange = async (postId: string, newStatus: string) => {
    await adminApi.request(`/api/admin/blog/${postId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus })
    })
    loadPosts()
  }

  const handleArchive = async (postId: string) => {
    if (!confirm('Bu yazıyı arşivlemek istediğinize emin misiniz?')) return
    await adminApi.request(`/api/admin/blog/${postId}`, { method: 'DELETE' })
    loadPosts()
  }

  const handleRestore = async (postId: string) => {
    await adminApi.request(`/api/admin/blog/${postId}/restore`, { method: 'POST' })
    loadPosts()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <FileText className="w-7 h-7 text-teal-400" />
            Blog Yönetimi
          </h1>
          <p className="text-gray-400 mt-1">Blog yazılarını oluşturun ve düzenleyin</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/blog/ai-writer"
            data-testid="blog-ai-write-btn"
            className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded-lg hover:bg-purple-500/30 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            AI ile Yaz
          </Link>
          <button
            onClick={() => setShowCreateModal(true)}
            data-testid="blog-new-post-btn"
            className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Yeni Yazı
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Başlık ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-teal-500"
          >
            <option value="">Tüm Durumlar</option>
            <option value="draft">Taslak</option>
            <option value="published">Yayında</option>
          </select>
          <label className="flex items-center gap-2 text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
              className="rounded bg-gray-900 border-gray-700"
            />
            Arşivleri Göster
          </label>
        </div>
      </div>

      {/* Posts List */}
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <FileText className="w-12 h-12 mb-4 opacity-50" />
            <p>Henüz blog yazısı yok</p>
            <p className="text-gray-500 text-sm mt-1">&quot;AI ile Yaz&quot; ile dakikalar içinde ilk taslağınızı oluşturabilirsiniz.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-700/50">
            {posts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 hover:bg-gray-700/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {/* Cover Image */}
                  <div className="w-20 h-14 rounded-lg overflow-hidden bg-gray-900 flex-shrink-0">
                    {post.cover_image_url ? (
                      <img src={post.cover_image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileText className="w-6 h-6 text-gray-600" />
                      </div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-white truncate">{post.title}</h3>
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-xs",
                        post.status === 'published' 
                          ? "bg-green-500/20 text-green-400" 
                          : "bg-yellow-500/20 text-yellow-400"
                      )}>
                        {post.status === 'published' ? 'Yayında' : 'Taslak'}
                      </span>
                      {post.archived_at && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-red-500/20 text-red-400">
                          Arşivde
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      {post.category && (
                        <span className="flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          {post.category}
                        </span>
                      )}
                      {post.created_at && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(post.created_at), 'dd MMM yyyy', { locale: tr })}
                        </span>
                      )}
                    </div>
                    {post.excerpt && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-1">{post.excerpt}</p>
                    )}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {post.archived_at ? (
                      <button
                        onClick={() => handleRestore(post.id)}
                        className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                        title="Geri Al"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => handleStatusChange(post.id, post.status === 'published' ? 'draft' : 'published')}
                          className={cn(
                            "p-2 rounded-lg transition-colors",
                            post.status === 'published' 
                              ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30" 
                              : "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                          )}
                          title={post.status === 'published' ? 'Yayından Kaldır' : 'Yayınla'}
                        >
                          {post.status === 'published' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => setEditingPost(post)}
                          className="p-2 rounded-lg bg-teal-500/20 text-teal-400 hover:bg-teal-500/30 transition-colors"
                          title="Düzenle"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleArchive(post.id)}
                          className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                          title="Arşivle"
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingPost) && (
        <BlogPostModal
          post={editingPost}
          onClose={() => {
            setShowCreateModal(false)
            setEditingPost(null)
          }}
          onSave={() => {
            loadPosts()
            setShowCreateModal(false)
            setEditingPost(null)
          }}
        />
      )}
    </div>
  )
}

function BlogPostModal({ 
  post, 
  onClose, 
  onSave 
}: { 
  post: BlogPost | null
  onClose: () => void
  onSave: () => void 
}) {
  const [formData, setFormData] = useState({
    title: post?.title || '',
    slug: post?.slug || '',
    excerpt: post?.excerpt || '',
    cover_image_url: post?.cover_image_url || '',
    content: '',
    category: post?.category || '',
    tags: post?.tags?.join(', ') || '',
    status: post?.status || 'draft',
    meta_title: '',
    meta_description: ''
  })
  const [relatedServiceIds, setRelatedServiceIds] = useState<string[]>(post?.related_service_ids || [])
  const [allServices, setAllServices] = useState<{ id: string; title: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingPost, setLoadingPost] = useState(false)

  // Load services for relation selector
  useEffect(() => {
    adminApi.request<{ services: { id: string; title: string }[] }>('/api/admin/services?limit=100&status=published').then(res => {
      if (res.data?.services) setAllServices(res.data.services)
    })
  }, [])
  
  // AI Revize state
  const [showAIPanel, setShowAIPanel] = useState(false)
  const [revisionTemplates, setRevisionTemplates] = useState<RevisionTemplate[]>([])
  const [customInstruction, setCustomInstruction] = useState('')
  const [revisingWith, setRevisingWith] = useState<string | null>(null)
  const [revisionResult, setRevisionResult] = useState<{
    success: boolean
    message: string
    changeSummary?: string
  } | null>(null)

  // Load full post content if editing
  useEffect(() => {
    if (post) {
      setLoadingPost(true)
      adminApi.request<BlogPost>(`/api/admin/blog/${post.id}`).then(res => {
        if (res.data) {
          setFormData(prev => ({
            ...prev,
            content: res.data?.content || '',
            meta_title: res.data?.meta_title || '',
            meta_description: res.data?.meta_description || ''
          }))
          setRelatedServiceIds(res.data?.related_service_ids || [])
        }
        setLoadingPost(false)
      })
    }
  }, [post])

  // Load revision templates when AI panel is opened
  useEffect(() => {
    if (showAIPanel && revisionTemplates.length === 0) {
      adminApi.getAIRevisionTemplates().then(res => {
        if (res.data?.templates) {
          setRevisionTemplates(res.data.templates)
        }
      })
    }
  }, [showAIPanel, revisionTemplates.length])

  const handleAIRevise = async (instruction: string, templateId?: string) => {
    if (!post) return
    
    setRevisingWith(templateId || 'custom')
    setRevisionResult(null)
    
    try {
      const res = await adminApi.reviseWithAI(post.id, instruction)
      
      if (res.data?.success && res.data.data.output) {
        const output = res.data.data.output
        
        // Update form with new AI content
        setFormData(prev => ({
          ...prev,
          title: output.title || prev.title,
          content: output.content_html || prev.content,
          meta_title: output.meta_title || prev.meta_title,
          meta_description: output.meta_description || prev.meta_description
        }))
        
        setRevisionResult({
          success: true,
          message: 'AI revizyonu tamamlandı!',
          changeSummary: output.change_summary
        })
      } else {
        setRevisionResult({
          success: false,
          message: 'Revizyon başarısız oldu'
        })
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata'
      setRevisionResult({
        success: false,
        message: `Hata: ${errorMessage}`
      })
    } finally {
      setRevisingWith(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const data = {
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      related_service_ids: relatedServiceIds
    }

    try {
      if (post) {
        await adminApi.request(`/api/admin/blog/${post.id}`, {
          method: 'PUT',
          body: JSON.stringify(data)
        })
      } else {
        await adminApi.request('/api/admin/blog', {
          method: 'POST',
          body: JSON.stringify(data)
        })
      }
      onSave()
    } catch (error) {
      console.error('Error saving post:', error)
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gray-800 border border-gray-700 rounded-xl w-full max-w-4xl my-8"
      >
        {/* Header with AI Toggle */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h3 className="text-xl font-semibold text-white">
            {post ? 'Blog Yazısını Düzenle' : 'Yeni Blog Yazısı'}
          </h3>
          {post && (
            <button
              type="button"
              onClick={() => setShowAIPanel(!showAIPanel)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
                showAIPanel 
                  ? "bg-purple-500 text-white" 
                  : "bg-purple-500/20 text-purple-400 hover:bg-purple-500/30"
              )}
            >
              <Sparkles className="w-4 h-4" />
              AI Revize
              <ChevronDown className={cn("w-4 h-4 transition-transform", showAIPanel && "rotate-180")} />
            </button>
          )}
        </div>

        {/* AI Revize Panel */}
        <AnimatePresence>
          {showAIPanel && post && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="p-6 bg-purple-500/10 border-b border-purple-500/20">
                <div className="flex items-center gap-2 mb-4">
                  <Wand2 className="w-5 h-5 text-purple-400" />
                  <h4 className="font-semibold text-white">AI Revize Komutları</h4>
                </div>
                
                {/* Quick Commands */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {revisionTemplates.map((template) => (
                    <button
                      key={template.id}
                      type="button"
                      disabled={revisingWith !== null}
                      onClick={() => handleAIRevise(template.instruction, template.id)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all",
                        revisingWith === template.id
                          ? "bg-purple-500 text-white"
                          : "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-600"
                      )}
                    >
                      {revisingWith === template.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                      {template.label}
                    </button>
                  ))}
                </div>

                {/* Custom Instruction */}
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Kendi revizyon isteğinizi yazın:</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customInstruction}
                      onChange={(e) => setCustomInstruction(e.target.value)}
                      placeholder="Örn: İlk paragrafı daha ilgi çekici yap..."
                      className="flex-1 px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    />
                    <button
                      type="button"
                      disabled={!customInstruction.trim() || revisingWith !== null}
                      onClick={() => handleAIRevise(customInstruction, 'custom')}
                      className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {revisingWith === 'custom' ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        'Uygula'
                      )}
                    </button>
                  </div>
                </div>

                {/* Revision Result */}
                {revisionResult && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "mt-4 p-3 rounded-lg flex items-start gap-3",
                      revisionResult.success 
                        ? "bg-green-500/20 border border-green-500/30" 
                        : "bg-red-500/20 border border-red-500/30"
                    )}
                  >
                    {revisionResult.success ? (
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    )}
                    <div>
                      <p className={revisionResult.success ? "text-green-400" : "text-red-400"}>
                        {revisionResult.message}
                      </p>
                      {revisionResult.changeSummary && (
                        <p className="text-sm text-gray-400 mt-1">
                          {revisionResult.changeSummary}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}

                <p className="text-xs text-gray-500 mt-3">
                  <Clock className="w-3 h-3 inline mr-1" />
                  Her revizyon önceki versiyonu otomatik kaydeder. Versiyon geçmişinden geri dönebilirsiniz.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {loadingPost ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Başlık</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-teal-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Slug (URL)</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="Otomatik oluşturulur"
                    className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Kategori</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Cover Image with Upload/AI */}
              <div className="pt-2 border-t border-gray-700">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-2">
                  <ImageIcon className="w-4 h-4" />
                  Kapak Görseli
                </label>
                <ImageUploadCropper
                  value={formData.cover_image_url}
                  onChange={(url) => setFormData(prev => ({ ...prev, cover_image_url: url }))}
                  aspectPreset="16:9"
                  uploadContext="blog"
                  title={formData.title}
                  category={formData.category}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Özet</label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                  rows={2}
                  className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-teal-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">İçerik (HTML)</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  rows={10}
                  className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-teal-500 resize-none font-mono text-sm"
                />
              </div>

              {/* SEO Section */}
              <div className="pt-2 border-t border-gray-700">
                <h4 className="text-sm font-semibold text-gray-300 mb-3">SEO Ayarları</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Meta Başlık (60 karakter)</label>
                    <input
                      type="text"
                      value={formData.meta_title}
                      onChange={(e) => setFormData(prev => ({ ...prev, meta_title: e.target.value }))}
                      maxLength={60}
                      className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-teal-500"
                    />
                    <span className="text-xs text-gray-500">{formData.meta_title.length}/60</span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Meta Açıklama (155 karakter)</label>
                    <textarea
                      value={formData.meta_description}
                      onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                      maxLength={155}
                      rows={2}
                      className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-teal-500 resize-none"
                    />
                    <span className="text-xs text-gray-500">{formData.meta_description.length}/155</span>
                  </div>
                </div>
              </div>

              {/* İlgili Hizmetler */}
              <div className="pt-2 border-t border-gray-700">
                <h4 className="text-sm font-semibold text-gray-300 mb-1">İlgili Hizmetler</h4>
                <p className="text-xs text-gray-500 mb-3">Seçilen hizmetlerin detay sayfasında bu yazı &quot;İlgili Yazılar&quot; bölümünde gösterilir.</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-36 overflow-y-auto" data-testid="blog-related-services">
                  {allServices.map(svc => (
                    <label key={svc.id} className="flex items-center gap-2 text-sm text-gray-300 bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 cursor-pointer hover:border-teal-500/50">
                      <input
                        type="checkbox"
                        checked={relatedServiceIds.includes(svc.id)}
                        onChange={(e) => setRelatedServiceIds(prev =>
                          e.target.checked ? [...prev, svc.id] : prev.filter(id => id !== svc.id)
                        )}
                        className="accent-teal-500"
                      />
                      <span className="truncate">{svc.title}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Etiketler (virgülle)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Durum</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'draft' | 'published' }))}
                    className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="draft">Taslak</option>
                    <option value="published">Yayında</option>
                  </select>
                </div>
              </div>
            </>
          )}
        </form>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            İptal
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || loadingPost}
            className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {post ? 'Kaydet' : 'Oluştur'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
