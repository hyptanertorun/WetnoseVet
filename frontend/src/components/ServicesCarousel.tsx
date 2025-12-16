'use client'

import { useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
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
} from 'lucide-react'
import { services } from '@/data/siteData'
import TextReveal from './TextReveal'
import { cn } from '@/lib/utils'

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
  const containerRef = useRef<HTMLDivElement>(null)
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  })

  const x = useTransform(scrollYProgress, [0, 1], ['0%', '-30%'])

  return (
    <section
      id="services"
      ref={containerRef}
      className="relative py-32 bg-gradient-to-b from-[#030712] via-gray-900 to-[#030712] overflow-hidden"
    >
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-medical-blue/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-[120px]" />
      </div>

      {/* Section Header */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center space-x-2 bg-medical-blue/10 border border-medical-blue/30 rounded-full px-5 py-2.5 mb-8"
          >
            <Sparkles className="w-4 h-4 text-medical-blue" />
            <span className="text-sm font-medium text-medical-blue">Profesyonel Hizmetler</span>
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
      <div className="relative">
        <motion.div
          style={{ x }}
          className="flex space-x-6 px-4 sm:px-8 lg:px-16"
        >
          {services.map((service, index) => {
            const Icon = iconMap[service.icon] || FlaskConical
            const isHovered = hoveredCard === service.id

            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                onMouseEnter={() => setHoveredCard(service.id)}
                onMouseLeave={() => setHoveredCard(null)}
                className="flex-shrink-0 w-80 group"
                data-cursor="pointer"
              >
                <motion.div
                  whileHover={{ y: -10 }}
                  className={cn(
                    'relative h-full rounded-2xl overflow-hidden transition-all duration-500',
                    'bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl',
                    'border border-white/10',
                    isHovered && 'border-medical-blue/50 shadow-2xl shadow-medical-blue/20'
                  )}
                >
                  {/* Animated Gradient Border */}
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 rounded-2xl"
                      style={{
                        background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.3), transparent)',
                        backgroundSize: '200% 100%',
                        animation: 'shine 2s linear infinite',
                      }}
                    />
                  )}

                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <motion.img
                      src={service.image}
                      alt={service.name}
                      className="w-full h-full object-cover"
                      animate={{ scale: isHovered ? 1.1 : 1 }}
                      transition={{ duration: 0.5 }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />
                    
                    {/* Icon Badge */}
                    <motion.div
                      animate={{ 
                        y: isHovered ? -5 : 0,
                        boxShadow: isHovered ? '0 10px 40px rgba(0,212,255,0.4)' : '0 0 0 rgba(0,212,255,0)'
                      }}
                      className="absolute bottom-4 right-4 w-14 h-14 rounded-xl bg-gradient-to-br from-medical-blue to-teal-500 flex items-center justify-center"
                    >
                      <Icon className="w-7 h-7 text-white" />
                    </motion.div>
                  </div>

                  {/* Content */}
                  <div className="relative p-6">
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-medical-blue transition-colors">
                      {service.name}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed mb-4">
                      {service.description}
                    </p>

                    {/* Learn More */}
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : -10 }}
                      className="flex items-center space-x-2 text-medical-blue font-medium text-sm"
                    >
                      <span>Detaylı Bilgi</span>
                      <ArrowRight className="w-4 h-4" />
                    </motion.div>
                  </div>

                  {/* Glow Effect */}
                  {isHovered && (
                    <div className="absolute inset-0 rounded-2xl pointer-events-none">
                      <div className="absolute inset-0 rounded-2xl opacity-20 blur-xl bg-medical-blue" />
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Scroll Indicator */}
        <div className="flex justify-center mt-12">
          <div className="flex items-center space-x-2 text-gray-500 text-sm">
            <motion.div
              animate={{ x: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ArrowRight className="w-4 h-4" />
            </motion.div>
            <span>Kaydırarak keşfet</span>
          </div>
        </div>
      </div>
    </section>
  )
}
