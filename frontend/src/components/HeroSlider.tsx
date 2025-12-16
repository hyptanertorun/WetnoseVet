'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Play } from 'lucide-react'
import { heroSlides, siteInfo } from '@/data/siteData'
import { cn } from '@/lib/utils'

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [direction, setDirection] = useState(0)

  const nextSlide = useCallback(() => {
    setDirection(1)
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
  }, [])

  const prevSlide = useCallback(() => {
    setDirection(-1)
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)
  }, [])

  // Auto-advance slides
  useEffect(() => {
    const timer = setInterval(nextSlide, 6000)
    return () => clearInterval(timer)
  }, [nextSlide])

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
    }),
  }

  return (
    <section id="hero" className="relative h-screen w-full overflow-hidden">
      {/* Full Screen Background Image */}
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentSlide}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: 'spring', stiffness: 300, damping: 30 },
            opacity: { duration: 0.4 },
          }}
          className="absolute inset-0 pt-20"
        >
          {/* Full page image with padding for header */}
          <div className="relative w-full h-full">
            <img
              src={heroSlides[currentSlide].image}
              alt={heroSlides[currentSlide].title}
              className="w-full h-full object-cover object-center"
            />
            {/* Gradient overlays for text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Content Overlay - Left 35-40% Safe Zone */}
      <div className="absolute inset-0 flex items-center pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-xl">
            {/* Animated Tag */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center space-x-2 bg-medical-blue/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-medical-blue animate-pulse" />
              <span className="text-sm font-medium text-medical-blue">7/24 Acil Hizmet</span>
            </motion.div>

            {/* Main Title */}
            <motion.h1
              key={`title-${currentSlide}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4 drop-shadow-lg"
            >
              {heroSlides[currentSlide].title}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              key={`subtitle-${currentSlide}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-lg sm:text-xl text-gray-200 mb-8"
            >
              {heroSlides[currentSlide].subtitle}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-4"
            >
              <a href="#contact" className="btn-premium">
                Randevu Al
              </a>
              <a
                href="#scroll-experience"
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-full border-2 border-white/30 text-white font-medium hover:border-medical-blue hover:bg-medical-blue/20 backdrop-blur-sm transition-colors"
              >
                <Play className="w-4 h-4" />
                <span>Keşfet</span>
              </a>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-12 flex items-center space-x-8"
            >
              <div className="text-center">
                <span className="block text-3xl font-bold text-medical-blue">15+</span>
                <span className="text-sm text-gray-500">Yıllık Deneyim</span>
              </div>
              <div className="w-px h-12 bg-gray-200" />
              <div className="text-center">
                <span className="block text-3xl font-bold text-medical-blue">10K+</span>
                <span className="text-sm text-gray-500">Mutlu Dost</span>
              </div>
              <div className="w-px h-12 bg-gray-200" />
              <div className="text-center">
                <span className="block text-3xl font-bold text-medical-blue">24/7</span>
                <span className="text-sm text-gray-500">Acil Hizmet</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Slide Navigation */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center space-x-4">
        <button
          onClick={prevSlide}
          className="p-2 rounded-full glass hover:bg-white/90 transition-colors"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>
        
        <div className="flex space-x-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setDirection(index > currentSlide ? 1 : -1)
                setCurrentSlide(index)
              }}
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-300',
                index === currentSlide
                  ? 'w-8 bg-medical-blue'
                  : 'bg-gray-300 hover:bg-gray-400'
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        <button
          onClick={nextSlide}
          className="p-2 rounded-full glass hover:bg-white/90 transition-colors"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      {/* Subtle Glow Animation */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-medical-blue/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl animate-pulse pointer-events-none" style={{ animationDelay: '1s' }} />
    </section>
  )
}
