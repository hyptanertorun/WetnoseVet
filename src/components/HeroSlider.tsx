'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Play, Sparkles, Calendar, Phone, Users, Stethoscope, ArrowRight } from 'lucide-react'
import MagneticButton from './MagneticButton'
import TextReveal from './TextReveal'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface SlideButton {
  id: string
  text: string
  href: string
  style: string
  icon?: string | null
  is_visible: boolean
}

interface SlideOverlay {
  enabled: boolean
  opacity: number
  gradient_direction: string
  color: string
}

interface Slide {
  id: string
  title: string
  subtitle: string | null
  image_url: string
  image_alt: string | null
  mobile_image_url: string | null
  buttons: SlideButton[]
  overlay: SlideOverlay
  animation_duration: number
}

interface SliderSettings {
  auto_play: boolean
  auto_play_interval: number
  show_navigation_arrows: boolean
  show_navigation_dots: boolean
  show_progress_bar: boolean
  show_slide_counter: boolean
  show_scroll_indicator: boolean
  badge: {
    enabled: boolean
    text: string
    icon: string
    show_pulse: boolean
  }
  stats: {
    enabled: boolean
    items: Array<{ value: string; label: string }>
  }
  ken_burns_effect: boolean
  scan_line_effect: boolean
}

// Fallback static data
const fallbackSlides: Slide[] = [
  {
    id: '1',
    title: 'Dostlarınıza Özel Bakım',
    subtitle: 'Modern teknoloji ile sağlık takibi',
    image_url: '/images/slider/slider1.png',
    image_alt: 'Veteriner klinik',
    mobile_image_url: null,
    buttons: [
      { id: '1', text: 'Online Randevu Al', href: '#contact', style: 'primary', icon: 'calendar', is_visible: true },
      { id: '2', text: 'Keşfet', href: '#scroll-experience', style: 'secondary', icon: 'play', is_visible: true }
    ],
    overlay: { enabled: true, opacity: 50, gradient_direction: 'to-r', color: '#000000' },
    animation_duration: 6000
  },
  {
    id: '2',
    title: 'Uzman Veteriner Ekibi',
    subtitle: '7/24 Acil Veteriner Hizmeti',
    image_url: '/images/slider/slider2.png',
    image_alt: 'Veteriner ekibi',
    mobile_image_url: null,
    buttons: [
      { id: '3', text: 'Online Randevu Al', href: '#contact', style: 'primary', icon: 'calendar', is_visible: true },
      { id: '4', text: 'Ekibimiz', href: '/ekibimiz', style: 'secondary', icon: 'users', is_visible: true }
    ],
    overlay: { enabled: true, opacity: 50, gradient_direction: 'to-r', color: '#000000' },
    animation_duration: 6000
  }
]

const fallbackSettings: SliderSettings = {
  auto_play: true,
  auto_play_interval: 6000,
  show_navigation_arrows: true,
  show_navigation_dots: true,
  show_progress_bar: true,
  show_slide_counter: true,
  show_scroll_indicator: true,
  badge: { enabled: true, text: '7/24 Acil Veteriner Hizmeti', icon: 'sparkles', show_pulse: true },
  stats: { 
    enabled: true, 
    items: [
      { value: '15+', label: 'Yıllık Deneyim' },
      { value: '10K+', label: 'Mutlu Dost' },
      { value: '24/7', label: 'Acil Hizmet' }
    ] 
  },
  ken_burns_effect: true,
  scan_line_effect: true
}

const getButtonIcon = (iconName?: string | null) => {
  switch (iconName) {
    case 'calendar': return <Calendar className="w-4 h-4" />
    case 'play': return <Play className="w-4 h-4" />
    case 'phone': return <Phone className="w-4 h-4" />
    case 'users': return <Users className="w-4 h-4" />
    case 'stethoscope': return <Stethoscope className="w-4 h-4" />
    case 'arrow-right': return <ArrowRight className="w-4 h-4" />
    default: return null
  }
}

export default function HeroSlider() {
  const [slides, setSlides] = useState<Slide[]>(fallbackSlides)
  const [settings, setSettings] = useState<SliderSettings>(fallbackSettings)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  // Fetch slides from API
  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || ''
        const response = await fetch(`${apiUrl}/api/public/slider`)
        if (response.ok) {
          const data = await response.json()
          if (data.slides && data.slides.length > 0) {
            setSlides(data.slides)
          }
          if (data.settings) {
            setSettings(data.settings)
          }
        }
      } catch (error) {
        // Fallback slides will be used
      } finally {
        setIsLoaded(true)
      }
    }
    
    fetchSlides()
  }, [])

  const nextSlide = useCallback(() => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrentSlide((prev) => (prev + 1) % slides.length)
    setTimeout(() => setIsAnimating(false), 1500)
  }, [isAnimating, slides.length])

  const prevSlide = useCallback(() => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
    setTimeout(() => setIsAnimating(false), 1500)
  }, [isAnimating, slides.length])

  const goToSlide = useCallback((index: number) => {
    if (isAnimating || index === currentSlide) return
    setIsAnimating(true)
    setCurrentSlide(index)
    setTimeout(() => setIsAnimating(false), 1500)
  }, [isAnimating, currentSlide])

  // Auto slide
  useEffect(() => {
    if (!settings.auto_play) return
    const timer = setInterval(nextSlide, settings.auto_play_interval)
    return () => clearInterval(timer)
  }, [nextSlide, settings.auto_play, settings.auto_play_interval])

  const currentSlideData = slides[currentSlide]
  const visibleButtons = currentSlideData?.buttons.filter(b => b.is_visible) || []

  return (
    <section id="hero" className="relative h-screen w-full overflow-hidden bg-black">
      {/* Background Images with Parallax Zoom */}
      <div className="absolute inset-0">
        {slides.map((slide, index) => (
          <motion.div
            key={slide.id}
            className="absolute inset-0"
            initial={false}
            animate={{
              opacity: index === currentSlide ? 1 : 0,
              scale: index === currentSlide ? 1 : 1.1,
              zIndex: index === currentSlide ? 1 : 0,
            }}
            transition={{
              opacity: { duration: prefersReducedMotion ? 0.3 : 1.2, ease: [0.4, 0, 0.2, 1] },
              scale: { duration: prefersReducedMotion ? 0.3 : 1.5, ease: [0.4, 0, 0.2, 1] },
            }}
          >
            {/* Ken Burns Zoom Effect - disabled for reduced motion */}
            <motion.div
              className="absolute inset-0"
              animate={!prefersReducedMotion && settings.ken_burns_effect && index === currentSlide ? {
                scale: [1, 1.15],
              } : {}}
              transition={{
                duration: 8,
                ease: 'linear',
              }}
            >
              <Image
                src={slide.image_url}
                alt={slide.image_alt || slide.title}
                fill
                priority={index === 0}
                loading={index === 0 ? 'eager' : 'lazy'}
                sizes="100vw"
                quality={index === 0 ? 85 : 75}
                className="object-cover"
                unoptimized={slide.image_url.startsWith('/')}
              />
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Cinematic Overlays - Enhanced */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-black/30 z-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/50 z-10" />
      
      {/* Extra depth layer based on overlay settings */}
      {currentSlideData?.overlay.enabled && (
        <div 
          className="absolute inset-0 z-10" 
          style={{ backgroundColor: `rgba(0,0,0,${(currentSlideData.overlay.opacity || 15) / 100})` }}
        />
      )}
      
      {/* Animated Vignette - Stronger */}
      <motion.div 
        className="absolute inset-0 z-10 pointer-events-none"
        animate={prefersReducedMotion ? {} : { opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 4, repeat: Infinity }}
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.7) 100%)',
          opacity: prefersReducedMotion ? 0.5 : undefined
        }} 
      />

      {/* Scan Line Effect - disabled for reduced motion */}
      {!prefersReducedMotion && settings.scan_line_effect && (
        <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden opacity-30">
          <motion.div
            className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"
            animate={{ top: ['-10%', '110%'] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          />
        </div>
      )}

      {/* Subtle Grid */}
      <div className="absolute inset-0 z-10 opacity-[0.03] pointer-events-none">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 212, 255, 1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 212, 255, 1) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
          }}
        />
      </div>

      {/* Main Content with Parallax */}
      <div className="absolute inset-0 z-20 flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl">
            {/* Badge */}
            {settings.badge.enabled && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="mb-8"
              >
                <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full px-5 py-2.5">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                  >
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                  </motion.div>
                  <span className="text-sm font-medium text-white">{settings.badge.text}</span>
                  {settings.badge.show_pulse && (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                    </span>
                  )}
                </div>
              </motion.div>
            )}

            {/* Title with Parallax Entry */}
            <div className="mb-6 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`title-${currentSlide}`}
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -100, opacity: 0 }}
                  transition={{ 
                    duration: 0.8, 
                    ease: [0.4, 0, 0.2, 1],
                  }}
                >
                  <h1 className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.1] tracking-tight">
                    <TextReveal delay={0.1} staggerDelay={0.03}>
                      {currentSlideData?.title || ''}
                    </TextReveal>
                  </h1>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Subtitle with Delayed Parallax */}
            <div className="overflow-hidden mb-10">
              <AnimatePresence mode="wait">
                <motion.p
                  key={`subtitle-${currentSlide}`}
                  initial={{ y: 60, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -60, opacity: 0 }}
                  transition={{ 
                    duration: 0.7, 
                    delay: 0.2,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                  className="text-lg sm:text-xl lg:text-2xl text-gray-300 font-light"
                >
                  {currentSlideData?.subtitle || ''}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* CTA Buttons - Dynamic */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex flex-wrap gap-4"
            >
              {visibleButtons.map((button, index) => (
                <MagneticButton 
                  key={button.id} 
                  href={button.href} 
                  variant={button.style === 'primary' ? 'primary' : 'secondary'}
                >
                  <span className="flex items-center space-x-2">
                    {button.icon && getButtonIcon(button.icon)}
                    <span>{button.text}</span>
                    {button.style === 'primary' && (
                      <motion.span
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        →
                      </motion.span>
                    )}
                  </span>
                </MagneticButton>
              ))}
            </motion.div>

            {/* Stats - Dynamic */}
            {settings.stats.enabled && settings.stats.items && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-16 flex items-center space-x-8 lg:space-x-12"
              >
                {settings.stats.items.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 + index * 0.1 }}
                    className="text-center"
                  >
                    <motion.span 
                      className="block text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-400"
                      whileHover={{ scale: 1.1 }}
                    >
                      {stat.value}
                    </motion.span>
                    <span className="text-sm text-gray-400">{stat.label}</span>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Slide Counter */}
      {settings.show_slide_counter && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute top-1/2 right-8 -translate-y-1/2 z-20 hidden lg:flex flex-col items-center space-y-4"
        >
          <span className="text-5xl font-bold text-white/20">
            {String(currentSlide + 1).padStart(2, '0')}
          </span>
          <div className="w-[1px] h-16 bg-white/20" />
          <span className="text-sm text-white/40">
            {String(slides.length).padStart(2, '0')}
          </span>
        </motion.div>
      )}

      {/* Progress Bar */}
      {settings.show_progress_bar && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 z-30">
          <motion.div
            key={currentSlide}
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: settings.auto_play_interval / 1000, ease: 'linear' }}
            className="h-full bg-teal-500/40 backdrop-blur-sm"
          />
        </div>
      )}

      {/* Navigation */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center space-x-6 z-30">
        {settings.show_navigation_arrows && (
          <motion.button
            onClick={prevSlide}
            whileHover={{ scale: 1.1, backgroundColor: 'rgba(20,184,166,0.25)' }}
            whileTap={{ scale: 0.95 }}
            className="p-3 rounded-full bg-teal-500/15 backdrop-blur-xl border border-teal-400/25 text-white transition-all hover:border-teal-400/40"
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>
        )}

        {settings.show_navigation_dots && (
          <div className="flex space-x-3">
            {slides.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => goToSlide(index)}
                whileHover={{ scale: 1.2 }}
                className="relative h-3 overflow-hidden rounded-full transition-all duration-500 border border-teal-400/30"
                style={{ width: index === currentSlide ? '40px' : '12px' }}
              >
                <div className={cn(
                  'absolute inset-0 rounded-full transition-all duration-500',
                  index === currentSlide
                    ? 'bg-teal-500/40 backdrop-blur-sm'
                    : 'bg-teal-500/15 hover:bg-teal-500/25'
                )} />
                {index === currentSlide && (
                  <motion.div
                    className="absolute inset-0 bg-white/20 rounded-full"
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ duration: settings.auto_play_interval / 1000, ease: 'linear' }}
                  />
                )}
              </motion.button>
            ))}
          </div>
        )}

        {settings.show_navigation_arrows && (
          <motion.button
            onClick={nextSlide}
            whileHover={{ scale: 1.1, backgroundColor: 'rgba(20,184,166,0.25)' }}
            whileTap={{ scale: 0.95 }}
            className="p-3 rounded-full bg-teal-500/15 backdrop-blur-xl border border-teal-400/25 text-white transition-all hover:border-teal-400/40"
          >
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        )}
      </div>

      {/* Scroll Indicator */}
      {settings.show_scroll_indicator && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center text-white/50 z-20"
        >
          <span className="text-xs uppercase tracking-widest mb-2">Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-5 h-8 rounded-full border-2 border-white/30 flex justify-center pt-1"
          >
            <motion.div className="w-1 h-2 bg-white/50 rounded-full" />
          </motion.div>
        </motion.div>
      )}
    </section>
  )
}
