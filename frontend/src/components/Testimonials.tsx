'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Quote, Heart, ChevronLeft, ChevronRight, PawPrint } from 'lucide-react'
import { cn } from '@/lib/utils'

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || ''

interface PublicTestimonial {
  id: string
  full_name: string
  pet_name: string
  pet_type?: string
  pet_photo_url: string | null
  owner_photo_url?: string | null
  service_name: string | null
  treatment?: string | null
  rating: number
  comment: string
  submitted_at?: string
}

// Fallback testimonials if API is empty
const fallbackTestimonials: PublicTestimonial[] = [
  {
    id: '1',
    full_name: "Boncuk'un Ailesi",
    pet_name: 'Boncuk',
    pet_type: 'Golden Retriever',
    pet_photo_url: '/images/testimonials/1552053831-71594a27632d.webp',
    owner_photo_url: '/images/testimonials/1494790108377-be9c29b29330.webp',
    service_name: 'Kalp Cerrahisi',
    rating: 5,
    comment: "Boncuk'un kalp ameliyatı sonrası iyileşme süreci mükemmeldi. Murat Bey ve ekibi her aşamada yanımızdaydı. 🐾"
  },
  {
    id: '2',
    full_name: "Pamuk'un Sahipleri",
    pet_name: 'Pamuk',
    pet_type: 'British Shorthair',
    pet_photo_url: '/images/testimonials/1574158622682-e40e69881006.webp',
    owner_photo_url: '/images/testimonials/1507003211169-0a1dd7228f2d.webp',
    service_name: 'Acil Müdahale',
    rating: 5,
    comment: "Gece 3'te acil durumda aradık, hemen müdahale ettiler. Pamuk şimdi tertemiz sağlıklı!"
  },
  {
    id: '3',
    full_name: "Karamel'in Annesi",
    pet_name: 'Karamel',
    pet_type: 'Poodle',
    pet_photo_url: '/images/blog/1587300003388-59208cc962cb.webp',
    owner_photo_url: '/images/testimonials/1438761681033-6461ffad8d80.webp',
    service_name: 'Diş Tedavisi',
    rating: 5,
    comment: "Karamel'in diş tedavisi için geldik, öyle profesyonel bir ortam ki! Kesinlikle tavsiye ederim."
  },
]

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<PublicTestimonial[]>(fallbackTestimonials)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [direction, setDirection] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)

  // Fetch testimonials from API
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const res = await fetch(`${API_URL}/api/public/testimonials?limit=8`)
        if (res.ok) {
          const data = await res.json()
          if (data.testimonials && data.testimonials.length > 0) {
            setTestimonials(data.testimonials)
          }
        }
      } catch (error) {
        console.error('Error fetching testimonials:', error)
      } finally {
        setIsLoaded(true)
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

  useEffect(() => {
    if (!isAutoPlaying || testimonials.length <= 1) return
    const timer = setInterval(nextSlide, 5000)
    return () => clearInterval(timer)
  }, [isAutoPlaying, testimonials.length])

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

  // Get pet image - either from API or generate placeholder
  const getPetImage = (testimonial: PublicTestimonial) => {
    if (testimonial.pet_photo_url) {
      // Check if it's a relative URL
      if (testimonial.pet_photo_url.startsWith('/')) {
        return testimonial.pet_photo_url
      }
      return testimonial.pet_photo_url
    }
    // Generate placeholder based on pet name
    return `https://api.dicebear.com/7.x/thumbs/svg?seed=${testimonial.pet_name}&backgroundColor=0891b2`
  }

  // Get owner image - either from API or generate placeholder
  const getOwnerImage = (testimonial: PublicTestimonial) => {
    if (testimonial.owner_photo_url) {
      if (testimonial.owner_photo_url.startsWith('/')) {
        return testimonial.owner_photo_url
      }
      return testimonial.owner_photo_url
    }
    // Generate placeholder based on owner name
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${testimonial.full_name}&backgroundColor=14b8a6`
  }

  return (
    <section id="testimonials" className="py-24 lg:py-28 bg-[#030712] relative overflow-hidden">
      {/* Background Effects - Parallax */}
      <div className="absolute inset-0">
        <motion.div 
          className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[150px]"
          animate={{ 
            x: [0, -30, 0],
            y: [0, 40, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-1/4 left-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[130px]"
          animate={{ 
            x: [0, 40, 0],
            y: [0, -30, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Floating Paw Prints */}
        {[
          { x: '15%', y: '20%', rotate: 45, delay: 0 },
          { x: '75%', y: '30%', rotate: 120, delay: 0.5 },
          { x: '25%', y: '70%', rotate: 200, delay: 1 },
          { x: '85%', y: '60%', rotate: 280, delay: 1.5 },
          { x: '45%', y: '15%', rotate: 30, delay: 2 },
          { x: '60%', y: '80%', rotate: 160, delay: 2.5 },
        ].map((pos, i) => (
          <motion.div
            key={i}
            className="absolute text-white/5"
            style={{ left: pos.x, top: pos.y }}
            initial={{ rotate: pos.rotate }}
            animate={{ 
              y: [0, -20, 0],
              rotate: [pos.rotate, pos.rotate + 10, pos.rotate],
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity,
              delay: pos.delay 
            }}
          >
            <PawPrint className="w-8 h-8" />
          </motion.div>
        ))}
      </div>

      {/* Heart Bubbles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[
          { left: '20%', top: '35%', size: 'w-5 h-5', color: 'text-pink-400/60', delay: 0 },
          { left: '40%', top: '45%', size: 'w-4 h-4', color: 'text-pink-500/50', delay: 0.4 },
          { left: '60%', top: '40%', size: 'w-6 h-6', color: 'text-red-400/50', delay: 0.8 },
          { left: '80%', top: '50%', size: 'w-5 h-5', color: 'text-pink-400/60', delay: 1.2 },
          { left: '30%', top: '55%', size: 'w-4 h-4', color: 'text-pink-500/50', delay: 1.6 },
          { left: '70%', top: '35%', size: 'w-6 h-6', color: 'text-red-400/50', delay: 2.0 },
          { left: '50%', top: '60%', size: 'w-5 h-5', color: 'text-pink-400/60', delay: 2.4 },
          { left: '25%', top: '45%', size: 'w-4 h-4', color: 'text-pink-500/50', delay: 2.8 },
        ].map((heart, i) => (
          <motion.div
            key={`heart-${i}`}
            className="absolute"
            style={{ left: heart.left, top: heart.top }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: [0, 1.2, 1, 0],
              opacity: [0, 0.7, 0.5, 0],
              y: [0, -60],
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              delay: heart.delay,
            }}
          >
            <Heart className={cn("fill-current", heart.size, heart.color)} />
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
        <div 
          className="relative max-w-4xl mx-auto"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          {/* Navigation Arrows */}
          {testimonials.length > 1 && (
            <>
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
            </>
          )}

          {/* Card Container */}
          <div className="relative overflow-hidden rounded-3xl">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current.id}
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
                  <motion.div 
                    className="relative flex-shrink-0"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="relative">
                      {/* Glow Ring */}
                      <motion.div
                        className="absolute -inset-3 rounded-full bg-gradient-to-r from-teal-500/50 via-cyan-500/50 to-emerald-500/50 blur-xl"
                        animate={{ 
                          scale: [1, 1.1, 1],
                          opacity: [0.5, 0.8, 0.5] 
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                      />
                      
                      {/* Pet Photo */}
                      <div className="relative w-32 h-32 lg:w-40 lg:h-40 rounded-full overflow-hidden border-4 border-white/20 bg-gray-800">
                        <img
                          src={getPetImage(current)}
                          alt={current.pet_name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>

                      {/* Owner Photo - Small circle at bottom right */}
                      <motion.div
                        className="absolute -bottom-1 -right-1 w-14 h-14 lg:w-16 lg:h-16 rounded-full overflow-hidden border-4 border-[#030712] shadow-xl bg-gray-800 z-10"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.4, type: 'spring' }}
                      >
                        <img
                          src={getOwnerImage(current)}
                          alt={current.full_name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </motion.div>

                      {/* Paw Badge */}
                      <motion.div
                        className="absolute -top-1 -left-1 w-10 h-10 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 flex items-center justify-center z-10"
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <PawPrint className="w-5 h-5 text-white" />
                      </motion.div>
                    </div>

                    {/* Pet Info */}
                    <div className="text-center mt-4">
                      <p className="text-lg font-bold text-white">{current.pet_name}</p>
                      <p className="text-sm text-gray-400">{current.pet_type || current.service_name || 'Evcil Hayvan'}</p>
                    </div>
                  </motion.div>

                  {/* Content */}
                  <div className="flex-1 text-center lg:text-left">
                    {/* Stars */}
                    <motion.div 
                      className="flex justify-center lg:justify-start space-x-1 mb-4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      {[...Array(current.rating)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: 0.4 + i * 0.1, type: 'spring' }}
                        >
                          <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                        </motion.div>
                      ))}
                    </motion.div>

                    {/* Service Badge */}
                    {current.service_name && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="inline-flex items-center space-x-2 bg-cyan-500/20 border border-cyan-400/30 rounded-full px-3 py-1 mb-4"
                      >
                        <span className="text-xs font-medium text-cyan-300">{current.service_name}</span>
                      </motion.div>
                    )}

                    {/* Quote Text */}
                    <motion.p 
                      className="text-lg lg:text-xl text-gray-200 leading-relaxed mb-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      "{current.comment}"
                    </motion.p>

                    {/* Author */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <p className="font-semibold text-white">{current.full_name}</p>
                    </motion.div>
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-teal-400/30 rounded-bl-lg" />
                <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-cyan-400/30 rounded-br-lg" />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dot Indicators */}
          {testimonials.length > 1 && (
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
          )}
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
              <motion.div
                className="w-10 h-10 mx-auto mb-3 rounded-xl bg-gradient-to-r from-teal-500/20 to-cyan-500/20 flex items-center justify-center"
                whileHover={{ rotate: 10 }}
              >
                <stat.icon className="w-5 h-5 text-teal-400" />
              </motion.div>
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
