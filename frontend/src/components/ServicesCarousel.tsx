'use client'

import { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  FlaskConical,
  Scan,
  Ambulance,
  Droplets,
  Stethoscope,
  HeartPulse,
  Scissors,
  Sparkles,
} from 'lucide-react'
import { services } from '@/data/siteData'
import { cn } from '@/lib/utils'

// Register GSAP plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
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
}

export default function ServicesCarousel() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  useEffect(() => {
    const section = sectionRef.current
    const scrollContainer = scrollRef.current
    if (!section || !scrollContainer) return

    // Calculate scroll distance
    const scrollWidth = scrollContainer.scrollWidth - window.innerWidth + 100

    // Create horizontal scroll animation
    gsap.to(scrollContainer, {
      x: -scrollWidth,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => `+=${scrollWidth}`,
        scrub: 1,
        pin: true,
        anticipatePin: 1,
      },
    })

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [])

  return (
    <section
      id="services"
      ref={sectionRef}
      className="relative min-h-screen bg-white overflow-hidden"
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-teal-50/30" />

      {/* Section Header */}
      <div className="relative pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <span className="text-medical-blue text-sm font-medium tracking-wider uppercase">
            Profesyonel Hizmetler
          </span>
          <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mt-2">
            Hizmetlerimiz
          </h2>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Modern teknoloji ve uzman kadromuzla dostlarınıza en iyi bakımı sunuyoruz
          </p>
        </motion.div>

        {/* Scroll Hint */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex items-center justify-center mt-8 text-gray-400"
        >
          <div className="flex items-center space-x-2">
            <div className="w-8 h-0.5 bg-medical-blue" />
            <span className="text-sm">Yatay kaydırın</span>
            <div className="w-8 h-0.5 bg-medical-blue" />
          </div>
        </motion.div>
      </div>

      {/* Horizontal Scroll Container */}
      <div
        ref={scrollRef}
        className="relative flex items-center pl-8 lg:pl-16 pb-24 will-change-transform"
      >
        {services.map((service, index) => {
          const Icon = iconMap[service.icon] || FlaskConical
          const isHovered = hoveredCard === service.id

          return (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              onMouseEnter={() => setHoveredCard(service.id)}
              onMouseLeave={() => setHoveredCard(null)}
              className={cn(
                'service-card flex-shrink-0 w-80 mr-6 p-6 rounded-2xl bg-white',
                'border border-gray-100 shadow-lg cursor-pointer',
                isHovered && 'border-medical-blue/30'
              )}
            >
              {/* Card Image */}
              <div className="relative h-48 rounded-xl overflow-hidden mb-6">
                <img
                  src={service.image}
                  alt={service.name}
                  className={cn(
                    'w-full h-full object-cover transition-transform duration-500',
                    isHovered && 'scale-110'
                  )}
                />
                {/* Overlay */}
                <div
                  className={cn(
                    'absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent transition-opacity duration-300',
                    isHovered ? 'opacity-70' : 'opacity-50'
                  )}
                />
                {/* Icon */}
                <div
                  className={cn(
                    'absolute bottom-4 right-4 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300',
                    isHovered
                      ? 'bg-medical-blue text-white medical-glow'
                      : 'glass text-gray-700'
                  )}
                >
                  <Icon className="w-6 h-6" />
                </div>
              </div>

              {/* Card Content */}
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {service.name}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {service.description}
              </p>

              {/* Hover Effect - Learn More */}
              <div
                className={cn(
                  'mt-4 flex items-center space-x-2 text-medical-blue font-medium text-sm transition-all duration-300',
                  isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
                )}
              >
                <span>Daha Fazla</span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>

              {/* HUD Pulse Effect on Hover */}
              {isHovered && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute -inset-1 rounded-2xl border-2 border-medical-blue/30 pointer-events-none"
                />
              )}
            </motion.div>
          )
        })}

        {/* End spacer */}
        <div className="flex-shrink-0 w-16" />
      </div>

      {/* Background Decorations */}
      <div className="absolute top-1/4 -right-32 w-64 h-64 bg-medical-blue/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -left-32 w-48 h-48 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
    </section>
  )
}
