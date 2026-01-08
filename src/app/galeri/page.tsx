'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Camera, X, ChevronLeft, ChevronRight, Filter, Loader2, ImageOff, RefreshCw, Sparkles, ZoomIn } from 'lucide-react'
import { cn } from '@/lib/utils'

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || ''

interface GalleryItem {
  id: string
  image_url: string
  image_alt: string | null
  caption: string | null
  sort_order: number
}

interface GalleryAlbum {
  id: string
  title: string
  slug: string
  description: string | null
  cover_image_url: string | null
  items: GalleryItem[]
}

// Sanitize text
const sanitizeText = (text: string | null): string => {
  if (!text) return ''
  return text.replace(/[<>]/g, '').substring(0, 100)
}

export default function GaleriPage() {
  const [albums, setAlbums] = useState<GalleryAlbum[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const fetchGallery = useCallback(async () => {
    setLoading(true)
    setError(false)
    
    try {
      const response = await fetch(`${API_URL}/api/public/gallery`)
      if (response.ok) {
        const data = await response.json()
        setAlbums(data.albums || [])
      } else {
        setError(true)
      }
    } catch (err) {
      console.error('Gallery fetch error:', err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchGallery()
  }, [fetchGallery])

  // Get filtered items based on selected album
  const filteredItems = selectedAlbum
    ? albums.find(a => a.id === selectedAlbum)?.items || []
    : albums.flatMap(a => a.items.map(item => ({ ...item, albumTitle: a.title })))

  // Get full image URL
  const getImageUrl = (url: string): string => {
    if (url.startsWith('http')) return url
    return `${API_URL}${url}`
  }

  // Get display title
  const getTitle = (item: GalleryItem): string => {
    if (item.caption) return sanitizeText(item.caption)
    if (item.image_alt) {
      return sanitizeText(item.image_alt)
        .replace(/_/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase())
    }
    return 'Görsel'
  }

  // Lightbox navigation
  const openLightbox = (item: GalleryItem, index: number) => {
    setSelectedImage(item)
    setLightboxIndex(index)
  }

  const nextImage = () => {
    const newIndex = (lightboxIndex + 1) % filteredItems.length
    setLightboxIndex(newIndex)
    setSelectedImage(filteredItems[newIndex] as GalleryItem)
  }

  const prevImage = () => {
    const newIndex = (lightboxIndex - 1 + filteredItems.length) % filteredItems.length
    setLightboxIndex(newIndex)
    setSelectedImage(filteredItems[newIndex] as GalleryItem)
  }

  // Get album for current item
  const getAlbumForItem = (item: GalleryItem): GalleryAlbum | undefined => {
    return albums.find(a => a.items.some(i => i.id === item.id))
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#030712] pt-24">
        {/* Hero Section */}
        <section className="relative py-16 lg:py-24 overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0">
            <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[150px]" />
            <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-[120px]" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center space-x-2 bg-teal-500/20 backdrop-blur-sm border border-teal-400/35 rounded-full px-5 py-2.5 mb-6 shadow-lg shadow-teal-500/10"
              >
                <Camera className="w-4 h-4 text-teal-400" />
                <span className="text-sm font-semibold text-teal-300">Foto Galeri</span>
              </motion.div>
              
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                Kliniğimizden
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-teal-300"> Kareler</span>
              </h1>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Modern tesislerimiz, deneyimli ekibimiz ve mutlu dostlarımızdan anlar
              </p>
            </motion.div>

            {/* Album Filter */}
            {albums.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-wrap items-center justify-center gap-3 mb-12"
              >
                <button
                  onClick={() => setSelectedAlbum(null)}
                  className={cn(
                    "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
                    !selectedAlbum
                      ? "bg-teal-500/30 text-teal-300 border border-teal-400/50"
                      : "bg-gray-800/50 text-gray-400 border border-gray-700 hover:border-gray-600 hover:text-gray-300"
                  )}
                >
                  <Filter className="w-4 h-4" />
                  Tümü
                </button>
                {albums.map((album) => (
                  <button
                    key={album.id}
                    onClick={() => setSelectedAlbum(album.id)}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium transition-all",
                      selectedAlbum === album.id
                        ? "bg-teal-500/30 text-teal-300 border border-teal-400/50"
                        : "bg-gray-800/50 text-gray-400 border border-gray-700 hover:border-gray-600 hover:text-gray-300"
                    )}
                  >
                    {sanitizeText(album.title)} ({album.items.length})
                  </button>
                ))}
              </motion.div>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square bg-gray-800/50 rounded-2xl animate-pulse"
                  />
                ))}
              </div>
            ) : error ? (
              /* Error State */
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                  <ImageOff className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Görseller yüklenemedi</h3>
                <p className="text-gray-400 text-sm mb-4">Lütfen daha sonra tekrar deneyin</p>
                <button
                  onClick={fetchGallery}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500/20 border border-teal-400/30 rounded-lg text-teal-300 hover:bg-teal-500/30 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Tekrar Dene
                </button>
              </div>
            ) : filteredItems.length === 0 ? (
              /* Empty State */
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-full bg-teal-500/10 flex items-center justify-center mb-4">
                  <Camera className="w-8 h-8 text-teal-400" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Galeri Yakında</h3>
                <p className="text-gray-400 text-sm">Bu kategoride henüz görsel bulunmuyor</p>
              </div>
            ) : (
              /* Gallery Grid */
              <motion.div
                layout
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
              >
                <AnimatePresence mode="popLayout">
                  {filteredItems.map((item, index) => {
                    const album = getAlbumForItem(item as GalleryItem)
                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                        className="group relative aspect-square cursor-pointer overflow-hidden rounded-2xl bg-gray-800/30"
                        onClick={() => openLightbox(item as GalleryItem, index)}
                      >
                        {/* Image */}
                        <img
                          src={getImageUrl(item.image_url)}
                          alt={sanitizeText(item.image_alt) || getTitle(item as GalleryItem)}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          loading="lazy"
                        />

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                        {/* Border */}
                        <div className="absolute inset-0 rounded-2xl border-2 border-teal-400/20 group-hover:border-teal-400/50 transition-colors" />

                        {/* Content */}
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          {album && (
                            <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30 mb-2">
                              <Sparkles className="w-3 h-3" />
                              {sanitizeText(album.title)}
                            </span>
                          )}
                          <h3 className="text-white font-medium text-sm line-clamp-1 group-hover:text-teal-300 transition-colors">
                            {getTitle(item as GalleryItem)}
                          </h3>
                        </div>

                        {/* Zoom Icon */}
                        <div className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-teal-400/20 backdrop-blur-sm border border-teal-400/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <ZoomIn className="w-5 h-5 text-teal-400" />
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </section>

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

              {/* Navigation */}
              {filteredItems.length > 1 && (
                <>
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
                </>
              )}

              {/* Image */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="relative max-w-5xl max-h-[80vh] overflow-hidden rounded-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-teal-400/50 via-cyan-400/50 to-teal-400/50 blur-sm" />
                
                <motion.img
                  key={selectedImage.id}
                  src={getImageUrl(selectedImage.image_url)}
                  alt={sanitizeText(selectedImage.image_alt) || getTitle(selectedImage)}
                  className="relative rounded-2xl max-w-full max-h-[80vh] object-contain bg-[#030712]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />

                {/* Info Bar */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#030712] to-transparent">
                  <div className="flex items-center justify-between">
                    <div>
                      {getAlbumForItem(selectedImage) && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full bg-teal-400/20 text-teal-300 border border-teal-400/30 mb-2">
                          <Sparkles className="w-3 h-3" />
                          {sanitizeText(getAlbumForItem(selectedImage)?.title || '')}
                        </span>
                      )}
                      <h3 className="text-xl font-semibold text-white">{getTitle(selectedImage)}</h3>
                    </div>
                    <div className="text-gray-400 text-sm">
                      {lightboxIndex + 1} / {filteredItems.length}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <Footer />
    </>
  )
}
