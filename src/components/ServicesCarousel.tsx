'use client'

import { useRef, useState, useEffect } from 'react'
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import {
  FlaskConical,
  Scan,
  Ambulance,
  Droplets,
  Stethoscope,
  HeartPulse,
  Scissors,
  Sparkles,
  ArrowRight,
  Home,
  Shield,
  Activity,
  Zap,
  Heart,
  Lightbulb,
  Smile,
  Bone,
} from 'lucide-react'
import TextReveal from './TextReveal'
import { cn } from '@/lib/utils'

// Service type from API
interface Service {
  id: string
  title: string
  slug: string
  short_description: string
  cover_image_url: string
  icon: string
}

const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  flask: FlaskConical,
  scan: Scan,
  ambulance: Ambulance,
  droplet: Droplets,
  stethoscope: Stethoscope,
  'heart-pulse': HeartPulse,
  scissors: Scissors,
  sparkles: Sparkles,
  home: Home,
  shield: Shield,
  activity: Activity,
  zap: Zap,
  heart: Heart,
  lightbulb: Lightbulb,
  smile: Smile,
  bone: Bone,
}

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || ''

// 3D Tilt Card Component
function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [10, -10]), { stiffness: 300, damping: 30 })
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-10, 10]), { stiffness: 300, damping: 30 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    x.set((e.clientX - centerX) / rect.width)
    y.set((e.clientY - centerY) / rect.height)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export default function ServicesCarousel() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch services from API
  useEffect(() => {
    async function fetchServices() {
      try {
        const response = await fetch(`${API_URL}/api/public/services`)
        if (response.ok) {
          const data = await response.json()
          setServices(data.services || [])
        }
      } catch (error) {
        console.error('Failed to fetch services:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchServices()
  }, [])

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  })

  const x = useTransform(scrollYProgress, [0, 1], ['0%', '-25%'])

  // Loading state
  if (loading) {
    return (
      <section id="services" className="relative py-24 lg:py-28 bg-gradient-to-b from-[#030712] via-[#0a0f1a] to-[#030712]">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </section>
    )
  }

  // Empty state
  if (services.length === 0) {
    return (
      <section id="services" className="relative py-24 lg:py-28 bg-gradient-to-b from-[#030712] via-[#0a0f1a] to-[#030712]">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="inline-flex items-center space-x-2 bg-teal-500/20 backdrop-blur-sm border border-teal-400/35 rounded-full px-5 py-2.5 mb-8">
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span className="text-sm font-semibold text-teal-300">Profesyonel Hizmetler</span>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">Hizmetlerimiz</h2>
          <p className="text-gray-400">Hizmetler yakında eklenecektir.</p>
        </div>
      </section>
    )
  }

  return (
    <section
      id="services"
      ref={containerRef}
      className="relative py-24 lg:py-28 bg-gradient-to-b from-[#030712] via-[#0a0f1a] to-[#030712] overflow-hidden"
    >
      {/* Background Effects - Parallax */}
      <div className="absolute inset-0">
        <motion.div 
          className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[150px]"
          animate={{ 
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-[120px]"
          animate={{ 
            x: [0, -40, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Section Header */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center space-x-2 bg-teal-500/20 backdrop-blur-sm border border-teal-400/35 rounded-full px-5 py-2.5 mb-8 shadow-lg shadow-teal-500/20"
          >
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span className="text-sm font-semibold text-teal-300">Profesyonel Hizmetler</span>
          </motion.div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            <TextReveal>Hizmetlerimiz</TextReveal>
          </h2>
          
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-gray-400 text-lg max-w-2xl mx-auto"
          >
            Modern teknoloji ve uzman kadromuzla dostlarınıza en iyi bakımı sunuyoruz
          </motion.p>
        </motion.div>
      </div>

      {/* Horizontal Scroll Cards */}
      <div className="relative" style={{ perspective: '1000px' }}>
        {/* Desktop: Scroll-linked animation, Mobile: Touch swipe */}
        <motion.div
          style={{ x }}
          className="hidden lg:flex space-x-6 px-4 sm:px-8 lg:px-16"
        >
          {services.map((service, index) => {
            const Icon = iconMap[service.icon] || FlaskConical
            const isHovered = hoveredCard === service.id

            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 60, scale: 0.9, filter: 'blur(10px)' }}
                whileInView={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ 
                  delay: index * 0.1, 
                  duration: 0.6,
                  ease: [0.25, 0.1, 0.25, 1]
                }}
                onMouseEnter={() => setHoveredCard(service.id)}
                onMouseLeave={() => setHoveredCard(null)}
                className="flex-shrink-0 w-80"
              >
                <Link href={`/hizmetler/${service.slug}`} className="block h-full">
                  <TiltCard className="h-full">
                    <div
                      className={cn(
                        'relative h-full rounded-2xl overflow-hidden transition-all duration-500 cursor-pointer',
                        'bg-teal-500/10 backdrop-blur-xl',
                        'border border-teal-400/20',
                        isHovered && 'border-teal-400/50 bg-teal-500/15'
                      )}
                      style={{
                        boxShadow: isHovered 
                          ? '0 25px 50px -12px rgba(20, 184, 166, 0.25), 0 0 0 1px rgba(20, 184, 166, 0.1)' 
                          : '0 10px 40px -10px rgba(0, 0, 0, 0.5)',
                        transform: 'translateZ(0)',
                      }}
                    >
                    {/* Animated Border Glow */}
                    {isHovered && (
                      <motion.div
                        className="absolute inset-0 rounded-2xl"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{
                          background: 'linear-gradient(90deg, transparent, rgba(20,184,166,0.3), transparent)',
                          backgroundSize: '200% 100%',
                          animation: 'shimmer 2s linear infinite',
                        }}
                      />
                    )}

                    {/* Image */}
                    <div className="relative h-48 overflow-hidden">
                      <motion.img
                        src={service.cover_image_url}
                        alt={service.title}
                        className="w-full h-full object-cover"
                        animate={{ scale: isHovered ? 1.1 : 1 }}
                        transition={{ duration: 0.6 }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-[#030712]/60 to-transparent" />
                      
                      {/* Floating Icon */}
                      <motion.div
                        animate={{ 
                          y: isHovered ? -8 : 0,
                          scale: isHovered ? 1.1 : 1,
                        }}
                        transition={{ duration: 0.3 }}
                        className="absolute bottom-4 right-4 w-14 h-14 rounded-xl flex items-center justify-center backdrop-blur-xl border border-teal-400/30"
                        style={{
                          background: isHovered 
                            ? 'rgba(20, 184, 166, 0.35)' 
                            : 'rgba(20, 184, 166, 0.2)',
                          boxShadow: isHovered 
                            ? '0 10px 40px rgba(20,184,166,0.3)' 
                            : '0 4px 20px rgba(0,0,0,0.3)',
                        }}
                      >
                        <Icon className="w-7 h-7 text-teal-300" />
                      </motion.div>

                      {/* Scan Line Effect */}
                      {isHovered && (
                        <motion.div
                          className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-teal-400 to-transparent"
                          initial={{ top: '0%' }}
                          animate={{ top: '100%' }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                      )}
                    </div>

                    {/* Content */}
                    <div className="relative p-6" style={{ transform: 'translateZ(20px)' }}>
                      <motion.h3 
                        className="text-xl font-bold text-white mb-3 transition-colors duration-300"
                        animate={{ color: isHovered ? '#5eead4' : '#ffffff' }}
                      >
                        {service.title}
                      </motion.h3>
                      <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-2">
                        {service.short_description}
                      </p>

                      {/* Learn More */}
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : -10 }}
                        className="flex items-center space-x-2 text-teal-400 font-medium text-sm"
                      >
                        <span>Detaylı Bilgi</span>
                        <motion.div
                          animate={{ x: isHovered ? [0, 5, 0] : 0 }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          <ArrowRight className="w-4 h-4" />
                        </motion.div>
                      </motion.div>
                    </div>

                    {/* Corner Accents */}
                    <div className={cn(
                      "absolute top-3 left-3 w-6 h-6 border-l-2 border-t-2 rounded-tl-lg transition-all duration-300",
                      isHovered ? "border-teal-400/80" : "border-teal-400/20"
                    )} />
                    <div className={cn(
                      "absolute top-3 right-3 w-6 h-6 border-r-2 border-t-2 rounded-tr-lg transition-all duration-300",
                      isHovered ? "border-teal-400/80" : "border-teal-400/20"
                    )} />
                  </div>
                </TiltCard>
                </Link>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Mobile: Touch Swipe Carousel */}
        <div className="lg:hidden overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4">
          <div className="flex space-x-4" style={{ width: 'max-content' }}>
            {services.map((service, index) => {
              const Icon = iconMap[service.icon] || FlaskConical

              return (
                <motion.div
                  key={`mobile-${service.id}`}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05, duration: 0.5 }}
                  className="flex-shrink-0 w-72"
                >
                  <Link href={`/hizmetler/${service.slug}`} className="block h-full">
                    <div
                      className="relative h-full rounded-2xl overflow-hidden bg-teal-500/10 backdrop-blur-xl border border-teal-400/20 cursor-pointer active:scale-95 transition-transform"
                      style={{ boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.5)' }}
                    >
                      {/* Image */}
                      <div className="relative h-40 overflow-hidden">
                        <img
                          src={service.cover_image_url}
                          alt={service.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-[#030712]/60 to-transparent" />
                        
                        {/* Icon */}
                        <div
                          className="absolute bottom-3 right-3 w-12 h-12 rounded-xl flex items-center justify-center backdrop-blur-xl border border-teal-400/30"
                          style={{ background: 'rgba(20, 184, 166, 0.25)' }}
                        >
                          <Icon className="w-6 h-6 text-teal-300" />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <h3 className="text-lg font-bold text-white mb-2">
                          {service.title}
                        </h3>
                        <p className="text-gray-400 text-sm leading-relaxed line-clamp-2">
                          {service.short_description}
                        </p>
                      </div>

                      {/* Corner Accents */}
                      <div className="absolute top-2 left-2 w-5 h-5 border-l-2 border-t-2 border-teal-400/30 rounded-tl-lg" />
                      <div className="absolute top-2 right-2 w-5 h-5 border-r-2 border-t-2 border-teal-400/30 rounded-tr-lg" />
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex justify-center mt-8 lg:mt-12"
        >
          <div className="flex items-center space-x-3 text-gray-500 text-sm bg-white/5 backdrop-blur-sm rounded-full px-5 py-2.5 border border-white/10">
            <motion.div
              animate={{ x: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ArrowRight className="w-4 h-4" />
            </motion.div>
            <span className="hidden sm:inline">Kaydırarak keşfet</span>
            <span className="sm:hidden">Kaydır →</span>
          </div>
        </motion.div>
      </div>

      {/* CSS for shimmer animation */}
      <style jsx global>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </section>
  )
}
