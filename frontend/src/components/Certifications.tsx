'use client'

import { motion } from 'framer-motion'
import { Award, Shield, Clock, Heart, Star, CheckCircle } from 'lucide-react'

const certifications = [
  { icon: Shield, label: 'ISO 9001 Sertifikalı', color: 'text-cyan-400' },
  { icon: Award, label: '15 Yıllık Deneyim', color: 'text-teal-400' },
  { icon: Clock, label: '7/24 Acil Hizmet', color: 'text-emerald-400' },
  { icon: Heart, label: '10.000+ Mutlu Dost', color: 'text-cyan-400' },
  { icon: Star, label: '4.9/5 Müşteri Puanı', color: 'text-teal-400' },
  { icon: CheckCircle, label: 'Lisanslı Klinik', color: 'text-emerald-400' },
]

export default function Certifications() {
  return (
    <section className="py-8 bg-[#030712] border-y border-white/5 overflow-hidden">
      <div className="relative">
        {/* Gradient Overlays */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#030712] to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#030712] to-transparent z-10" />

        {/* Scrolling Content */}
        <motion.div
          animate={{ x: [0, -1000] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="flex items-center space-x-12"
        >
          {/* Double the items for seamless loop */}
          {[...certifications, ...certifications, ...certifications].map((cert, index) => (
            <div
              key={index}
              className="flex items-center space-x-3 whitespace-nowrap"
            >
              <cert.icon className={`w-5 h-5 ${cert.color}`} />
              <span className="text-gray-400 font-medium">{cert.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
