'use client'

import { useEffect, useState, useMemo, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ClinicRhythmCompact from '@/components/ClinicRhythmCompact'
import { getPublicBlogPosts, BlogPost } from '@/lib/publicApi'
import { ArrowRight, BookOpen, Clock, Loader2, PawPrint, Search, X, Tag } from 'lucide-react'
import Link from 'next/link'
import { useReducedMotion } from '@/hooks/useReducedMotion'

// Kategori tanımları (sidebar ile senkron)
const CATEGORIES = [
  { name: 'Kedi Sağlığı', slug: 'kedi-sagligi', icon: '🐱' },
  { name: 'Köpek Sağlığı', slug: 'kopek-sagligi', icon: '🐕' },
  { name: 'Beslenme', slug: 'beslenme', icon: '🥗' },
  { name: 'Davranış', slug: 'davranis', icon: '🧠' },
  { name: 'Eğitim', slug: 'egitim', icon: '📚' },
  { name: 'Bakım', slug: 'bakim', icon: '✨' },
]

// Main content component that uses useSearchParams
function SaglikRehberiContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const prefersReducedMotion = useReducedMotion()

  // URL'den filtreleri al
  const kategoriParam = searchParams.get('kategori')
  const etiketParam = searchParams.get('etiket')
  const qParam = searchParams.get('q')

  // İlk yüklemede URL parametrelerini local state'e aktar
  useEffect(() => {
    if (qParam) {
      setSearchQuery(qParam)
    }
  }, [qParam])

  useEffect(() => {
    async function loadPosts() {
      const data = await getPublicBlogPosts()
      // Filter only published posts (published_at is not null)
      const publishedPosts = data.filter(post => post.published_at)
      setPosts(publishedPosts)
      setLoading(false)
    }
    loadPosts()
  }, [])

  // Filtreleme mantığı
  const filteredPosts = useMemo(() => {
    let result = [...posts]
    
    // Kategori filtresi
    if (kategoriParam) {
      const catName = CATEGORIES.find(c => c.slug === kategoriParam)?.name.toLowerCase()
      result = result.filter(post => {
        const postCat = (post.category || '').toLowerCase()
        return postCat.includes(kategoriParam.replace('-', ' ')) || 
               (catName && postCat.includes(catName))
      })
    }
    
    // Etiket filtresi
    if (etiketParam) {
      result = result.filter(post => 
        post.tags?.some(tag => tag.toLowerCase() === etiketParam.toLowerCase())
      )
    }
    
    // Arama filtresi
    const searchTerm = qParam || searchQuery
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase()
      result = result.filter(post =>
        post.title.toLowerCase().includes(lowerSearch) ||
        (post.excerpt || '').toLowerCase().includes(lowerSearch) ||
        (post.category || '').toLowerCase().includes(lowerSearch) ||
        post.tags?.some(tag => tag.toLowerCase().includes(lowerSearch))
      )
    }
    
    return result
  }, [posts, kategoriParam, etiketParam, qParam, searchQuery])

  // Filtre temizle
  const clearFilters = () => {
    setSearchQuery('')
    router.push('/saglik-rehberi')
  }

  // Aktif filtre var mı?
  const hasActiveFilters = kategoriParam || etiketParam || qParam || searchQuery

  // Arama submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/saglik-rehberi?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  // Format date to Turkish
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  // Aktif filtre etiketi oluştur
  const getActiveFilterLabel = () => {
    if (kategoriParam) {
      const cat = CATEGORIES.find(c => c.slug === kategoriParam)
      return cat ? `${cat.icon} ${cat.name}` : kategoriParam
    }
    if (etiketParam) return `#${etiketParam}`
    if (qParam) return `"${qParam}"`
    return null
  }

  return (
    <main className="min-h-screen bg-[#030712]">
      <Header />
        
        <section className="pt-32 pb-24 relative overflow-hidden">
          {/* Background Effects - simplified for performance */}
          <div className="absolute inset-0 pointer-events-none">
            {!prefersReducedMotion ? (
              <>
                <motion.div 
                  className="absolute top-1/4 left-0 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[180px]"
                  animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
                  transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div 
                  className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[150px]"
                  animate={{ x: [0, -40, 0], y: [0, -20, 0] }}
                  transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                />
              </>
            ) : (
              <>
                <div className="absolute top-1/4 left-0 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[180px]" />
                <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[150px]" />
              </>
            )}
          </div>

          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(20,184,166,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(20,184,166,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <motion.div
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 40, filter: 'blur(10px)' }}
              animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: prefersReducedMotion ? 0.3 : 0.8 }}
              className="text-center mb-16"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center space-x-2 bg-teal-500/20 backdrop-blur-sm border border-teal-400/35 rounded-full px-5 py-2.5 mb-6"
              >
                <PawPrint className="w-4 h-4 text-teal-400" />
                <span className="text-sm font-semibold text-teal-300">Evcil Hayvan Sağlık İpuçları</span>
              </motion.div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
                Sağlık Rehberi
              </h1>
              <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto">
                Kedi ve köpekler için güvenilir sağlık bilgileri, aşı rehberleri ve bakım ipuçları
              </p>
            </motion.div>

            {/* Clinic Rhythm Compact */}
            <div className="max-w-2xl mx-auto">
              <ClinicRhythmCompact />
            </div>

            {/* Search & Filter Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8 mb-8"
            >
              {/* Search Form */}
              <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto mb-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Yazılarda ara..."
                    className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 transition-colors"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </form>

              {/* Category Pills - Horizontal Scroll */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide justify-center flex-wrap">
                <Link
                  href="/saglik-rehberi"
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    !kategoriParam
                      ? 'bg-teal-500/30 text-teal-300 border border-teal-400/50'
                      : 'bg-gray-800/50 text-gray-400 border border-gray-700 hover:border-gray-600'
                  }`}
                >
                  Tümü
                </Link>
                {CATEGORIES.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/saglik-rehberi?kategori=${cat.slug}`}
                    className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      kategoriParam === cat.slug
                        ? 'bg-teal-500/30 text-teal-300 border border-teal-400/50'
                        : 'bg-gray-800/50 text-gray-400 border border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
                  </Link>
                ))}
              </div>

              {/* Active Filter Indicator */}
              {hasActiveFilters && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <span className="text-sm text-gray-500">Filtre:</span>
                  <span className="flex items-center gap-1 px-3 py-1 bg-teal-500/20 border border-teal-400/30 rounded-full text-sm text-teal-300">
                    {etiketParam && <Tag className="w-3 h-3" />}
                    {getActiveFilterLabel()}
                    <button onClick={clearFilters} className="ml-1 hover:text-white">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                  <span className="text-sm text-gray-500">
                    ({filteredPosts.length} sonuç)
                  </span>
                </div>
              )}
            </motion.div>

            {/* Loading State */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
              </div>
            ) : filteredPosts.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20"
              >
                <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                {hasActiveFilters ? (
                  <>
                    <p className="text-gray-400 text-lg">Aramanızla eşleşen içerik bulunamadı</p>
                    <p className="text-gray-500 text-sm mt-2">Farklı anahtar kelimeler veya kategoriler deneyin</p>
                    <button 
                      onClick={clearFilters}
                      className="mt-4 px-4 py-2 bg-teal-500/20 border border-teal-400/30 rounded-lg text-teal-400 hover:bg-teal-500/30 transition-colors"
                    >
                      Filtreleri Temizle
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-gray-400 text-lg">Henüz içerik eklenmemiş</p>
                    <p className="text-gray-500 text-sm mt-2">Yakında faydalı sağlık rehberleri burada olacak</p>
                  </>
                )}
              </motion.div>
            ) : (
              /* Posts Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts.map((post, index) => (
                  <motion.article
                    key={post.id}
                    initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 40 }}
                    animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.1, 0.5), duration: prefersReducedMotion ? 0.2 : 0.6 }}
                  >
                    <Link href={`/saglik-rehberi/${post.slug}`}>
                      <motion.div
                        whileHover={prefersReducedMotion ? {} : { y: -8, scale: 1.02 }}
                        className="group relative h-full bg-teal-500/10 backdrop-blur-xl border border-teal-400/20 rounded-2xl overflow-hidden hover:border-teal-400/50 transition-all cursor-pointer flex flex-col"
                        style={{
                          boxShadow: '0 4px 30px rgba(0,0,0,0.3)'
                        }}
                      >
                        {/* Cover Image - Optimized */}
                        {post.cover_image_url ? (
                          <div className="relative h-48 overflow-hidden bg-gray-800">
                            <Image
                              src={post.cover_image_url}
                              alt={post.cover_image_alt || post.title}
                              fill
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              quality={60}
                              loading={index < 6 ? 'eager' : 'lazy'}
                              priority={index < 3}
                              placeholder="blur"
                              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIhAAAgIBAwUBAAAAAAAAAAAAAQIDEQAEBSEGEhMxQVH/xAAVAQEBAAAAAAAAAAAAAAAAAAADBP/EABsRAAEEAwAAAAAAAAAAAAAAAAEAAgMRITFB/9oADAMBAAIRAxEAPwC3091NuO37VBp9VtqsYkMjSROGYk0fQI4+Zz22rsV9VaPYMY"
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-transparent" />
                          </div>
                        ) : (
                          <div className="relative h-48 bg-gradient-to-br from-teal-500/20 to-cyan-500/20 flex items-center justify-center">
                            <BookOpen className="w-12 h-12 text-teal-400/50" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-transparent" />
                          </div>
                        )}

                        {/* Content */}
                        <div className="p-6 flex flex-col flex-grow">
                          {/* Category & Reading Time */}
                          <div className="flex items-center justify-between mb-3">
                            {post.category && (
                              <span className="text-xs font-medium text-teal-400 bg-teal-500/20 px-2 py-1 rounded-full">
                                {post.category}
                              </span>
                            )}
                            {post.reading_time && (
                              <span className="flex items-center text-xs text-gray-500">
                                <Clock className="w-3 h-3 mr-1" />
                                {post.reading_time} dk okuma
                              </span>
                            )}
                          </div>

                          {/* Title */}
                          <h2 className="text-lg font-bold text-white mb-2 group-hover:text-teal-300 transition-colors line-clamp-2">
                            {post.title}
                          </h2>

                          {/* Excerpt */}
                          {post.excerpt && (
                            <p className="text-gray-400 text-sm mb-4 line-clamp-3 flex-grow">
                              {post.excerpt}
                            </p>
                          )}

                          {/* Footer */}
                          <div className="flex items-center justify-between mt-auto pt-4 border-t border-teal-400/10">
                            {post.published_at && (
                              <span className="text-xs text-gray-500">
                                {formatDate(post.published_at)}
                              </span>
                            )}
                            <span className="flex items-center text-teal-400 text-sm font-medium">
                              Devamını Oku
                              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                            </span>
                          </div>
                        </div>

                        {/* Hover Glow */}
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-teal-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                      </motion.div>
                    </Link>
                  </motion.article>
                ))}
              </div>
            )}
          </div>
        </section>

        <Footer />
    </main>
  )
}

// Loading fallback component
function LoadingFallback() {
  return (
    <main className="min-h-screen bg-[#030712]">
      <Header />
      <section className="pt-32 pb-24 relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}

// Main page export with Suspense boundary
export default function SaglikRehberiPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SaglikRehberiContent />
    </Suspense>
  )
}
