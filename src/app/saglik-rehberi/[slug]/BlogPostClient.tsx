'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { BlogPost, FAQItem } from '@/lib/publicApi'
import { 
  ArrowLeft, Calendar, Clock, ChevronDown, ChevronRight, MessageCircle, 
  PawPrint, Shield, Search, Folder, List, TrendingUp, Tag,
  Eye, Share2, Facebook, Twitter, Link as LinkIcon, Check, BookOpen
} from 'lucide-react'
import Link from 'next/link'
import Script from 'next/script'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || ''
const BASE_URL = 'https://www.wetnose.com.tr'

// Categories with icons and colors
const CATEGORIES = [
  { name: 'Kedi Sağlığı', slug: 'kedi-sagligi', icon: '🐱', color: 'from-pink-500 to-rose-500' },
  { name: 'Köpek Sağlığı', slug: 'kopek-sagligi', icon: '🐕', color: 'from-amber-500 to-orange-500' },
  { name: 'Beslenme', slug: 'beslenme', icon: '🥗', color: 'from-green-500 to-emerald-500' },
  { name: 'Davranış', slug: 'davranis', icon: '🧠', color: 'from-purple-500 to-violet-500' },
  { name: 'Eğitim', slug: 'egitim', icon: '📚', color: 'from-blue-500 to-cyan-500' },
  { name: 'Bakım', slug: 'bakim', icon: '✨', color: 'from-teal-500 to-cyan-500' },
]

// Extract headings from HTML content for TOC
function extractHeadings(html: string): { id: string; text: string; level: number }[] {
  const headings: { id: string; text: string; level: number }[] = []
  const regex = /<h([23])[^>]*>(.*?)<\/h\1>/gi
  let match
  let index = 0
  
  while ((match = regex.exec(html)) !== null) {
    const level = parseInt(match[1])
    const text = match[2].replace(/<[^>]*>/g, '').trim()
    const id = `heading-${index}`
    headings.push({ id, text, level })
    index++
  }
  
  return headings
}

// Add IDs to headings in HTML
function addHeadingIds(html: string): string {
  let index = 0
  return html.replace(/<h([23])([^>]*)>(.*?)<\/h\1>/gi, (match, level, attrs, content) => {
    const id = `heading-${index}`
    index++
    return `<h${level}${attrs} id="${id}">${content}</h${level}>`
  })
}

// FAQ Accordion Component
function FAQAccordion({ faq, prefersReducedMotion }: { faq: FAQItem[], prefersReducedMotion: boolean }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="space-y-3">
      {faq.map((item, index) => (
        <motion.div
          key={index}
          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
          animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          transition={{ delay: Math.min(index * 0.1, 0.3) }}
          className="bg-teal-500/10 backdrop-blur-xl border border-teal-400/20 rounded-xl overflow-hidden"
        >
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-teal-500/10 transition-colors"
          >
            <span className="text-white font-medium pr-4">{item.question}</span>
            <motion.div
              animate={{ rotate: openIndex === index ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="flex-shrink-0"
            >
              <ChevronDown className="w-5 h-5 text-teal-400" />
            </motion.div>
          </button>
          <AnimatePresence>
            {openIndex === index && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: prefersReducedMotion ? 0.1 : 0.3 }}
              >
                <div className="px-5 pb-4 text-gray-300 text-sm leading-relaxed border-t border-teal-400/10 pt-3">
                  {item.answer}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  )
}

// Sidebar Search Component
function SidebarSearch() {
  const router = useRouter()
  const [query, setQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/saglik-rehberi?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <form onSubmit={handleSearch} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Yazılarda ara..."
        className="w-full px-4 py-3 pl-11 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 transition-colors text-sm"
      />
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
    </form>
  )
}

// Table of Contents Component
function TableOfContents({ 
  headings, 
  activeId 
}: { 
  headings: { id: string; text: string; level: number }[]
  activeId: string | null 
}) {
  if (headings.length === 0) return null

  return (
    <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4">
      <h3 className="flex items-center gap-2 text-white font-semibold mb-3 text-sm">
        <List className="w-4 h-4 text-teal-400" />
        İçindekiler
      </h3>
      <nav className="space-y-1 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700">
        {headings.map((heading) => (
          <a
            key={heading.id}
            href={`#${heading.id}`}
            className={`block text-sm py-1.5 transition-colors ${
              heading.level === 3 ? 'pl-4' : ''
            } ${
              activeId === heading.id 
                ? 'text-teal-400 font-medium' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {heading.text.length > 35 ? heading.text.substring(0, 35) + '...' : heading.text}
          </a>
        ))}
      </nav>
    </div>
  )
}

// Popular Posts Component
function PopularPosts({ currentSlug }: { currentSlug: string }) {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadPosts() {
      try {
        const res = await fetch(`${API_URL}/api/public/blog?limit=5`)
        if (res.ok) {
          const data = await res.json()
          setPosts(data.posts?.filter((p: BlogPost) => p.slug !== currentSlug).slice(0, 4) || [])
        }
      } catch (e) {
        console.error('Failed to load popular posts:', e)
      }
      setLoading(false)
    }
    loadPosts()
  }, [currentSlug])

  if (loading) {
    return (
      <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          <div className="h-12 bg-gray-700 rounded"></div>
          <div className="h-12 bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  if (posts.length === 0) return null

  return (
    <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4">
      <h3 className="flex items-center gap-2 text-white font-semibold mb-3 text-sm">
        <TrendingUp className="w-4 h-4 text-teal-400" />
        Popüler Yazılar
      </h3>
      <div className="space-y-3">
        {posts.map((post, index) => (
          <Link
            key={post.id}
            href={`/saglik-rehberi/${post.slug}`}
            className="flex items-start gap-3 group"
          >
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 text-xs font-bold flex items-center justify-center">
              {index + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-300 group-hover:text-teal-400 transition-colors line-clamp-2">
                {post.title}
              </p>
              {post.reading_time && (
                <span className="text-xs text-gray-500">{post.reading_time} dk</span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

// Share Buttons Component
function ShareButtons({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false)

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`
  }

  const copyLink = async () => {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 mr-1">Paylaş:</span>
      <a
        href={shareLinks.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
        title="WhatsApp'ta paylaş"
      >
        <MessageCircle className="w-4 h-4" />
      </a>
      <a
        href={shareLinks.twitter}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-lg bg-sky-500/20 text-sky-400 hover:bg-sky-500/30 transition-colors"
        title="Twitter'da paylaş"
      >
        <Twitter className="w-4 h-4" />
      </a>
      <a
        href={shareLinks.facebook}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
        title="Facebook'ta paylaş"
      >
        <Facebook className="w-4 h-4" />
      </a>
      <button
        onClick={copyLink}
        className="p-2 rounded-lg bg-gray-700/50 text-gray-400 hover:bg-gray-700 transition-colors"
        title="Linki kopyala"
      >
        {copied ? <Check className="w-4 h-4 text-green-400" /> : <LinkIcon className="w-4 h-4" />}
      </button>
    </div>
  )
}

// Reading Progress Bar
function ReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = (scrollTop / docHeight) * 100
      setProgress(Math.min(100, Math.max(0, progress)))
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-gray-800 z-50">
      <motion.div
        className="h-full bg-gradient-to-r from-teal-500 to-cyan-500"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

interface BlogPostClientProps {
  post: BlogPost
  isThinContent?: boolean
}

export default function BlogPostClient({ post, isThinContent }: BlogPostClientProps) {
  const prefersReducedMotion = useReducedMotion()
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null)
  const [viewCount, setViewCount] = useState<number | null>(null)

  // Extract headings for TOC
  const headings = useMemo(() => {
    if (!post?.content) return []
    return extractHeadings(post.content)
  }, [post?.content])

  // Content with heading IDs
  const contentWithIds = useMemo(() => {
    if (!post?.content) return ''
    return addHeadingIds(post.content)
  }, [post?.content])

  // Track active heading for TOC
  useEffect(() => {
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveHeadingId(entry.target.id)
          }
        })
      },
      { rootMargin: '-100px 0px -80% 0px' }
    )

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [headings])

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

  // Schema generators
  const generateFAQSchema = (faq: FAQItem[]) => ({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer }
    }))
  })

  const generateArticleSchema = (post: BlogPost) => {
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.title,
      description: post.excerpt || '',
      image: post.cover_image_url || `${BASE_URL}/og-default.jpg`,
      datePublished: post.published_at,
      author: { '@type': 'Organization', name: 'Wetnose Veteriner Kliniği', url: BASE_URL },
      publisher: {
        '@type': 'Organization',
        name: 'Wetnose Veteriner Kliniği',
        logo: { '@type': 'ImageObject', url: `${BASE_URL}/logo.png` }
      },
      mainEntityOfPage: { '@type': 'WebPage', '@id': `${BASE_URL}/saglik-rehberi/${post.slug}` }
    }
  }

  const generateBreadcrumbSchema = (post: BlogPost) => {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: BASE_URL },
        { '@type': 'ListItem', position: 2, name: 'Sağlık Rehberi', item: `${BASE_URL}/saglik-rehberi` },
        { '@type': 'ListItem', position: 3, name: post.title, item: `${BASE_URL}/saglik-rehberi/${post.slug}` }
      ]
    }
  }

  const hasFAQ = post.ai_metadata?.faq && post.ai_metadata.faq.length > 0
  const currentUrl = typeof window !== 'undefined' ? window.location.href : `${BASE_URL}/saglik-rehberi/${post.slug}`

  return (
    <>
      {/* Reading Progress Bar */}
      <ReadingProgress />

      {/* Schemas */}
      <Script id="article-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(generateArticleSchema(post)) }} />
      <Script id="breadcrumb-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(generateBreadcrumbSchema(post)) }} />
      {hasFAQ && <Script id="faq-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(generateFAQSchema(post.ai_metadata!.faq!)) }} />}
      
      {/* Thin content warning for SEO */}
      {isThinContent && (
        <meta name="robots" content="noindex, follow" />
      )}
      
      <main className="min-h-screen bg-[#030712]">
        <Header />
        
        <article className="pt-32 pb-24 relative overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-0 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[180px]" />
            <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[150px]" />
          </div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(20,184,166,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(20,184,166,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Main Layout: Sidebar + Content */}
            <div className="flex gap-8">
              
              {/* Left Sidebar - Desktop Only */}
              <aside className="hidden lg:block w-72 flex-shrink-0">
                <div className="sticky top-24 space-y-6">
                  {/* Search */}
                  <SidebarSearch />

                  {/* Categories */}
                  <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4">
                    <h3 className="flex items-center gap-2 text-white font-semibold mb-3 text-sm">
                      <Folder className="w-4 h-4 text-teal-400" />
                      Kategoriler
                    </h3>
                    <div className="space-y-1">
                      {CATEGORIES.map((cat) => {
                        const isActive = post.category?.toLowerCase().includes(cat.slug.replace('-', ' '))
                        return (
                          <Link
                            key={cat.slug}
                            href={`/saglik-rehberi?category=${cat.slug}`}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                              isActive 
                                ? 'bg-teal-500/20 text-teal-400' 
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                            }`}
                          >
                            <span>{cat.icon}</span>
                            <span>{cat.name}</span>
                          </Link>
                        )
                      })}
                    </div>
                  </div>

                  {/* Table of Contents */}
                  <TableOfContents headings={headings} activeId={activeHeadingId} />

                  {/* Popular Posts */}
                  <PopularPosts currentSlug={post.slug} />
                </div>
              </aside>

              {/* Main Content */}
              <div className="flex-1 min-w-0">
                {/* Breadcrumb */}
                <motion.nav
                  initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-sm text-gray-400 mb-8 flex-wrap"
                >
                  <Link href="/" className="hover:text-teal-400 transition-colors">Ana Sayfa</Link>
                  <ChevronRight className="w-4 h-4" />
                  <Link href="/saglik-rehberi" className="hover:text-teal-400 transition-colors">Sağlık Rehberi</Link>
                  <ChevronRight className="w-4 h-4" />
                  <span className="text-gray-500 truncate max-w-[200px]">{post.title}</span>
                </motion.nav>

                {/* Back Button - Mobile */}
                <Link
                  href="/saglik-rehberi"
                  className="lg:hidden inline-flex items-center gap-2 text-teal-400 hover:text-teal-300 mb-6 text-sm font-medium transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Tüm Yazılar
                </Link>

                {/* Category Badge */}
                {post.category && (
                  <motion.div
                    initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-4"
                  >
                    <Link
                      href={`/saglik-rehberi?category=${post.category.toLowerCase().replace(/\s+/g, '-')}`}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-teal-500/20 border border-teal-400/30 rounded-full text-teal-400 text-sm font-medium hover:bg-teal-500/30 transition-colors"
                    >
                      <Tag className="w-3 h-3" />
                      {post.category}
                    </Link>
                  </motion.div>
                )}

                {/* Title */}
                <motion.h1
                  initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight"
                >
                  {post.title}
                </motion.h1>

                {/* Meta info */}
                <motion.div
                  initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-wrap items-center gap-4 mb-8 text-sm text-gray-400"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-cyan-400 flex items-center justify-center">
                      <PawPrint className="w-4 h-4 text-white" />
                    </div>
                    <span>Wetnose Ekibi</span>
                  </div>
                  
                  {post.published_at && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-teal-400" />
                      <span>{formatDate(post.published_at)}</span>
                    </div>
                  )}
                  
                  {post.reading_time && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-teal-400" />
                      <span>{post.reading_time} dk okuma</span>
                    </div>
                  )}

                  {viewCount !== null && (
                    <div className="flex items-center gap-1.5">
                      <Eye className="w-4 h-4 text-teal-400" />
                      <span>{viewCount} görüntülenme</span>
                    </div>
                  )}
                </motion.div>

                {/* Share Buttons */}
                <motion.div
                  initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="mb-8"
                >
                  <ShareButtons title={post.title} url={currentUrl} />
                </motion.div>

                {/* Cover Image */}
                {post.cover_image_url && (
                  <motion.div
                    initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="relative aspect-video rounded-2xl overflow-hidden mb-10 border border-gray-800"
                  >
                    <Image
                      src={post.cover_image_url}
                      alt={post.cover_image_alt || post.title}
                      fill
                      priority
                      className="object-cover"
                    />
                  </motion.div>
                )}

                {/* Excerpt / Introduction */}
                {post.excerpt && (
                  <motion.div
                    initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mb-10 p-6 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border-l-4 border-teal-500 rounded-r-xl"
                  >
                    <div className="flex items-start gap-3">
                      <BookOpen className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-300 text-lg leading-relaxed italic">
                        {post.excerpt}
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Content */}
                <motion.div
                  initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="prose prose-invert prose-lg max-w-none
                    prose-headings:font-bold prose-headings:!text-white prose-headings:scroll-mt-24
                    prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:border-b prose-h2:border-gray-700 prose-h2:pb-3 prose-h2:!text-white
                    prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4 prose-h3:!text-teal-400
                    prose-p:!text-white prose-p:leading-relaxed prose-p:mb-6
                    prose-a:text-teal-400 prose-a:no-underline hover:prose-a:underline
                    prose-strong:!text-white prose-strong:font-bold
                    prose-ul:my-6 prose-ul:list-disc prose-ul:pl-6
                    prose-ol:my-6 prose-ol:list-decimal prose-ol:pl-6
                    prose-li:!text-white prose-li:mb-2
                    prose-blockquote:border-l-4 prose-blockquote:border-teal-500 prose-blockquote:bg-teal-500/10 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-xl prose-blockquote:not-italic prose-blockquote:!text-white
                    prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-teal-400 prose-code:before:content-none prose-code:after:content-none
                    prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-800 prose-pre:rounded-xl
                    prose-img:rounded-xl prose-img:border prose-img:border-gray-800
                    [&_p]:!text-white [&_li]:!text-white [&_span]:!text-white [&_h2]:!text-white [&_h3]:!text-teal-400"
                  dangerouslySetInnerHTML={{ __html: contentWithIds }}
                />

                {/* FAQ Section */}
                {hasFAQ && (
                  <motion.section
                    initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="mt-16 pt-12 border-t border-gray-800"
                  >
                    <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                      <Shield className="w-6 h-6 text-teal-400" />
                      Sıkça Sorulan Sorular
                    </h2>
                    <FAQAccordion faq={post.ai_metadata!.faq!} prefersReducedMotion={prefersReducedMotion} />
                  </motion.section>
                )}

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <motion.div
                    initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="mt-12 pt-8 border-t border-gray-800"
                  >
                    <h3 className="text-sm font-medium text-gray-400 mb-3">Etiketler</h3>
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <Link
                          key={tag}
                          href={`/saglik-rehberi?tag=${encodeURIComponent(tag)}`}
                          className="px-3 py-1.5 bg-gray-800/50 border border-gray-700 rounded-full text-sm text-gray-400 hover:text-teal-400 hover:border-teal-500/50 transition-colors"
                        >
                          #{tag}
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Bottom Share */}
                <motion.div
                  initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="mt-12 pt-8 border-t border-gray-800"
                >
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <p className="text-gray-400 text-sm">Bu yazıyı faydalı buldunuz mu? Paylaşın!</p>
                    <ShareButtons title={post.title} url={currentUrl} />
                  </div>
                </motion.div>

                {/* Author Card */}
                <motion.div
                  initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  className="mt-12 p-6 bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-2xl"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center flex-shrink-0">
                      <PawPrint className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">Wetnose Veteriner Ekibi</h3>
                      <p className="text-gray-400 text-sm mb-3">
                        Uzman veteriner hekimlerimiz tarafından hazırlanan içeriklerle evcil dostlarınızın sağlığını koruyun.
                      </p>
                      <Link
                        href="/ekibimiz"
                        className="text-teal-400 text-sm font-medium hover:underline"
                      >
                        Ekibimizi tanıyın →
                      </Link>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </article>

        <Footer />
      </main>
    </>
  )
}
