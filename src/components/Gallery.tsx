'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { X, ZoomIn, Camera, ChevronLeft, ChevronRight, Sparkles, Loader2, RefreshCw, ImageOff } from 'lucide-react'
import { cn } from '@/lib/utils'

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || ''

interface GalleryItem {
  id: string
  image_url: string
  image_alt: string | null
  caption: string | null
  category: string
  album_id: string
  album_slug: string
}

// Assign sizes based on index for visual variety
const getSizeByIndex = (index: number): string => {
  const pattern = ['large', 'medium', 'medium', 'large', 'small', 'medium', 'small', 'large']
  return pattern[index % pattern.length]
}

// Sanitize text to prevent XSS
const sanitizeText = (text: string | null): string => {
  if (!text) return ''
  return text.replace(/[<>]/g, '').substring(0, 100)
}

export default function Gallery() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start']
  })

  const y1 = useTransform(scrollYProgress, [0, 1], [0, 0])
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 0])
  const y3 = useTransform(scrollYProgress, [0, 1], [0, 0])

  // Fetch gallery items from API
  const fetchGalleryItems = useCallback(async () => {
    setLoading(true)
    setError(false)
    
    try {
      const response = await fetch(`${API_URL}/api/public/gallery/random?limit=8`)
      if (response.ok) {
        const data = await response.json()
        if (data.items && data.items.length > 0) {
          setGalleryItems(data.items)
        } else {
          // Empty gallery - not an error, just no content yet
          setGalleryItems([])
        }
      } else {
        setError(true)
        setGalleryItems([])
      }
    } catch (err) {
      console.error('Gallery fetch error:', err)
      setError(true)
      setGalleryItems([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchGalleryItems()
  }, [fetchGalleryItems])

  // Get full image URL
  const getImageUrl = (item: GalleryItem): string => {
    if (item.image_url.startsWith('http')) {
      return item.image_url
    }
    // For local uploads, prepend the API URL
    return `${API_URL}${item.image_url}`
  }

  // Get display title for item (sanitized)
  const getTitle = (item: GalleryItem): string => {
    if (item.caption) return sanitizeText(item.caption)
    if (item.image_alt) {
      // Convert filename like "modern_muayene_odasi" to "Modern Muayene Odası"
      return sanitizeText(item.image_alt)
        .replace(/_/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase())
    }
    return 'Görsel'
  }

  // Get sanitized category
  const getCategory = (item: GalleryItem): string => {
    return sanitizeText(item.category) || 'Genel'
  }

  const openLightbox = (item: GalleryItem) => {
    setSelectedImage(item)
    setLightboxIndex(galleryItems.findIndex(g => g.id === item.id))
  }

  const nextImage = () => {
    const newIndex = (lightboxIndex + 1) % galleryItems.length
    setLightboxIndex(newIndex)
    setSelectedImage(galleryItems[newIndex])
  }

  const prevImage = () => {
    const newIndex = (lightboxIndex - 1 + galleryItems.length) % galleryItems.length
    setLightboxIndex(newIndex)
    setSelectedImage(galleryItems[newIndex])
  }

  const getParallaxY = (index: number) => {
    if (index % 3 === 0) return y1
    if (index % 3 === 1) return y2
    return y3
  }

  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'large':
        return 'col-span-2 row-span-2'
      case 'medium':
        return 'col-span-1 row-span-2'
      default:
        return 'col-span-1 row-span-1'
    }
  }

  return (
    <section id="gallery" ref={containerRef} className="py-24 lg:py-28 bg-[#030712] relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-[120px]" />
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
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
            className="inline-flex items-center space-x-2 bg-teal-500/20 backdrop-blur-sm border border-teal-400/35 rounded-full px-5 py-2.5 mb-6 shadow-lg shadow-teal-500/10"
          >
            <Camera className="w-4 h-4 text-teal-400" />
            <span className="text-sm font-semibold text-teal-300">Foto Galeri</span>
          </motion.div>
          <h2 className="text-3xl lg:text-5xl font-bold text-white mt-2">
            Kliniğimizden
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-teal-300"> Kareler</span>
          </h2>
          <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
            Modern tesislerimiz ve mutlu dostlarımızdan anlar
          </p>
        </motion.div>

        {/* Loading State - Skeleton */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[200px]">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  'bg-gray-800/50 rounded-2xl animate-pulse',
                  getSizeClasses(getSizeByIndex(i))
                )}
              />
            ))}
          </div>
        ) : error ? (
          /* Error State */
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
              <ImageOff className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Görseller yüklenemedi</h3>
            <p className="text-gray-400 text-sm mb-4">Lütfen daha sonra tekrar deneyin</p>
            <button
              onClick={fetchGalleryItems}
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500/20 border border-teal-400/30 rounded-lg text-teal-300 hover:bg-teal-500/30 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Tekrar Dene
            </button>
          </div>
        ) : galleryItems.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-teal-500/10 flex items-center justify-center mb-4">
              <Camera className="w-8 h-8 text-teal-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Galeri Yakında</h3>
            <p className="text-gray-400 text-sm">Kliniğimizden fotoğraflar yakında burada olacak</p>
          </div>
        ) : (
          <>
            {/* Masonry Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[200px]">
              {galleryItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  style={{ y: getParallaxY(index) }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    'group relative cursor-pointer overflow-hidden rounded-2xl',
                    getSizeClasses(getSizeByIndex(index))
                  )}
                  onClick={() => openLightbox(item)}
                  onMouseEnter={() => setHoveredId(item.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  {/* Image with aspect ratio container */}
                  <motion.img
                    src={getImageUrl(item)}
                    alt={sanitizeText(item.image_alt) || getTitle(item)}
                    className="absolute inset-0 w-full h-full object-cover"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    loading="lazy"
                  />

                  {/* Dark Overlay for Consistency */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-[#030712]/40 to-[#030712]/20" />

                  {/* Scan Line Effect */}
                  {hoveredId === item.id && (
                    <motion.div
                      className="absolute inset-0 pointer-events-none overflow-hidden"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {/* Horizontal Scan Line */}
                      <motion.div
                        className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-teal-400 to-transparent shadow-[0_0_20px_rgba(20,184,166,0.8)]"
                        initial={{ top: '-10%' }}
                        animate={{ top: '110%' }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                      />
                      {/* Glitch Lines */}
                      <motion.div
                        className="absolute inset-0"
                        animate={{ 
                          backgroundPosition: ['0% 0%', '100% 100%'],
                        }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                        style={{
                          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(20,184,166,0.03) 2px, rgba(20,184,166,0.03) 4px)',
                        }}
                      />
                    </motion.div>
                  )}

                  {/* Glow Border */}
                  <div className={cn(
                    "absolute inset-0 rounded-2xl border-2 transition-all duration-500",
                    hoveredId === item.id 
                      ? "border-teal-400/60 shadow-[0_0_30px_rgba(20,184,166,0.4),inset_0_0_30px_rgba(20,184,166,0.1)]" 
                      : "border-teal-400/20"
                  )} />

                  {/* Corner Brackets */}
                  <div className="absolute top-3 left-3 w-8 h-8">
                    <div className={cn(
                      "absolute top-0 left-0 w-full h-[2px] transition-all duration-300",
                      hoveredId === item.id ? "bg-teal-400 shadow-[0_0_10px_rgba(20,184,166,0.8)]" : "bg-teal-400/20"
                    )} />
                    <div className={cn(
                      "absolute top-0 left-0 h-full w-[2px] transition-all duration-300",
                      hoveredId === item.id ? "bg-teal-400 shadow-[0_0_10px_rgba(20,184,166,0.8)]" : "bg-teal-400/20"
                    )} />
                  </div>
                  <div className="absolute top-3 right-3 w-8 h-8">
                    <div className={cn(
                      "absolute top-0 right-0 w-full h-[2px] transition-all duration-300",
                      hoveredId === item.id ? "bg-teal-400 shadow-[0_0_10px_rgba(20,184,166,0.8)]" : "bg-teal-400/20"
                    )} />
                    <div className={cn(
                      "absolute top-0 right-0 h-full w-[2px] transition-all duration-300",
                      hoveredId === item.id ? "bg-teal-400 shadow-[0_0_10px_rgba(20,184,166,0.8)]" : "bg-teal-400/20"
                    )} />
                  </div>
                  <div className="absolute bottom-3 left-3 w-8 h-8">
                    <div className={cn(
                      "absolute bottom-0 left-0 w-full h-[2px] transition-all duration-300",
                      hoveredId === item.id ? "bg-teal-400 shadow-[0_0_10px_rgba(20,184,166,0.8)]" : "bg-teal-400/20"
                    )} />
                    <div className={cn(
                      "absolute bottom-0 left-0 h-full w-[2px] transition-all duration-300",
                      hoveredId === item.id ? "bg-teal-400 shadow-[0_0_10px_rgba(20,184,166,0.8)]" : "bg-teal-400/20"
                    )} />
                  </div>
                  <div className="absolute bottom-3 right-3 w-8 h-8">
                    <div className={cn(
                      "absolute bottom-0 right-0 w-full h-[2px] transition-all duration-300",
                      hoveredId === item.id ? "bg-teal-400 shadow-[0_0_10px_rgba(20,184,166,0.8)]" : "bg-teal-400/20"
                    )} />
                    <div className={cn(
                      "absolute bottom-0 right-0 h-full w-[2px] transition-all duration-300",
                      hoveredId === item.id ? "bg-teal-400 shadow-[0_0_10px_rgba(20,184,166,0.8)]" : "bg-teal-400/20"
                    )} />
                  </div>

                  {/* Content */}
                  <div className="absolute inset-0 p-4 flex flex-col justify-end">
                    {/* Category Badge */}
                    <motion.div className="mb-2">
                      <span className={cn(
                        "inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full backdrop-blur-sm transition-all duration-300 max-w-[150px] truncate",
                        hoveredId === item.id 
                          ? "bg-teal-400/30 text-teal-300 border border-teal-400/50" 
                          : "bg-teal-500/15 text-gray-300 border border-teal-400/25"
                      )}>
                        {hoveredId === item.id && <Sparkles className="w-3 h-3 flex-shrink-0" />}
                        {getCategory(item)}
                      </span>
                    </motion.div>

                    {/* Title */}
                    <h3 className={cn(
                      "font-semibold text-lg transform transition-all duration-300",
                      hoveredId === item.id 
                        ? "text-white translate-y-0" 
                        : "text-gray-200 translate-y-2"
                    )}>
                      {getTitle(item)}
                    </h3>

                    {/* View Icon */}
                    <motion.div
                      className={cn(
                        "absolute top-4 right-4 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300",
                        hoveredId === item.id 
                          ? "bg-teal-400/20 backdrop-blur-md border border-teal-400/50 opacity-100" 
                          : "bg-teal-500/10 backdrop-blur-sm opacity-0"
                      )}
                      whileHover={{ scale: 1.1 }}
                    >
                      <ZoomIn className={cn(
                        "w-5 h-5 transition-colors",
                        hoveredId === item.id ? "text-teal-400" : "text-white"
                      )} />
                    </motion.div>
                  </div>
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
              <motion.a
                href="/galeri"
                whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(20,184,166,0.4)' }}
                whileTap={{ scale: 0.95 }}
                className="relative inline-flex items-center space-x-2 bg-teal-500/25 backdrop-blur-xl border border-teal-400/35 hover:bg-teal-500/35 hover:border-teal-400/50 text-white font-semibold px-8 py-4 rounded-2xl shadow-lg shadow-teal-500/25 transition-all overflow-hidden group"
              >
                {/* Button Glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-teal-400/0 via-white/15 to-teal-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <Camera className="w-5 h-5 relative z-10" />
                <span className="relative z-10">Tüm Galeriyi Gör</span>
              </motion.a>
            </motion.div>
          </>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#030712]/98 backdrop-blur-xl p-4"
            onClick={() => setSelectedImage(null)}
          >
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:30px_30px]" />

            {/* Close Button */}
            <motion.button
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setSelectedImage(null)}
              className="absolute top-6 right-6 p-3 rounded-xl bg-white/10 hover:bg-cyan-400/20 border border-white/20 hover:border-cyan-400/50 text-white transition-all z-10"
            >
              <X className="w-6 h-6" />
            </motion.button>

            {/* Navigation Arrows */}
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={(e) => { e.stopPropagation(); prevImage() }}
              className="absolute left-4 md:left-8 p-3 rounded-xl bg-white/10 hover:bg-cyan-400/20 border border-white/20 hover:border-cyan-400/50 text-white transition-all z-10"
            >
              <ChevronLeft className="w-6 h-6" />
            </motion.button>
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={(e) => { e.stopPropagation(); nextImage() }}
              className="absolute right-4 md:right-8 p-3 rounded-xl bg-white/10 hover:bg-cyan-400/20 border border-white/20 hover:border-cyan-400/50 text-white transition-all z-10"
            >
              <ChevronRight className="w-6 h-6" />
            </motion.button>

            {/* Image Container */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-5xl max-h-[80vh] overflow-hidden rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Glow Border */}
              <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-teal-400/50 via-cyan-400/50 to-teal-400/50 blur-sm" />
              
              {/* Image */}
              <motion.img
                key={selectedImage.id}
                src={getImageUrl(selectedImage)}
                alt={selectedImage.image_alt || getTitle(selectedImage)}
                className="relative rounded-2xl max-w-full max-h-[80vh] object-contain bg-[#030712]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />

              {/* Info Bar */}
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#030712] to-transparent">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full bg-teal-400/20 text-teal-300 border border-teal-400/30 mb-2 max-w-[150px] truncate">
                      <Sparkles className="w-3 h-3 flex-shrink-0" />
                      {getCategory(selectedImage)}
                    </span>
                    <h3 className="text-xl font-semibold text-white line-clamp-2">{getTitle(selectedImage)}</h3>
                  </div>
                  <div className="text-gray-400 text-sm">
                    {lightboxIndex + 1} / {galleryItems.length}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
