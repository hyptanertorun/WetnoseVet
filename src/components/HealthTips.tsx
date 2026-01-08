'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, ArrowRight, Sparkles, Clock, Loader2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { getPublicBlogPosts, BlogPost } from '@/lib/publicApi'
import { useReducedMotion } from '@/hooks/useReducedMotion'

// Fallback görsel paleti - farklı kategoriler için
const categoryColors: Record<string, string> = {
  'kedi': 'from-pink-500 to-rose-500',
  'köpek': 'from-amber-500 to-orange-500',
  'beslenme': 'from-emerald-500 to-green-500',
  'aşı': 'from-cyan-500 to-teal-500',
  'bakım': 'from-purple-500 to-violet-500',
  'default': 'from-teal-500 to-cyan-500'
}

const getColorForPost = (title: string, category?: string): string => {
  const lowerTitle = title.toLowerCase()
  const lowerCategory = (category || '').toLowerCase()
  
  if (lowerTitle.includes('kedi') || lowerCategory.includes('kedi')) return categoryColors['kedi']
  if (lowerTitle.includes('köpek') || lowerCategory.includes('köpek')) return categoryColors['köpek']
  if (lowerTitle.includes('beslenme') || lowerTitle.includes('mama')) return categoryColors['beslenme']
  if (lowerTitle.includes('aşı')) return categoryColors['aşı']
  if (lowerTitle.includes('bakım')) return categoryColors['bakım']
  return categoryColors['default']
}

// Fallback görsel
const fallbackImage = '/images/general/1450778869180-41d0601e046e.webp'

export default function HealthTips() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    async function loadPosts() {
      try {
        const data = await getPublicBlogPosts()
        // Sadece yayınlanmış yazıları al ve ilk 4 tanesini göster
        const publishedPosts = data.filter(post => post.published_at).slice(0, 4)
        setPosts(publishedPosts)
      } catch (error) {
        console.error('Blog yazıları yüklenemedi:', error)
      }
      setLoading(false)
    }
    loadPosts()
  }, [])
  // Yazı yoksa veya yükleniyorsa gösterilecek
  if (loading) {
    return (
      <section id="health-tips" className="py-20 bg-[#0a0f1a] relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
        </div>
      </section>
    )
  }

  // Eğer hiç yazı yoksa bu bölümü gösterme
  if (posts.length === 0) {
    return null
  }

  return (
    <section id="health-tips" className="py-20 bg-[#0a0f1a] relative overflow-hidden">
      {/* Background Effects - pointer-events-none */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center space-x-2 bg-cyan-500/20 backdrop-blur-sm border border-cyan-400/40 rounded-full px-5 py-2.5 mb-6 shadow-lg shadow-cyan-500/10"
          >
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-semibold text-cyan-300">Sağlık Rehberi</span>
          </motion.div>
          
          <h2 className="text-3xl lg:text-5xl font-bold text-white mt-2 mb-4">
            Evcil Hayvan
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-400"> Sağlık İpuçları</span>
          </h2>
          
          <p className="text-gray-400 max-w-2xl mx-auto">
            Dostlarınızın sağlıklı ve mutlu bir yaşam sürmesi için uzman önerilerimiz
          </p>
        </motion.div>

        {/* Tips Grid - Dinamik */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 30 }}
              whileInView={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: Math.min(index * 0.1, 0.3) }}
              whileHover={prefersReducedMotion ? {} : { y: -8 }}
              className="group"
            >
              <Link 
                href={`/saglik-rehberi/${post.slug}`}
                className="block relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-cyan-400/50 transition-all duration-500 cursor-pointer h-full"
              >
                {/* Image - Optimized with Next.js Image */}
                <div className="relative h-40 overflow-hidden">
                  {post.cover_image_url ? (
                    <Image
                      src={post.cover_image_url}
                      alt={post.cover_image_alt || post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      quality={75}
                      loading="lazy"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <Image
                      src={fallbackImage}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      quality={60}
                      loading="lazy"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1a] to-transparent" />
                  
                  {/* Category Badge */}
                  {post.category && (
                    <div className="absolute top-3 left-3">
                      <span className="text-xs font-medium text-white bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">
                        {post.category}
                      </span>
                    </div>
                  )}

                  {/* Color Accent */}
                  <div
                    className={`absolute bottom-3 right-3 w-10 h-10 rounded-xl bg-gradient-to-r ${getColorForPost(post.title, post.category)} flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:rotate-12`}
                  >
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2 flex-1">
                      {post.excerpt}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-auto">
                    {post.reading_time && (
                      <span className="flex items-center text-xs text-gray-500">
                        <Clock className="w-3 h-3 mr-1" />
                        {post.reading_time} dk
                      </span>
                    )}
                    <span className="flex items-center space-x-1 text-cyan-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
                      <span>Oku</span>
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <Link 
            href="/saglik-rehberi"
            className="inline-flex items-center space-x-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-400/50 text-white px-6 py-3 rounded-xl transition-all hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
          >
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <span>Tüm Rehberleri Gör</span>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
