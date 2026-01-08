'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, PawPrint, Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Testimonial {
  id: string
  full_name: string
  pet_name: string
  pet_type?: string
  pet_photo_url?: string
  owner_photo_url?: string
  rating: number
  comment: string
  treatment?: string
  submitted_at?: string
}

// Fallback testimonials if API fails
const fallbackTestimonials: Testimonial[] = [
  {
    id: '1',
    full_name: "Boncuk'un Ailesi",
    pet_name: "Boncuk",
    pet_type: "Golden Retriever",
    pet_photo_url: "/images/testimonials/1552053831-71594a27632d.webp",
    owner_photo_url: "/images/testimonials/1494790108377-be9c29b29330.webp",
    rating: 5,
    comment: "Boncuk'un kalp ameliyatı sonrası iyileşme süreci mükemmeldi. Murat Bey ve ekibi her aşamada yanımızdaydı. Minnettarız! 🐾",
    treatment: "Kalp Cerrahisi"
  },
]

// Calculate relative time in Turkish
function getRelativeTime(dateStr?: string): string {
  if (!dateStr) return '1 hafta önce'
  const now = new Date()
  const date = new Date(dateStr)
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffDays < 1) return 'Bugün'
  if (diffDays === 1) return 'Dün'
  if (diffDays < 7) return `${diffDays} gün önce`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} hafta önce`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} ay önce`
  return `${Math.floor(diffDays / 365)} yıl önce`
}

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(fallbackTestimonials)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTestimonials() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/public/testimonials`)
        if (res.ok) {
          const data = await res.json()
          if (data.testimonials && data.testimonials.length > 0) {
            setTestimonials(data.testimonials)
          }
        }
      } catch (err) {
        console.error('Failed to fetch testimonials:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchTestimonials()
  }, [])

  const nextSlide = () => {
    setDirection(1)
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevSlide = () => {
    setDirection(-1)
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const current = testimonials[currentIndex]

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0,
      scale: 0.9,
    }),
  }

  // Default images if not provided
  const petImage = current.pet_photo_url || '/images/testimonials/1552053831-71594a27632d.webp'
  const ownerImage = current.owner_photo_url || '/images/testimonials/1494790108377-be9c29b29330.webp'
  const displayName = current.full_name?.includes('Ailesi') ? current.full_name : `${current.pet_name}'in Ailesi`

  return (
    <section className="py-24 bg-[#030712] relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <motion.div 
          className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[150px]"
          animate={{ x: [0, -30, 0], y: [0, 40, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-1/4 left-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[130px]"
          animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Floating Hearts */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[
          { left: '10%', top: '20%', yOffset: -55, duration: 2.8, delay: 0 },
          { left: '25%', top: '20%', yOffset: -60, duration: 3.0, delay: 0.3 },
          { left: '40%', top: '20%', yOffset: -50, duration: 2.6, delay: 0.6 },
          { left: '55%', top: '20%', yOffset: -65, duration: 3.2, delay: 0.9 },
          { left: '70%', top: '20%', yOffset: -58, duration: 2.9, delay: 1.2 },
          { left: '85%', top: '20%', yOffset: -52, duration: 2.7, delay: 1.5 },
          { left: '10%', top: '60%', yOffset: -48, duration: 3.1, delay: 1.8 },
          { left: '25%', top: '60%', yOffset: -62, duration: 2.5, delay: 2.1 },
          { left: '40%', top: '60%', yOffset: -56, duration: 3.3, delay: 2.4 },
          { left: '55%', top: '60%', yOffset: -45, duration: 2.8, delay: 2.7 },
          { left: '70%', top: '60%', yOffset: -68, duration: 3.0, delay: 3.0 },
          { left: '85%', top: '60%', yOffset: -53, duration: 2.6, delay: 3.3 },
        ].map((heart, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{ left: heart.left, top: heart.top }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: [0, 1.2, 1, 0],
              opacity: [0, 0.6, 0.4, 0],
              y: [0, heart.yOffset],
            }}
            transition={{ duration: heart.duration, repeat: Infinity, delay: heart.delay, ease: "easeOut" }}
          >
            <Heart className={cn(
              "fill-current",
              i % 3 === 0 ? "w-5 h-5 text-pink-400/50" :
              i % 3 === 1 ? "w-4 h-4 text-pink-500/40" : "w-6 h-6 text-red-400/40"
            )} />
          </motion.div>
        ))}
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center space-x-2 bg-teal-500/20 backdrop-blur-sm border border-teal-400/40 rounded-full px-5 py-2.5 mb-6 shadow-lg shadow-teal-500/10"
          >
            <Heart className="w-4 h-4 text-teal-400 fill-teal-400" />
            <span className="text-sm font-semibold text-teal-300">Mutlu Dostlar</span>
          </motion.div>
          
          <h2 className="text-3xl lg:text-5xl font-bold text-white mt-2 mb-4">
            Patili Dostlarımız
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-400 to-emerald-400"> Ne Dedi?</span>
          </h2>
          
          <p className="text-gray-400 max-w-2xl mx-auto">
            Binlerce mutlu dostumuzun hikayelerinden bazıları
          </p>
        </motion.div>

        {/* Main Testimonial Card */}
        <div className="relative max-w-4xl mx-auto">
          {/* Navigation Arrows */}
          <motion.button
            onClick={prevSlide}
            whileHover={{ scale: 1.1, backgroundColor: 'rgba(20, 184, 166, 0.3)' }}
            whileTap={{ scale: 0.95 }}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-16 z-20 p-3 rounded-full bg-black/50 backdrop-blur-xl border border-white/20 text-white hover:border-teal-400/50 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>

          <motion.button
            onClick={nextSlide}
            whileHover={{ scale: 1.1, backgroundColor: 'rgba(20, 184, 166, 0.3)' }}
            whileTap={{ scale: 0.95 }}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-16 z-20 p-3 rounded-full bg-black/50 backdrop-blur-xl border border-white/20 text-white hover:border-teal-400/50 transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </motion.button>

          {/* Card Container */}
          <div className="relative overflow-hidden rounded-3xl">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 lg:p-12"
              >
                {/* Quote Icon */}
                <div className="absolute top-6 right-6 lg:top-8 lg:right-8">
                  <Quote className="w-12 h-12 lg:w-16 lg:h-16 text-teal-500/20" />
                </div>

                <div className="flex flex-col lg:flex-row gap-8 items-center">
                  {/* Pet Image with Owner Photo */}
                  <motion.div className="relative flex-shrink-0">
                    <div className="relative">
                      <motion.div
                        className="absolute -inset-3 rounded-full bg-gradient-to-r from-teal-500/50 via-cyan-500/50 to-emerald-500/50 blur-xl"
                        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      />
                      {/* Pet Photo */}
                      <div className="relative w-32 h-32 lg:w-40 lg:h-40 rounded-full overflow-hidden border-4 border-white/20">
                        <img loading="lazy" src={petImage} alt={current.pet_name} className="w-full h-full object-cover" />
                      </div>
                      {/* Paw Icon - Top Left */}
                      <motion.div
                        className="absolute -top-1 -left-1 w-10 h-10 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 flex items-center justify-center z-10"
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <PawPrint className="w-5 h-5 text-white" />
                      </motion.div>
                    </div>
                    {/* Owner Photo - Outside of relative container to avoid clipping */}
                    <motion.div
                      className="absolute bottom-8 right-0 w-14 h-14 lg:w-16 lg:h-16 rounded-full overflow-hidden border-4 border-[#030712] shadow-xl bg-gray-800 z-20"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4, type: 'spring' }}
                    >
                      <img loading="lazy" src={ownerImage} alt={displayName} className="w-full h-full object-cover" />
                    </motion.div>
                    <div className="text-center mt-4">
                      <p className="text-lg font-bold text-white">{current.pet_name}</p>
                      <p className="text-sm text-gray-400">{current.pet_type || 'Evcil Hayvan'}</p>
                    </div>
                  </motion.div>

                  {/* Content */}
                  <div className="flex-1 text-center lg:text-left">
                    <div className="flex justify-center lg:justify-start space-x-1 mb-4">
                      {[...Array(current.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                    {current.treatment && (
                      <div className="inline-flex items-center space-x-2 bg-cyan-500/20 border border-cyan-400/30 rounded-full px-3 py-1 mb-4">
                        <span className="text-xs font-medium text-cyan-300">{current.treatment}</span>
                      </div>
                    )}
                    <p className="text-lg lg:text-xl text-gray-200 leading-relaxed mb-6">
                      &quot;{current.comment}&quot;
                    </p>
                    <div>
                      <p className="font-semibold text-white">{displayName}</p>
                      <p className="text-sm text-gray-500">{getRelativeTime(current.submitted_at)}</p>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-teal-400/30 rounded-bl-lg" />
                <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-cyan-400/30 rounded-br-lg" />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dot Indicators */}
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => {
                  setDirection(index > currentIndex ? 1 : -1)
                  setCurrentIndex(index)
                }}
                whileHover={{ scale: 1.2 }}
                className="relative h-2 overflow-hidden rounded-full transition-all duration-300"
                style={{ width: index === currentIndex ? '32px' : '8px' }}
              >
                <div className={cn(
                  'absolute inset-0 rounded-full transition-all duration-300',
                  index === currentIndex
                    ? 'bg-gradient-to-r from-teal-500 via-cyan-500 to-emerald-500'
                    : 'bg-white/30 hover:bg-white/50'
                )} />
              </motion.button>
            ))}
          </div>
        </div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
        >
          {[
            { value: '10,000+', label: 'Mutlu Dost', icon: PawPrint },
            { value: '4.9/5', label: 'Ortalama Puan', icon: Star },
            { value: '%98', label: 'Memnuniyet', icon: Heart },
            { value: '15+', label: 'Yıllık Güven', icon: Quote },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 + index * 0.1 }}
              whileHover={{ scale: 1.03, borderColor: 'rgba(236, 72, 153, 0.5)' }}
              className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 text-center group"
            >
              <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-gradient-to-r from-teal-500/20 to-cyan-500/20 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-teal-400" />
              </div>
              <p className="text-2xl lg:text-3xl font-bold text-white group-hover:text-teal-400 transition-colors">
                {stat.value}
              </p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
